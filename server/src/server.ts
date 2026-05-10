import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createWinery } from './controllers/auth.controller';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const port = process.env.PORT || 3001;

// Supabase com Service Role Key para o backend ter poderes de admin (bypass RLS)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);

app.use(cors());
// Webhook Route (MUST use express.raw for Stripe signature verification)
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id; // Passado na criação
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;
      
      // Expandir a sessão para ver os itens de linha (plano)
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      if (userId && priceId) {
        // Encontra a vinícola do usuário no Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('winery_id')
          .eq('id', userId)
          .single();

        if (profile?.winery_id) {
          // Atualiza a vinícola usando Supabase
          const { error } = await supabase
            .from('wineries')
            .update({
              stripe_price_id: priceId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan_type: 'premium'
            })
            .eq('id', profile.winery_id);
            
          if (error) {
            console.error("Erro ao atualizar via Webhook:", error);
          } else {
            console.log(`✅ Plano atualizado com sucesso para a vinícola ${profile.winery_id} via Supabase Webhook (Price ID: ${priceId})`);
          }
        }
      }
    }
    
    // Processar cancelamentos
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      const { data: wineries } = await supabase
        .from('wineries')
        .select('id')
        .eq('stripe_subscription_id', subscription.id);
        
      const wineryId = wineries?.[0]?.id;

      if (wineryId) {
        await supabase
          .from('wineries')
          .update({
            stripe_price_id: null,
            stripe_subscription_id: null,
            plan_type: 'basic'
          })
          .eq('id', wineryId);
          
        console.log(`❌ Assinatura cancelada para a vinícola ${wineryId} via Supabase Webhook`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
});

app.use(express.json());

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok' });
});

// Auth Routes
app.post('/auth/create-winery', createWinery);

// Stripe Checkout Route
app.post('/api/checkout/create-session', async (req: any, res: any) => {
  const { priceId, userId, returnUrl } = req.body;
  
  if (!priceId) {
    return res.status(400).json({ error: 'priceId is required' });
  }

  try {
    const successUrl = returnUrl ? `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true` : process.env.STRIPE_SUCCESS_URL!;
    const cancelUrl = returnUrl || process.env.STRIPE_CANCEL_URL!;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId, // Vincula a assinatura ao usuário logado
      metadata: {
        userId: userId || null
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch plans from Stripe
app.get('/api/checkout/plans', async (req: any, res: any) => {
  try {
    const priceIds = [
      process.env.VITE_STRIPE_PRICE_VINHEDO || process.env.STRIPE_PRICE_VINHEDO,
      process.env.VITE_STRIPE_PRICE_RESERVA || process.env.STRIPE_PRICE_RESERVA,
      process.env.VITE_STRIPE_PRICE_GRAND_CRU || process.env.STRIPE_PRICE_GRAND_CRU
    ].filter(Boolean) as string[];

    console.log('[Stripe] Buscando detalhes para os IDs:', priceIds);

    if (priceIds.length === 0) {
      return res.status(400).json({ error: 'No price IDs configured in .env' });
    }

    const plans = await Promise.all(
      priceIds.map(async (id) => {
        const price = await stripe.prices.retrieve(id, {
          expand: ['product'],
        });
        const product = price.product as any;
        
        return {
          priceId: price.id,
          name: product.name,
          price: (price.unit_amount || 0) / 100,
          desc: product.description || "",
        };
      })
    );

    res.json(plans);
  } catch (error: any) {
    console.error('Error fetching plans from Stripe:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Session Route (para o frontend processar os dados e salvar no Supabase)
app.post('/api/checkout/verify-session', async (req: any, res: any) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id is required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      
      let planName = "Viticultura";
      let planPrice = 129;

      if (priceId === process.env.VITE_STRIPE_PRICE_RESERVA || priceId === process.env.STRIPE_PRICE_RESERVA) {
        planName = "Business";
        planPrice = 349;
      } else if (priceId === process.env.VITE_STRIPE_PRICE_GRAND_CRU || priceId === process.env.STRIPE_PRICE_GRAND_CRU) {
        planName = "Sommelier";
        planPrice = 849;
      }

      return res.json({ 
        success: true, 
        priceId,
        planName,
        planPrice,
        subscriptionId: session.subscription,
        customerId: session.customer
      });
    }
    
    res.json({ success: false, status: session.payment_status });
  } catch (error: any) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exemplo de rota de Produtos
app.get('/products', async (req, res) => {
  const { wineryId } = req.query;
  
  if (!wineryId) {
    return res.status(400).json({ error: 'wineryId is required' });
  }

  try {
    const products = await prisma.product.findMany({
      where: { winery_id: wineryId as string }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// WhatsApp Bulk Send Route
app.post('/api/whatsapp/send-bulk-feedback', async (req: any, res: any) => {
  const { eventTitle, bookings, baseUrl } = req.body;
  
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE_NAME;

  console.log(`[WhatsApp] Iniciando disparo em massa para: ${eventTitle}`);

  if (!apiUrl || !apiKey || !instance) {
    console.error('[WhatsApp] Configurações ausentes no .env');
    return res.status(500).json({ error: 'WhatsApp configuration missing on server' });
  }

  const results = [];

  for (const booking of bookings) {
    if (!booking.customer_phone) {
      results.push({ customer: booking.customer_name, status: 'skipped', reason: 'no phone' });
      continue;
    }

    const cleanPhone = booking.customer_phone.replace(/\D/g, '');
    const feedbackLink = `${baseUrl}/feedback/${booking.id}`;
    const message = `Olá ${booking.customer_name}! Foi um prazer receber você na nossa experiência de ${eventTitle}. O que você achou? Avalie aqui: ${feedbackLink}`;

    try {
      const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          number: `55${cleanPhone}`,
          text: message,
          delay: 1200,
          linkPreview: true
        })
      });

      const data = await response.json();
      console.log(`[WhatsApp] Mensagem enviada para ${booking.customer_name}`);
      results.push({ customer: booking.customer_name, status: 'sent', data });
    } catch (error) {
      console.error(`[WhatsApp] Erro ao enviar para ${booking.customer_name}:`, error);
      results.push({ customer: booking.customer_name, status: 'error', error });
    }
  }

  res.json({ success: true, results });
});

app.listen(port, () => {
  console.log(`🚀 Backend Vintech rodando em http://localhost:${port}`);
});

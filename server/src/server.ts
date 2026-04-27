import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createWinery } from './controllers/auth.controller';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth Routes
app.post('/auth/create-winery', createWinery);

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

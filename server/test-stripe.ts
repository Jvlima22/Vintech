import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

async function test() {
  console.log('--- DIAGNÓSTICO STRIPE ---');
  console.log('Secret Key:', process.env.STRIPE_SECRET_KEY ? 'Configurada (OK)' : 'NÃO ENCONTRADA');
  
  const priceIds = [
    process.env.VITE_STRIPE_PRICE_VINHEDO || process.env.STRIPE_PRICE_VINHEDO,
    process.env.VITE_STRIPE_PRICE_RESERVA || process.env.STRIPE_PRICE_RESERVA,
    process.env.VITE_STRIPE_PRICE_GRAND_CRU || process.env.STRIPE_PRICE_GRAND_CRU
  ].filter(Boolean) as string[];

  console.log('IDs para testar:', priceIds);

  if (priceIds.length === 0) {
    console.error('ERRO: Nenhum ID de preço encontrado no .env');
    return;
  }

  try {
    for (const id of priceIds) {
      console.log(`\nTestando ID: ${id}...`);
      const price = await stripe.prices.retrieve(id, {
        expand: ['product'],
      });
      const product = price.product as Stripe.Product;
      
      console.log('✅ SUCESSO:');
      console.log('- Nome do Produto:', product.name);
      console.log('- Valor:', (price.unit_amount || 0) / 100, price.currency.toUpperCase());
      console.log('- Descrição:', product.description);
    }
  } catch (error: any) {
    console.error('\n❌ ERRO NA CHAMADA:', error.message);
  }
  console.log('\n--------------------------');
}

test();

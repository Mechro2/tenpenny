import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Use the Service Role Key to bypass RLS in server-side background webhooks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful checkout & trial activation
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Safely extract contractorId with a fallback to 1 for solo testing
    const contractorId = 
      session.subscription_data?.metadata?.contractorId || 
      session.metadata?.contractorId || 
      1;

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    console.log(`Checkout completed. Target Contractor ID: ${contractorId}`);
    console.log(`Stripe Customer ID: ${customerId}, Subscription ID: ${subscriptionId}`);

    // Update Supabase with Pro status
    const { data, error } = await supabase
      .from('contractors')
      .update({
        is_pro: true,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      })
      .eq('id', contractorId)
      .select();

    if (error) {
      console.error('Error updating database from webhook:', error.message);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    console.log('Successfully updated contractor pro status in Supabase:', data);
  }

  return NextResponse.json({ received: true });
}
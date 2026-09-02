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

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const contractorId = session.subscription_data?.metadata?.contractorId || session.metadata?.contractorId;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const customerEmail = session.customer_details?.email || session.customer_email;

    console.log(`Checkout completed for contractor: ${contractorId}`);
    console.log(`Stripe Customer ID: ${customerId}, Subscription ID: ${subscriptionId}`);

    // Update Supabase with the Pro status
    // (Make sure 'contractors' matches your actual database table name)
    const { error } = await supabase
      .from('contractors')
      .update({
        is_pro: true,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      })
      .eq('id', contractorId); // Fallback to .eq('email', customerEmail) if you pass email instead of ID

    if (error) {
      console.error('Error updating database from webhook:', error.message);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
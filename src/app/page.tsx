import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: Request) {
  try {
    const { contractorId } = await req.json().catch(() => ({}));
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://tenpenny-backend.vercel.app';

    // Using automatic payment methods with a reusable price configuration for subscription mode
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tenpenny AI Pro Operations',
            },
            unit_amount: 14700,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      automatic_tax: { enabled: true },
      subscription_data: {
        trial_period_days: 14,
        metadata: { contractorId: contractorId || 'default_contractor' },
      },
      success_url: `${origin}/settings?success=true`,
      cancel_url: `${origin}/settings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
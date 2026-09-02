import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as any,
    })

    const body = await request.json()
    const { leadId, callerName, jobType } = body

    const session = await stripe.checkout.sessions.create({
      // Disable Managed Payments for this session
      managed_payments: {
        enabled: false,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `$50 Job Deposit - ${jobType || 'Service Call'}`,
              description: `Deposit for lead: ${callerName || 'Customer'}`,
            },
            unit_amount: 5000, // $50.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/upload/${leadId}?paid=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
    } as any)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
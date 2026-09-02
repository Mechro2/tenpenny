import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Lookup Customer Payload:', JSON.stringify(body, null, 2))

    const args =
      body.message?.functionCall?.parameters ||
      body.message?.toolCalls?.[0]?.function?.arguments ||
      body.parameters ||
      body

    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
    const phone = parsedArgs.phone_number || parsedArgs.phone

    if (!phone) {
      return NextResponse.json({
        results: [
          {
            toolCallId: body.message?.toolCalls?.[0]?.id || 'tool-call',
            result: 'No phone number provided to perform lookup.'
          }
        ]
      })
    }

    const supabase = getSupabaseAdmin()

    const { data: customer, error } = await supabase
      .from('leads')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (customer) {
      return NextResponse.json({
        results: [
          {
            toolCallId:
              body.message?.toolCalls?.[0]?.id ||
              body.message?.functionCall?.id ||
              'tool-call',
            result: `Customer found! Name: ${customer.name}, Address: ${customer.address}, Last Service: ${customer.service_type}, Status: ${customer.status}.`
          }
        ]
      })
    } else {
      return NextResponse.json({
        results: [
          {
            toolCallId:
              body.message?.toolCalls?.[0]?.id ||
              body.message?.functionCall?.id ||
              'tool-call',
            result: `No prior history found for ${phone}. Treat as new customer.`
          }
        ]
      })
    }
  } catch (err: any) {
    console.error('Lookup Customer Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ status: 'Tenpenny lookup-customer endpoint is live!' })
}
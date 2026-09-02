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
    console.log('Incoming Vapi Payload:', JSON.stringify(body, null, 2))

    const args =
      body.message?.functionCall?.parameters ||
      body.message?.toolCalls?.[0]?.function?.arguments ||
      body.parameters ||
      body

    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args

    const name = parsedArgs.caller_name || parsedArgs.name || 'Unknown Name'
    const phone = parsedArgs.phone_number || parsedArgs.phone || 'Unknown Phone'
    const address = parsedArgs.address || 'No address provided'
    const service = parsedArgs.service_type || parsedArgs.service || 'General Service'
    const summary = parsedArgs.project_description || parsedArgs.summary || 'No summary provided'

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          phone_number: phone,
          address,
          service_type: service,
          summary,
          status: 'new',
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) throw error

    return NextResponse.json({
      results: [
        {
          toolCallId:
            body.message?.toolCalls?.[0]?.id ||
            body.message?.functionCall?.id ||
            'tool-call',
          result: `Lead successfully created for ${name}`
        }
      ]
    })
  } catch (err: any) {
    console.error('Create Lead Tool Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ status: 'Tenpenny create-lead endpoint is live!' })
}
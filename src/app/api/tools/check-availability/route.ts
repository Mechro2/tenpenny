import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Check Availability Payload:', JSON.stringify(body, null, 2))

    const args =
      body.message?.functionCall?.parameters ||
      body.message?.toolCalls?.[0]?.function?.arguments ||
      body.parameters ||
      body

    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
    const requestedDate = parsedArgs.date || new Date().toISOString().split('T')[0]

    // Default business slot options for contractors (9 AM, 1 PM, 4 PM)
    // In production, this can query Google Calendar API
    const availableSlots = [
      `${requestedDate} at 09:00 AM`,
      `${requestedDate} at 01:00 PM`,
      `${requestedDate} at 04:00 PM`
    ]

    return NextResponse.json({
      results: [
        {
          toolCallId:
            body.message?.toolCalls?.[0]?.id ||
            body.message?.functionCall?.id ||
            'tool-call',
          result: `Available slots for ${requestedDate}: ${availableSlots.join(', ')}.`
        }
      ]
    })
  } catch (err: any) {
    console.error('Check Availability Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ status: 'Tenpenny check-availability endpoint is live!' })
}
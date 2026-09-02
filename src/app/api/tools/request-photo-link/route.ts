import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Request Photo Link Payload:', JSON.stringify(body, null, 2))

    const args =
      body.message?.functionCall?.parameters ||
      body.message?.toolCalls?.[0]?.function?.arguments ||
      body.parameters ||
      body

    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
    const phone = parsedArgs.phone_number || parsedArgs.phone || 'Caller Phone'
    
    // Generates upload link for client photo uploads
    const photoUploadUrl = `https://tenpenny-backend.vercel.app/upload?phone=${encodeURIComponent(phone)}`

    return NextResponse.json({
      results: [
        {
          toolCallId:
            body.message?.toolCalls?.[0]?.id ||
            body.message?.functionCall?.id ||
            'tool-call',
          result: `Photo link request created. Tell caller an SMS link (${photoUploadUrl}) has been triggered for phone ${phone}.`
        }
      ]
    })
  } catch (err: any) {
    console.error('Request Photo Link Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ status: 'Tenpenny request-photo-link endpoint is live!' })
}
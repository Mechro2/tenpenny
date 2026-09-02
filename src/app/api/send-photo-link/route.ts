import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const args = body.message?.functionCall?.parameters || body.parameters || body
    const { lead_id, phone_number } = args

    const uploadUrl = `https://tenpenny-backend.vercel.app/upload/${lead_id || 'default'}`

    return NextResponse.json({
      results: [
        {
          toolCallId: body.message?.functionCall?.id,
          result: `Photo upload link generated: ${uploadUrl}`
        }
      ]
    })
  } catch (err: any) {
    console.error('Send Photo Link Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
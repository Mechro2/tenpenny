import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { assistantId } = await request.json();

    const response = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'vapi',
        assistantId: assistantId,
        areaCode: '479' // Optional local area code
      }),
    });

    const phoneData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: phoneData.message || 'Failed to provision' }, { status: 500 });
    }

    return NextResponse.json({ success: true, phone: phoneData.number });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
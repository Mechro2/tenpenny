import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    const { tokens } = await oauth2Client.getToken(code)
    
    // Initialize Supabase admin client to save tokens securely
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Save tokens into your table
    await supabase.from('contractor_integrations').upsert({
      service_provider: 'google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    })

    // Redirect the contractor back to your app dashboard after successful connection
    return NextResponse.redirect(new URL('/dashboard?success=google_connected', req.url))
  } catch (err: any) {
    console.error('Google OAuth Callback Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
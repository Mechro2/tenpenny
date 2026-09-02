import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contractorId = searchParams.get('contractorId');

  if (!contractorId) {
    return NextResponse.json({ is_pro: false, error: 'Missing contractorId' }, { status: 400 });
  }

  // Query Supabase for the contractor
  const { data, error } = await supabase
    .from('contractors')
    .select('is_pro, stripe_customer_id, stripe_subscription_id')
    .eq('id', contractorId)
    .maybeSingle();

  if (error) {
    console.error('Supabase check-subscription error:', error.message);
    return NextResponse.json({ is_pro: false });
  }

  // Return the actual boolean value from the database record
  return NextResponse.json({ is_pro: !!data?.is_pro });
}
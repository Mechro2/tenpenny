import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { contractorId } = await req.json();
    const activeContractorId = contractorId || 'default_contractor';

    // Query Supabase to verify the contractor's subscription status
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('contractor_id', activeContractorId)
      .single();

    if (error || !sub) {
      return NextResponse.json(
        { error: 'Access denied. No active subscription or trial found. Please start your 14-day trial.' },
        { status: 403 }
      );
    }

    const isActive = sub.status === 'active';
    const isTrialing = sub.status === 'trialing';
    const trialValid = sub.trial_ends_at ? new Date(sub.trial_ends_at) > new Date() : false;

    if (!isActive && !(isTrialing && trialValid)) {
      return NextResponse.json(
        { error: 'Your subscription or 14-day trial has expired. Please update your billing details.' },
        { status: 403 }
      );
    }

    // --- YOUR EXISTING VAPI DISPATCH CODE GOES HERE ---
    // Example: Triggering the Vapi API to start the call...

    return NextResponse.json({ success: true, message: 'Voice pipeline authorized and dispatched.' });
  } catch (err: any) {
    console.error('Vapi Dispatch Guard Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
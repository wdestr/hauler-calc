import { NextResponse } from 'next/server';
import { getStripe, siteUrl } from '@/lib/stripe';
import { getSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST() {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Billing is not configured yet.' }, { status: 503 });

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Accounts are not configured yet.' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();
  const customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) return NextResponse.json({ error: 'No subscription found for this account.' }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl()}/calculator`,
  });

  return NextResponse.json({ url: session.url });
}

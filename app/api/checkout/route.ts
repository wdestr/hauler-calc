import { NextResponse } from 'next/server';
import { getStripe, priceIdFor, siteUrl } from '@/lib/stripe';
import { getSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { interval } = (await request.json().catch(() => ({}))) as { interval?: 'monthly' | 'annual' };
  const iv = interval === 'annual' ? 'annual' : 'monthly';

  // Demo mode — no Stripe keys yet. Route to the in-app demo checkout so the
  // whole purchase flow works and unlocks Pro. Real Stripe takes over the
  // moment STRIPE_SECRET_KEY is set (see SETUP.md).
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ url: `/demo-checkout?interval=${iv}`, demo: true });

  const price = priceIdFor(iv);
  if (!price) return NextResponse.json({ error: 'This plan is not configured yet.' }, { status: 503 });

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: 'Accounts are not configured yet.' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  // Reuse the Stripe customer if we've seen this user before.
  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();
  let customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email ?? undefined, metadata: { supabase_id: user.id } });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${siteUrl()}/calculator?upgraded=1`,
    cancel_url: `${siteUrl()}/pricing`,
    subscription_data: { metadata: { supabase_id: user.id } },
  });

  return NextResponse.json({ url: session.url });
}

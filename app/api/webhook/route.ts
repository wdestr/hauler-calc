import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// Stripe → us. The source of truth for is_pro. Verifies the signature, then
// flips the profile on subscription lifecycle events.
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });

  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Signature verification failed: ${(err as Error).message}` }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });

  const setProByCustomer = async (customerId: string, isPro: boolean) => {
    await admin.from('profiles').update({ is_pro: isPro, updated_at: new Date().toISOString() }).eq('stripe_customer_id', customerId);
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.client_reference_id;
      const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id;
      if (userId) {
        await admin.from('profiles').update({ is_pro: true, stripe_customer_id: customerId, updated_at: new Date().toISOString() }).eq('id', userId);
      } else if (customerId) {
        await setProByCustomer(customerId, true);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
      const active = sub.status === 'active' || sub.status === 'trialing';
      await setProByCustomer(customerId, active);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
      await setProByCustomer(customerId, false);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

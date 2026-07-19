'use client';

// Kicks off Stripe Checkout. Posts to the server route, which creates a
// Checkout Session and returns its URL. Degrades clearly when unconfigured.
export async function startCheckout(interval: 'monthly' | 'annual'): Promise<{ error?: string }> {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? 'Checkout is not available yet.' };
    if (data.url) {
      window.location.href = data.url as string;
      return {};
    }
    return { error: 'Checkout did not return a URL.' };
  } catch {
    return { error: 'Could not reach the checkout service.' };
  }
}

export async function openBillingPortal(): Promise<{ error?: string }> {
  try {
    const res = await fetch('/api/portal', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? 'Billing portal is not available yet.' };
    if (data.url) {
      window.location.href = data.url as string;
      return {};
    }
    return { error: 'Portal did not return a URL.' };
  } catch {
    return { error: 'Could not reach the billing service.' };
  }
}

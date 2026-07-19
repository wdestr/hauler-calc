'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { usePlan } from '@/components/PlanProvider';
import { useUI } from '@/components/UIProvider';
import { startCheckout } from '@/lib/checkout';
import { FREE_FEATURES, PRO_FEATURES, PRICING } from '@/lib/plan';

export default function PricingPage() {
  const { plan, configured, user } = usePlan();
  const { openAuth } = useUI();
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const isPro = plan === 'pro';
  const price = PRICING[interval];

  async function upgrade() {
    if (configured && !user) { openAuth(); return; }
    setBusy(true); setErr('');
    const { error } = await startCheckout(interval); // routes to demo checkout until Stripe keys are set
    if (error) { setErr(error); setBusy(false); }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="eyebrow">Pricing</span>
        <h1 className="display-xl text-4xl sm:text-5xl text-ink mt-3 mb-4">Price the whole business.</h1>
        <p className="text-ink-soft">The core calculator is free forever. Pro unlocks the tools that decide big moves — cash flow, crew models, fleet scale, and truck financing.</p>
      </div>

      {/* Interval toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl border border-line p-1 bg-surface" role="tablist" aria-label="Billing interval">
          {(['annual', 'monthly'] as const).map((iv) => (
            <button key={iv} role="tab" aria-selected={interval === iv} onClick={() => setInterval(iv)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${interval === iv ? 'bg-brand-600 text-white' : 'text-muted hover:text-ink'}`}>
              {iv === 'annual' ? 'Annual' : 'Monthly'}
              {iv === 'annual' && <span className={`ml-1.5 text-[0.66rem] font-bold ${interval === iv ? 'text-brand-100' : 'text-brand-600'}`}>SAVE {PRICING.annual.savingsPct}%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {/* Free */}
        <div className="rounded-2xl border border-line bg-surface p-7">
          <h2 className="font-display text-2xl font-semibold text-ink">Free</h2>
          <div className="flex items-end gap-1.5 mt-2 mb-5">
            <span className="display-lg text-5xl text-ink tnum">$0</span>
            <span className="text-muted mb-2">forever</span>
          </div>
          <ul className="space-y-2.5 mb-7">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <span className="text-muted mt-0.5 shrink-0"><Icon name="check" size={16} /></span>{f}
              </li>
            ))}
          </ul>
          <Link href="/calculator" className="block text-center py-3 rounded-xl border border-line-strong text-ink font-semibold hover:bg-paper transition-colors">
            {isPro ? 'Open calculator' : 'Start free'}
          </Link>
        </div>

        {/* Pro */}
        <div className="rounded-2xl border-2 border-brand-500 bg-brand-50/30 p-7 relative shadow-[var(--shadow-plate)]">
          <span className="absolute -top-3 left-7 text-[0.66rem] font-bold text-white bg-brand-600 rounded-full px-3 py-1">MOST POPULAR</span>
          <h2 className="font-display text-2xl font-semibold text-ink">Pro</h2>
          <div className="flex items-end gap-1.5 mt-2 mb-1">
            <span className="display-lg text-5xl text-ink tnum">{price.label}</span>
            <span className="text-muted mb-2">{price.per}</span>
          </div>
          <p className="text-xs text-muted mb-5 h-4">
            {interval === 'annual' ? `~$${PRICING.annual.monthlyEquivalent}/mo · billed yearly` : 'billed monthly · cancel anytime'}
          </p>
          <ul className="space-y-2.5 mb-7">
            <li className="flex items-start gap-2.5 text-sm text-ink font-medium">
              <span className="text-brand-600 mt-0.5 shrink-0"><Icon name="check" size={16} /></span>Everything in Free, plus:
            </li>
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <span className="text-brand-600 mt-0.5 shrink-0"><Icon name="check" size={16} /></span>{f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="text-center py-3 rounded-xl bg-brand-100 text-brand-700 font-semibold">You&rsquo;re on Pro ✓</div>
          ) : (
            <button onClick={upgrade} disabled={busy}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors disabled:opacity-60">
              {busy ? 'Opening checkout…' : `Get Pro — ${price.label}${price.per}`}
            </button>
          )}
          {err && <p className="text-sm text-loss mt-2 text-center">{err}</p>}
          <p className="text-xs text-faint mt-3 text-center">
            {configured ? 'Secure checkout by Stripe · cancel anytime' : 'Demo checkout · connect Stripe to take real payments (SETUP.md)'}
          </p>
        </div>
      </div>

      <p className="text-center text-sm text-muted mt-10">
        Questions? Everything runs on Stripe and cancels anytime. <Link href="/#faq" className="text-brand-700 font-medium">Read the FAQ →</Link>
      </p>
    </div>
  );
}

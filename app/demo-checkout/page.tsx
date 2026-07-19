'use client';

// A working demo of the purchase flow — no Stripe account required. Looks and
// behaves like real checkout, unlocks Pro on "pay". The instant real Stripe keys
// are added (SETUP.md), the checkout route hands off to Stripe instead of here.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';
import { usePlan } from '@/components/PlanProvider';
import { PRICING } from '@/lib/plan';

export default function DemoCheckoutPage() {
  const router = useRouter();
  const { setPreviewPro } = usePlan();
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const iv = new URLSearchParams(window.location.search).get('interval');
    if (iv === 'monthly' || iv === 'annual') setInterval(iv);
  }, []);

  const price = PRICING[interval];

  function pay(e: React.FormEvent) {
    e.preventDefault();
    setPaying(true);
    setTimeout(() => {
      setPreviewPro(true);
      router.push('/calculator?upgraded=1');
    }, 1100);
  }

  return (
    <div className="min-h-[calc(100vh-3.75rem)] grid lg:grid-cols-2">
      {/* Order summary */}
      <div className="bg-brand-700 text-white px-6 sm:px-12 py-12 flex flex-col">
        <Logo />
        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <p className="text-brand-100 text-sm font-semibold uppercase tracking-wider mb-2">Subscribe to Hauler Calc Pro</p>
          <div className="flex items-end gap-2 mb-1">
            <span className="display-xl text-5xl tnum">{price.label}</span>
            <span className="text-brand-100 mb-2">{price.per}</span>
          </div>
          <p className="text-brand-100 text-sm mb-8">
            {interval === 'annual' ? `Billed yearly · ~$${PRICING.annual.monthlyEquivalent}/mo · save ${PRICING.annual.savingsPct}%` : 'Billed monthly · cancel anytime'}
          </p>
          <div className="space-y-2.5">
            {['Cash-flow timeline', 'W-2 vs 1099 analyzer', 'Fleet planner', 'Truck acquisition', 'Up to 10 profiles', 'PDF export'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-brand-50 text-sm">
                <span className="text-brand-200"><Icon name="check" size={16} /></span>{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment form */}
      <div className="px-6 sm:px-12 py-12 flex flex-col justify-center bg-paper">
        <form onSubmit={pay} className="w-full max-w-sm mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-warn bg-warn-bg border border-warn/25 rounded-full px-3 py-1 mb-6">
            <Icon name="bolt" size={13} /> DEMO MODE · no real charge
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink mb-6">Pay with card</h1>

          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Email</label>
          <input type="email" defaultValue="owner@myhauling.co" className="w-full mb-4 px-3.5 py-2.5 rounded-lg border border-line-strong bg-surface text-ink text-sm focus:border-brand-500" />

          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Card information</label>
          <div className="rounded-lg border border-line-strong bg-surface overflow-hidden mb-4 text-sm">
            <input defaultValue="4242 4242 4242 4242" className="w-full px-3.5 py-2.5 border-b border-line text-ink tnum focus:bg-brand-50/30 outline-none" />
            <div className="flex">
              <input defaultValue="12 / 34" className="w-1/2 px-3.5 py-2.5 border-r border-line text-ink tnum focus:bg-brand-50/30 outline-none" />
              <input defaultValue="123" className="w-1/2 px-3.5 py-2.5 text-ink tnum focus:bg-brand-50/30 outline-none" />
            </div>
          </div>

          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Name on card</label>
          <input defaultValue="Dana Ferro" className="w-full mb-6 px-3.5 py-2.5 rounded-lg border border-line-strong bg-surface text-ink text-sm focus:border-brand-500" />

          <button type="submit" disabled={paying}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors disabled:opacity-70">
            {paying ? 'Processing…' : `Subscribe — ${price.label}${price.per}`}
          </button>

          <p className="text-xs text-faint text-center mt-4">
            This is a demonstration. No card is charged and no data is stored.<br />
            <Link href="/pricing" className="text-brand-700 font-medium">Back to pricing</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

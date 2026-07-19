'use client';

import { useState } from 'react';
import Modal from './ui/Modal';
import Icon from './ui/Icon';
import { usePlan } from './PlanProvider';
import { PRICING, PRO_FEATURES } from '@/lib/plan';
import { startCheckout } from '@/lib/checkout';

export default function UpgradeModal({ open, onClose, feature }: { open: boolean; onClose: () => void; feature?: string }) {
  const { configured, user, setPreviewPro } = usePlan();
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function upgrade() {
    setBusy(true); setErr('');
    const { error } = await startCheckout(interval);
    if (error) { setErr(error); setBusy(false); }
  }

  const price = PRICING[interval];

  return (
    <Modal open={open} onClose={onClose} title="Unlock Hauler Calc Pro" maxWidth="max-w-lg">
      {feature && (
        <p className="text-sm text-muted mb-4">
          <span className="text-ink font-medium">{feature}</span> is a Pro tool. Upgrade to run the numbers the free tier can&rsquo;t.
        </p>
      )}

      <div className="inline-flex rounded-lg border border-line p-0.5 mb-4 bg-paper" role="tablist" aria-label="Billing interval">
        {(['annual', 'monthly'] as const).map((iv) => (
          <button
            key={iv} role="tab" aria-selected={interval === iv} onClick={() => setInterval(iv)}
            className={`px-3.5 py-1.5 text-sm font-semibold rounded-md transition-colors ${interval === iv ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}
          >
            {iv === 'annual' ? 'Annual' : 'Monthly'}
            {iv === 'annual' && <span className="ml-1.5 text-[0.68rem] font-bold text-brand-600">SAVE {PRICING.annual.savingsPct}%</span>}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 mb-1">
        <span className="display-lg text-4xl text-ink tnum">{price.label}</span>
        <span className="text-muted text-sm mb-1.5">{price.per}</span>
        {interval === 'annual' && (
          <span className="text-muted text-sm mb-1.5">· ~${PRICING.annual.monthlyEquivalent}/mo billed yearly</span>
        )}
      </div>

      <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-2 my-4">
        {PRO_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
            <span className="text-brand-600 mt-0.5 shrink-0"><Icon name="check" size={16} /></span>
            {f}
          </li>
        ))}
      </ul>

      {configured ? (
        <>
          <button
            onClick={upgrade} disabled={busy}
            className="w-full py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors disabled:opacity-60"
          >
            {busy ? 'Redirecting to checkout…' : user ? `Upgrade — ${price.label}${price.per}` : 'Sign in & upgrade'}
          </button>
          {err && <p className="text-sm text-loss mt-2">{err}</p>}
          <p className="text-xs text-faint mt-3 text-center">Secure checkout by Stripe · cancel anytime</p>
        </>
      ) : (
        <div className="rounded-lg bg-warn-bg border border-warn/25 px-4 py-3 text-sm">
          <p className="text-ink font-medium mb-1">Payments aren&rsquo;t switched on yet.</p>
          <p className="text-muted mb-3">Add your Stripe + Supabase keys (see <code className="text-brand-600">SETUP.md</code>) and this button goes live. Meanwhile, preview every Pro tool:</p>
          <button
            onClick={() => { setPreviewPro(true); onClose(); }}
            className="w-full py-2.5 rounded-lg bg-ink text-white font-semibold text-sm hover:bg-ink-soft transition-colors"
          >
            Preview Pro (this device)
          </button>
        </div>
      )}
    </Modal>
  );
}

'use client';

// Wraps a Pro tab. For free users it shows the real tool blurred behind an
// unlock card — proof there's value, not an empty paywall.
import { ReactNode } from 'react';
import Icon from '../ui/Icon';
import { usePlan } from '../PlanProvider';
import { useUI } from '../UIProvider';

export default function LockGate({ locked, feature, children }: { locked: boolean; feature: string; children: ReactNode }) {
  const { openUpgrade } = useUI();
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[3px] opacity-55" aria-hidden="true">{children}</div>
      <div className="absolute inset-0 grid place-items-center px-5">
        <div className="plate p-7 max-w-sm text-center shadow-[var(--shadow-lift)]">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mx-auto mb-3">
            <Icon name="lock" size={24} />
          </span>
          <h3 className="font-display text-xl font-semibold text-ink">{feature} is a Pro tool</h3>
          <p className="text-sm text-muted mt-1.5 mb-5">Unlock the cash-flow timeline, crew models, fleet planner, and truck-financing comparison.</p>
          <button onClick={() => openUpgrade(feature)}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">
            Unlock Pro — from $9/mo
          </button>
        </div>
      </div>
    </div>
  );
}

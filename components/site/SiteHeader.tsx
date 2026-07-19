'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '../ui/Logo';
import Icon from '../ui/Icon';
import { usePlan } from '../PlanProvider';
import { useUI } from '../UIProvider';
import { openBillingPortal } from '@/lib/checkout';

export default function SiteHeader() {
  const { plan, email, user, configured, previewPro, signOut, setPreviewPro } = usePlan();
  const { openAuth, openUpgrade } = useUI();
  const [menu, setMenu] = useState(false);
  const isPro = plan === 'pro';

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-line no-print">
      <div className="max-w-6xl mx-auto px-5 h-15 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <Logo />
          <nav className="hidden sm:flex items-center gap-5 text-sm font-medium text-muted">
            <Link href="/calculator" className="hover:text-ink transition-colors">Calculator</Link>
            <Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {isPro ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2.5 py-1">
              <Icon name="spark" size={13} /> PRO{!configured && previewPro ? ' · DEMO' : ''}
            </span>
          ) : (
            <button
              onClick={() => openUpgrade()}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-3.5 py-1.5 transition-colors"
            >
              <Icon name="spark" size={15} /> Upgrade
            </button>
          )}

          {configured && user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="grid place-items-center w-8 h-8 rounded-full bg-ink text-white text-xs font-bold"
                aria-label="Account menu" aria-expanded={menu}
              >
                {(email ?? '?')[0].toUpperCase()}
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-line rounded-xl shadow-[var(--shadow-lift)] py-1.5 text-sm">
                  <div className="px-3.5 py-2 border-b border-line">
                    <div className="text-faint text-xs">Signed in</div>
                    <div className="text-ink font-medium truncate">{email}</div>
                  </div>
                  {isPro && (
                    <button onClick={() => openBillingPortal()} className="w-full text-left px-3.5 py-2 text-ink-soft hover:bg-paper">Manage billing</button>
                  )}
                  {!isPro && (
                    <button onClick={() => { setMenu(false); openUpgrade(); }} className="w-full text-left px-3.5 py-2 text-brand-700 font-medium hover:bg-paper">Upgrade to Pro</button>
                  )}
                  <button onClick={() => { setMenu(false); signOut(); }} className="w-full text-left px-3.5 py-2 text-ink-soft hover:bg-paper">Sign out</button>
                </div>
              )}
            </div>
          ) : configured ? (
            <button onClick={openAuth} className="text-sm font-semibold text-ink-soft hover:text-ink px-2 py-1.5">Sign in</button>
          ) : previewPro ? (
            <button onClick={() => setPreviewPro(false)} className="text-xs font-medium text-muted hover:text-ink px-2 py-1.5" title="Reset the demo Pro unlock">Reset demo</button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

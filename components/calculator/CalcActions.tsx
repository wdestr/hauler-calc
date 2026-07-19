'use client';

// Share (free growth loop) + Export PDF (Pro). Rate card lives on the Pro tabs.
import { useState } from 'react';
import Icon from '../ui/Icon';
import { usePlan } from '../PlanProvider';
import { useUI } from '../UIProvider';
import { encodeInputs } from '@/lib/share';
import type { CalcInputs, CalcResults } from '@/types';

export default function CalcActions({ inputs }: { inputs: CalcInputs; results: CalcResults }) {
  const { plan } = usePlan();
  const { openUpgrade } = useUI();
  const [copied, setCopied] = useState(false);
  const isPro = plan === 'pro';

  async function share() {
    const url = `${window.location.origin}/calculator?s=${encodeInputs(inputs)}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My Hauler Calc scenario', url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  }

  function exportPdf() {
    if (!isPro) { openUpgrade('PDF export'); return; }
    window.print();
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={share}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink border border-line-strong rounded-lg px-3 py-1.5 hover:bg-surface transition-colors">
        <Icon name="share" size={15} /> {copied ? 'Link copied' : 'Share'}
      </button>
      <button onClick={exportPdf}
        className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 transition-colors
          border border-line-strong text-ink-soft hover:text-ink hover:bg-surface">
        <Icon name={isPro ? 'download' : 'lock'} size={15} /> Export PDF
      </button>
    </div>
  );
}

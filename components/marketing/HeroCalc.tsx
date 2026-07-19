'use client';

// The hero's live moment: type your rate and stops, watch the verdict land.
// Show-don't-tell — this IS the product, in miniature.
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Icon from '../ui/Icon';
import { fmt } from '@/lib/fmt';

export default function HeroCalc() {
  const [rate, setRate] = useState(125);
  const [stops, setStops] = useState(8);
  const [dailyCost, setDailyCost] = useState(560);

  const r = useMemo(() => {
    const revenue = rate * stops;
    const net = revenue - dailyCost;
    const perStop = stops > 0 ? net / stops : 0;
    const margin = revenue > 0 ? net / revenue : 0;
    const breakeven = rate > 0 ? dailyCost / rate : 0;
    return { revenue, net, perStop, margin, breakeven };
  }, [rate, stops, dailyCost]);

  const verdict = r.margin >= 0.2 ? 'good' : r.margin >= 0.08 ? 'thin' : 'bad';
  const verdictText = { good: 'Healthy margin', thin: 'Running thin', bad: 'Losing money' }[verdict];
  const verdictColor = { good: 'text-profit', thin: 'text-warn', bad: 'text-loss' }[verdict];
  const verdictBg = { good: 'bg-profit-bg', thin: 'bg-warn-bg', bad: 'bg-loss-bg' }[verdict];

  return (
    <div className="plate p-5 sm:p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <span className="eyebrow">Try it now</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${verdictBg} ${verdictColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" /> {verdictText}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Field label="Rate / stop" value={rate} onChange={setRate} prefix="$" />
        <Field label="Stops / day" value={stops} onChange={setStops} />
        <Field label="Daily cost" value={dailyCost} onChange={setDailyCost} prefix="$" />
      </div>

      <div className={`rounded-xl ${verdictBg} px-4 py-4 mb-3`}>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Your true profit / stop</div>
        <div className={`display-lg text-4xl tnum ${verdictColor}`}>
          {r.perStop < 0 ? '−' : ''}{fmt(Math.abs(r.perStop), 2)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-5">
        <Row label="Net / day" value={`${r.net < 0 ? '−' : ''}${fmt(Math.abs(r.net))}`} />
        <Row label="Margin" value={`${(r.margin * 100).toFixed(0)}%`} />
        <Row label="Break-even" value={`${r.breakeven.toFixed(1)} stops`} />
        <Row label="Revenue / day" value={fmt(r.revenue)} />
      </div>

      <Link
        href="/calculator"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Run the full breakdown <Icon name="arrow" size={17} />
      </Link>
    </div>
  );
}

function Field({ label, value, onChange, prefix }: { label: string; value: number; onChange: (n: number) => void; prefix?: string }) {
  return (
    <label className="block">
      <span className="block text-[0.68rem] font-semibold uppercase tracking-wide text-muted mb-1">{label}</span>
      <span className="flex items-center rounded-lg border border-line-strong bg-paper focus-within:border-brand-500 px-2 py-1.5">
        {prefix && <span className="text-faint text-sm mr-0.5">{prefix}</span>}
        <input
          type="number" value={value} inputMode="numeric"
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent outline-none text-ink font-semibold tnum text-sm"
          aria-label={label}
        />
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-ink font-semibold tnum">{value}</span>
    </div>
  );
}

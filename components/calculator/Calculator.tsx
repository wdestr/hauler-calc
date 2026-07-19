'use client';
import { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { calc } from '@/lib/calc';
import { fmt } from '@/lib/fmt';
import Icon, { type IconName } from '@/components/ui/Icon';
import type { CalcInputs } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

// Cohesive brand-derived breakdown palette (was rainbow SaaS defaults).
const SLICE = ['#0b7d5c', '#c98a2b', '#33997a', '#626b74', '#a3d5c1', '#c0342e'];

export default function Calculator({
  inputs,
  onInputsChange,
}: {
  inputs: CalcInputs;
  onInputsChange: (inputs: CalcInputs) => void;
}) {
  const [period, setPeriod] = useState<'day' | 'mo' | 'yr'>('day');
  const R = useMemo(() => calc(inputs), [inputs]);
  const mul = period === 'day' ? 1 : period === 'mo' ? R.dMo : R.dYr;

  const set = (key: keyof CalcInputs) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      onInputsChange({ ...inputs, [key]: val });
    };

  const perStopNet = R.stops > 0 ? R.netD / R.stops : 0;
  const verdict = R.margin >= 0.2 ? 'good' : R.margin >= 0.08 ? 'thin' : 'bad';
  const vText = { good: 'Healthy margin', thin: 'Running thin', bad: 'Losing money' }[verdict];
  const vCol = { good: 'text-profit', thin: 'text-warn', bad: 'text-loss' }[verdict];
  const vBg = { good: 'bg-profit-bg', thin: 'bg-warn-bg', bad: 'bg-loss-bg' }[verdict];

  const chartData = {
    labels: ['Labor', 'Fuel', 'Insurance', 'Vehicle', 'Overhead', 'Claims'],
    datasets: [{
      data: [R.labD, R.fuelD, R.insD, R.vehD, R.ovrD, R.claimsD].map((v) => Math.max(0, v)),
      backgroundColor: SLICE,
      borderWidth: 0,
    }],
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-7 print-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-5 items-start">

        {/* LEFT: Inputs */}
        <div className="space-y-3.5">
          <Card icon="coins" title="Revenue">
            <ToggleGroup
              options={[{ val: 'perstop', label: 'Per Stop' }, { val: 'flat', label: 'Flat Daily' }]}
              active={inputs.revMode}
              onSelect={(v) => onInputsChange({ ...inputs, revMode: v as 'perstop' | 'flat' })}
            />
            {inputs.revMode === 'perstop' ? (
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label="Stops/Day" value={inputs.stopsPerDay} onChange={set('stopsPerDay')} />
                <NumField label="Rate/Stop" value={inputs.ratePerStop} onChange={set('ratePerStop')} prefix="$" />
              </div>
            ) : (
              <NumField label="Daily Revenue" value={inputs.flatRev} onChange={set('flatRev')} prefix="$" />
            )}
            <NumField label="Days/Week" value={inputs.daysWk} onChange={set('daysWk')} min={1} max={7} className="mt-2.5" />
          </Card>

          <Card icon="crew" title="Labor">
            <ToggleGroup
              options={[{ val: 'hourly', label: 'Hourly' }, { val: 'daily', label: 'Daily Rate' }]}
              active={inputs.labMode}
              onSelect={(v) => onInputsChange({ ...inputs, labMode: v as 'hourly' | 'daily' })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <NumField label="Crew Size" value={inputs.crewSize} onChange={set('crewSize')} min={1} />
              {inputs.labMode === 'hourly' ? (
                <>
                  <NumField label="Hourly Rate" value={inputs.hrRate} onChange={set('hrRate')} prefix="$" />
                  <NumField label="Hours/Shift" value={inputs.hrShift} onChange={set('hrShift')} min={1} />
                </>
              ) : (
                <NumField label="Daily Rate/Person" value={inputs.dyRate} onChange={set('dyRate')} prefix="$" />
              )}
            </div>
            <label className="flex items-center gap-2 mt-3 text-xs font-semibold text-muted cursor-pointer">
              <input type="checkbox" checked={inputs.inclTax} onChange={set('inclTax')}
                className="rounded border-line-strong text-brand-600 focus:ring-brand-500" />
              Include payroll taxes (~8%)
            </label>
          </Card>

          <Card icon="fuel" title="Fuel">
            <ToggleGroup
              options={[{ val: 'miles', label: 'By Miles' }, { val: 'flat', label: 'Flat Daily' }]}
              active={inputs.fuelMode}
              onSelect={(v) => onInputsChange({ ...inputs, fuelMode: v as 'miles' | 'flat' })}
            />
            {inputs.fuelMode === 'miles' ? (
              <div className="grid grid-cols-3 gap-2.5">
                <NumField label="Miles/Day" value={inputs.milesDay} onChange={set('milesDay')} />
                <NumField label="MPG" value={inputs.mpg} onChange={set('mpg')} min={1} />
                <NumField label="Price/Gal" value={inputs.ppg} onChange={set('ppg')} prefix="$" />
              </div>
            ) : (
              <NumField label="Daily Fuel Cost" value={inputs.fuelFlat} onChange={set('fuelFlat')} prefix="$" />
            )}
          </Card>

          <Card icon="shield" title="Insurance — monthly">
            <div className="grid grid-cols-2 gap-2.5">
              <NumField label="Auto" value={inputs.insAuto} onChange={set('insAuto')} prefix="$" />
              <NumField label="General Liability" value={inputs.insGl} onChange={set('insGl')} prefix="$" />
              <NumField label="Cargo" value={inputs.insCargo} onChange={set('insCargo')} prefix="$" />
              <NumField label="Workers Comp" value={inputs.insWc} onChange={set('insWc')} prefix="$" />
            </div>
          </Card>

          <Card icon="truck" title="Vehicle — monthly">
            <div className="grid grid-cols-3 gap-2.5">
              <NumField label="Payment" value={inputs.vehPmt} onChange={set('vehPmt')} prefix="$" />
              <NumField label="Maintenance" value={inputs.vehMaint} onChange={set('vehMaint')} prefix="$" />
              <NumField label="Repairs" value={inputs.vehRepair} onChange={set('vehRepair')} prefix="$" />
            </div>
          </Card>

          <Card icon="clip" title="Overhead — monthly">
            <div className="grid grid-cols-3 gap-2.5">
              <NumField label="Permits" value={inputs.ovrPermits} onChange={set('ovrPermits')} prefix="$" />
              <NumField label="Software" value={inputs.ovrSoft} onChange={set('ovrSoft')} prefix="$" />
              <NumField label="Other" value={inputs.ovrOther} onChange={set('ovrOther')} prefix="$" />
            </div>
          </Card>

          <Card icon="chart" title="Risk & Tax">
            <div className="grid grid-cols-2 gap-2.5">
              <NumField label="Claims Rate (%)" value={inputs.claimsRate} onChange={set('claimsRate')} suffix="%" />
              <NumField label="Tax Rate (%)" value={inputs.taxRate} onChange={set('taxRate')} suffix="%" />
            </div>
          </Card>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:sticky lg:top-20 space-y-3.5">
          {/* Verdict hero — the number that decides the business */}
          <div className={`plate p-5 ${vBg} border-0`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">True profit / stop</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${vCol}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" /> {vText}
              </span>
            </div>
            <div className={`display-xl text-5xl tnum ${vCol}`} data-testid="result-net">
              {perStopNet < 0 ? '−' : ''}{fmt(Math.abs(perStopNet), 2)}
            </div>
            <div className="text-sm text-ink-soft mt-1">
              {(R.margin * 100).toFixed(0)}% margin · {fmt(R.netD)} net/day
            </div>
          </div>

          <ToggleGroup
            options={[{ val: 'day', label: 'Daily' }, { val: 'mo', label: 'Monthly' }, { val: 'yr', label: 'Annual' }]}
            active={period}
            onSelect={(v) => setPeriod(v as 'day' | 'mo' | 'yr')}
          />

          <div className="grid grid-cols-3 gap-2.5">
            <MetricTile label="Revenue" value={fmt(R.revD * mul)} tone="brand" testId="result-revenue" />
            <MetricTile label="Total Cost" value={fmt(R.totalD * mul)} tone="gold" />
            <MetricTile label="Net Income" value={fmt(R.netD * mul)} tone={R.netD >= 0 ? 'profit' : 'loss'} />
          </div>

          <div className="plate p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Where the money goes — {period === 'day' ? 'daily' : period === 'mo' ? 'monthly' : 'annual'}</div>
            <div className="h-44">
              <Doughnut data={chartData}
                options={{ responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, boxHeight: 10, font: { size: 12 }, color: '#39424a' } } } }} />
            </div>
          </div>

          <div className="plate p-4 text-sm">
            <KeyRow label="Cost per stop" value={fmt(R.cps, 2)} />
            <KeyRow label="Break-even stops/day" value={R.beStops.toFixed(1)} />
            <KeyRow label="Minimum rate/stop" value={fmt(R.minRate, 2)} />
            <KeyRow label="After-tax annual net" value={fmt(R.afterTax)} strong tone={R.afterTax >= 0 ? 'profit' : 'loss'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <div className="plate">
      <div className="px-4 py-3 border-b border-line flex items-center gap-2.5">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-50 text-brand-600 shrink-0"><Icon name={icon} size={16} /></span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink-soft">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ToggleGroup({ options, active, onSelect, className = '' }: {
  options: { val: string; label: string }[]; active: string; onSelect: (val: string) => void; className?: string;
}) {
  return (
    <div className={`flex bg-paper border border-line rounded-lg p-0.5 ${className}`}>
      {options.map((o) => (
        <button key={o.val} onClick={() => onSelect(o.val)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all
            ${active === o.val ? 'bg-surface text-brand-700 shadow-sm' : 'text-muted hover:text-ink'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NumField({ label, value, onChange, prefix, suffix, min, max, className = '' }: {
  label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string; suffix?: string; min?: number; max?: number; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-muted mb-1">
        {label}
        <div className="relative mt-1">
          {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-faint">{prefix}</span>}
          {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-faint">{suffix}</span>}
          <input type="number" value={value} onChange={onChange} min={min} max={max}
            className={`w-full border border-line-strong rounded-lg py-2 text-sm font-semibold text-ink tnum bg-surface
              focus:outline-none focus:border-brand-500
              ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-7' : 'pr-3'}`} />
        </div>
      </label>
    </div>
  );
}

function MetricTile({ label, value, tone, testId }: { label: string; value: string; tone: 'brand' | 'gold' | 'profit' | 'loss'; testId?: string }) {
  const bar = { brand: 'bg-brand-500', gold: 'bg-gold', profit: 'bg-profit', loss: 'bg-loss' }[tone];
  return (
    <div data-testid={testId} className="plate p-3 text-center relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
      <div className="text-[0.66rem] font-bold uppercase tracking-wider text-muted mb-1 mt-1">{label}</div>
      <div className="text-lg font-bold text-ink tnum">{value}</div>
    </div>
  );
}

function KeyRow({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: 'profit' | 'loss' }) {
  const col = tone === 'profit' ? 'text-profit' : tone === 'loss' ? 'text-loss' : 'text-ink';
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-line last:border-0">
      <span className="text-muted">{label}</span>
      <span className={`tnum ${strong ? 'font-extrabold' : 'font-bold'} ${col}`}>{value}</span>
    </div>
  );
}

'use client';
import { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { calc } from '@/lib/calc';
import { fmt } from '@/lib/fmt';
import type { CalcInputs } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Calculator({
  inputs,
  onInputsChange,
}: {
  inputs: CalcInputs;
  onInputsChange: (inputs: CalcInputs) => void;
}) {
  const [period, setPeriod] = useState<'day'|'mo'|'yr'>('day');
  const R   = useMemo(() => calc(inputs), [inputs]);
  const mul = period === 'day' ? 1 : period === 'mo' ? R.dMo : R.dYr;

  const set = (key: keyof CalcInputs) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      onInputsChange({ ...inputs, [key]: val });
    };

  const chartData = {
    labels: ['Labor', 'Fuel', 'Insurance', 'Vehicle', 'Overhead', 'Claims'],
    datasets: [{
      data: [R.labD, R.fuelD, R.insD, R.vehD, R.ovrD, R.claimsD].map(v => Math.max(0, v)),
      backgroundColor: ['#1B4FD8','#D97706','#059669','#7C3AED','#DB2777','#DC2626'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-7">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* LEFT: Input Cards */}
        <div>
          {/* Revenue */}
          <Card icon="💰" title="Revenue">
            <ToggleGroup
              options={[{ val: 'perstop', label: 'Per Stop' }, { val: 'flat', label: 'Flat Daily' }]}
              active={inputs.revMode}
              onSelect={v => onInputsChange({ ...inputs, revMode: v as 'perstop'|'flat' })}
            />
            {inputs.revMode === 'perstop' ? (
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label="Stops/Day"  value={inputs.stopsPerDay} onChange={set('stopsPerDay')} />
                <NumField label="Rate/Stop"  value={inputs.ratePerStop} onChange={set('ratePerStop')} prefix="$" />
              </div>
            ) : (
              <NumField label="Daily Revenue" value={inputs.flatRev} onChange={set('flatRev')} prefix="$" />
            )}
            <NumField label="Days/Week" value={inputs.daysWk} onChange={set('daysWk')} min={1} max={7} className="mt-2.5" />
          </Card>

          {/* Labor */}
          <Card icon="👷" title="Labor">
            <ToggleGroup
              options={[{ val: 'hourly', label: 'Hourly' }, { val: 'daily', label: 'Daily Rate' }]}
              active={inputs.labMode}
              onSelect={v => onInputsChange({ ...inputs, labMode: v as 'hourly'|'daily' })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <NumField label="Crew Size" value={inputs.crewSize} onChange={set('crewSize')} min={1} />
              {inputs.labMode === 'hourly' ? (
                <>
                  <NumField label="Hourly Rate"  value={inputs.hrRate}  onChange={set('hrRate')}  prefix="$" />
                  <NumField label="Hours/Shift"  value={inputs.hrShift} onChange={set('hrShift')} min={1} />
                </>
              ) : (
                <NumField label="Daily Rate/Person" value={inputs.dyRate} onChange={set('dyRate')} prefix="$" />
              )}
            </div>
            <label className="flex items-center gap-2 mt-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
              <input type="checkbox" checked={inputs.inclTax} onChange={set('inclTax')}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Include payroll taxes (~8%)
            </label>
          </Card>

          {/* Fuel */}
          <Card icon="⛽" title="Fuel">
            <ToggleGroup
              options={[{ val: 'miles', label: 'By Miles' }, { val: 'flat', label: 'Flat Cost' }]}
              active={inputs.fuelMode}
              onSelect={v => onInputsChange({ ...inputs, fuelMode: v as 'miles'|'flat' })}
            />
            {inputs.fuelMode === 'miles' ? (
              <div className="grid grid-cols-3 gap-2.5">
                <NumField label="Miles/Day" value={inputs.milesDay} onChange={set('milesDay')} />
                <NumField label="MPG"       value={inputs.mpg}      onChange={set('mpg')}      min={1} />
                <NumField label="Price/Gal" value={inputs.ppg}      onChange={set('ppg')}      prefix="$" />
              </div>
            ) : (
              <NumField label="Daily Fuel Cost" value={inputs.fuelFlat} onChange={set('fuelFlat')} prefix="$" />
            )}
          </Card>

          {/* Insurance */}
          <Card icon="🛡️" title="Insurance (monthly)">
            <div className="grid grid-cols-2 gap-2.5">
              <NumField label="Auto"        value={inputs.insAuto}  onChange={set('insAuto')}  prefix="$" />
              <NumField label="GL"          value={inputs.insGl}    onChange={set('insGl')}    prefix="$" />
              <NumField label="Cargo"       value={inputs.insCargo} onChange={set('insCargo')} prefix="$" />
              <NumField label="Workers Comp" value={inputs.insWc}   onChange={set('insWc')}    prefix="$" />
            </div>
          </Card>

          {/* Vehicle */}
          <Card icon="🚛" title="Vehicle (monthly)">
            <div className="grid grid-cols-3 gap-2.5">
              <NumField label="Payment"     value={inputs.vehPmt}    onChange={set('vehPmt')}    prefix="$" />
              <NumField label="Maintenance" value={inputs.vehMaint}  onChange={set('vehMaint')}  prefix="$" />
              <NumField label="Repairs"     value={inputs.vehRepair} onChange={set('vehRepair')} prefix="$" />
            </div>
          </Card>

          {/* Overhead */}
          <Card icon="🏢" title="Overhead (monthly)">
            <div className="grid grid-cols-3 gap-2.5">
              <NumField label="Permits"  value={inputs.ovrPermits} onChange={set('ovrPermits')} prefix="$" />
              <NumField label="Software" value={inputs.ovrSoft}    onChange={set('ovrSoft')}    prefix="$" />
              <NumField label="Other"    value={inputs.ovrOther}   onChange={set('ovrOther')}   prefix="$" />
            </div>
          </Card>

          {/* Risk & Tax */}
          <Card icon="📊" title="Risk & Tax">
            <div className="grid grid-cols-2 gap-2.5">
              <NumField label="Claims Rate (%)" value={inputs.claimsRate} onChange={set('claimsRate')} suffix="%" />
              <NumField label="Tax Rate (%)"    value={inputs.taxRate}    onChange={set('taxRate')}    suffix="%" />
            </div>
          </Card>
        </div>

        {/* RIGHT: Results Panel */}
        <div className="lg:sticky lg:top-5">
          <ToggleGroup
            options={[{ val: 'day', label: 'Daily' }, { val: 'mo', label: 'Monthly' }, { val: 'yr', label: 'Annual' }]}
            active={period}
            onSelect={v => setPeriod(v as 'day'|'mo'|'yr')}
            className="mb-3.5"
          />

          <div className="grid grid-cols-3 gap-2.5 mb-3.5">
            <MetricTile label="Gross"      value={fmt(R.revD   * mul)} colorClass="border-t-blue-600" />
            <MetricTile label="Total Cost" value={fmt(R.totalD * mul)} colorClass="border-t-amber-500" />
            <MetricTile label="Net Income" value={fmt(R.netD   * mul)}
              colorClass={R.netD >= 0 ? 'border-t-green-600' : 'border-t-red-600'}
              testId="result-net" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-3.5">
            <div className="h-48">
              <Doughnut data={chartData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Cost per stop</span>
              <span className="font-bold text-slate-800">{fmt(R.cps, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Break-even stops/day</span>
              <span className="font-bold text-slate-800">{R.beStops.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">After-tax annual net</span>
              <span className={`font-extrabold ${R.afterTax >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(R.afterTax)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-3.5">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ToggleGroup({ options, active, onSelect, className = '' }: {
  options: { val: string; label: string }[];
  active: string;
  onSelect: (val: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex bg-slate-100 rounded-lg p-0.5 mb-3 ${className}`}>
      {options.map(o => (
        <button key={o.val} onClick={() => onSelect(o.val)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all
            ${active === o.val ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NumField({ label, value, onChange, prefix, suffix, min, max, className = '' }: {
  label: string; value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string; suffix?: string; min?: number; max?: number; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
        {label}
        <div className="relative mt-1">
          {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{prefix}</span>}
          {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{suffix}</span>}
          <input type="number" value={value} onChange={onChange} min={min} max={max}
            className={`w-full border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-800
              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
              ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-7' : 'pr-3'}`} />
        </div>
      </label>
    </div>
  );
}

function MetricTile({ label, value, colorClass, testId }: {
  label: string; value: string; colorClass: string; testId?: string;
}) {
  return (
    <div data-testid={testId}
      className={`bg-slate-50 border border-slate-200 border-t-4 ${colorClass} rounded-lg p-3 text-center`}>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-extrabold text-slate-800">{value}</div>
    </div>
  );
}

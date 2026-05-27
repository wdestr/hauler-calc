'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { calcTruck } from '@/lib/calcTruck';
import { getProfiles } from '@/lib/profiles';
import type { TruckInputs, CalcInputs, LocalProfile } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────────────

const $ = (n: number, dec = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  }).format(n);

function calcProfileMargin(
  mode: string,
  modeMonthly: number,
  ps: CalcInputs,
  icRate: number,
): number | null {
  const dMo = ps.daysWk * (52 / 12);
  const stops = ps.stopsPerDay;
  const revD = ps.revMode === 'flat' ? ps.flatRev : stops * ps.ratePerStop;
  const revPerMonth = revD * dMo;
  if (revPerMonth <= 0) return null;
  const taxM = ps.inclTax ? 1.08 : 1.0;
  const labD =
    ps.labMode === 'hourly'
      ? ps.crewSize * ps.hrRate * ps.hrShift * taxM
      : ps.crewSize * ps.dyRate * taxM;
  const fuelD =
    ps.fuelMode === 'miles'
      ? (ps.milesDay / Math.max(ps.mpg, 0.5)) * ps.ppg
      : ps.fuelFlat;
  const insD = (ps.insAuto + ps.insGl + ps.insCargo + ps.insWc) / dMo;
  const ovrD = (ps.ovrPermits + ps.ovrSoft + ps.ovrOther) / dMo;
  const claimsD = (revPerMonth / dMo) * (ps.claimsRate / 100);
  // modeMonthly REPLACES the profile's existing vehicle costs (vehPmt/vehMaint/vehRepair)
  // — this answers "what would margin be if you switched to this acquisition mode?"
  const total =
    mode === 'ic'
      ? icRate * stops * dMo + (fuelD + insD + ovrD + claimsD) * dMo
      : modeMonthly + (labD + fuelD + insD + ovrD + claimsD) * dMo;
  return (revPerMonth - total) / revPerMonth;
}

function marginClass(m: number | null): string {
  if (m === null) return 'text-slate-400';
  if (m >= 0.15) return 'text-green-700 font-semibold';
  if (m >= 0.05) return 'text-amber-600 font-semibold';
  return 'text-red-600 font-semibold';
}

function marginLabel(m: number | null): string {
  if (m === null) return '—';
  return (m * 100).toFixed(1) + '%';
}

// ─── default inputs ──────────────────────────────────────────────────────────

const DEFAULT_TRUCK_INPUTS: TruckInputs = {
  rentCost: 2400, rentMaintIncluded: false, rentMaint: 300,
  leasePmt: 1850, leaseTerm: 48, leaseCapReduction: 2000,
  leaseBuyoutPct: 20, leaseOrigValue: 45000, leaseFullMaint: false, leaseMaint: 300,
  loanPrice: 55000, loanDown: 10000, loanRate: 7.5, loanTerm: 60,
  loanResale: 15000, loanMaint: 400,
  cashPrice: 55000, cashResale: 15000, cashLife: 5, cashMaint: 400,
  icRate: 0,
};

// ─── sub-components ───────────────────────────────────────────────────────────

function NumInput({
  label, id, value, onChange, prefix, suffix, hint, min = 0, max, step,
}: {
  label: string; id: string; value: number;
  onChange: (v: number) => void;
  prefix?: string; suffix?: string; hint?: string;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-slate-400 text-sm pointer-events-none">{prefix}</span>}
        <input
          id={id} type="number" value={value} min={min} max={max} step={step}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-full border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-800
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'}`}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {suffix && <span className="absolute right-3 text-slate-400 text-sm pointer-events-none">{suffix}</span>}
      </div>
      {hint && <p id={`${id}-hint`} className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Card({ icon, title, children, action }: {
  icon: string; title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function TruckAcquisitionTab({
  calInputs,
  onCalcInputsChange,
}: {
  calInputs: CalcInputs;
  onCalcInputsChange: (inputs: CalcInputs) => void;
}) {
  const [inputs, setInputs] = useState<TruckInputs>(DEFAULT_TRUCK_INPUTS);
  const [icBanner, setIcBanner] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setProfiles(getProfiles());
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const T = useMemo(
    () => calcTruck(inputs, { stopsPerDay: calInputs.stopsPerDay, daysWk: calInputs.daysWk }),
    [inputs, calInputs.stopsPerDay, calInputs.daysWk],
  );

  // helper to update a single field
  function set<K extends keyof TruckInputs>(key: K, val: TruckInputs[K]) {
    setInputs(prev => ({ ...prev, [key]: val }));
  }

  function useTruckMode(mode: string) {
    if (mode === 'ic') {
      const dailyIC = inputs.icRate * calInputs.stopsPerDay;
      onCalcInputsChange({
        ...calInputs,
        labMode: 'daily',
        crewSize: 1,
        dyRate: dailyIC,
        vehPmt: 0, vehMaint: 0, vehRepair: 0,
      });
      setIcBanner(true);
    } else {
      let vp = 0, vm = 0;
      if (mode === 'rent') {
        vp = inputs.rentCost;
        vm = inputs.rentMaintIncluded ? 0 : inputs.rentMaint;
      } else if (mode === 'lease') {
        vp = inputs.leasePmt;
        vm = inputs.leaseFullMaint ? 0 : inputs.leaseMaint;
      } else if (mode === 'loan') {
        vp = Math.round(T.loan.monthlyPayment);
        vm = inputs.loanMaint;
      } else if (mode === 'cash') {
        vp = inputs.cashLife > 0
          ? Math.round((inputs.cashPrice - inputs.cashResale) / (inputs.cashLife * 12))
          : 0;
        vm = inputs.cashMaint;
      }
      onCalcInputsChange({ ...calInputs, vehPmt: vp, vehMaint: vm });
      const label = mode.charAt(0).toUpperCase() + mode.slice(1);
      setToast(`Vehicle costs updated from ${label} scenario.`);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    }
  }

  // comparison table data
  const rows: { key: string; label: string; monthly: number; fiveYr: number; cps: number | null }[] = [
    { key: 'rent',  label: 'Rent',      monthly: T.rent.monthly,  fiveYr: T.rent.fiveYr,  cps: T.rent.cps },
    { key: 'lease', label: 'Lease',     monthly: T.lease.monthly, fiveYr: T.lease.fiveYr, cps: T.lease.cps },
    { key: 'loan',  label: 'Buy (Loan)',monthly: T.loan.monthly,  fiveYr: T.loan.fiveYr,  cps: T.loan.cps },
    { key: 'cash',  label: 'Buy (Cash)',monthly: T.cash.monthly,  fiveYr: T.cash.fiveYr,  cps: T.cash.cps },
    { key: 'ic',    label: 'IC / 1099', monthly: T.ic.monthly,   fiveYr: T.ic.fiveYr,    cps: T.ic.cps },
  ];

  const nonIcFiveYrs = rows.filter(r => r.key !== 'ic').map(r => r.fiveYr);
  const cheapest5yr  = nonIcFiveYrs.length ? Math.min(...nonIcFiveYrs) : null;

  const showProfileCols = profiles.length >= 2;

  return (
    <div className="max-w-6xl mx-auto px-5 py-7">

      {/* Context strip */}
      <div className="flex flex-wrap items-center gap-3 mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm text-blue-800">
        <span>📍 Context:</span>
        <span className="font-semibold">{calInputs.stopsPerDay} stops/day</span>
        <span className="text-blue-400">·</span>
        <span className="font-semibold">{calInputs.daysWk} days/week</span>
        <span className="text-xs text-blue-500 italic">(edit on Calculator tab)</span>
      </div>

      {/* IC banner */}
      {icBanner && (
        <div className="flex items-start justify-between gap-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <div>
            <strong>IC / 1099 mode applied.</strong> Labor is now set to IC daily rate; vehicle payment and
            maintenance are cleared to $0. Switch back to another acquisition mode to undo.
          </div>
          <button onClick={() => setIcBanner(false)} className="text-amber-500 hover:text-amber-700 font-bold text-lg leading-none mt-0.5">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

        {/* LEFT: Input Cards */}
        <div>

          {/* Rent */}
          <Card icon="🔑" title="Rent / Short-Term Lease">
            <div className="grid grid-cols-2 gap-x-4">
              <NumInput label="Monthly Rent" id="rentCost" value={inputs.rentCost}
                onChange={v => set('rentCost', v)} prefix="$" />
              <NumInput label="Monthly Maintenance" id="rentMaint" value={inputs.rentMaint}
                onChange={v => set('rentMaint', v)} prefix="$" />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
              <input type="checkbox" checked={inputs.rentMaintIncluded}
                onChange={e => set('rentMaintIncluded', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Maintenance included in rent
            </label>
          </Card>

          {/* Lease */}
          <Card icon="📄" title="Lease (Capital / Operating)">
            <div className="grid grid-cols-2 gap-x-4">
              <NumInput label="Monthly Payment" id="leasePmt" value={inputs.leasePmt}
                onChange={v => set('leasePmt', v)} prefix="$" />
              <NumInput label="Term (months)" id="leaseTerm" value={inputs.leaseTerm}
                onChange={v => set('leaseTerm', v)} min={1}
                hint="< 60 mo → renewed at same rate for 5-yr calc" />
              <NumInput label="Cap Cost Reduction" id="leaseCapReduction" value={inputs.leaseCapReduction}
                onChange={v => set('leaseCapReduction', v)} prefix="$" />
              <NumInput label="Buyout %" id="leaseBuyoutPct" value={inputs.leaseBuyoutPct}
                onChange={v => set('leaseBuyoutPct', v)} suffix="%" max={100} />
              <NumInput label="Original Value" id="leaseOrigValue" value={inputs.leaseOrigValue}
                onChange={v => set('leaseOrigValue', v)} prefix="$" />
              <NumInput label="Monthly Maintenance" id="leaseMaint" value={inputs.leaseMaint}
                onChange={v => set('leaseMaint', v)} prefix="$" />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer mt-1">
              <input type="checkbox" checked={inputs.leaseFullMaint}
                onChange={e => set('leaseFullMaint', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Full maintenance included
            </label>
          </Card>

          {/* Buy Loan */}
          <Card icon="🏦" title="Buy — Financed (Loan)">
            <div className="grid grid-cols-2 gap-x-4">
              <NumInput label="Purchase Price" id="loanPrice" value={inputs.loanPrice}
                onChange={v => set('loanPrice', v)} prefix="$" />
              <NumInput label="Down Payment" id="loanDown" value={inputs.loanDown}
                onChange={v => set('loanDown', v)} prefix="$" />
              <NumInput label="Interest Rate" id="loanRate" value={inputs.loanRate}
                onChange={v => set('loanRate', v)} suffix="%" step={0.1} min={0} />
              <NumInput label="Term (months)" id="loanTerm" value={inputs.loanTerm}
                onChange={v => set('loanTerm', v)} min={1}
                hint="> 60 mo → capped at 60 mo for 5-yr" />
              <NumInput label="Resale Value" id="loanResale" value={inputs.loanResale}
                onChange={v => set('loanResale', v)} prefix="$" />
              <NumInput label="Monthly Maintenance" id="loanMaint" value={inputs.loanMaint}
                onChange={v => set('loanMaint', v)} prefix="$" />
            </div>
          </Card>

          {/* Buy Cash */}
          <Card icon="💵" title="Buy — Cash / Outright">
            <div className="grid grid-cols-2 gap-x-4">
              <NumInput label="Purchase Price" id="cashPrice" value={inputs.cashPrice}
                onChange={v => set('cashPrice', v)} prefix="$" />
              <NumInput label="Resale Value" id="cashResale" value={inputs.cashResale}
                onChange={v => set('cashResale', v)} prefix="$" />
              <NumInput label="Useful Life (years)" id="cashLife" value={inputs.cashLife}
                onChange={v => set('cashLife', v)} min={1} step={1} />
              <NumInput label="Monthly Maintenance" id="cashMaint" value={inputs.cashMaint}
                onChange={v => set('cashMaint', v)} prefix="$" />
            </div>
          </Card>

          {/* IC Per-Stop */}
          <Card icon="🤝" title="IC / 1099 — Per-Stop Rate">
            <NumInput label="IC Rate per Stop" id="icRate" value={inputs.icRate}
              onChange={v => set('icRate', v)} prefix="$" step={0.01}
              hint="Replaces labor + vehicle cost when applied" />
            <div className="mt-1 text-xs text-slate-400">
              Monthly IC cost: <strong className="text-slate-600">{$(inputs.icRate * calInputs.stopsPerDay * T.dMo)}</strong>
              {' '}({calInputs.stopsPerDay} stops/day × {T.dMo.toFixed(1)} days/mo)
            </div>
          </Card>

        </div>

        {/* RIGHT: Comparison Table */}
        <div className="xl:sticky xl:top-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="text-base">📊</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">5-Year Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="text-left px-4 py-2">Mode</th>
                    <th className="text-right px-3 py-2">Monthly</th>
                    <th className="text-right px-3 py-2">Cost/Stop</th>
                    <th className="text-right px-3 py-2">5-Year Total</th>
                    <th className="text-right px-3 py-2">vs. Cheapest</th>
                    {showProfileCols && profiles.map(p => (
                      <th key={p.id} className="text-right px-3 py-2 text-blue-600 min-w-[90px]">{p.name}</th>
                    ))}
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const isCheapest = row.key !== 'ic' && row.fiveYr === cheapest5yr;
                    const vs = row.key === 'ic'
                      ? null
                      : cheapest5yr !== null ? row.fiveYr - cheapest5yr : null;

                    return (
                      <tr key={row.key}
                        className={`border-b border-slate-50 ${isCheapest ? 'bg-green-50' : 'hover:bg-slate-50'}`}>
                        <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                          {row.label}
                          {isCheapest && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 rounded-full px-1.5 py-0.5 font-bold">
                              cheapest
                            </span>
                          )}
                        </td>
                        <td className="text-right px-3 py-3 text-slate-700">{$(row.monthly)}</td>
                        <td className="text-right px-3 py-3 text-slate-600">
                          {row.cps !== null ? $(row.cps, 2) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="text-right px-3 py-3 font-semibold text-slate-800">
                          {$(row.fiveYr)}
                          {row.key === 'lease' && inputs.leaseTerm < 60 && <sup className="text-xs ml-0.5">†</sup>}
                          {row.key === 'loan' && inputs.loanTerm > 60 && <sup className="text-xs ml-0.5">‡</sup>}
                        </td>
                        <td className="text-right px-3 py-3">
                          {row.key === 'ic' ? (
                            <span className="text-xs text-slate-400 italic">replaces labor+vehicle</span>
                          ) : vs !== null ? (
                            <span className={vs === 0 ? 'text-green-700 font-semibold' : 'text-slate-600'}>
                              {vs === 0 ? '—' : `+${$(vs)}`}
                            </span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        {showProfileCols && profiles.map(p => {
                          const m = calcProfileMargin(row.key, row.monthly, p.state, inputs.icRate);
                          return (
                            <td key={p.id} className={`text-right px-3 py-3 ${marginClass(m)}`}>
                              {marginLabel(m)}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3">
                          <button
                            onClick={() => useTruckMode(row.key)}
                            className="whitespace-nowrap px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                            Use in Calc →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* footnotes */}
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 space-y-1">
              {inputs.leaseTerm < 60 && (
                <p>† Lease term is {inputs.leaseTerm} months; 5-year total assumes renewal at same rate.</p>
              )}
              {inputs.loanTerm > 60 && (
                <p>‡ Loan term is {inputs.loanTerm} months; 5-year total uses only first 60 payments.</p>
              )}
              {T.lease.buyoutAmt > 0 && (
                <p>Lease buyout option: {$(T.lease.buyoutAmt)} ({inputs.leaseBuyoutPct}% of {$(inputs.leaseOrigValue)}) — not included in 5-yr total.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm font-semibold
          px-5 py-3 rounded-xl shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}

'use client';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import type { CalcResults } from '@/types';
import { fmt } from '@/lib/fmt';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function W2v1099Tab({ results: R }: { results: CalcResults }) {
  const [wage,    setWage]    = useState(R.labD / Math.max(R.crew, 1) / 10);
  const [hours,   setHours]   = useState(10);
  const [pto,     setPto]     = useState(10);
  const [markup,  setMarkup]  = useState(15);
  const [riskRes, setRiskRes] = useState(0);

  const analysis = useMemo(() => {
    const baseYr   = wage * hours * R.dYr;
    const fica     = baseYr * 0.0765;
    const futa     = Math.min(baseYr, 7000) * 0.006;
    const suta     = baseYr * 0.027;
    const ptoVal   = (wage * hours) * pto;
    const w2pp     = baseYr + fica + futa + suta + ptoVal;
    const w2Tot    = w2pp * R.crew;
    const base1099 = baseYr * (1 + markup / 100);
    const tot1099  = base1099 * R.crew + riskRes;
    const stopsYr  = R.stops * R.dYr;
    const w2cps    = stopsYr > 0 ? w2Tot / stopsYr : 0;
    const c1099cps = stopsYr > 0 ? tot1099 / stopsYr : 0;
    const cheaper  = w2Tot <= tot1099 ? 'w2' : '1099';
    const saving   = Math.abs(w2Tot - tot1099);
    return { w2Tot, tot1099, w2cps, c1099cps, cheaper, saving };
  }, [R, wage, hours, pto, markup, riskRes]);

  const data = {
    labels: ['W-2 Employees', '1099 Contractors'],
    datasets: [{
      label: 'Annual Labor Cost',
      data: [analysis.w2Tot, analysis.tot1099],
      backgroundColor: ['rgba(27,79,216,0.7)', 'rgba(217,119,6,0.7)'],
      borderRadius: 4,
    }],
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-6">
      <h2 className="text-lg font-bold text-ink mb-4">W-2 vs 1099 Analyzer</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'W-2 Hourly Wage ($)', val: wage,    set: setWage },
          { label: 'Hours/Shift',         val: hours,   set: setHours },
          { label: 'PTO Days/Year',        val: pto,     set: setPto },
          { label: '1099 Markup (%)',      val: markup,  set: setMarkup },
          { label: 'Risk Reserve ($/yr)',  val: riskRes, set: setRiskRes },
        ].map(({ label, val, set }) => (
          <label key={label} className="block text-xs font-bold uppercase text-muted">
            {label}
            <input type="number" value={val} onChange={e => set(+e.target.value)}
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm" />
          </label>
        ))}
      </div>
      <div className="bg-surface border border-line rounded-xl p-4 mb-4 h-56">
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
      </div>
      <div className={`rounded-xl p-4 text-sm font-medium ${analysis.cheaper === 'w2' ? 'bg-brand-50 text-brand-800' : 'bg-amber-50 text-amber-800'}`}>
        {analysis.cheaper === 'w2' ? 'W-2 employees' : '1099 contractors'} are cheaper by <strong>{fmt(analysis.saving)}/yr</strong>
        {'  '} · Cost/stop: W-2 {fmt(analysis.w2cps, 2)} vs 1099 {fmt(analysis.c1099cps, 2)}
      </div>
    </div>
  );
}

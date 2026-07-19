'use client';
import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import type { CalcResults } from '@/types';
import { fmt } from '@/lib/fmt';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function CashFlowTab({ results: R }: { results: CalcResults }) {
  const [reserve, setReserve]     = useState(0);
  const [terms, setTerms]         = useState(30);
  const [laborFreq, setLaborFreq] = useState<'weekly'|'biweekly'>('weekly');

  const weeks = useMemo(() => {
    const revWeek      = R.revD * R.dW;
    const laborWeek    = R.labD * R.dW;
    const nonLaborWeek = (R.fuelD + R.insD + R.vehD + R.ovrD + R.claimsD) * R.dW;
    const delayWeeks   = Math.ceil(terms / 7);

    let cash = reserve;
    return Array.from({ length: 13 }, (_, i) => {
      if (i > 0) {
        const payrollDue = laborFreq === 'weekly' || i % 2 === 0;
        cash -= nonLaborWeek;
        if (payrollDue) cash -= laborWeek;
        if (i > delayWeeks) cash += revWeek;
      }
      return { week: i, balance: cash };
    });
  }, [R, reserve, terms, laborFreq]);

  const lowestBalance = Math.min(...weeks.map(w => w.balance));

  const data = {
    labels: weeks.map(w => `Wk ${w.week}`),
    datasets: [{
      label: 'Cash Balance',
      data: weeks.map(w => w.balance),
      borderColor: '#0b7d5c',
      backgroundColor: 'rgba(27,79,216,0.08)',
      fill: true, tension: 0.35, pointRadius: 3,
    }],
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-6">
      <h2 className="text-lg font-bold text-ink mb-4">Cash Flow Timeline</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <label className="block text-xs font-bold uppercase text-muted">
          Starting Cash Reserve ($)
          <input type="number" value={reserve} onChange={e => setReserve(+e.target.value)}
            className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs font-bold uppercase text-muted">
          Payment Terms (days)
          <input type="number" value={terms} onChange={e => setTerms(+e.target.value)}
            className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs font-bold uppercase text-muted">
          Labor Pay Frequency
          <select value={laborFreq} onChange={e => setLaborFreq(e.target.value as 'weekly'|'biweekly')}
            className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm">
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
          </select>
        </label>
      </div>
      <div className="bg-surface border border-line rounded-xl p-4 mb-4 h-64">
        <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
      {lowestBalance < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <strong>Cash gap detected:</strong> Lowest balance is {fmt(lowestBalance)}.
          Consider increasing your starting reserve or negotiating shorter payment terms.
        </div>
      )}
    </div>
  );
}

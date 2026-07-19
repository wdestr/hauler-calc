'use client';
import { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { CalcResults, FleetVehicle } from '@/types';
import { fmt, pct } from '@/lib/fmt';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PRESETS: Record<string, Omit<FleetVehicle, 'name'|'count'>> = {
  'Cargo Van':        { stops: 12, rate: 85,  laborD: 280, fuelD: 22, fixedMo: 1100, daysWk: 6 },
  'Box Truck (16ft)': { stops: 10, rate: 105, laborD: 360, fuelD: 32, fixedMo: 1800, daysWk: 6 },
  'Box Truck (26ft)': { stops: 8,  rate: 125, laborD: 440, fuelD: 40, fixedMo: 2300, daysWk: 6 },
  'Sprinter Van':     { stops: 14, rate: 75,  laborD: 260, fuelD: 25, fixedMo: 1200, daysWk: 6 },
  'Custom':           { stops: 8,  rate: 100, laborD: 400, fuelD: 35, fixedMo: 2000, daysWk: 6 },
};

const DEFAULT_FLEET: FleetVehicle[] = [
  { name: 'Box Truck (26ft)', count: 1, stops: 8, rate: 125, laborD: 440, fuelD: 40, fixedMo: 2300, daysWk: 6 },
];

export default function FleetPlannerTab({ results: R }: { results: CalcResults }) {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(DEFAULT_FLEET);
  const taxR = R.taxR || 0.25;

  const results = useMemo(() => vehicles.map(fv => {
    const dMo    = fv.daysWk * (52 / 12);
    const dYr    = fv.daysWk * 52;
    const fixedD = fv.fixedMo / dMo;
    const costD  = fv.laborD + fv.fuelD + fixedD;
    const revD   = fv.stops * fv.rate;
    const netD   = revD - costD;
    const margin = revD > 0 ? netD / revD : 0;
    const cps    = fv.stops > 0 ? costD / fv.stops : 0;
    const annualNet = netD * dYr * (1 - taxR) * fv.count;
    return { ...fv, costD, revD, netD, margin, cps, annualNet, dYr };
  }), [vehicles, taxR]);

  const totalRevD  = results.reduce((s, r) => s + r.revD  * r.count, 0);
  const totalCostD = results.reduce((s, r) => s + r.costD * r.count, 0);
  const totalNetD  = totalRevD - totalCostD;

  function updateVehicle(i: number, field: keyof FleetVehicle, value: number | string) {
    setVehicles(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function applyPreset(i: number, name: string) {
    const preset = PRESETS[name];
    if (preset) setVehicles(prev => prev.map((v, idx) => idx === i ? { ...v, name, ...preset } : v));
  }

  const chartData = {
    labels: results.map(r => `${r.count}x ${r.name}`),
    datasets: [
      { label: 'Daily Revenue', data: results.map(r => Math.round(r.revD * r.count)), backgroundColor: 'rgba(27,79,216,0.65)', borderRadius: 4 },
      { label: 'Daily Cost',    data: results.map(r => Math.round(r.costD * r.count)), backgroundColor: 'rgba(217,119,6,0.65)',  borderRadius: 4 },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Fleet Planner</h2>
        <button onClick={() => setVehicles(p => [...p, { ...DEFAULT_FLEET[0], name: 'Cargo Van', ...PRESETS['Cargo Van'] }])}
          className="text-xs font-semibold text-brand-700 border border-brand-200 rounded-lg px-3 py-1.5 hover:bg-brand-50">
          + Add Vehicle
        </button>
      </div>

      {vehicles.map((fv, i) => (
        <div key={i} className="bg-surface border border-line rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <select value={fv.name} onChange={e => applyPreset(i, e.target.value)}
              className="text-sm font-semibold border border-line rounded-lg px-2 py-1">
              {Object.keys(PRESETS).map(k => <option key={k}>{k}</option>)}
            </select>
            {vehicles.length > 1 && (
              <button onClick={() => setVehicles(p => p.filter((_, idx) => idx !== i))}
                className="text-xs text-red-500 hover:text-red-700">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            {([
              { label: 'Count',         key: 'count' as keyof FleetVehicle },
              { label: 'Stops/Day',     key: 'stops' as keyof FleetVehicle },
              { label: 'Rate/Stop ($)', key: 'rate' as keyof FleetVehicle },
              { label: 'Labor/Day ($)', key: 'laborD' as keyof FleetVehicle },
              { label: 'Fuel/Day ($)',  key: 'fuelD' as keyof FleetVehicle },
              { label: 'Fixed/Mo ($)',  key: 'fixedMo' as keyof FleetVehicle },
            ]).map(({ label, key }) => (
              <label key={key} className="font-bold uppercase text-muted">
                {label}
                <input type="number" value={fv[key] as number} onChange={e => updateVehicle(i, key, +e.target.value)}
                  className="mt-1 w-full border border-line rounded-lg px-2 py-1.5 text-sm font-medium" />
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-surface border border-line rounded-xl p-4 mb-4 h-52">
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Fleet Daily Revenue', val: fmt(totalRevD),  color: 'blue' },
          { label: 'Fleet Daily Cost',    val: fmt(totalCostD), color: 'amber' },
          { label: 'Fleet Daily Net',     val: fmt(totalNetD),  color: totalNetD >= 0 ? 'green' : 'red' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-paper border border-line rounded-lg p-3 text-center">
            <div className="text-xs font-bold uppercase text-muted">{label}</div>
            <div className={`text-lg font-extrabold ${color === 'blue' ? 'text-brand-700' : color === 'green' ? 'text-green-700' : color === 'red' ? 'text-red-700' : 'text-amber-600'}`}>{val}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {['Vehicle','Rev/Day','Cost/Day','Net/Day','Margin','Cost/Stop','Annual Net (after tax)'].map(h => (
                <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b border-line">
                <td className="py-2 px-3 font-semibold text-brand-700">{r.count}x {r.name}</td>
                <td className="py-2 px-3">{fmt(r.revD)}</td>
                <td className="py-2 px-3">{fmt(r.costD)}</td>
                <td className={`py-2 px-3 font-bold ${r.netD >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(r.netD)}</td>
                <td className={`py-2 px-3 ${r.margin >= 0 ? 'text-green-700' : 'text-red-700'}`}>{pct(r.margin)}</td>
                <td className="py-2 px-3">{fmt(r.cps, 2)}</td>
                <td className="py-2 px-3 font-extrabold text-green-700">{fmt(r.annualNet)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

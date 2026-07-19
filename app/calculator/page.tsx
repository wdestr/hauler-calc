'use client';
import { useState, useMemo, useEffect } from 'react';
import { decodeInputs } from '@/lib/share';
import Calculator from '@/components/calculator/Calculator';
import CashFlowTab from '@/components/calculator/CashFlowTab';
import W2v1099Tab from '@/components/calculator/W2v1099Tab';
import FleetPlannerTab from '@/components/calculator/FleetPlannerTab';
import TruckAcquisitionTab from '@/components/calculator/TruckAcquisitionTab';
import ProfileBar from '@/components/calculator/ProfileBar';
import LockGate from '@/components/calculator/LockGate';
import CalcActions from '@/components/calculator/CalcActions';
import Icon, { type IconName } from '@/components/ui/Icon';
import { calc } from '@/lib/calc';
import { DEFAULTS } from '@/lib/defaults';
import { TAB_PRO } from '@/lib/plan';
import { usePlan } from '@/components/PlanProvider';
import type { CalcInputs } from '@/types';

type Tab = 'calc' | 'cashflow' | 'w2v1099' | 'fleet' | 'truck';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'calc', label: 'Calculator', icon: 'coins' },
  { id: 'cashflow', label: 'Cash Flow', icon: 'chart' },
  { id: 'w2v1099', label: 'W-2 vs 1099', icon: 'scale' },
  { id: 'fleet', label: 'Fleet Planner', icon: 'route' },
  { id: 'truck', label: 'Truck Acquisition', icon: 'truck' },
];

const LABELS: Record<Tab, string> = {
  calc: 'Calculator', cashflow: 'Cash Flow', w2v1099: 'W-2 vs 1099', fleet: 'Fleet Planner', truck: 'Truck Acquisition',
};

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('calc');
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULTS);

  // Reopen a shared scenario: /calculator?s=<encoded>
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s');
    if (!s) return;
    const decoded = decodeInputs(s);
    if (decoded) setInputs((prev) => ({ ...prev, ...decoded }));
  }, []);

  const results = useMemo(() => calc(inputs), [inputs]);
  const { plan, refresh } = usePlan();
  const isPro = plan === 'pro';
  const locked = (t: Tab) => TAB_PRO[t] && !isPro;

  // Returning from Stripe Checkout — the webhook flips is_pro; poll a few times.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('upgraded') !== '1') return;
    let n = 0;
    const t = setInterval(() => { refresh(); if (++n >= 5) clearInterval(t); }, 1500);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-line bg-surface sticky top-15 z-30 no-print">
        <div className="max-w-6xl mx-auto px-5 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const isLocked = locked(t.id);
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                aria-current={activeTab === t.id ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-muted hover:text-ink'}`}>
                <Icon name={t.icon} size={16} />
                {t.label}
                {isLocked && <span className="text-brand-500"><Icon name="lock" size={13} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions + profiles (calc tab only) */}
      {activeTab === 'calc' && (
        <div className="border-b border-line bg-raised no-print">
          <div className="max-w-6xl mx-auto px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <ProfileBar currentInputs={inputs} onLoad={setInputs} />
            <CalcActions inputs={inputs} results={results} />
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'calc' && <Calculator inputs={inputs} onInputsChange={setInputs} />}
      {activeTab === 'cashflow' && (
        <LockGate locked={locked('cashflow')} feature={LABELS.cashflow}><CashFlowTab results={results} /></LockGate>
      )}
      {activeTab === 'w2v1099' && (
        <LockGate locked={locked('w2v1099')} feature={LABELS.w2v1099}><W2v1099Tab results={results} /></LockGate>
      )}
      {activeTab === 'fleet' && (
        <LockGate locked={locked('fleet')} feature={LABELS.fleet}><FleetPlannerTab results={results} /></LockGate>
      )}
      {activeTab === 'truck' && (
        <LockGate locked={locked('truck')} feature={LABELS.truck}><TruckAcquisitionTab calInputs={inputs} onCalcInputsChange={setInputs} /></LockGate>
      )}
    </div>
  );
}

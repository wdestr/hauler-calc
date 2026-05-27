'use client';
import { useState, useMemo } from 'react';
import Calculator from '@/components/calculator/Calculator';
import CashFlowTab from '@/components/calculator/CashFlowTab';
import W2v1099Tab from '@/components/calculator/W2v1099Tab';
import FleetPlannerTab from '@/components/calculator/FleetPlannerTab';
import TruckAcquisitionTab from '@/components/calculator/TruckAcquisitionTab';
import ProfileBar from '@/components/calculator/ProfileBar';
import { calc } from '@/lib/calc';
import { DEFAULTS } from '@/lib/defaults';
import type { CalcInputs } from '@/types';

type Tab = 'calc' | 'cashflow' | 'w2v1099' | 'fleet' | 'truck';

const TABS: { id: Tab; label: string; pro: boolean }[] = [
  { id: 'calc',     label: 'Calculator',        pro: false },
  { id: 'cashflow', label: 'Cash Flow',          pro: true  },
  { id: 'w2v1099',  label: 'W-2 vs 1099',       pro: true  },
  { id: 'fleet',    label: 'Fleet Planner',      pro: true  },
  { id: 'truck',    label: '🚛 Truck Acquisition', pro: false },
];

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('calc');
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULTS);
  const results = useMemo(() => calc(inputs), [inputs]);

  return (
    <>
      {/* Tab nav */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors
                ${activeTab === t.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
              {t.pro && <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 font-bold">PRO</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'calc' && (
        <ProfileBar currentInputs={inputs} onLoad={setInputs} />
      )}
      {activeTab === 'calc'     && <Calculator inputs={inputs} onInputsChange={setInputs} />}
      {activeTab === 'cashflow' && <CashFlowTab results={results} />}
      {activeTab === 'w2v1099' && <W2v1099Tab  results={results} />}
      {activeTab === 'fleet'    && <FleetPlannerTab results={results} />}
      {activeTab === 'truck'    && <TruckAcquisitionTab calInputs={inputs} onCalcInputsChange={setInputs} />}
    </>
  );
}

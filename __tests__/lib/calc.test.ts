// __tests__/lib/calc.test.ts
import { calc } from '@/lib/calc';
import type { CalcInputs } from '@/types';

const BASE: CalcInputs = {
  revMode: 'perstop', labMode: 'hourly', fuelMode: 'miles',
  daysWk: 6, stopsPerDay: 8, ratePerStop: 125, flatRev: 1000,
  crewSize: 2, hrRate: 22, hrShift: 10, dyRate: 200,
  inclTax: false, milesDay: 80, mpg: 8, ppg: 4.0, fuelFlat: 60,
  insAuto: 600, insGl: 150, insCargo: 100, insWc: 200,
  vehPmt: 1800, vehMaint: 300, vehRepair: 200,
  ovrPermits: 50, ovrSoft: 75, ovrOther: 100,
  claimsRate: 1.5, taxRate: 25,
};

describe('calc()', () => {
  it('computes daily revenue per-stop', () => {
    const r = calc(BASE);
    expect(r.revD).toBe(8 * 125); // 1000
  });

  it('computes labor hourly', () => {
    const r = calc(BASE);
    expect(r.labD).toBe(2 * 22 * 10); // 440
  });

  it('computes fuel from miles', () => {
    const r = calc(BASE);
    expect(r.fuelD).toBeCloseTo((80 / 8) * 4.0); // 40
  });

  it('net is revenue minus total cost', () => {
    const r = calc(BASE);
    expect(r.netD).toBeCloseTo(r.revD - r.totalD);
  });

  it('margin is netD / revD', () => {
    const r = calc(BASE);
    expect(r.margin).toBeCloseTo(r.netD / r.revD);
  });

  it('dMo is dW * 52/12', () => {
    const r = calc(BASE);
    expect(r.dMo).toBeCloseTo(BASE.daysWk * (52 / 12));
  });

  it('applies payroll tax multiplier when inclTax=true', () => {
    const r = calc({ ...BASE, inclTax: true });
    const rNo = calc(BASE);
    expect(r.labD).toBeCloseTo(rNo.labD * 1.08);
  });

  it('uses flat revenue when revMode=flat', () => {
    const r = calc({ ...BASE, revMode: 'flat', flatRev: 1200 });
    expect(r.revD).toBe(1200);
  });
});

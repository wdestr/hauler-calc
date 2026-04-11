// lib/defaults.ts
import type { CalcInputs } from '@/types';

export const DEFAULTS: CalcInputs = {
  revMode: 'perstop', labMode: 'hourly', fuelMode: 'miles',
  daysWk: 6, stopsPerDay: 8, ratePerStop: 125, flatRev: 1000,
  crewSize: 2, hrRate: 22, hrShift: 10, dyRate: 200, inclTax: false,
  milesDay: 80, mpg: 8, ppg: 4.0, fuelFlat: 60,
  insAuto: 600, insGl: 150, insCargo: 100, insWc: 200,
  vehPmt: 1800, vehMaint: 300, vehRepair: 200,
  ovrPermits: 50, ovrSoft: 75, ovrOther: 100,
  claimsRate: 1.5, taxRate: 25,
};

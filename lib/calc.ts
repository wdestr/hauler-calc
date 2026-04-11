// lib/calc.ts
import type { CalcInputs, CalcResults } from '@/types';

export function calc(i: CalcInputs): CalcResults {
  const dW  = i.daysWk;
  const dMo = dW * (52 / 12);
  const dYr = dW * 52;

  // Revenue
  let revD: number, stops: number, rate: number;
  if (i.revMode === 'perstop') {
    stops = i.stopsPerDay;
    rate  = i.ratePerStop;
    revD  = stops * rate;
  } else {
    revD  = i.flatRev;
    stops = i.stopsPerDay;
    rate  = stops > 0 ? revD / stops : 0;
  }

  // Labor
  const crew   = i.crewSize;
  const taxM   = i.inclTax ? 1.08 : 1.0;
  const labRaw = i.labMode === 'hourly'
    ? crew * i.hrRate * i.hrShift
    : crew * i.dyRate;
  const labD   = labRaw * taxM;

  // Fuel
  const fuelD = i.fuelMode === 'miles'
    ? (i.milesDay / Math.max(i.mpg, 0.5)) * i.ppg
    : i.fuelFlat;

  // Monthly -> daily
  const insD  = (i.insAuto + i.insGl + i.insCargo + i.insWc) / dMo;
  const vehD  = (i.vehPmt + i.vehMaint + i.vehRepair) / dMo;
  const ovrD  = (i.ovrPermits + i.ovrSoft + i.ovrOther) / dMo;

  // Claims
  const claimsD = revD * (i.claimsRate / 100);

  // Totals
  const totalD = labD + fuelD + insD + vehD + ovrD + claimsD;
  const netD   = revD - totalD;
  const margin = revD > 0 ? netD / revD : 0;

  // Derived
  const taxR     = i.taxRate / 100;
  const afterTax = netD * dYr * (1 - taxR);
  const cps      = stops > 0 ? totalD / stops : 0;
  const beStops  = rate  > 0 ? totalD / rate  : 0;
  const minRate  = stops > 0 ? totalD / stops : 0;

  return {
    revD, totalD, netD, margin,
    labD, fuelD, insD, vehD, ovrD, claimsD,
    dW, dMo, dYr, afterTax,
    stops, rate, cps, beStops, minRate,
    crew, taxM, taxR,
  };
}

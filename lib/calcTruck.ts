// lib/calcTruck.ts — formulas match spec exactly
// 5-year normalized comparison: lease extended at same rate if term < 60 months
import type { TruckInputs, TruckResults, CalcContext } from '@/types';

export function calcTruck(i: TruckInputs, ctx: CalcContext): TruckResults {
  const { stopsPerDay, daysWk } = ctx;
  const dMo = daysWk * (52 / 12);
  const spm = stopsPerDay * dMo;
  const cps = (mo: number): number | null => spm > 0 ? mo / spm : null;

  // Rent
  const rentMaint = i.rentMaintIncluded ? 0 : i.rentMaint;
  const rentMo    = i.rentCost + rentMaint;

  // Lease
  const leaseMaint = i.leaseFullMaint ? 0 : i.leaseMaint;
  const leaseMo    = i.leasePmt + leaseMaint;
  const leaseFiveYr = i.leaseCapReduction + (i.leasePmt * 60) + (leaseMaint * 60);
  const buyoutAmt  = (i.leaseBuyoutPct / 100) * i.leaseOrigValue;

  // Buy Loan
  const principal   = i.loanPrice - i.loanDown;
  const mr          = i.loanRate / 12 / 100;
  const loanPmt     = mr === 0
    ? (i.loanTerm > 0 ? principal / i.loanTerm : 0)
    : (principal * mr) / (1 - Math.pow(1 + mr, -i.loanTerm));
  const loanMo      = loanPmt + i.loanMaint;
  const loanFiveYr  = i.loanDown + loanPmt * Math.min(i.loanTerm, 60) + i.loanMaint * 60 - i.loanResale;

  // Buy Cash
  const cashMo    = i.cashLife > 0 ? (i.cashPrice - i.cashResale) / (i.cashLife * 12) + i.cashMaint : 0;
  const cashFiveYr = i.cashPrice + i.cashMaint * 60 - i.cashResale;

  // IC
  const icMo = i.icRate * stopsPerDay * dMo;

  return {
    rent:  { monthly: rentMo,  fiveYr: rentMo * 60, cps: cps(rentMo) },
    lease: { monthly: leaseMo, fiveYr: leaseFiveYr,  cps: cps(leaseMo), buyoutAmt },
    loan:  { monthly: loanMo,  fiveYr: loanFiveYr,   cps: cps(loanMo),  monthlyPayment: loanPmt },
    cash:  { monthly: cashMo,  fiveYr: cashFiveYr,   cps: cps(cashMo) },
    ic:    { monthly: icMo,    fiveYr: icMo * 60,    cps: cps(icMo),    rate: i.icRate },
    stopsPerMonth: spm, dMo, leaseTerm: i.leaseTerm,
    loanTerm: i.loanTerm,
  };
}

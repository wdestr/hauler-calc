import { calcTruck } from '@/lib/calcTruck';
import type { TruckInputs } from '@/types';

const BASE: TruckInputs = {
  rentCost: 2400, rentMaintIncluded: false, rentMaint: 300,
  leasePmt: 1850, leaseTerm: 48, leaseCapReduction: 2000,
  leaseBuyoutPct: 20, leaseOrigValue: 45000, leaseFullMaint: false, leaseMaint: 300,
  loanPrice: 55000, loanDown: 10000, loanRate: 7.5, loanTerm: 60,
  loanResale: 15000, loanMaint: 400,
  cashPrice: 55000, cashResale: 15000, cashLife: 5, cashMaint: 400,
  icRate: 30,
};
const CTX = { stopsPerDay: 10, daysWk: 6 };

describe('calcTruck()', () => {
  // RENT
  it('rent monthly = rentalCost + maint', () => {
    expect(calcTruck(BASE, CTX).rent.monthly).toBe(2700);
  });
  it('rent monthly = rentalCost only when maint included', () => {
    expect(calcTruck({ ...BASE, rentMaintIncluded: true }, CTX).rent.monthly).toBe(2400);
  });
  it('rent 5-year = monthly * 60', () => {
    const r = calcTruck(BASE, CTX);
    expect(r.rent.fiveYr).toBe(r.rent.monthly * 60);
  });

  // LEASE
  it('lease monthly = payment + maint (cap reduction NOT in monthly)', () => {
    expect(calcTruck(BASE, CTX).lease.monthly).toBe(2150);
  });
  it('lease monthly = payment only when full maintenance lease', () => {
    expect(calcTruck({ ...BASE, leaseFullMaint: true }, CTX).lease.monthly).toBe(1850);
  });
  it('lease 5-year = capRed + payment*60 + maint*60', () => {
    expect(calcTruck(BASE, CTX).lease.fiveYr).toBe(2000 + 1850 * 60 + 300 * 60);
  });
  it('lease buyout = pct * origValue', () => {
    expect(calcTruck(BASE, CTX).lease.buyoutAmt).toBe(9000);
  });

  // BUY LOAN
  it('loan monthly payment approximately correct (7.5%, $45K, 60mo -> ~$901)', () => {
    expect(calcTruck(BASE, CTX).loan.monthlyPayment).toBeCloseTo(901.71, 0);
  });
  it('loan monthly = payment + maintenance', () => {
    const r = calcTruck(BASE, CTX);
    expect(r.loan.monthly).toBeCloseTo(r.loan.monthlyPayment + 400, 0);
  });
  it('loan 0% interest uses simple division', () => {
    const r = calcTruck({ ...BASE, loanRate: 0 }, CTX);
    expect(r.loan.monthlyPayment).toBeCloseTo(45000 / 60, 2);
  });
  it('loan 5-year caps at 60 payments when term > 60', () => {
    const r = calcTruck({ ...BASE, loanTerm: 72 }, CTX);
    const expected = 10000 + r.loan.monthlyPayment * 60 + 400 * 60 - 15000;
    expect(r.loan.fiveYr).toBeCloseTo(expected, 0);
  });
  it('loan 5-year uses actual term when < 60', () => {
    const r = calcTruck({ ...BASE, loanTerm: 48 }, CTX);
    const expected = 10000 + r.loan.monthlyPayment * 48 + 400 * 60 - 15000;
    expect(r.loan.fiveYr).toBeCloseTo(expected, 0);
  });

  // BUY CASH
  it('cash monthly = amortized depreciation + maint', () => {
    const expected = (55000 - 15000) / (5 * 12) + 400;
    expect(calcTruck(BASE, CTX).cash.monthly).toBeCloseTo(expected, 1);
  });
  it('cash 5-year = price + maint*60 - resale', () => {
    expect(calcTruck(BASE, CTX).cash.fiveYr).toBe(55000 + 400 * 60 - 15000);
  });

  // IC
  it('IC monthly = rate * stops * dMo', () => {
    const dMo = 6 * (52 / 12);
    expect(calcTruck(BASE, CTX).ic.monthly).toBeCloseTo(30 * 10 * dMo, 1);
  });
  it('IC cps equals the IC rate (via general formula)', () => {
    expect(calcTruck(BASE, CTX).ic.cps).toBeCloseTo(30, 4);
  });
  it('IC 5-year = monthly * 60', () => {
    const r = calcTruck(BASE, CTX);
    expect(r.ic.fiveYr).toBeCloseTo(r.ic.monthly * 60, 0);
  });

  // Edge cases
  it('returns null cps when stopsPerDay = 0', () => {
    const r = calcTruck(BASE, { stopsPerDay: 0, daysWk: 6 });
    expect(r.rent.cps).toBeNull();
    expect(r.ic.cps).toBeNull();
  });
  it('cash monthly returns 0 when useful life = 0', () => {
    expect(calcTruck({ ...BASE, cashLife: 0 }, CTX).cash.monthly).toBe(0);
  });
});

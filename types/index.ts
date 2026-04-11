// types/index.ts

export interface CalcInputs {
  revMode: 'perstop' | 'flat';
  labMode: 'hourly' | 'daily';
  fuelMode: 'miles' | 'flat';
  daysWk: number;
  stopsPerDay: number;
  ratePerStop: number;
  flatRev: number;
  crewSize: number;
  hrRate: number;
  hrShift: number;
  dyRate: number;
  inclTax: boolean;
  milesDay: number;
  mpg: number;
  ppg: number;
  fuelFlat: number;
  insAuto: number;
  insGl: number;
  insCargo: number;
  insWc: number;
  vehPmt: number;
  vehMaint: number;
  vehRepair: number;
  ovrPermits: number;
  ovrSoft: number;
  ovrOther: number;
  claimsRate: number;
  taxRate: number;
}

export interface CalcResults {
  revD: number;
  totalD: number;
  netD: number;
  margin: number;
  labD: number;
  fuelD: number;
  insD: number;
  vehD: number;
  ovrD: number;
  claimsD: number;
  dW: number;
  dMo: number;
  dYr: number;
  afterTax: number;
  stops: number;
  rate: number;
  cps: number;
  beStops: number;
  minRate: number;
  crew: number;
  taxM: number;
  taxR: number;
}

export interface Profile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: 'free' | 'active' | 'canceled' | 'past_due';
  subscription_tier: 'monthly' | 'annual' | null;
  current_period_end: string | null;
  created_at: string;
}

export interface SavedScenario {
  id: string;
  user_id: string;
  name: string;
  inputs: CalcInputs;
  created_at: string;
  updated_at: string;
}

export type FleetVehicle = {
  name: string;
  count: number;
  stops: number;
  rate: number;
  laborD: number;
  fuelD: number;
  fixedMo: number;
  daysWk: number;
};

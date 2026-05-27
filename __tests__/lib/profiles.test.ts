import { getProfiles, saveProfile, deleteProfile, renameProfile, MAX_PROFILES } from '@/lib/profiles';
import type { CalcInputs } from '@/types';

const S: CalcInputs = {
  revMode:'perstop',labMode:'hourly',fuelMode:'miles',daysWk:6,stopsPerDay:8,
  ratePerStop:125,flatRev:1000,crewSize:2,hrRate:22,hrShift:10,dyRate:200,inclTax:false,
  milesDay:80,mpg:8,ppg:4,fuelFlat:60,insAuto:600,insGl:150,insCargo:100,insWc:200,
  vehPmt:1800,vehMaint:300,vehRepair:200,ovrPermits:50,ovrSoft:75,ovrOther:100,
  claimsRate:1.5,taxRate:25,
};

beforeEach(() => localStorage.clear());

describe('profiles', () => {
  it('starts empty', () => expect(getProfiles()).toEqual([]));
  it('saves a profile', () => {
    const ps = saveProfile('Route A', S);
    expect(ps).not.toBe(false);
    expect((ps as any[]).length).toBe(1);
    expect((ps as any[])[0].name).toBe('Route A');
  });
  it('persists across calls', () => { saveProfile('Route A', S); expect(getProfiles()).toHaveLength(1); });
  it('blocks save at max capacity', () => {
    for (let i = 0; i < MAX_PROFILES; i++) saveProfile(`R${i}`, S);
    expect(saveProfile('Overflow', S)).toBe(false);
    expect(getProfiles()).toHaveLength(MAX_PROFILES);
  });
  it('deletes by id', () => {
    saveProfile('Route A', S);
    const [p] = getProfiles();
    expect(deleteProfile(p.id)).toHaveLength(0);
  });
  it('renames a profile', () => {
    saveProfile('Route A', S);
    const [p] = getProfiles();
    const after = renameProfile(p.id, 'Updated');
    expect(after[0].name).toBe('Updated');
  });
});

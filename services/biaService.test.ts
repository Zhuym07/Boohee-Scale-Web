import { describe, expect, it } from 'vitest';
import { calculateBMI, calculateBodyComposition, evaluateBMI } from './biaService';
import { Gender, UserProfile } from '../types';

const maleProfile: UserProfile = {
  age: 25,
  height: 175,
  gender: Gender.Male
};

describe('calculateBodyComposition', () => {
  it('uses impedance when the reading is plausible', () => {
    const result = calculateBodyComposition(70, 500, maleProfile);

    expect(result.bodyFatMethod).toBe('bia');
    expect(result.bodyFatPercentage).toBeCloseTo(18.9, 1);
    expect(result.leanMassRate).toBeCloseTo(81.1, 1);
    expect(result.waterRate).toBeCloseTo(59.3, 1);
  });

  it('falls back when the scale reports an implausible impedance', () => {
    const result = calculateBodyComposition(70, 25957, maleProfile);

    expect(result.bodyFatMethod).toBe('demographic');
    expect(result.bodyFatPercentage).toBeCloseTo(17, 1);
  });

  it('returns finite zero values for an empty measurement', () => {
    expect(calculateBodyComposition(0, 500, maleProfile)).toEqual({
      bmi: 0,
      bodyFatPercentage: 0,
      leanMassRate: 0,
      waterRate: 0,
      bmr: 0,
      bodyFatMethod: 'demographic'
    });
  });

  it('keeps all derived percentages within physiological display bounds', () => {
    const result = calculateBodyComposition(180, 200, maleProfile);

    expect(result.bodyFatPercentage).toBeGreaterThanOrEqual(2);
    expect(result.bodyFatPercentage).toBeLessThanOrEqual(60);
    expect(result.leanMassRate).toBeGreaterThanOrEqual(40);
    expect(Number.isFinite(result.waterRate)).toBe(true);
  });
});

describe('BMI helpers', () => {
  it('calculates and classifies Chinese adult BMI thresholds', () => {
    expect(calculateBMI(70, 175)).toBe(22.9);
    expect(evaluateBMI(23.9)).toBe('normal');
    expect(evaluateBMI(24)).toBe('overweight');
    expect(evaluateBMI(28)).toBe('obese');
  });
});

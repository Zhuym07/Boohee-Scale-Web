import { UserProfile, BodyMetrics, Gender } from '../types';

/**
 * Calculates BMI
 * @param weightKg Weight in Kilograms
 * @param heightCm Height in Centimeters
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (heightCm === 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

export const evaluateBMI = (bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 24.0) return 'normal';
  if (bmi < 28.0) return 'overweight';
  return 'obese';
};

export const evaluateBodyFat = (fat: number, gender: Gender): 'low' | 'normal' | 'high' | 'veryHigh' => {
  if (gender === Gender.Male) {
      if (fat < 15) return 'low'; // Using low for <15 as user specified Normal 15-20
      if (fat <= 20) return 'normal';
      if (fat <= 25) return 'high';
      return 'veryHigh';
  } else {
      if (fat < 20) return 'low';
      if (fat <= 25) return 'normal';
      if (fat <= 30) return 'high';
      return 'veryHigh';
  }
};

export const evaluateLeanMass = (rate: number, gender: Gender): 'low' | 'normal' | 'high' => {
    const min = gender === Gender.Male ? 75 : 68;
    const max = gender === Gender.Male ? 90 : 85;
    
    if (rate < min) return 'low';
    if (rate <= max) return 'normal';
    return 'high';
};

export const evaluateWater = (rate: number, gender: Gender): 'low' | 'normal' | 'high' => {
    const min = gender === Gender.Male ? 50 : 45;
    const max = gender === Gender.Male ? 65 : 60;
    
    if (rate < min) return 'low';
    if (rate <= max) return 'normal';
    return 'high';
};

/**
 * Calculates Body Fat Percentage using a standard BIA formula estimation.
 */
export const calculateBodyComposition = (
  weightKg: number,
  impedance: number,
  profile: UserProfile
): BodyMetrics => {
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return {
      bmi: 0,
      bodyFatPercentage: 0,
      leanMassRate: 0,
      waterRate: 0,
      bmr: 0,
      bodyFatMethod: 'demographic'
    };
  }

  const bmi = calculateBMI(weightKg, profile.height);
  
  // Basic Logic for BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * profile.height - 5 * profile.age;
  bmr = profile.gender === Gender.Male ? bmr + 5 : bmr - 161;

  // Body Fat Calculation
  const sexFactor = profile.gender === Gender.Male ? 1 : 0;
  const demographicBodyFat = (1.20 * bmi) + (0.23 * profile.age) - (10.8 * sexFactor) - 5.4;
  let bodyFat = demographicBodyFat;
  let bodyFatMethod: BodyMetrics['bodyFatMethod'] = 'demographic';

  // Single-frequency BIA estimate. Values outside the range commonly produced by
  // foot-to-foot consumer scales are ignored instead of distorting the result.
  if (Number.isFinite(impedance) && impedance >= 200 && impedance <= 1500) {
      const impedanceIndex = Math.pow(profile.height, 2) / impedance;
      const fatFreeMassKg = (0.61 * impedanceIndex) + (0.25 * weightKg) + 1.31;
      const impedanceBodyFat = ((weightKg - fatFreeMassKg) / weightKg) * 100;

      if (impedanceBodyFat >= 3 && impedanceBodyFat <= 55) {
        // Demographic inputs dampen the sensitivity of a single impedance reading.
        bodyFat = (impedanceBodyFat * 0.7) + (demographicBodyFat * 0.3);
        bodyFatMethod = 'bia';
      }
  }

  // Clamping
  bodyFat = Math.max(2, Math.min(60, bodyFat));

  const leanMassRate = 100 - bodyFat;
  // Fat-free mass is approximately 73.2% water; this is still an estimate.
  const waterRate = leanMassRate * 0.732;

  return {
    bmi,
    bodyFatPercentage: Number(bodyFat.toFixed(1)),
    bmr: Math.round(bmr),
    waterRate: Number(waterRate.toFixed(1)),
    leanMassRate: Number(leanMassRate.toFixed(1)),
    bodyFatMethod
  };
};

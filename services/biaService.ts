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

export const evaluateMuscle = (rate: number, gender: Gender): 'low' | 'normal' | 'high' => {
    // Simplified approximations
    const min = gender === Gender.Male ? 40 : 30;
    const max = gender === Gender.Male ? 60 : 50;
    
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
  const bmi = calculateBMI(weightKg, profile.height);
  
  // Basic Logic for BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * profile.height - 5 * profile.age;
  bmr = profile.gender === Gender.Male ? bmr + 5 : bmr - 161;

  // Body Fat Calculation
  const sexFactor = profile.gender === Gender.Male ? 1 : 0;
  let bodyFat = (1.20 * bmi) + (0.23 * profile.age) - (10.8 * sexFactor) - 5.4;

  // Impedance Correction
  if (impedance > 0 && impedance < 5000) {
      const LBM = (0.34 * Math.pow(profile.height, 2) / impedance) + (0.1534 * profile.height) + (0.273 * weightKg) - (0.127 * profile.age) + 12.44;
      const calculatedFatFromImp = ((weightKg - LBM) / weightKg) * 100;
      bodyFat = (bodyFat + calculatedFatFromImp) / 2;
  }

  // Clamping
  bodyFat = Math.max(2, Math.min(60, bodyFat));

  // Water Rate estimation
  const waterRate = (100 - bodyFat) * 0.7;

  // Muscle Rate estimation
  const muscleRate = (100 - bodyFat - 4); // Minus bone mass approx

  return {
    bmi,
    bodyFatPercentage: Number(bodyFat.toFixed(1)),
    bmr: Math.round(bmr),
    waterRate: Number(waterRate.toFixed(1)),
    muscleRate: Number(muscleRate.toFixed(1))
  };
};
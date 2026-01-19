export enum Gender {
  Male = 'male',
  Female = 'female',
}

export interface UserProfile {
  height: number; // cm
  age: number;
  gender: Gender;
}

export interface ScaleData {
  weight: number; // kg
  impedance: number; // ohm
  isStable: boolean;
  rawFat: number; // The raw byte value from the scale (0-255 representing 0.0-25.5% usually, or arbitrary)
  timestamp: number;
  rawHex: string; // The raw hex string of the data packet
}

export interface BodyMetrics {
  bmi: number;
  bodyFatPercentage: number;
  muscleRate?: number;
  waterRate?: number;
  bmr?: number;
}

export interface BleDeviceError {
  message: string;
}

export type Language = 'en' | 'zh';

// Service and Characteristic UUIDs from documentation
export const SERVICE_UUID = 0xFFF0;
export const CHARACTERISTIC_UUID = 0xFFF4;
import { UserProfile, ScaleData, BodyMetrics, Gender, Language, PROFILE_LIMITS } from '../types';

const KEYS = {
  PROFILE: 'boohee_user_profile',
  HISTORY: 'boohee_scale_history',
  SETTINGS: 'boohee_app_settings'
};

export interface HistoryRecord extends ScaleData {
  metrics: BodyMetrics;
  id: string;
}

export interface AppSettings {
  autoSave: boolean;
  language: Language;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSave: true,
  language: 'zh'
};

const readJson = (key: string): unknown => {
  const data = localStorage.getItem(key);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isProfile = (value: unknown): value is UserProfile =>
  isRecord(value) &&
  isFiniteNumber(value.height) && value.height >= PROFILE_LIMITS.height.min && value.height <= PROFILE_LIMITS.height.max &&
  isFiniteNumber(value.age) && value.age >= PROFILE_LIMITS.age.min && value.age <= PROFILE_LIMITS.age.max &&
  (value.gender === Gender.Male || value.gender === Gender.Female);

const isHistoryRecord = (value: unknown): value is HistoryRecord =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  isFiniteNumber(value.weight) &&
  isFiniteNumber(value.impedance) &&
  typeof value.isStable === 'boolean' &&
  isFiniteNumber(value.rawFat) &&
  isFiniteNumber(value.timestamp) &&
  typeof value.rawHex === 'string' &&
  isRecord(value.metrics) &&
  isFiniteNumber(value.metrics.bmi) &&
  isFiniteNumber(value.metrics.bodyFatPercentage);

const normalizeHistoryRecord = (record: HistoryRecord): HistoryRecord => ({
  ...record,
  metrics: {
    ...record.metrics,
    leanMassRate: isFiniteNumber(record.metrics.leanMassRate)
      ? record.metrics.leanMassRate
      : Number((100 - record.metrics.bodyFatPercentage).toFixed(1)),
    bodyFatMethod: record.metrics.bodyFatMethod === 'bia' ? 'bia' : 'demographic'
  }
});

export const storageService = {
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getProfile: (): UserProfile | null => {
    const data = readJson(KEYS.PROFILE);
    return isProfile(data) ? data : null;
  },

  saveHistory: (history: HistoryRecord[]) => {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  },

  getHistory: (): HistoryRecord[] => {
    const data = readJson(KEYS.HISTORY);
    return Array.isArray(data) ? data.filter(isHistoryRecord).map(normalizeHistoryRecord) : [];
  },

  clearHistory: () => {
    localStorage.removeItem(KEYS.HISTORY);
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSettings: (): AppSettings => {
    const data = readJson(KEYS.SETTINGS);
    if (!isRecord(data)) return DEFAULT_SETTINGS;

    return {
      autoSave: typeof data.autoSave === 'boolean' ? data.autoSave : DEFAULT_SETTINGS.autoSave,
      language: data.language === 'en' || data.language === 'zh'
        ? data.language
        : DEFAULT_SETTINGS.language
    };
  }
};

import { UserProfile, ScaleData, BodyMetrics } from '../types';

const KEYS = {
  PROFILE: 'boohee_user_profile',
  HISTORY: 'boohee_scale_history',
  SETTINGS: 'boohee_app_settings'
};

export interface HistoryRecord extends ScaleData {
  metrics: BodyMetrics;
  id: string;
}

export const storageService = {
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveHistory: (history: HistoryRecord[]) => {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  },

  getHistory: (): HistoryRecord[] => {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  },

  clearHistory: () => {
    localStorage.removeItem(KEYS.HISTORY);
  },

  saveSettings: (settings: { autoSave: boolean }) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSettings: () => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { autoSave: true };
  }
};
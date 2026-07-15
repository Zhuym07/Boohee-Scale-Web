import { useEffect, useRef, useState } from 'react';
import { bluetoothService } from '../services/bluetoothService';
import { calculateBodyComposition } from '../services/biaService';
import { t } from '../services/i18n';
import { HistoryRecord, storageService } from '../services/storage';
import { Gender, Language, ScaleData, UserProfile } from '../types';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

const EMPTY_SCALE_DATA: ScaleData = {
  weight: 0,
  impedance: 0,
  isStable: false,
  rawFat: 0,
  timestamp: 0,
  rawHex: ''
};

const DEFAULT_PROFILE: UserProfile = {
  height: 175,
  age: 25,
  gender: Gender.Male
};

export const useScaleController = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  const [lang, setLang] = useState<Language>('zh');
  const [realtimeData, setRealtimeData] = useState<ScaleData>(EMPTY_SCALE_DATA);
  const [displayRecord, setDisplayRecord] = useState<HistoryRecord | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const userProfileRef = useRef(userProfile);
  const autoSaveRef = useRef(autoSave);
  const stabilityStartedAtRef = useRef<number | null>(null);
  const stableWeightRef = useRef(0);
  const sessionSavedRef = useRef(false);
  const savedWeightRef = useRef(0);
  const onDataReceivedRef = useRef<(data: ScaleData) => void>(() => undefined);

  useEffect(() => { userProfileRef.current = userProfile; }, [userProfile]);
  useEffect(() => { autoSaveRef.current = autoSave; }, [autoSave]);
  useEffect(() => () => { void bluetoothService.disconnect(); }, []);

  useEffect(() => {
    const savedProfile = storageService.getProfile();
    const savedHistory = storageService.getHistory();
    const savedSettings = storageService.getSettings();

    if (savedProfile) {
      setUserProfile(savedProfile);
      setHistory(savedHistory);
      setDisplayRecord(savedHistory.at(-1) ?? null);
    } else {
      setShowOnboarding(true);
    }
    setAutoSave(savedSettings.autoSave);
    setLang(savedSettings.language);
    document.documentElement.lang = savedSettings.language === 'zh' ? 'zh-CN' : 'en';
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    onDataReceivedRef.current = (data: ScaleData) => {
      setRealtimeData(data);
      const { weight } = data;
      const now = Date.now();

      if (weight < 0.5) {
        sessionSavedRef.current = false;
        savedWeightRef.current = 0;
        stabilityStartedAtRef.current = null;
        stableWeightRef.current = 0;
        return;
      }

      if (sessionSavedRef.current && Math.abs(weight - savedWeightRef.current) > 1) {
        sessionSavedRef.current = false;
        stabilityStartedAtRef.current = now;
        stableWeightRef.current = weight;
      }

      let isClientStable = false;
      if (stabilityStartedAtRef.current === null) {
        stabilityStartedAtRef.current = now;
        stableWeightRef.current = weight;
      } else if (Math.abs(weight - stableWeightRef.current) > 0.2) {
        stabilityStartedAtRef.current = now;
        stableWeightRef.current = weight;
      } else if (now - stabilityStartedAtRef.current >= 2000) {
        isClientStable = true;
      }

      const currentRecord: HistoryRecord = {
        ...data,
        isStable: data.isStable || isClientStable,
        metrics: calculateBodyComposition(weight, data.impedance, userProfileRef.current),
        id: 'live'
      };

      setDisplayRecord(currentRecord);

      if (currentRecord.isStable && autoSaveRef.current && !sessionSavedRef.current) {
        const savedRecord = { ...currentRecord, id: crypto.randomUUID() };
        setHistory(previous => {
          const next = [...previous, savedRecord];
          storageService.saveHistory(next);
          return next;
        });
        sessionSavedRef.current = true;
        savedWeightRef.current = weight;
      }
    };
  }, []);

  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    storageService.saveProfile(profile);
    setDisplayRecord(record => record?.id === 'live'
      ? { ...record, metrics: calculateBodyComposition(record.weight, record.impedance, profile) }
      : record);
  };

  const completeOnboarding = (profile: UserProfile) => {
    updateProfile(profile);
    setShowOnboarding(false);
  };

  const toggleAutoSave = () => {
    setAutoSave(previous => {
      const next = !previous;
      storageService.saveSettings({ autoSave: next, language: lang });
      return next;
    });
  };

  const toggleLanguage = () => {
    setLang(previous => {
      const next = previous === 'en' ? 'zh' : 'en';
      storageService.saveSettings({ autoSave, language: next });
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
      return next;
    });
  };

  const connect = async () => {
    if (connectionState !== 'disconnected') return;
    setError(null);
    setConnectionState('connecting');

    try {
      await bluetoothService.connect(
        data => onDataReceivedRef.current(data),
        () => setConnectionState('disconnected')
      );
      setConnectionState('connected');
    } catch (caught: unknown) {
      setConnectionState('disconnected');
      if (caught instanceof DOMException && caught.name === 'NotFoundError') return;

      const message = caught instanceof Error ? caught.message : '';
      setError(message.includes('not supported')
        ? t('errors.unsupported', lang)
        : t('errors.connectFail', lang));
    }
  };

  const disconnect = async () => {
    await bluetoothService.disconnect();
    setConnectionState('disconnected');
  };

  const saveCurrentReading = () => {
    if (!displayRecord || displayRecord.id !== 'live' || !displayRecord.isStable) return;

    const savedRecord = { ...displayRecord, id: crypto.randomUUID() };
    setHistory(previous => {
      const next = [...previous, savedRecord];
      storageService.saveHistory(next);
      return next;
    });
    setDisplayRecord(savedRecord);
    sessionSavedRef.current = true;
    savedWeightRef.current = savedRecord.weight;
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(previous => {
      const next = previous.filter(record => record.id !== id);
      storageService.saveHistory(next);
      if (displayRecord?.id === id) setDisplayRecord(next.at(-1) ?? null);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    storageService.clearHistory();
    if (displayRecord?.id !== 'live') setDisplayRecord(null);
  };

  return {
    isInitialized,
    showOnboarding,
    connectionState,
    error,
    autoSave,
    lang,
    realtimeData,
    displayRecord,
    userProfile,
    history,
    clearError: () => setError(null),
    clearHistory,
    completeOnboarding,
    connect,
    deleteHistoryItem,
    disconnect,
    saveCurrentReading,
    selectHistoryItem: setDisplayRecord,
    toggleAutoSave,
    toggleLanguage,
    updateProfile
  };
};

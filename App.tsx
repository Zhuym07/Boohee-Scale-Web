import React, { useState, useEffect, useRef, useCallback } from 'react';
import { bluetoothService } from './services/bluetoothService';
import { calculateBodyComposition, evaluateBMI, evaluateBodyFat, evaluateMuscle, evaluateWater } from './services/biaService';
import { storageService, HistoryRecord } from './services/storage';
import { ScaleData, UserProfile, Gender, BodyMetrics, Language } from './types';
import { Gauge } from './components/Gauge';
import { MetricCard } from './components/MetricCard';
import { UserProfileForm } from './components/UserProfileForm';
import { OnboardingWizard } from './components/OnboardingWizard';
import { t } from './services/i18n';
import { Bluetooth, User, Activity, AlertCircle, Save, Trash2, ToggleLeft, ToggleRight, History, Globe } from 'lucide-react';

const App: React.FC = () => {
  // --- Initialization State ---
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // --- App State ---
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese
  
  // --- Data State ---
  // Real-time data from bluetooth
  const [realtimeData, setRealtimeData] = useState<ScaleData>({
    weight: 0,
    impedance: 0,
    isStable: false,
    rawFat: 0,
    timestamp: 0,
    rawHex: ''
  });

  // The record we are currently displaying (either real-time or "held" history)
  const [displayRecord, setDisplayRecord] = useState<HistoryRecord | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    height: 175,
    age: 25,
    gender: Gender.Male
  });
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Refs for tracking state inside callbacks without stale closures
  const userProfileRef = useRef(userProfile);
  const autoSaveRef = useRef(autoSave);
  
  // Custom Stability Logic Refs
  const stabilityTimerRef = useRef<number | null>(null);
  const stableWeightRef = useRef<number>(0);
  const sessionSavedRef = useRef<boolean>(false);

  // Update refs when state changes
  useEffect(() => { userProfileRef.current = userProfile; }, [userProfile]);
  useEffect(() => { autoSaveRef.current = autoSave; }, [autoSave]);

  // Load initial data
  useEffect(() => {
    const savedProfile = storageService.getProfile();
    const savedHistory = storageService.getHistory();
    const savedSettings = storageService.getSettings();

    if (savedProfile) {
      setUserProfile(savedProfile);
      setHistory(savedHistory);
      // If we have history, show the last record as the "Held" value initially
      if (savedHistory.length > 0) {
        setDisplayRecord(savedHistory[savedHistory.length - 1]);
      }
      setIsInitialized(true);
    } else {
      setShowOnboarding(true);
      setIsInitialized(true);
    }
    setAutoSave(savedSettings.autoSave);
  }, []);

  // Save changes
  const updateProfile = (p: UserProfile) => {
    setUserProfile(p);
    storageService.saveProfile(p);
  };

  const toggleAutoSave = () => {
    const newVal = !autoSave;
    setAutoSave(newVal);
    storageService.saveSettings({ autoSave: newVal });
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    storageService.saveHistory(newHistory);
    if (displayRecord?.id === id) {
      setDisplayRecord(null);
    }
  };

  const toggleLanguage = () => {
      setLang(prev => prev === 'en' ? 'zh' : 'en');
  }

  // --- Bluetooth Logic ---
  
  // Create a stable callback function ref that bluetooth service calls
  // This proxies the call to our logic which can access fresh refs
  const onDataReceivedRef = useRef<(data: ScaleData) => void>((_) => {});

  useEffect(() => {
    onDataReceivedRef.current = (data: ScaleData) => {
      setRealtimeData(data);
      const weight = data.weight;
      const timestamp = Date.now();
  
      // If weight is effectively zero (user stepped off)
      if (weight < 0.5) {
        sessionSavedRef.current = false;
        stabilityTimerRef.current = null;
        stableWeightRef.current = 0;
        // We do NOT update displayRecord here, so it holds the last value
        return;
      }

      // Calculate Metrics
      const metrics = calculateBodyComposition(weight, data.impedance, userProfileRef.current);
      
      // --- Client-Side Stability Detection ---
      // Requirement: "When weight value has no change within a reasonable time and is not 0"
      let isCustomStable = false;

      if (stabilityTimerRef.current === null) {
          // Initialize timer
          stabilityTimerRef.current = timestamp;
          stableWeightRef.current = weight;
      } else {
          // Check if weight has drifted significantly from the "start of stability"
          const diff = Math.abs(weight - stableWeightRef.current);
          
          if (diff > 0.2) { 
              // Movement detected (>0.2kg), reset timer
              stabilityTimerRef.current = timestamp;
              stableWeightRef.current = weight;
          } else {
              // Weight is within threshold
              const elapsed = timestamp - stabilityTimerRef.current;
              // Require 2 seconds of stability
              if (elapsed > 2000) { 
                  isCustomStable = true;
              }
          }
      }

      // Combine hardware stability with our custom stability
      const effectiveStability = data.isStable || isCustomStable;

      const currentAsRecord: HistoryRecord = { 
        ...data, 
        isStable: effectiveStability, 
        metrics, 
        id: 'live' 
      };
      
      setDisplayRecord(currentAsRecord);

      // Auto-Save Trigger
      if (effectiveStability && !sessionSavedRef.current && weight > 1.0) {
        if (autoSaveRef.current) {
             const newRecord: HistoryRecord = {
               ...currentAsRecord,
               id: Date.now().toString()
             };
             setHistory(prev => {
                const newHistory = [...prev, newRecord];
                storageService.saveHistory(newHistory);
                return newHistory;
             });
             sessionSavedRef.current = true;
        }
      }
    };
  }, []); // Logic setup runs once, relies on refs for dynamic values

  const handleConnect = async () => {
    setError(null);
    try {
      // Pass a proxy function that calls the current ref
      await bluetoothService.connect(
        (data) => onDataReceivedRef.current(data),
        () => {
          setIsConnected(false);
          // Do not clear display record on disconnect, mimicking a physical scale holding value
        }
      );
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || t('errors.connectFail', lang));
    }
  };

  const handleDisconnect = () => {
    bluetoothService.disconnect();
    setIsConnected(false);
  };

  const handleManualSave = () => {
    if (displayRecord && displayRecord.id === 'live' && displayRecord.isStable) {
       const newRecord: HistoryRecord = {
         ...displayRecord,
         id: Date.now().toString()
       };
       const newHistory = [...history, newRecord];
       setHistory(newHistory);
       storageService.saveHistory(newHistory);
       setDisplayRecord(newRecord); // Switch display ID to the saved one
    }
  };

  // --- Helpers for Display ---
  const getEvaluatedMetric = (type: 'bmi' | 'fat' | 'muscle' | 'water', value: number | undefined) => {
      if (value === undefined) return undefined;
      let statusKey = '';
      if (type === 'bmi') statusKey = evaluateBMI(value);
      if (type === 'fat') statusKey = evaluateBodyFat(value, userProfile.gender);
      if (type === 'muscle') statusKey = evaluateMuscle(value, userProfile.gender);
      if (type === 'water') statusKey = evaluateWater(value, userProfile.gender);
      
      return {
          status: statusKey as any,
          label: t(`evaluation.${statusKey}`, lang)
      };
  };

  // --- Render ---

  if (!isInitialized) return <div className="min-h-screen bg-background" />;

  if (showOnboarding) {
    return <OnboardingWizard onComplete={(p) => {
      updateProfile(p);
      setShowOnboarding(false);
    }} lang={lang} />;
  }

  const isLive = displayRecord?.id === 'live';
  const showSaveButton = isLive && displayRecord?.isStable && !autoSave;
  
  // Status text for Gauge
  const gaugeStatusText = displayRecord?.isStable ? t('status.locked', lang) : t('status.measuring', lang);
  const gaugeLabelText = displayRecord 
    ? (isLive ? t('status.measuring', lang) : t('status.lastResult', lang)) 
    : t('status.ready', lang);

  return (
    <div className="min-h-screen bg-background text-slate-50 font-sans selection:bg-boohee selection:text-black flex flex-col">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-boohee rounded-lg flex items-center justify-center">
              <Activity className="text-black w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
              {t('title.main', lang)} <span className="text-boohee font-light">{t('title.sub', lang)}</span>
            </h1>
            <h1 className="text-xl font-bold tracking-tight text-white sm:hidden">
              {t('title.main', lang)}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
             <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white"
              title="Switch Language"
            >
              <Globe size={20} />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white"
              title="User Profile"
            >
              <User size={20} />
            </button>
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all ${
                isConnected 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                  : 'bg-boohee text-black hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
              }`}
            >
              <Bluetooth size={16} className="mr-2" />
              <span className="hidden sm:inline">{isConnected ? t('disconnect', lang) : t('connect', lang)}</span>
              <span className="sm:hidden">{isConnected ? t('disconnect', lang) : t('connect', lang).split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 px-4 max-w-6xl mx-auto w-full">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400">
            <AlertCircle size={20} className="mr-3" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-sm underline">{t('errors.dismiss', lang)}</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Gauge & Primary Weight */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-surface rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[420px]">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-boohee/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Control Bar inside card */}
                <div className="w-full flex justify-between items-center mb-4 px-2">
                   <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
                      <span className={isConnected ? "text-green-400" : "text-gray-600"}>●</span>
                      <span>{isConnected ? t('status.connected', lang) : t('status.offline', lang)}</span>
                   </div>
                   <button 
                    onClick={toggleAutoSave}
                    className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                   >
                     <span>{t('controls.autoSave', lang)}</span>
                     {autoSave ? <ToggleRight className="text-boohee" size={24}/> : <ToggleLeft size={24}/>}
                   </button>
                </div>

                <Gauge 
                  value={displayRecord?.weight || 0} 
                  max={150} 
                  label={gaugeLabelText} 
                  unit="kg" 
                  statusLabel={gaugeStatusText}
                  isStable={displayRecord?.isStable || false} 
                />
                
                {/* Save Button for Manual Mode */}
                {showSaveButton && (
                  <button 
                    onClick={handleManualSave}
                    className="mt-[-20px] mb-4 bg-boohee text-black font-bold px-6 py-2 rounded-full shadow-lg animate-bounce"
                  >
                    <Save size={16} className="inline mr-2" /> {t('controls.saveReading', lang)}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                  <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700">
                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">{t('metrics.impedance', lang)}</span>
                    <span className="text-xl font-mono text-white">
                      {displayRecord?.impedance && displayRecord.impedance > 0 ? displayRecord.impedance : '--'} <span className="text-sm text-gray-500">Ω</span>
                    </span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700">
                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">{t('metrics.rawFat', lang)}</span>
                    <span className="text-xl font-mono text-white">
                       {displayRecord?.rawFat && displayRecord.rawFat > 0 ? displayRecord.rawFat.toFixed(1) : '--'} <span className="text-sm text-gray-500">%</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Instructions (if disconnected) */}
            {!isConnected && !displayRecord && (
              <div className="mt-8 p-6 rounded-2xl border border-dashed border-slate-700 text-center animate-pulse">
                <h3 className="text-lg font-bold text-gray-300 mb-2">{t('instructions.readyTitle', lang)}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('instructions.readyText', lang)}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Metrics Grid */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{t('metrics.bodyFat', lang)}</h2>
              <div className="text-sm text-gray-400">
                {t('profile.userLabel', lang)}: <span className="text-white">{userProfile.gender === Gender.Male ? t('profile.male', lang) : t('profile.female', lang)}, {userProfile.age}y, {userProfile.height}cm</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <MetricCard 
                label={t('metrics.bmi', lang)}
                value={displayRecord?.metrics?.bmi || '--'} 
                evaluation={getEvaluatedMetric('bmi', displayRecord?.metrics?.bmi)}
                description={t('metrics.desc.bmi', lang)}
              />
              <MetricCard 
                label={t('metrics.bodyFat', lang)}
                value={displayRecord?.metrics?.bodyFatPercentage || '--'} 
                unit="%"
                evaluation={getEvaluatedMetric('fat', displayRecord?.metrics?.bodyFatPercentage)}
                description={t('metrics.desc.bodyFat', lang)}
              />
              <MetricCard 
                label={t('metrics.muscle', lang)}
                value={displayRecord?.metrics?.muscleRate || '--'} 
                unit="%"
                evaluation={getEvaluatedMetric('muscle', displayRecord?.metrics?.muscleRate)}
                description={t('metrics.desc.muscle', lang)}
              />
              <MetricCard 
                label={t('metrics.water', lang)}
                value={displayRecord?.metrics?.waterRate || '--'} 
                unit="%"
                evaluation={getEvaluatedMetric('water', displayRecord?.metrics?.waterRate)}
                description={t('metrics.desc.water', lang)}
              />
              <MetricCard 
                label={t('metrics.bmr', lang)}
                value={displayRecord?.metrics?.bmr || '--'} 
                unit="kcal"
                description={t('metrics.desc.bmr', lang)}
              />
              
              {/* Device Status Card */}
               <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 opacity-70 flex flex-col justify-center">
                 <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{t('status.deviceStatus', lang)}</h3>
                 <p className="font-mono text-xs text-boohee break-all mb-1">
                   {isLive ? t('status.streaming', lang) : t('status.held', lang)}
                 </p>
                 <div className="mt-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold mb-1">{t('status.lastResult', lang)}</span>
                    <p className="font-mono text-[10px] text-gray-400 break-all leading-tight">
                        {realtimeData.rawHex || t('status.waiting', lang)}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="mt-12 border-t border-slate-800 pt-8 mb-8">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold flex items-center">
               <History className="mr-2 text-boohee" /> {t('history.title', lang)}
             </h2>
             {history.length > 0 && (
               <button 
                 onClick={() => {
                   if(confirm(t('history.confirmClear', lang))) {
                     setHistory([]);
                     storageService.clearHistory();
                     setDisplayRecord(null);
                   }
                 }}
                 className="text-xs text-red-500 hover:text-red-400"
               >
                 {t('history.clear', lang)}
               </button>
             )}
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-600 bg-slate-900/30 rounded-2xl">
              {t('history.empty', lang)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4 font-medium">{t('history.cols.date', lang)}</th>
                    <th className="py-3 px-4 font-medium">{t('history.cols.weight', lang)}</th>
                    <th className="py-3 px-4 font-medium">{t('history.cols.bmi', lang)}</th>
                    <th className="py-3 px-4 font-medium">{t('history.cols.fat', lang)}</th>
                    <th className="py-3 px-4 font-medium text-right">{t('history.cols.actions', lang)}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {[...history].reverse().map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-4 text-sm font-mono text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-bold text-white text-lg">{entry.weight.toFixed(2)} kg</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${entry.metrics.bmi > 24 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                          {entry.metrics.bmi}
                        </span>
                      </td>
                      <td className="py-4 px-4">{entry.metrics.bodyFatPercentage}%</td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => deleteHistoryItem(entry.id)}
                          className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-background/90 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-2">
            {t('footer.copyright', lang)}
          </p>
          <p className="text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('footer.disclaimer', lang)}
          </p>
        </div>
      </footer>

      <UserProfileForm 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        profile={userProfile}
        onChange={updateProfile}
        lang={lang}
      />
    </div>
  );
};

export default App;
import { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { ErrorBanner } from './components/ErrorBanner';
import { HistorySection } from './components/HistorySection';
import { MeasurementPanel } from './components/MeasurementPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { OnboardingWizard } from './components/OnboardingWizard';
import { UserProfileForm } from './components/UserProfileForm';
import { useScaleController } from './hooks/useScaleController';
import { t } from './services/i18n';

const App = () => {
  const scale = useScaleController();
  const [showSettings, setShowSettings] = useState(false);

  if (!scale.isInitialized) return <div className="min-h-screen bg-background" />;

  if (scale.showOnboarding) {
    return <OnboardingWizard onComplete={scale.completeOnboarding} lang={scale.lang} onToggleLanguage={scale.toggleLanguage} />;
  }

  return (
    <div className="min-h-screen bg-background text-slate-50 font-sans selection:bg-boohee selection:text-black flex flex-col">
      <AppHeader
        connectionState={scale.connectionState}
        lang={scale.lang}
        onConnect={scale.connect}
        onDisconnect={scale.disconnect}
        onOpenProfile={() => setShowSettings(true)}
        onToggleLanguage={scale.toggleLanguage}
      />

      <main className="flex-grow pt-24 pb-12 px-4 max-w-6xl mx-auto w-full">
        {scale.error && (
          <ErrorBanner message={scale.error} lang={scale.lang} onDismiss={scale.clearError} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <MeasurementPanel
            autoSave={scale.autoSave}
            connectionState={scale.connectionState}
            displayRecord={scale.displayRecord}
            lang={scale.lang}
            onManualSave={scale.saveCurrentReading}
            onToggleAutoSave={scale.toggleAutoSave}
          />
          <MetricsPanel
            displayRecord={scale.displayRecord}
            lang={scale.lang}
            realtimeData={scale.realtimeData}
            userProfile={scale.userProfile}
          />
        </div>

        <HistorySection
          history={scale.history}
          lang={scale.lang}
          selectedId={scale.displayRecord?.id}
          onClear={scale.clearHistory}
          onDelete={scale.deleteHistoryItem}
          onSelect={scale.selectHistoryItem}
        />
      </main>

      <footer className="w-full border-t border-slate-800 bg-background/90 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-2">{t('footer.copyright', scale.lang)}</p>
          <p className="text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('footer.disclaimer', scale.lang)}
          </p>
        </div>
      </footer>

      <UserProfileForm
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        profile={scale.userProfile}
        onChange={scale.updateProfile}
        lang={scale.lang}
      />
    </div>
  );
};

export default App;

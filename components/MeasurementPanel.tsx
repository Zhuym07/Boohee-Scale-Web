import { Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { ConnectionState } from '../hooks/useScaleController';
import { t } from '../services/i18n';
import { HistoryRecord } from '../services/storage';
import { Language } from '../types';
import { Gauge } from './Gauge';

interface Props {
  autoSave: boolean;
  connectionState: ConnectionState;
  displayRecord: HistoryRecord | null;
  lang: Language;
  onManualSave: () => void;
  onToggleAutoSave: () => void;
}

export const MeasurementPanel = ({
  autoSave,
  connectionState,
  displayRecord,
  lang,
  onManualSave,
  onToggleAutoSave
}: Props) => {
  const isConnected = connectionState === 'connected';
  const isLive = displayRecord?.id === 'live';
  const showSaveButton = isLive && displayRecord.isStable && !autoSave;
  const gaugeStatus = displayRecord?.isStable ? t('status.locked', lang) : t('status.measuring', lang);
  const gaugeLabel = displayRecord
    ? (isLive ? t('status.measuring', lang) : t('status.lastResult', lang))
    : t('status.ready', lang);

  return (
    <section className="lg:col-span-5 flex flex-col" aria-label={t('metrics.weight', lang)}>
      <div className="bg-surface rounded-lg p-4 sm:p-6 border border-slate-800 shadow-xl min-h-[390px]">
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4 px-1 sm:px-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className={isConnected ? 'text-green-400' : 'text-gray-600'} aria-hidden="true">●</span>
              <span>{isConnected ? t('status.connected', lang) : t('status.offline', lang)}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoSave}
              onClick={onToggleAutoSave}
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              <span>{t('controls.autoSave', lang)}</span>
              {autoSave ? <ToggleRight className="text-boohee" size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>

          <Gauge
            value={displayRecord?.weight ?? 0}
            max={150}
            label={gaugeLabel}
            unit="kg"
            statusLabel={gaugeStatus}
            isStable={displayRecord?.isStable ?? false}
          />

          {showSaveButton && (
            <button
              type="button"
              onClick={onManualSave}
              className="mb-4 bg-boohee hover:bg-green-400 text-black font-bold px-5 py-2 rounded-lg shadow-lg"
            >
              <Save size={16} className="inline mr-2" />
              {t('controls.saveReading', lang)}
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mt-4">
            <ReadingValue label={t('metrics.impedance', lang)} value={displayRecord?.impedance} unit="Ω" />
            <ReadingValue label={t('metrics.rawFat', lang)} value={displayRecord?.rawFat} unit="%" decimals={1} />
          </div>
        </div>
      </div>

      {!isConnected && !displayRecord && (
        <div className="mt-6 p-5 rounded-lg border border-dashed border-slate-700 text-center">
          <h2 className="text-base font-bold text-gray-300 mb-2">{t('instructions.readyTitle', lang)}</h2>
          <p className="text-gray-500 text-sm">{t('instructions.readyText', lang)}</p>
        </div>
      )}
    </section>
  );
};

const ReadingValue = ({
  label,
  value,
  unit,
  decimals = 0
}: { label: string; value?: number; unit: string; decimals?: number }) => (
  <div className="bg-slate-900/50 p-3 sm:p-4 rounded-lg text-center border border-slate-700 min-w-0">
    <span className="block text-[11px] text-gray-500 uppercase font-bold mb-1 truncate">{label}</span>
    <span className="text-lg sm:text-xl font-mono text-white whitespace-nowrap">
      {value && value > 0 ? value.toFixed(decimals) : '--'} <span className="text-xs sm:text-sm text-gray-500">{unit}</span>
    </span>
  </div>
);

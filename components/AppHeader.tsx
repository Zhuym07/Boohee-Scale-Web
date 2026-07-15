import { Activity, Bluetooth, Globe, LoaderCircle, User } from 'lucide-react';
import { ConnectionState } from '../hooks/useScaleController';
import { t } from '../services/i18n';
import { Language } from '../types';

interface Props {
  connectionState: ConnectionState;
  lang: Language;
  onConnect: () => void;
  onDisconnect: () => void;
  onOpenProfile: () => void;
  onToggleLanguage: () => void;
}

export const AppHeader = ({
  connectionState,
  lang,
  onConnect,
  onDisconnect,
  onOpenProfile,
  onToggleLanguage
}: Props) => {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const connectionLabel = isConnecting
    ? t('status.connecting', lang)
    : isConnected ? t('disconnect', lang) : t('connect', lang);

  return (
    <header className="fixed top-0 w-full z-40 bg-background/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 bg-boohee rounded-lg flex items-center justify-center">
            <Activity className="text-black w-5 h-5" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">
            {t('title.main', lang)} <span className="hidden sm:inline text-boohee font-light">{t('title.sub', lang)}</span>
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white"
            title={t('controls.language', lang)}
            aria-label={t('controls.language', lang)}
          >
            <Globe size={20} />
          </button>
          <button
            type="button"
            onClick={onOpenProfile}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white"
            title={t('profile.title', lang)}
            aria-label={t('profile.title', lang)}
          >
            <User size={20} />
          </button>
          <button
            type="button"
            onClick={isConnected ? onDisconnect : onConnect}
            disabled={isConnecting}
            className={`h-10 flex items-center px-3 sm:px-4 rounded-lg text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-70 ${
              isConnected
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-boohee text-black hover:bg-green-400'
            }`}
          >
            {isConnecting
              ? <LoaderCircle size={16} className="mr-0 sm:mr-2 animate-spin" />
              : <Bluetooth size={16} className="mr-0 sm:mr-2" />}
            <span className="hidden sm:inline">{connectionLabel}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

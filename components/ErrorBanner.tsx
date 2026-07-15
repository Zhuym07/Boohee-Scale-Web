import { AlertCircle, X } from 'lucide-react';
import { t } from '../services/i18n';
import { Language } from '../types';

interface Props {
  message: string;
  lang: Language;
  onDismiss: () => void;
}

export const ErrorBanner = ({ message, lang, onDismiss }: Props) => (
  <div role="alert" className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-300">
    <AlertCircle size={20} className="mr-3 shrink-0" />
    <span className="text-sm">{message}</span>
    <button
      type="button"
      onClick={onDismiss}
      className="ml-auto p-1 text-red-400 hover:text-white"
      title={t('errors.dismiss', lang)}
      aria-label={t('errors.dismiss', lang)}
    >
      <X size={18} />
    </button>
  </div>
);

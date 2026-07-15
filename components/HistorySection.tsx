import { History, Trash2 } from 'lucide-react';
import { evaluateBMI } from '../services/biaService';
import { t } from '../services/i18n';
import { HistoryRecord } from '../services/storage';
import { Language } from '../types';

interface Props {
  history: HistoryRecord[];
  lang: Language;
  selectedId?: string;
  onClear: () => void;
  onDelete: (id: string) => void;
  onSelect: (record: HistoryRecord) => void;
}

export const HistorySection = ({ history, lang, selectedId, onClear, onDelete, onSelect }: Props) => {
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  const records = [...history].reverse();

  const confirmClear = () => {
    if (window.confirm(t('history.confirmClear', lang))) onClear();
  };

  return (
    <section className="mt-12 border-t border-slate-800 pt-8 mb-8" aria-labelledby="history-title">
      <div className="flex items-center justify-between mb-6">
        <h2 id="history-title" className="text-xl font-bold flex items-center">
          <History className="mr-2 text-boohee" /> {t('history.title', lang)}
        </h2>
        {history.length > 0 && (
          <button type="button" onClick={confirmClear} className="text-sm text-red-400 hover:text-red-300">
            {t('history.clear', lang)}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-600 bg-slate-900/30 rounded-lg">
          {t('history.empty', lang)}
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {records.map(record => (
              <article key={record.id} className={`rounded-lg border p-4 ${selectedId === record.id ? 'border-boohee bg-boohee/5' : 'border-slate-800 bg-slate-900/30'}`}>
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => onSelect(record)} className="min-w-0 text-left flex-1">
                    <time className="block text-xs text-gray-500 mb-1">{new Date(record.timestamp).toLocaleString(locale)}</time>
                    <span className="text-xl font-bold text-white">{record.weight.toFixed(2)} kg</span>
                  </button>
                  <DeleteButton lang={lang} onClick={() => onDelete(record.id)} />
                </div>
                <div className="mt-3 flex gap-4 text-sm text-gray-400">
                  <span>BMI <strong className="text-gray-200">{record.metrics.bmi}</strong></span>
                  <span>{t('history.cols.fat', lang)} <strong className="text-gray-200">{record.metrics.bodyFatPercentage}%</strong></span>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-slate-800">
                  <th className="py-3 px-4 font-medium">{t('history.cols.date', lang)}</th>
                  <th className="py-3 px-4 font-medium">{t('history.cols.weight', lang)}</th>
                  <th className="py-3 px-4 font-medium">{t('history.cols.bmi', lang)}</th>
                  <th className="py-3 px-4 font-medium">{t('history.cols.fat', lang)}</th>
                  <th className="py-3 px-4 font-medium text-right">{t('history.cols.actions', lang)}</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {records.map(record => {
                  const bmiStatus = evaluateBMI(record.metrics.bmi);
                  const bmiColor = bmiStatus === 'normal'
                    ? 'bg-green-500/20 text-green-400'
                    : bmiStatus === 'underweight' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400';

                  return (
                    <tr key={record.id} className={`border-b border-slate-800/50 transition-colors ${selectedId === record.id ? 'bg-boohee/5' : 'hover:bg-slate-800/30'}`}>
                      <td className="py-4 px-4 text-sm font-mono">
                        <button type="button" onClick={() => onSelect(record)} className="text-gray-400 hover:text-white text-left">
                          {new Date(record.timestamp).toLocaleString(locale)}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-bold text-white text-lg">{record.weight.toFixed(2)} kg</td>
                      <td className="py-4 px-4"><span className={`px-2 py-1 rounded text-xs font-bold ${bmiColor}`}>{record.metrics.bmi}</span></td>
                      <td className="py-4 px-4">{record.metrics.bodyFatPercentage}%</td>
                      <td className="py-4 px-4 text-right"><DeleteButton lang={lang} onClick={() => onDelete(record.id)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

const DeleteButton = ({ lang, onClick }: { lang: Language; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
    title={t('history.delete', lang)}
    aria-label={t('history.delete', lang)}
  >
    <Trash2 size={17} />
  </button>
);

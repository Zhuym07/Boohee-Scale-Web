import { evaluateBMI, evaluateBodyFat, evaluateLeanMass, evaluateWater } from '../services/biaService';
import { t } from '../services/i18n';
import { HistoryRecord } from '../services/storage';
import { Gender, Language, ScaleData, UserProfile } from '../types';
import { MetricCard } from './MetricCard';

type MetricType = 'bmi' | 'fat' | 'lean' | 'water';

interface Props {
  displayRecord: HistoryRecord | null;
  lang: Language;
  realtimeData: ScaleData;
  userProfile: UserProfile;
}

export const MetricsPanel = ({ displayRecord, lang, realtimeData, userProfile }: Props) => {
  const getEvaluation = (type: MetricType, value: number | undefined) => {
    if (value === undefined) return undefined;

    const status = type === 'bmi'
      ? evaluateBMI(value)
      : type === 'fat'
        ? evaluateBodyFat(value, userProfile.gender)
        : type === 'lean'
          ? evaluateLeanMass(value, userProfile.gender)
          : evaluateWater(value, userProfile.gender);

    return { status, label: t(`evaluation.${status}`, lang) };
  };

  const metrics = displayRecord?.metrics;
  const isLive = displayRecord?.id === 'live';
  const bodyFatDescription = metrics?.bodyFatMethod === 'bia'
    ? t('metrics.desc.bodyFatBia', lang)
    : t('metrics.desc.bodyFatFallback', lang);

  return (
    <section className="lg:col-span-7" aria-labelledby="body-metrics-title">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <h2 id="body-metrics-title" className="text-xl sm:text-2xl font-bold text-white">{t('metrics.bodyComposition', lang)}</h2>
        <div className="text-xs sm:text-sm text-gray-400">
          {t('profile.userLabel', lang)}: <span className="text-white">
            {userProfile.gender === Gender.Male ? t('profile.male', lang) : t('profile.female', lang)}, {userProfile.age}{t('onboarding.years', lang)}, {userProfile.height}cm
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          label={t('metrics.bmi', lang)}
          value={metrics?.bmi ?? '--'}
          evaluation={getEvaluation('bmi', metrics?.bmi)}
          description={t('metrics.desc.bmi', lang)}
        />
        <MetricCard
          label={t('metrics.bodyFat', lang)}
          value={metrics?.bodyFatPercentage ?? '--'}
          unit="%"
          evaluation={getEvaluation('fat', metrics?.bodyFatPercentage)}
          description={bodyFatDescription}
        />
        <MetricCard
          label={t('metrics.leanMass', lang)}
          value={metrics?.leanMassRate ?? '--'}
          unit="%"
          evaluation={getEvaluation('lean', metrics?.leanMassRate)}
          description={t('metrics.desc.leanMass', lang)}
        />
        <MetricCard
          label={t('metrics.water', lang)}
          value={metrics?.waterRate ?? '--'}
          unit="%"
          evaluation={getEvaluation('water', metrics?.waterRate)}
          description={t('metrics.desc.water', lang)}
        />
        <MetricCard
          label={t('metrics.bmr', lang)}
          value={metrics?.bmr ?? '--'}
          unit="kcal"
          description={t('metrics.desc.bmr', lang)}
        />

        <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 flex flex-col justify-center min-h-[126px]">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">{t('status.deviceStatus', lang)}</h3>
          <p className="font-mono text-xs text-boohee break-all mb-1">
            {!displayRecord ? t('status.waiting', lang) : isLive ? t('status.streaming', lang) : t('status.held', lang)}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-gray-500 block uppercase font-bold mb-1">{t('status.rawPacket', lang)}</span>
            <p className="font-mono text-[10px] text-gray-400 break-all leading-tight">
              {realtimeData.rawHex || '--'}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-500">{t('metrics.estimateNotice', lang)}</p>
    </section>
  );
};

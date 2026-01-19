import React, { useState } from 'react';
import { UserProfile, Gender, Language } from '../types';
import { ChevronRight, Ruler, Calendar, User } from 'lucide-react';
import { t } from '../services/i18n';

interface Props {
  onComplete: (profile: UserProfile) => void;
  lang: Language;
}

export const OnboardingWizard: React.FC<Props> = ({ onComplete, lang }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    gender: Gender.Male,
    height: 170,
    age: 25
  });

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{t('onboarding.welcome', lang)}</h1>
          <p className="text-gray-400">{t('onboarding.desc', lang)}</p>
        </div>

        <div className="bg-surface border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1 bg-boohee transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>

          <div className="min-h-[300px] flex flex-col">
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                <User size={48} className="text-boohee mb-6" />
                <h2 className="text-2xl font-bold mb-8">{t('onboarding.genderQ', lang)}</h2>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => setProfile({ ...profile, gender: Gender.Male })}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      profile.gender === Gender.Male
                        ? 'border-boohee bg-boohee/10 text-white'
                        : 'border-slate-700 hover:border-slate-500 text-gray-400'
                    }`}
                  >
                    <span className="block text-xl font-bold">{t('profile.male', lang)}</span>
                  </button>
                  <button
                    onClick={() => setProfile({ ...profile, gender: Gender.Female })}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      profile.gender === Gender.Female
                        ? 'border-boohee bg-boohee/10 text-white'
                        : 'border-slate-700 hover:border-slate-500 text-gray-400'
                    }`}
                  >
                    <span className="block text-xl font-bold">{t('profile.female', lang)}</span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                <Calendar size={48} className="text-boohee mb-6" />
                <h2 className="text-2xl font-bold mb-2">{t('onboarding.ageQ', lang)}</h2>
                <p className="text-gray-500 text-sm mb-8">{t('onboarding.ageDesc', lang)}</p>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Math.max(1, parseInt(e.target.value) || 0) })}
                    className="w-32 bg-slate-900 border-2 border-slate-600 rounded-2xl px-4 py-4 text-center text-3xl font-bold text-white focus:outline-none focus:border-boohee"
                  />
                  <span className="text-xl text-gray-400">{t('onboarding.years', lang)}</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300">
                <Ruler size={48} className="text-boohee mb-6" />
                <h2 className="text-2xl font-bold mb-2">{t('onboarding.heightQ', lang)}</h2>
                <p className="text-gray-500 text-sm mb-8">{t('onboarding.heightDesc', lang)}</p>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: Math.max(1, parseInt(e.target.value) || 0) })}
                    className="w-32 bg-slate-900 border-2 border-slate-600 rounded-2xl px-4 py-4 text-center text-3xl font-bold text-white focus:outline-none focus:border-boohee"
                  />
                  <span className="text-xl text-gray-400">{t('onboarding.cm', lang)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={nextStep}
            className="w-full mt-8 bg-boohee hover:bg-green-500 text-black font-bold py-4 rounded-xl flex items-center justify-center transition-colors"
          >
            {step === 3 ? t('onboarding.finish', lang) : t('onboarding.next', lang)}
            <ChevronRight size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
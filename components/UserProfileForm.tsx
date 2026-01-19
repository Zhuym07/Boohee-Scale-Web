import React from 'react';
import { UserProfile, Gender, Language } from '../types';
import { t } from '../services/i18n';

interface Props {
  profile: UserProfile;
  onChange: (p: UserProfile) => void;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const UserProfileForm: React.FC<Props> = ({ profile, onChange, isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    onChange({
      ...profile,
      [field]: value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">{t('profile.title', lang)}</h2>
        <p className="text-gray-400 text-sm mb-6">
          {t('profile.desc', lang)}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">{t('profile.gender', lang)}</label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleChange('gender', Gender.Male)}
                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                  profile.gender === Gender.Male 
                    ? 'bg-boohee text-black border-boohee' 
                    : 'bg-transparent text-gray-400 border-slate-600 hover:border-gray-400'
                }`}
              >
                {t('profile.male', lang)}
              </button>
              <button
                onClick={() => handleChange('gender', Gender.Female)}
                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                  profile.gender === Gender.Female 
                    ? 'bg-boohee text-black border-boohee' 
                    : 'bg-transparent text-gray-400 border-slate-600 hover:border-gray-400'
                }`}
              >
                {t('profile.female', lang)}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">{t('profile.height', lang)}</label>
            <input
              type="number"
              value={profile.height}
              onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-boohee"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">{t('profile.age', lang)}</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-boohee"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-boohee hover:bg-green-400 text-black font-bold py-3 px-8 rounded-xl transition-colors"
          >
            {t('profile.save', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
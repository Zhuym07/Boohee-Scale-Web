import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { t } from '../services/i18n';
import { Gender, Language, PROFILE_LIMITS, UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const UserProfileForm = ({ profile, onChange, isOpen, onClose, lang }: Props) => {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (isOpen) setDraft(profile);
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isValid = draft.height >= PROFILE_LIMITS.height.min && draft.height <= PROFILE_LIMITS.height.max
    && draft.age >= PROFILE_LIMITS.age.min && draft.age <= PROFILE_LIMITS.age.max;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    onChange(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="profile-title" className="bg-surface border border-slate-700 p-6 sm:p-8 rounded-lg w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 id="profile-title" className="text-2xl font-bold text-white">{t('profile.title', lang)}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-white" aria-label={t('controls.close', lang)}>
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-6">{t('profile.desc', lang)}</p>

        <div className="space-y-4">
          <fieldset>
            <legend className="block text-xs uppercase text-gray-500 font-bold mb-2">{t('profile.gender', lang)}</legend>
            <div className="grid grid-cols-2 gap-3">
              {[Gender.Male, Gender.Female].map(gender => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setDraft(current => ({ ...current, gender }))}
                  className={`py-3 rounded-lg border font-bold transition-colors ${draft.gender === gender ? 'bg-boohee text-black border-boohee' : 'text-gray-400 border-slate-600 hover:border-gray-400'}`}
                >
                  {t(`profile.${gender}`, lang)}
                </button>
              ))}
            </div>
          </fieldset>

          <NumberField
            id="profile-height"
            label={t('profile.height', lang)}
            value={draft.height}
            min={PROFILE_LIMITS.height.min}
            max={PROFILE_LIMITS.height.max}
            onChange={height => setDraft(current => ({ ...current, height }))}
          />
          <NumberField
            id="profile-age"
            label={t('profile.age', lang)}
            value={draft.age}
            min={PROFILE_LIMITS.age.min}
            max={PROFILE_LIMITS.age.max}
            onChange={age => setDraft(current => ({ ...current, age }))}
          />
        </div>

        <button type="submit" disabled={!isValid} className="mt-8 w-full bg-boohee hover:bg-green-400 disabled:bg-slate-700 disabled:text-gray-500 text-black font-bold py-3 px-8 rounded-lg transition-colors">
          {t('profile.save', lang)}
        </button>
      </form>
    </div>
  );
};

const NumberField = ({ id, label, value, min, max, onChange }: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <div>
    <label htmlFor={id} className="block text-xs uppercase text-gray-500 font-bold mb-2">{label}</label>
    <input
      id={id}
      type="number"
      inputMode="numeric"
      required
      min={min}
      max={max}
      value={value || ''}
      onChange={event => onChange(event.target.valueAsNumber || 0)}
      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-boohee"
    />
    <span className="mt-1 block text-xs text-gray-600">{min}–{max}</span>
  </div>
);

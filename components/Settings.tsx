
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { translations } from '../services/i18n';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate }) => {
  const t = translations[profile.language] || translations.English;
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1a2e23]">{t.settings.title}</h2>
        <p className="text-gray-500">{t.settings.desc}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-50">
          <div className="w-24 h-24 rounded-full bg-[#c1a062] flex items-center justify-center text-[#1a2e23] text-3xl font-bold border-4 border-[#f8f9fa] overflow-hidden">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-xl text-[#1a2e23]">{formData.name}</h3>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-[#c1a062] uppercase">{t.settings.photo}</button>
              {formData.avatarUrl && (
                <button type="button" onClick={() => setFormData({...formData, avatarUrl: undefined})} className="text-xs font-bold text-red-400 uppercase">{t.settings.remove}</button>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">{t.settings.name}</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:border-[#c1a062] text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">{t.settings.level}</label>
            <select className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}>
              <option value="Novice">Novice</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">{t.settings.horse}</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm" value={formData.horseName} onChange={(e) => setFormData({ ...formData, horseName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">{t.settings.discipline}</label>
            <select className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm" value={formData.discipline} onChange={(e) => setFormData({ ...formData, discipline: e.target.value as any })}>
              <option value="Dressage">Dressage</option>
              <option value="Show Jumping">Show Jumping</option>
              <option value="Eventing">Eventing</option>
              <option value="Leisure">Leisure</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-400">{t.settings.goals}</label>
          <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm" placeholder={t.settings.placeholder} value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} />
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button type="submit" className="bg-[#1a2e23] text-white font-bold py-3 px-10 rounded-xl">{t.settings.save}</button>
          {isSaved && <span className="text-green-600 font-bold text-sm">{t.settings.updated}</span>}
        </div>
      </form>
    </div>
  );
};

export default Settings;

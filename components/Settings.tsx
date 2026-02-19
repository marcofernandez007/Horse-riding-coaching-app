
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
  const [isUploading, setIsUploading] = useState(false);
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
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatarUrl: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'EQ';

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn pb-20">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-bold text-[#1a2e23] serif">{t.settings.title}</h2>
        <p className="text-gray-500 mt-2">{t.settings.desc}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-10">
        {/* Avatar Selection Section */}
        <div className="flex flex-col items-center md:flex-row md:space-x-10 pb-10 border-b border-gray-50">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className={`w-32 h-32 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#1a2e23] text-4xl font-bold border-4 border-white shadow-lg overflow-hidden transition-all duration-300 ${isUploading ? 'opacity-50' : 'group-hover:scale-105'}`}>
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Rider Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="serif">{initials}</span>
              )}
            </div>
            
            {/* Edit Overlay */}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            </div>

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#c1a062] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="text-center md:text-left mt-6 md:mt-0 flex-1">
            <h3 className="font-bold text-2xl text-[#1a2e23] mb-2">{formData.name || 'Set Your Name'}</h3>
            <p className="text-sm text-gray-400 mb-4">{t.settings.level}: {formData.level}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="text-xs font-bold text-white bg-[#c1a062] px-6 py-2.5 rounded-full uppercase tracking-wider hover:bg-[#b08e50] transition-colors shadow-md shadow-[#c1a062]/20"
              >
                {t.settings.photo}
              </button>
              {formData.avatarUrl && (
                <button 
                  type="button" 
                  onClick={removeAvatar} 
                  className="text-xs font-bold text-red-500 bg-red-50 px-6 py-2.5 rounded-full uppercase tracking-wider hover:bg-red-100 transition-colors"
                >
                  {t.settings.remove}
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">{t.settings.name}</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-4 focus:ring-[#c1a062]/5 transition-all outline-none text-sm font-medium" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">{t.settings.level}</label>
            <select 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-4 focus:ring-[#c1a062]/5 transition-all outline-none text-sm font-medium appearance-none" 
              value={formData.level} 
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
            >
              <option value="Novice">Novice</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">{t.settings.horse}</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-4 focus:ring-[#c1a062]/5 transition-all outline-none text-sm font-medium" 
              value={formData.horseName} 
              onChange={(e) => setFormData({ ...formData, horseName: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">{t.settings.discipline}</label>
            <select 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-4 focus:ring-[#c1a062]/5 transition-all outline-none text-sm font-medium appearance-none" 
              value={formData.discipline} 
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value as any })}
            >
              <option value="Dressage">Dressage</option>
              <option value="Show Jumping">Show Jumping</option>
              <option value="Eventing">Eventing</option>
              <option value="Leisure">Leisure</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">{t.settings.goals}</label>
          <textarea 
            rows={4} 
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-4 focus:ring-[#c1a062]/5 transition-all outline-none text-sm font-medium resize-none" 
            placeholder={t.settings.placeholder} 
            value={formData.goals} 
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })} 
          />
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <button 
            type="submit" 
            className="w-full md:w-auto bg-[#1a2e23] text-white font-bold py-4 px-16 rounded-2xl shadow-xl hover:bg-[#253f31] transition-all hover:scale-[1.02] active:scale-95"
          >
            {t.settings.save}
          </button>
          {isSaved && (
            <div className="flex items-center space-x-2 text-green-600 animate-fadeIn">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              <span className="font-bold text-sm">{t.settings.updated}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Settings;

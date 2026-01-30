
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate }) => {
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
      if (file.size > 2 * 1024 * 1024) {
        alert("Avatar image must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatarUrl: undefined });
  };

  const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1a2e23]">Profile Settings</h2>
        <p className="text-gray-500">Customize your EquiAI experience and coaching focus.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-50">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-[#c1a062] flex items-center justify-center text-[#1a2e23] text-3xl font-bold border-4 border-[#f8f9fa] overflow-hidden shadow-inner">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-xl text-[#1a2e23]">{formData.name}</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
              <button 
                type="button" 
                onClick={triggerFileInput}
                className="text-xs font-bold text-[#c1a062] hover:text-[#b08e50] uppercase tracking-wider"
              >
                Change Photo
              </button>
              {formData.avatarUrl && (
                <>
                  <span className="text-gray-300">•</span>
                  <button 
                    type="button" 
                    onClick={removeAvatar}
                    className="text-xs font-bold text-red-400 hover:text-red-500 uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Rider Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-0 transition-all text-sm font-medium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Experience Level</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-0 transition-all text-sm font-medium"
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
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Horse Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-0 transition-all text-sm font-medium"
              value={formData.horseName}
              onChange={(e) => setFormData({ ...formData, horseName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Discipline</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-0 transition-all text-sm font-medium"
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
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Training Goals</label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#c1a062] focus:ring-0 transition-all text-sm font-medium"
            placeholder="What are you working towards?"
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
          />
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button
            type="submit"
            className="bg-[#1a2e23] hover:bg-[#253f31] text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all"
          >
            Save Changes
          </button>
          {isSaved && (
            <span className="text-green-600 font-bold text-sm animate-pulse flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Profile Updated Successfully</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Settings;

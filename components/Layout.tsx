
import React from 'react';
import { AppState, UserProfile, Language } from '../types';
import { translations } from '../services/i18n';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
  onLanguageChange: (lang: Language) => void;
  profile: UserProfile;
}

const LANGUAGES: { name: Language; flag: string }[] = [
  { name: 'English', flag: '🇺🇸' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'Italian', flag: '🇮🇹' },
  { name: 'Portuguese', flag: '🇵🇹' },
  { name: 'Arabic', flag: '🇦🇪' },
  { name: 'Mandarin', flag: '🇨🇳' },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Dutch', flag: '🇳🇱' }
];

const NavIcon = ({ state, active }: { state: AppState; active: boolean }) => {
  const color = active ? 'text-[#c1a062]' : 'text-current';
  switch (state) {
    case 'dashboard':
      return <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
    case 'analyze':
      return <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
    case 'history':
      return <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
    case 'training-plan':
      return <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
    case 'settings':
      return <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
    default:
      return null;
  }
};

const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate, onLanguageChange, profile }) => {
  const t = translations[profile.language] || translations.English;
  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const navItems: { state: AppState; label: string }[] = [
    { state: 'dashboard', label: t.nav.dashboard },
    { state: 'analyze', label: t.nav.camera },
    { state: 'history', label: t.nav.history },
    { state: 'training-plan', label: t.nav.plan },
    { state: 'settings', label: t.nav.settings }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 bg-[#1a2e23] text-white p-6 flex-col sticky top-0 h-screen overflow-y-auto z-50 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold serif text-[#c1a062]">EquiAI</h1>
          <p className="text-xs text-[#8ca493] tracking-widest uppercase">Mastery through Vision</p>
        </div>
        
        <div className="space-y-4 flex-1">
          {navItems.map((item) => (
            <button 
              key={item.state}
              onClick={() => onNavigate(item.state)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${activeState === item.state ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
            >
              <NavIcon state={item.state} active={activeState === item.state} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-6 border-t border-[#253f31] mt-auto">
          <button 
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center space-x-3 group text-left hover:bg-[#253f31] p-2 rounded-xl transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#c1a062] flex items-center justify-center text-[#1a2e23] font-bold group-hover:scale-110 transition-transform overflow-hidden shadow-inner border border-white/20">
               {profile.avatarUrl ? (
                 <img src={profile.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span>{initials}</span>
               )}
            </div>
            <div>
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-[#8ca493]">{profile.level} Rider</p>
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full md:h-screen md:overflow-hidden relative pb-20 md:pb-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 py-3 px-4 md:py-4 md:px-8 flex justify-between items-center shadow-sm z-40 sticky top-0 md:static">
           <div className="flex items-center space-x-3">
              <h1 className="md:hidden text-2xl font-bold serif text-[#1a2e23]">EquiAI</h1>
              <div className="hidden md:block">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.nav.discipline}</span>
                <p className="text-sm font-bold text-[#1a2e23]">{profile.discipline} {t.nav.with} {profile.horseName}</p>
              </div>
           </div>
           
           <div className="flex items-center space-x-2 md:space-x-6">
             <div className="flex items-center space-x-1 md:space-x-2">
               <select 
                value={profile.language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="text-[10px] md:text-xs font-bold text-gray-600 bg-gray-50 border-none rounded-lg py-1 px-2 md:py-2 md:px-3 focus:ring-1 focus:ring-[#c1a062] cursor-pointer hover:bg-gray-100 transition-colors"
               >
                 {LANGUAGES.map(lang => (
                   <option key={lang.name} value={lang.name}>
                     {lang.flag} {lang.name}
                   </option>
                 ))}
               </select>
             </div>
             
             <div className="h-6 md:h-8 w-px bg-gray-100"></div>
             
             <div className="flex items-center space-x-2 md:space-x-3">
               <div className="hidden sm:block text-right">
                 <p className="text-xs font-bold text-[#1a2e23]">{profile.name}</p>
                 <p className="text-[10px] text-[#c1a062] font-bold uppercase">{profile.language}</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-[#c1a062]/10 flex items-center justify-center text-[#c1a062] text-xs font-bold border border-[#c1a062]/20">
                 {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover rounded-full" /> : initials}
               </div>
             </div>
           </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a2e23] border-t border-white/10 z-50 flex justify-around items-center px-1 py-2 safe-area-bottom shadow-2xl">
          {navItems.map((item) => (
            <button 
              key={item.state}
              onClick={() => onNavigate(item.state)}
              className="flex flex-col items-center py-1 flex-1 transition-all active:scale-90"
            >
              <NavIcon state={item.state} active={activeState === item.state} />
              <span className={`text-[10px] mt-1 font-medium transition-colors ${activeState === item.state ? 'text-[#c1a062]' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default Layout;

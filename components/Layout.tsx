
import React from 'react';
import { AppState, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
  profile: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate, profile }) => {
  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Navigation */}
      <nav className="w-full md:w-64 bg-[#1a2e23] text-white p-6 flex flex-col sticky top-0 md:h-screen overflow-y-auto z-50 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold serif text-[#c1a062]">EquiAI</h1>
          <p className="text-xs text-[#8ca493] tracking-widest uppercase">Mastery through Vision</p>
        </div>
        
        <div className="space-y-4 flex-1">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${activeState === 'dashboard' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => onNavigate('analyze')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${activeState === 'analyze' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>Analysis Camera</span>
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${activeState === 'history' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <span>Training Log</span>
          </button>
          <button 
            onClick={() => onNavigate('training-plan')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${activeState === 'training-plan' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            <span>Coaching Plan</span>
          </button>
          <button 
            onClick={() => onNavigate('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${activeState === 'settings' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>Profile Settings</span>
          </button>
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-[#f8f9fa] overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

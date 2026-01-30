
import React from 'react';
import { AppState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Navigation */}
      <nav className="w-full md:w-64 bg-[#1a2e23] text-white p-6 flex flex-col sticky top-0 md:h-screen overflow-y-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold serif text-[#c1a062]">EquiAI</h1>
          <p className="text-xs text-[#8ca493] tracking-widest uppercase">Mastery through Vision</p>
        </div>
        
        <div className="space-y-4 flex-1">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeState === 'dashboard' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate('analyze')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeState === 'analyze' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            Analysis Camera
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeState === 'history' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            Training Log
          </button>
          <button 
            onClick={() => onNavigate('training-plan')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeState === 'training-plan' ? 'bg-[#c1a062] text-[#1a2e23] font-semibold' : 'hover:bg-[#253f31]'}`}
          >
            Coaching Plan
          </button>
        </div>

        <div className="pt-6 border-t border-[#253f31] mt-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#c1a062] flex items-center justify-center text-[#1a2e23] font-bold">JD</div>
            <div>
              <p className="text-sm font-medium">Jane Doe</p>
              <p className="text-xs text-[#8ca493]">Advanced Rider</p>
            </div>
          </div>
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

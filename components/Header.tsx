
import React from 'react';
import { ViewType } from '../types.ts';

interface HeaderProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  hasParticipants: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, hasParticipants }) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 md:mb-0 cursor-pointer" onClick={() => setView('setup')}>
          <div className="bg-red-600 p-2 rounded-lg">
            <i className="fas fa-ambulance text-2xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">EMS 救護教官教學工具</h1>
            <p className="text-xs text-slate-400">Emergency Medical Services Toolset</p>
          </div>
        </div>
        
        <nav className="flex space-x-2 bg-slate-800 p-1 rounded-full">
          <button 
            onClick={() => setView('setup')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${currentView === 'setup' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-users-cog mr-2"></i>名單設定
          </button>
          <button 
            onClick={() => setView('lucky-draw')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${currentView === 'lucky-draw' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-gift mr-2"></i>獎品抽籤
          </button>
          <button 
            onClick={() => setView('grouping')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${currentView === 'grouping' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-layer-group mr-2"></i>智能分組
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

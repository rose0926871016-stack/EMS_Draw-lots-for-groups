
import React, { useState } from 'react';
import Header from './components/Header';
import ParticipantInput from './components/ParticipantInput';
import LuckyDraw from './components/LuckyDraw';
import Grouping from './components/Grouping';
import { Participant, ViewType } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('setup');
  const [participants, setParticipants] = useState<Participant[]>([]);

  const handleParticipantsUpdate = (newList: Participant[]) => {
    setParticipants(newList);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Header 
        currentView={view} 
        setView={setView} 
        hasParticipants={participants.length > 0} 
      />

      <main className="container mx-auto px-4 py-8">
        {view === 'setup' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2">準備開始教學？</h2>
                <p className="text-blue-100 opacity-90">請先匯入學員名單。您可以直接貼上姓名或上傳 CSV 檔案。</p>
              </div>
              <i className="fas fa-user-plus absolute -right-8 -bottom-8 text-9xl text-white opacity-10 transform -rotate-12"></i>
            </div>
            <ParticipantInput 
              onParticipantsUpdate={handleParticipantsUpdate} 
              currentParticipants={participants} 
            />
          </div>
        )}

        {view === 'lucky-draw' && (
          <div className="animate-fade-in">
            <LuckyDraw participants={participants} />
          </div>
        )}

        {view === 'grouping' && (
          <div className="animate-fade-in">
            <Grouping participants={participants} />
          </div>
        )}
      </main>

      {/* Floating Action Hint for empty participants */}
      {participants.length === 0 && view !== 'setup' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-3 rounded-full shadow-lg flex items-center space-x-3 z-50 animate-bounce">
          <i className="fas fa-exclamation-triangle"></i>
          <span className="text-sm font-bold">請先回到「名單設定」匯入學員！</span>
        </div>
      )}
    </div>
  );
};

export default App;

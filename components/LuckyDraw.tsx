
import React, { useState, useEffect, useRef } from 'react';
import { Participant } from '../types.ts';
import { getEMSCommentary } from '../services/geminiService.ts';

interface LuckyDrawProps {
  participants: Participant[];
}

const LuckyDraw: React.FC<LuckyDrawProps> = ({ participants }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [remainingPool, setRemainingPool] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [aiComment, setAiComment] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [history, setHistory] = useState<Participant[]>([]);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setRemainingPool([...participants]);
    setHistory([]);
    setWinner(null);
    setAiComment('');
  }, [participants]);

  if (participants.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
        <i className="fas fa-user-slash text-6xl text-slate-200 mb-4"></i>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">尚未匯入名單</h3>
        <p className="text-slate-500 mb-6">請先前往「名單設定」貼上學員姓名或上傳檔案。</p>
      </div>
    );
  }

  const startDraw = async () => {
    if (remainingPool.length === 0 && !allowRepeat) {
      alert('所有學員都已經被抽過了！請重置母數或開啟重複抽獎。');
      return;
    }

    setIsDrawing(true);
    setWinner(null);
    setAiComment('');

    let count = 0;
    const maxCycles = 30;
    
    intervalRef.current = window.setInterval(() => {
      setDisplayIndex(Math.floor(Math.random() * remainingPool.length));
      count++;

      if (count >= maxCycles) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        finishDraw();
      }
    }, 80);
  };

  const finishDraw = async () => {
    const finalPool = allowRepeat ? participants : remainingPool;
    const randomIndex = Math.floor(Math.random() * finalPool.length);
    const selected = finalPool[randomIndex];

    setWinner(selected);
    setIsDrawing(false);
    setHistory(prev => [selected, ...prev]);

    if (!allowRepeat) {
      setRemainingPool(prev => prev.filter(p => p.id !== selected.id));
    }

    setIsLoadingAi(true);
    const comment = await getEMSCommentary(selected.name, 'winner');
    setAiComment(comment);
    setIsLoadingAi(false);
  };

  const resetPool = () => {
    setRemainingPool([...participants]);
    setHistory([]);
    setWinner(null);
    setAiComment('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-red-500">
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold flex items-center">
            <i className="fas fa-star mr-2"></i>
            緊急抽籤程序
          </h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm font-medium cursor-pointer">
              <input 
                type="checkbox" 
                className="mr-2 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                checked={allowRepeat}
                onChange={() => setAllowRepeat(!allowRepeat)}
              />
              可重複抽獎
            </label>
            <button 
              onClick={resetPool}
              className="text-xs bg-red-800 hover:bg-red-900 px-3 py-1 rounded transition-colors"
            >
              重置母數
            </button>
          </div>
        </div>

        <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
          {isDrawing ? (
            <div className="text-center">
              <div className="text-6xl font-black text-red-600 mb-4 shake">
                {remainingPool[displayIndex]?.name || '...'}
              </div>
              <p className="text-slate-400 animate-pulse">正在掃描生命徵象（抽籤中）...</p>
            </div>
          ) : winner ? (
            <div className="text-center animate-bounce-in">
              <div className="text-sm text-red-500 font-bold uppercase tracking-widest mb-2">中獎者名單</div>
              <div className="text-7xl font-black text-slate-900 mb-6 drop-shadow-md">
                {winner.name}
              </div>
              
              {isLoadingAi ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-md">
                  <p className="text-slate-400 text-sm">教官正在打給 119 調度員...</p>
                </div>
              ) : aiComment && (
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 max-w-md relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    教官的話
                  </div>
                  <p className="text-slate-800 italic leading-relaxed">"{aiComment}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl text-slate-200 font-black mb-4">準備抽籤</div>
              <p className="text-slate-400">目前剩餘母數：{remainingPool.length}</p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
          <button
            onClick={startDraw}
            disabled={isDrawing || (remainingPool.length === 0 && !allowRepeat)}
            className={`px-12 py-4 rounded-full text-xl font-bold transition-all shadow-lg transform hover:-translate-y-1 active:scale-95 flex items-center space-x-3
              ${isDrawing ? 'bg-slate-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            <i className={`fas ${isDrawing ? 'fa-sync fa-spin' : 'fa-ambulance'}`}></i>
            <span>{isDrawing ? '抽籤中...' : '開始抽籤'}</span>
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center">
            <i className="fas fa-history text-slate-400 mr-2"></i>
            抽籤歷史紀錄
          </h3>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <div key={i} className="bg-slate-100 px-4 py-2 rounded-full text-sm border border-slate-200">
                <span className="font-bold text-red-600 mr-2">#{history.length - i}</span>
                {h.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyDraw;

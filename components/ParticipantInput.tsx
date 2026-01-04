
import React, { useState, useMemo } from 'react';
import { Participant } from '../types';

interface ParticipantInputProps {
  onParticipantsUpdate: (list: Participant[]) => void;
  currentParticipants: Participant[];
}

const ParticipantInput: React.FC<ParticipantInputProps> = ({ onParticipantsUpdate, currentParticipants }) => {
  const [inputText, setInputText] = useState('');

  // 偵測哪些姓名是重複的
  const duplicateNames = useMemo(() => {
    const names = currentParticipants.map(p => p.name);
    return names.filter((name, index) => names.indexOf(name) !== index);
  }, [currentParticipants]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const parseAndAdd = (text: string = inputText) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
    if (lines.length === 0) return;

    const newParticipants: Participant[] = lines.map(line => {
      const name = line.includes(',') ? line.split(',')[0].trim() : line;
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: name
      };
    });

    onParticipantsUpdate([...currentParticipants, ...newParticipants]);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseAndAdd(content);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const loadSampleData = () => {
    const samples = [
      "陳大明 (EMT-1)",
      "林美華 (EMT-2)",
      "張小強 (EMT-P)",
      "王救護 (EMT-1)",
      "李急救 (EMT-2)",
      "趙心肺 (EMT-1)",
      "孫壓胸 (EMT-1)",
      "周氧氣 (EMT-2)",
      "林美華 (EMT-2)", // 刻意重複
      "陳大明 (EMT-1)"  // 刻意重複
    ];
    parseAndAdd(samples.join('\n'));
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const uniqueList = currentParticipants.filter(p => {
      const duplicate = seen.has(p.name);
      seen.add(p.name);
      return !duplicate;
    });
    onParticipantsUpdate(uniqueList);
  };

  const clearAll = () => {
    if (window.confirm('確定要清除所有名單嗎？')) {
      onParticipantsUpdate([]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center">
          <i className="fas fa-clipboard-list text-blue-600 mr-2"></i>
          名單匯入
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSampleData}
            className="text-xs font-bold text-blue-600 border border-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <i className="fas fa-vial mr-1"></i>載入範例名單
          </button>
          <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            目前人數: {currentParticipants.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-700">方式一：貼上姓名 (每行一個)</label>
            <textarea
              value={inputText}
              onChange={handleTextChange}
              placeholder="例如：&#10;王小明&#10;李大華&#10;張三"
              className="h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
            />
            <button
              onClick={() => parseAndAdd()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>加入名單
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-700">方式二：上傳 CSV 檔案</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <i className="fas fa-file-csv text-4xl text-slate-400 mb-2"></i>
              <p className="text-sm text-slate-600">點擊或拖拽 CSV 檔案至此</p>
              <p className="text-xs text-slate-400 mt-1">僅限第一欄為姓名之檔案</p>
            </div>
          </div>
          
          <button
            onClick={clearAll}
            className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-trash-alt mr-2"></i>清空目前名單
          </button>
        </div>
      </div>

      {currentParticipants.length > 0 && (
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              學員預覽
              {duplicateNames.length > 0 && (
                <span className="ml-2 text-amber-600 font-normal normal-case">
                  (發現 {duplicateNames.length} 個重複項)
                </span>
              )}
            </h3>
            {duplicateNames.length > 0 && (
              <button
                onClick={removeDuplicates}
                className="text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
              >
                <i className="fas fa-broom mr-1"></i>移除重複姓名
              </button>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentParticipants.map((p, idx) => {
                const isDuplicate = duplicateNames.includes(p.name);
                return (
                  <div 
                    key={p.id} 
                    className={`bg-white px-3 py-2 rounded-lg border transition-all flex items-center shadow-sm relative group
                      ${isDuplicate ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200'}`}
                  >
                    <span className="text-slate-400 mr-2 font-mono text-xs w-5">{idx + 1}.</span>
                    <span className={`truncate text-sm ${isDuplicate ? 'text-amber-900 font-medium' : 'text-slate-700'}`}>
                      {p.name}
                    </span>
                    {isDuplicate && (
                      <span className="ml-auto text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">
                        重複
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantInput;

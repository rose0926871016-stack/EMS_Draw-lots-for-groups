
import React, { useState } from 'react';
import { Participant, Group } from '../types';
import { getEMSCommentary } from '../services/geminiService';

interface GroupingProps {
  participants: Participant[];
}

const Grouping: React.FC<GroupingProps> = ({ participants }) => {
  const [peoplePerGroup, setPeoplePerGroup] = useState(3);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teamNames, setTeamNames] = useState<Record<number, string>>({});
  const [isLoadingTeams, setIsLoadingTeams] = useState<Record<number, boolean>>({});

  const doGrouping = () => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    for (let i = 0; i < shuffled.length; i += peoplePerGroup) {
      newGroups.push({
        id: Math.floor(i / peoplePerGroup) + 1,
        members: shuffled.slice(i, i + peoplePerGroup)
      });
    }

    setGroups(newGroups);
    setTeamNames({});
    setIsLoadingTeams({});
  };

  const generateTeamInfo = async (groupId: number, members: Participant[]) => {
    setIsLoadingTeams(prev => ({ ...prev, [groupId]: true }));
    const namesString = members.map(m => m.name).join('、');
    const info = await getEMSCommentary(namesString, 'group');
    setTeamNames(prev => ({ ...prev, [groupId]: info }));
    setIsLoadingTeams(prev => ({ ...prev, [groupId]: false }));
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;

    // 定義 CSV 內容，包含 BOM 以支援 Excel 開啟中文不編碼錯誤
    let csvContent = "\uFEFF小隊,成員姓名\n";
    groups.forEach(group => {
      group.members.forEach(member => {
        csvContent += `${group.id},${member.name}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EMS_分組紀錄_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-bold flex items-center">
              <i className="fas fa-layer-group text-emerald-600 mr-2"></i>
              智能分組設定
            </h2>
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <label className="text-sm font-semibold px-2">每組人數:</label>
              <input
                type="number"
                min="1"
                max={participants.length}
                value={peoplePerGroup}
                onChange={(e) => setPeoplePerGroup(parseInt(e.target.value) || 1)}
                className="w-16 p-1 text-center border rounded border-slate-300"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.length > 0 && (
              <button
                onClick={downloadCSV}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md active:scale-95 flex items-center"
              >
                <i className="fas fa-file-download mr-2"></i>下載 CSV
              </button>
            )}
            <button
              onClick={doGrouping}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-8 rounded-lg transition-all shadow-md active:scale-95 flex items-center"
            >
              <i className="fas fa-random mr-2"></i>開始隨機分組
            </button>
          </div>
        </div>
      </div>

      {groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                <span className="font-black text-lg">小隊 {group.id}</span>
                <span className="text-xs bg-emerald-800 px-2 py-1 rounded-full">{group.members.length} 人</span>
              </div>
              
              <div className="p-5 flex-grow">
                <ul className="space-y-2">
                  {group.members.map((member) => (
                    <li key={member.id} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <i className="fas fa-user-md text-emerald-500 mr-3"></i>
                      <span className="font-medium">{member.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                {teamNames[group.id] ? (
                  <div className="text-sm text-slate-700 italic border-l-4 border-emerald-400 pl-3">
                    <p className="font-bold text-xs text-emerald-600 uppercase mb-1">教官點評:</p>
                    {teamNames[group.id]}
                  </div>
                ) : (
                  <button
                    onClick={() => generateTeamInfo(group.id, group.members)}
                    disabled={isLoadingTeams[group.id]}
                    className="w-full text-xs font-bold text-emerald-600 hover:bg-emerald-100 py-2 rounded transition-colors flex items-center justify-center"
                  >
                    {isLoadingTeams[group.id] ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>調度中...</>
                    ) : (
                      <><i className="fas fa-magic mr-2"></i>生成小隊代號 & 祝福</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Grouping;

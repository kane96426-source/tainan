
import React, { useState, useEffect } from 'react';
import { User, TimetableData } from '../types';
import { TIME_SLOTS, DAYS, ICONS } from '../constants';

interface TimetableProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Timetable: React.FC<TimetableProps> = ({ user, onUpdateUser }) => {
  const [editingCell, setEditingCell] = useState<{ day: number, slot: number } | null>(null);
  const [cellText, setCellText] = useState('');
  const [friendUID, setFriendUID] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [friendError, setFriendError] = useState('');

  // Get current time slot (simplified for demo)
  const currentSlotIndex = 2; // Fixed for simulation: e.g. 10:00 AM

  useEffect(() => {
    // Simulate fetching friend data from "all users"
    const allUsers = JSON.parse(localStorage.getItem('nutn_all_users') || '[]');
    const friendList = allUsers.filter((u: User) => user.friends.includes(u.uid));
    setFriends(friendList);
  }, [user.friends]);

  const toggleCell = (day: number, slot: number) => {
    setEditingCell({ day, slot });
    setCellText(user.timetable[day]?.[slot] || '');
  };

  const saveCell = () => {
    if (!editingCell) return;
    const { day, slot } = editingCell;
    const newTimetable = { ...user.timetable };
    if (!newTimetable[day]) newTimetable[day] = {};
    
    if (cellText.trim()) {
      newTimetable[day][slot] = cellText;
    } else {
      delete newTimetable[day][slot];
    }

    onUpdateUser({ ...user, timetable: newTimetable });
    setEditingCell(null);
  };

  const addFriend = () => {
    setFriendError('');
    if (friendUID === user.uid) {
      setFriendError('不能加自己為好友喔！');
      return;
    }
    if (user.friends.includes(friendUID)) {
      setFriendError('已經是好友了。');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('nutn_all_users') || '[]');
    const friend = allUsers.find((u: User) => u.uid === friendUID);
    
    if (friend) {
      onUpdateUser({ ...user, friends: [...user.friends, friendUID] });
      setFriendUID('');
    } else {
      setFriendError('找不到此 UID 的使用者。');
    }
  };

  const isFriendFreeNow = (f: User) => {
    const today = new Date().getDay(); // 1-5 (Mon-Fri)
    const dayIndex = today >= 1 && today <= 5 ? today - 1 : 0;
    return !f.timetable[dayIndex]?.[currentSlotIndex];
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Friend List Sidebar */}
        <div className="w-full md:w-64 border-r bg-white p-4 flex flex-col gap-4">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">添加好友</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={friendUID}
                onChange={(e) => setFriendUID(e.target.value.toUpperCase())}
                placeholder="5碼 UID"
                maxLength={5}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addFriend} className="bg-blue-600 text-white p-1.5 rounded-lg">
                {ICONS.Plus}
              </button>
            </div>
            {friendError && <p className="text-red-500 text-[10px]">{friendError}</p>}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">好友動態</h3>
            {friends.length > 0 ? (
              friends.map(f => (
                <div key={f.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg relative ${isFriendFreeNow(f) ? 'bg-green-500' : 'bg-red-500'}`}>
                      {f.nickname.charAt(0)}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isFriendFreeNow(f) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{f.nickname}</p>
                      <p className="text-[10px] text-slate-400">{isFriendFreeNow(f) ? '現在有空' : '正在忙碌'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs text-center py-4">還沒有任何好友</p>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-[10px] text-slate-400 text-center">你的 UID: <span className="font-bold text-slate-900">{user.uid}</span></p>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="min-w-[800px] bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-6 border-b bg-slate-50">
              <div className="p-3 border-r text-center text-xs font-bold text-slate-400 uppercase">時間</div>
              {DAYS.map(day => (
                <div key={day} className="p-3 border-r text-center text-sm font-bold text-slate-700">{day}</div>
              ))}
            </div>
            {TIME_SLOTS.map((slot, sIdx) => (
              <div key={sIdx} className="grid grid-cols-6 border-b hover:bg-slate-50/50 transition-colors">
                <div className="p-2 border-r text-[10px] flex items-center justify-center text-slate-400 text-center font-medium bg-slate-50">
                  {slot}
                </div>
                {DAYS.map((_, dIdx) => {
                  const content = user.timetable[dIdx]?.[sIdx];
                  const isCurrent = dIdx === (new Date().getDay() - 1) && sIdx === currentSlotIndex;
                  return (
                    <div 
                      key={dIdx} 
                      onClick={() => toggleCell(dIdx, sIdx)}
                      className={`p-2 border-r min-h-[60px] cursor-pointer transition-all group relative ${isCurrent ? 'bg-blue-50/50' : ''}`}
                    >
                      {content ? (
                        <div className="h-full w-full bg-blue-100 text-blue-800 text-xs p-2 rounded-lg font-medium flex items-center justify-center text-center shadow-sm">
                          {content}
                        </div>
                      ) : (
                        <div className="h-full w-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                            {ICONS.Plus}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">編輯課程 - {DAYS[editingCell.day]} {TIME_SLOTS[editingCell.slot]}</h3>
            <input 
              type="text" 
              autoFocus
              value={cellText}
              onChange={(e) => setCellText(e.target.value)}
              placeholder="輸入課程名稱 (例如: 計算機概論)"
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 mb-6"
              onKeyDown={(e) => e.key === 'Enter' && saveCell()}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingCell(null)}
                className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button 
                onClick={saveCell}
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;

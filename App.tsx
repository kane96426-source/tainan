
import React, { useState, useEffect, useCallback } from 'react';
import { User, Restaurant, Post, TimetableData } from './types';
import Auth from './components/Auth';
import FoodMap from './components/FoodMap';
import Timetable from './components/Timetable';
import BulletinBoard from './components/BulletinBoard';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'timetable' | 'board' | null>(null);
  
  // Persist state
  useEffect(() => {
    const saved = localStorage.getItem('nutn_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('nutn_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab(null);
    localStorage.removeItem('nutn_user');
  };

  const updateUserData = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('nutn_user', JSON.stringify(updatedUser));
    
    // Also update in "all users" simulation
    const allUsers = JSON.parse(localStorage.getItem('nutn_all_users') || '[]');
    const index = allUsers.findIndex((u: User) => u.id === updatedUser.id);
    if (index !== -1) {
      allUsers[index] = updatedUser;
      localStorage.setItem('nutn_all_users', JSON.stringify(allUsers));
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-2 rounded-lg font-bold">NUTN</div>
            <h1 className="font-bold text-lg hidden sm:block">台南大學新生指南</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-slate-100 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-medium">{currentUser.nickname}</span>
              <span className="text-slate-400 text-xs">#{currentUser.uid}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        {!activeTab ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            <MenuCard 
              icon={ICONS.Food} 
              title="美食地圖" 
              desc="探索校園周邊 2km 熱門餐廳" 
              onClick={() => setActiveTab('map')} 
              color="bg-orange-500"
            />
            <MenuCard 
              icon={ICONS.Calendar} 
              title="共享課表" 
              desc="查看好友課表，發現共同空堂" 
              onClick={() => setActiveTab('timetable')} 
              color="bg-blue-600"
            />
            <MenuCard 
              icon={ICONS.Chat} 
              title="匿名留言板" 
              desc="學長姐真心話，新鮮人必看" 
              onClick={() => setActiveTab('board')} 
              color="bg-purple-600"
            />
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <button 
              onClick={() => setActiveTab(null)}
              className="mb-4 flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
            >
              ← 返回主選單
            </button>
            
            <div className="flex-1 bg-white rounded-2xl shadow-sm border overflow-hidden min-h-[600px]">
              {activeTab === 'map' && <FoodMap user={currentUser} />}
              {activeTab === 'timetable' && <Timetable user={currentUser} onUpdateUser={updateUserData} />}
              {activeTab === 'board' && <BulletinBoard user={currentUser} />}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 flex justify-around items-center z-50">
        <NavButton active={activeTab === 'map'} icon={ICONS.Food} onClick={() => setActiveTab('map')} />
        <NavButton active={activeTab === 'timetable'} icon={ICONS.Calendar} onClick={() => setActiveTab('timetable')} />
        <NavButton active={activeTab === 'board'} icon={ICONS.Chat} onClick={() => setActiveTab('board')} />
      </nav>
    </div>
  );
};

const MenuCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, onClick: () => void, color: string }> = ({ icon, title, desc, onClick, color }) => (
  <button 
    onClick={onClick}
    className="group bg-white p-8 rounded-2xl border-2 border-transparent hover:border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-4"
  >
    <div className={`${color} text-white w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
    <div className="mt-auto pt-4 flex items-center gap-1 text-slate-900 font-semibold text-sm">
      進入功能 →
    </div>
  </button>
);

const NavButton: React.FC<{ active: boolean, icon: React.ReactNode, onClick: () => void }> = ({ active, icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-full ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
  >
    {icon}
  </button>
);

export default App;

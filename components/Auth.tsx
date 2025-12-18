
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const generateUID = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const allUsers = JSON.parse(localStorage.getItem('nutn_all_users') || '[]');
      const user = allUsers.find((u: any) => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('帳號或密碼錯誤');
      }
    } else {
      if (!username || !password || !nickname) {
        setError('所有欄位皆必填');
        return;
      }
      const allUsers = JSON.parse(localStorage.getItem('nutn_all_users') || '[]');
      if (allUsers.some((u: any) => u.username === username)) {
        setError('此帳號已存在');
        return;
      }
      const newUser: User & { password?: string } = {
        id: Date.now().toString(),
        username,
        password,
        nickname,
        uid: generateUID(),
        timetable: {},
        friends: []
      };
      allUsers.push(newUser);
      localStorage.setItem('nutn_all_users', JSON.stringify(allUsers));
      onLogin(newUser as User);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-red-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold mb-4">
            NUTN
          </div>
          <h1 className="text-2xl font-bold">台南大學新生指南</h1>
          <p className="text-slate-500 mt-2">{isLogin ? '歡迎回來，請登入帳號' : '建立你的校園帳號'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">顯示暱稱</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder="例如：紅樓南南"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">帳號</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              placeholder="請輸入帳號"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              placeholder="請輸入密碼"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors mt-6 shadow-lg shadow-red-100"
          >
            {isLogin ? '登入' : '註冊帳號'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-red-600 font-medium"
          >
            {isLogin ? '還沒有帳號？點此註冊' : '已經有帳號了？點此登入'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

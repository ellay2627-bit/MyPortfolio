'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// 简单的后台密码保护
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    setIsAuthenticated(isLoggedIn);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_logged_in', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('密码错误，请重试');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsAuthenticated(false);
    setPassword('');
  };

  // 如果未认证，显示登录表单
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-8 text-center">管理员登录</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="请输入管理员密码"
                autoComplete="off"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-500/20 text-red-400 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-dark-bg rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              登录
            </button>
          </form>
          <p className="mt-6 text-center text-gray-400 text-sm">
            默认密码：admin123（建议在 .env.local 中修改）
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">后台管理系统</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all text-white"
            >
              返回前台
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

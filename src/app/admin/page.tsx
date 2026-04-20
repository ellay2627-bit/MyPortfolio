'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    } else {
      router.push('/admin/login');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg dark:bg-light-bg">
        <div className="text-primary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg dark:bg-light-bg">
      {/* 导航栏 */}
      <nav className="bg-gray-900 dark:bg-gray-800 border-b border-gray-800 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">后台管理系统</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 dark:bg-gray-700 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all"
            >
              退出登录
            </button>
          </div>
        </div>
      </nav>

      {/* 侧边栏和内容 */}
      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-gray-900 dark:bg-gray-800 border-r border-gray-800 dark:border-gray-700 min-h-[calc(100vh-64px)]">
          <div className="py-6">
            <div className="px-4 mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                管理功能
              </h2>
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="/admin/works"
                  className="px-4 py-3 block text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-primary transition-all"
                >
                  作品管理
                </a>
              </li>
              <li>
                <a
                  href="/admin/profile"
                  className="px-4 py-3 block text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-primary transition-all"
                >
                  个人信息管理
                </a>
              </li>
              <li>
                <a
                  href="/admin/settings"
                  className="px-4 py-3 block text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-primary transition-all"
                >
                  站点设置
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* 主内容 */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">欢迎回来，{user?.email}</h2>
            <p className="text-gray-400 dark:text-gray-500">
              在这里你可以管理你的个人作品集、个人信息和站点设置
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">作品管理</h3>
              <p className="text-gray-400 dark:text-gray-500 mb-4">
                创建、编辑和管理你的设计作品
              </p>
              <a
                href="/admin/works"
                className="inline-block px-4 py-2 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                管理作品
              </a>
            </div>
            <div className="bg-gray-800 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">个人信息管理</h3>
              <p className="text-gray-400 dark:text-gray-500 mb-4">
                更新你的个人信息和履历
              </p>
              <a
                href="/admin/profile"
                className="inline-block px-4 py-2 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                编辑信息
              </a>
            </div>
            <div className="bg-gray-800 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">站点设置</h3>
              <p className="text-gray-400 dark:text-gray-500 mb-4">
                配置站点信息和联系方式
              </p>
              <a
                href="/admin/settings"
                className="inline-block px-4 py-2 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                站点设置
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
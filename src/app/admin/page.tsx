'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Settings, FilePlus, LayoutDashboard } from 'lucide-react';
import AdminCursorFix from '@/components/AdminCursorFix';

export default function AdminDashboard() {
  const router = useRouter();

  const menuItems = [
    {
      title: '作品管理',
      icon: FilePlus,
      path: '/admin/works',
      description: '管理您的作品集，添加、编辑和删除作品'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminCursorFix />
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">后台管理系统</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              返回前台
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-md dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{item.description}</p>
                  <Button 
                    onClick={() => router.push(item.path)}
                    className="w-full"
                  >
                    进入管理
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 系统信息 */}
        <div className="mt-12">
          <Card className="p-6 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">系统信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">状态</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">运行中</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">模式</p>
                <Badge variant="outline" className="mt-1">本地测试</Badge>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

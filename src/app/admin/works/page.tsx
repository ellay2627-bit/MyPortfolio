'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Work {
  id: number;
  title: string;
  category: string[];
  cover: string;
  ratio: '16:9' | '4:3';
  order: number;
}

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      // 这里应该从Supabase获取作品数据
      // 暂时使用模拟数据
      const mockWorks: Work[] = [
        {
          id: 1,
          title: '电商平台UI设计',
          category: ['UX设计', '品牌设计'],
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20e-commerce%20website%20UI%20design%20dark%20theme&image_size=landscape_16_9',
          ratio: '16:9',
          order: 1
        },
        {
          id: 2,
          title: '移动应用界面设计',
          category: ['UX设计'],
          cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20app%20UI%20design%20dark%20theme&image_size=portrait_4_3',
          ratio: '4:3',
          order: 2
        }
      ];
      setWorks(mockWorks);
    } catch (err) {
      setError('获取作品失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWork = () => {
    // 跳转到添加作品页面
    router.push('/admin/works/add');
  };

  const handleEditWork = (id: number) => {
    // 跳转到编辑作品页面
    router.push(`/admin/works/edit/${id}`);
  };

  const handleDeleteWork = async (id: number) => {
    if (confirm('确定要删除这个作品吗？')) {
      try {
        // 这里应该从Supabase删除作品
        setWorks(works.filter(work => work.id !== id));
      } catch (err) {
        setError('删除作品失败');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg dark:bg-light-bg">
        <div className="flex items-center justify-center h-full">
          <div className="text-primary">加载中...</div>
        </div>
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
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-800 dark:bg-gray-700 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all"
            >
              返回首页
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
                  className="px-4 py-3 block text-primary bg-gray-800 dark:bg-gray-700 transition-all"
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">作品管理</h2>
            <button
              onClick={handleAddWork}
              className="px-6 py-3 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all"
            >
              添加作品
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-gray-800 dark:bg-gray-700 rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 dark:border-gray-600">
                    <th className="text-left py-3 px-4">序号</th>
                    <th className="text-left py-3 px-4">作品标题</th>
                    <th className="text-left py-3 px-4">分类</th>
                    <th className="text-left py-3 px-4">封面</th>
                    <th className="text-left py-3 px-4">比例</th>
                    <th className="text-right py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {works.map((work, index) => (
                    <tr key={work.id} className="border-b border-gray-700 dark:border-gray-600 hover:bg-gray-700 dark:hover:bg-gray-600 transition-all">
                      <td className="py-4 px-4">{work.order}</td>
                      <td className="py-4 px-4">{work.title}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {work.category.map((cat, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-700 dark:bg-gray-600 rounded text-xs">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <img
                          src={work.cover}
                          alt={work.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-4 px-4">{work.ratio}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEditWork(work.id)}
                            className="px-3 py-1 bg-gray-700 dark:bg-gray-600 rounded hover:bg-gray-600 dark:hover:bg-gray-500 transition-all"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteWork(work.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
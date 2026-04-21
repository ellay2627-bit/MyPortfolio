'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminCursorFix from '@/components/AdminCursorFix';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // 站点设置表单数据
  const [formData, setFormData] = useState({
    siteName: '个人作品集',
    siteDescription: '展示我的设计作品和个人信息',
    keywords: 'UI设计, UX设计, 作品集, 设计师',
    contactEmail: 'ellay2627@126.com',
    contactPhone: '188 1051 2527',
    footerText: '© 2026 个人作品集. All rights reserved.'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('站点设置保存成功！');
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <AdminCursorFix />
      {/* 导航栏 */}
      <nav className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">后台管理系统</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      </nav>

      {/* 侧边栏和内容 */}
      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-[calc(100vh-64px)]">
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
                  className="px-4 py-3 block text-gray-300 hover:bg-gray-800 hover:text-primary transition-all"
                >
                  作品管理
                </a>
              </li>
              <li>
                <a
                  href="/admin/profile"
                  className="px-4 py-3 block text-gray-300 hover:bg-gray-800 hover:text-primary transition-all"
                >
                  个人信息管理
                </a>
              </li>
              <li>
                <a
                  href="/admin/settings"
                  className="px-4 py-3 block text-primary bg-gray-800 transition-all"
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
            <h2 className="text-2xl font-bold">站点设置</h2>
            <p className="text-gray-400 mt-2">配置站点信息和联系方式</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-500/20 text-green-400 rounded-lg">
              {success}
            </div>
          )}

          <div className="bg-gray-800 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  站点名称
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  站点描述
                </label>
                <textarea
                  value={formData.siteDescription}
                  onChange={(e) => setFormData({...formData, siteDescription: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  关键词
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="用逗号分隔"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4">联系方式</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      联系邮箱
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      联系电话
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  页脚文字
                </label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({...formData, footerText: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存设置'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

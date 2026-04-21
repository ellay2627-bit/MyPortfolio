'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminCursorFix from '@/components/AdminCursorFix';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '李超（李一轩）',
    title: 'UI/UX 设计师',
    bio: '专注于用户体验设计和界面设计，拥有多年设计经验。',
    email: 'ellay2627@126.com',
    phone: '188 1051 2527',
    social: {
      github: '',
      linkedin: '',
      behance: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('个人信息保存成功！');
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <AdminCursorFix />
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

      <div className="flex">
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
                  className="px-4 py-3 block text-primary bg-gray-800 transition-all"
                >
                  个人信息管理
                </a>
              </li>
              <li>
                <a
                  href="/admin/settings"
                  className="px-4 py-3 block text-gray-300 hover:bg-gray-800 hover:text-primary transition-all"
                >
                  站点设置
                </a>
              </li>
            </ul>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">个人信息管理</h2>
            <p className="text-gray-400 mt-2">更新你的个人信息和联系方式</p>
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
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  职位
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  个人简介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  电话
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-4">社交账号</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={formData.social.github}
                      onChange={(e) => setFormData({...formData, social: {...formData.social, github: e.target.value}})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.social.linkedin}
                      onChange={(e) => setFormData({...formData, social: {...formData.social, linkedin: e.target.value}})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Behance
                    </label>
                    <input
                      type="url"
                      value={formData.social.behance}
                      onChange={(e) => setFormData({...formData, social: {...formData.social, behance: e.target.value}})}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://behance.net/yourusername"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-dark-bg rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存信息'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
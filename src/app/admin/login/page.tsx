'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 暂时跳过密码验证，直接进入后台
    router.push('/admin/works');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">管理员登录</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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

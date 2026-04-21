import React from 'react';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '后台管理 - 作品集',
  description: '作品集后台管理系统',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} min-h-screen bg-dark-bg`}>
      {children}
    </div>
  );
}

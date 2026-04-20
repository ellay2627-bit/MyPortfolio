import React from 'react';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import NavbarWrapper from '@/components/NavbarWrapper';
import NeoCursor from '@/components/NeoCursor';
import BackToTop from '@/components/BackToTop';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ellay - 视觉/UI 设计师',
  description: '极简现代、苹果风、科技感的个人作品集',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} dark`}>
        <NavbarWrapper />
        {children}
        <NeoCursor />
        <BackToTop />
      </body>
    </html>
  );
}
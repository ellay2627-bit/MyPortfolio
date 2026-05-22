import React from 'react';
import '@/styles/globals.css';
import { LayoutContent } from '@/components/LayoutContent';

export const metadata = {
  title: 'Ellay - 视觉/UI 设计师',
  description: '极简现代、苹果风、科技感的个人作品集',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        {/* 移除禁用缓存的代码！改为合理的缓存策略
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        */}
      </head>
      <body className="dark">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}

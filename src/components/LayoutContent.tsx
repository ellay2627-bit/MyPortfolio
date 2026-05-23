'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import NavbarWrapper from './NavbarWrapper';
const SiteLoader = dynamic(() => import('./SiteLoader'), { ssr: false, loading: () => null });
// 延迟加载非关键组件
const NeoCursor = dynamic(() => import('./NeoCursor'), { ssr: false, loading: () => null });
const BackToTop = dynamic(() => import('./BackToTop'), { ssr: false, loading: () => null });
// 暂时禁用 About 图片预加载，因为会拖慢网速
// import { AboutImagePreloader } from './AboutImagePreloader';
import { usePathname } from 'next/navigation';
import { SectionScrollProvider } from '@/contexts/SectionScrollProvider';

interface LayoutContentProps {
  children: ReactNode;
}

function LayoutContentInner({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const [showEnhancements, setShowEnhancements] = useState(false);

  // 快速加载增强功能
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEnhancements(true);
    }, 500); // 0.5秒后就加载
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {!isAdminPage && <SiteLoader />}
      {!isAdminPage && <NavbarWrapper />}
      {/* 暂时禁用，解决网速慢的问题 */}
      {/* {!isAdminPage && <AboutImagePreloader />} */}
      {children}
      {/* 延迟加载的增强功能 */}
      {!isAdminPage && showEnhancements && (
        <>
          <NeoCursor />
          <BackToTop />
        </>
      )}
    </>
  );
}

export function LayoutContent({ children }: LayoutContentProps) {
  return (
    <SectionScrollProvider>
      <LayoutContentInner>{children}</LayoutContentInner>
    </SectionScrollProvider>
  );
}

'use client';
import React, { ReactNode } from 'react';
import NavbarWrapper from './NavbarWrapper';
import NeoCursor from './NeoCursor';
import BackToTop from './BackToTop';
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

  return (
    <>
      {!isAdminPage && <NavbarWrapper />}
      {/* 暂时禁用，解决网速慢的问题 */}
      {/* {!isAdminPage && <AboutImagePreloader />} */}
      {children}
      {!isAdminPage && <NeoCursor />}
      {!isAdminPage && <BackToTop />}
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


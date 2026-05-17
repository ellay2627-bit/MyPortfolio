'use client';
import React, { ReactNode } from 'react';
import NavbarWrapper from './NavbarWrapper';
import NeoCursor from './NeoCursor';
import BackToTop from './BackToTop';
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


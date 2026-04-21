'use client';
import React, { ReactNode } from 'react';
import NavbarWrapper from './NavbarWrapper';
import NeoCursor from './NeoCursor';
import BackToTop from './BackToTop';
import { usePathname } from 'next/navigation';

interface LayoutContentProps {
  children: ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
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

'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');

  if (isHome || isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

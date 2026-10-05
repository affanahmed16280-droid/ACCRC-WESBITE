'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GuideModal } from '@/components/GuideModal';

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsGuideOpen(true);
    window.addEventListener('accrc:open-onboarding', handleOpen);
    return () => window.removeEventListener('accrc:open-onboarding', handleOpen);
  }, []);

  // Admin pages: no site chrome at all
  if (isAdmin) return <>{children}</>;

  // Home page: has its own inline Navbar/Footer — only render modal
  if (isHome) {
    return (
      <>
        {children}
        <GuideModal isOpen={isGuideOpen} setIsOpen={setIsGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </>
    );
  }

  // All other public pages: render full chrome + modal
  return (
    <>
      <Navbar onHelpClick={() => setIsGuideOpen(true)} />
      {children}
      <Footer />
      <GuideModal isOpen={isGuideOpen} setIsOpen={setIsGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}

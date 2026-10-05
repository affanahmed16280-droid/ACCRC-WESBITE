'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OnboardingModal } from '@/components/OnboardingModal';

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');
  const [helpOpen, setHelpOpen] = useState(false);

  // Admin pages: no site chrome at all
  if (isAdmin) return <>{children}</>;

  // Home page: has its own inline Navbar/Footer — only render modal
  if (isHome) {
    return (
      <>
        {children}
        <OnboardingModal forceOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      </>
    );
  }

  // All other public pages: render full chrome + modal
  return (
    <>
      <Navbar onHelpClick={() => setHelpOpen(true)} />
      {children}
      <Footer />
      <OnboardingModal forceOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GuideModal } from '@/components/GuideModal';

import { GlobalEventBanner } from '@/components/layout/GlobalEventBanner';

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    const handleOpen = () => setIsGuideOpen(true);
    window.addEventListener('accrc:open-onboarding', handleOpen);
    return () => window.removeEventListener('accrc:open-onboarding', handleOpen);
  }, []);

  // Admin pages: no site chrome at all
  if (isAdmin) return <>{children}</>;

  // Home page: has its own inline Navbar/Footer — render banner + modal only
  if (isHome) {
    return (
      <div
        className="min-h-screen flex flex-col relative"
        style={{ '--site-banner-height': `${bannerHeight}px` } as CSSProperties}
      >
        <GlobalEventBanner onHeightChange={setBannerHeight} />
        <div
          className="flex-grow flex flex-col transition-[padding] duration-200"
          style={{ paddingTop: bannerHeight > 0 ? `${bannerHeight}px` : undefined }}
        >
          {children}
        </div>
        <GuideModal isOpen={isGuideOpen} setIsOpen={setIsGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </div>
    );
  }

  // All other public pages: full chrome.
  // Each page's own top padding (pt-24, pt-28 etc.) accounts for the fixed navbar height.
  // SiteChrome only adds the dynamic banner height on top of that via paddingTop.
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ '--site-banner-height': `${bannerHeight}px` } as CSSProperties}
    >
      <GlobalEventBanner onHeightChange={setBannerHeight} />
      <Navbar topOffset={bannerHeight} onHelpClick={() => setIsGuideOpen(true)} />
      <main
        className="flex-grow flex flex-col transition-[padding] duration-200"
        style={{ paddingTop: bannerHeight > 0 ? `${bannerHeight}px` : undefined }}
      >
        {children}
      </main>
      <Footer />
      <GuideModal isOpen={isGuideOpen} setIsOpen={setIsGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

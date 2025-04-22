'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
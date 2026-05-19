'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const GA_ID = 'G-XMHKGYVDJW'
const TEST_EMAIL = process.env.NEXT_PUBLIC_TEST_USER_EMAIL ?? 'test@example.com'

function isTrackingEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.gtag !== 'function') return false
  // localhost / 127.0.0.1 では計測しない
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return false
  return true
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isTrackingEnabled()) return
    window.gtag('config', GA_ID, { page_path: pathname })
  }, [pathname]);

  return <>{children}</>;
}

/** テストユーザーのセッションを GA から除外するためにユーザー識別後に呼ぶ */
export function disableAnalyticsForTestUser(email: string | null | undefined) {
  if (!email) return
  if (email === TEST_EMAIL || email.endsWith('@example.com')) {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('set', { traffic_type: 'internal' })
    }
  }
}
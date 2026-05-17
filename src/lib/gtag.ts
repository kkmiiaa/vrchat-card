declare global {
  interface Window {
    gtag: (...args: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}

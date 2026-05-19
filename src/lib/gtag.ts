declare global {
  interface Window {
    gtag: (...args: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

function isTrackingEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.gtag !== 'function') return false
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return false
  return true
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!isTrackingEnabled()) return
  window.gtag('event', name, params)
}

'use client'
export const CONSENT_KEY = 'productshotai.analytics-consent'
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }
export function gaEvent(event: string, properties?: Record<string, unknown>) {
  try { if (localStorage.getItem(CONSENT_KEY) === 'granted' && window.gtag) window.gtag('event', event, properties || {}) } catch {}
}

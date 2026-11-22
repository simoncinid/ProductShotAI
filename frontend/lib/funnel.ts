'use client'

import { track } from '@vercel/analytics'

const RETURN_KEY = 'productshotai.authReturnTo'

export function rememberPurchase(packId: string) {
  try { sessionStorage.setItem(RETURN_KEY, `/pricing?pack=${encodeURIComponent(packId)}`) } catch {}
}

export function authDestination() {
  try {
    const path = sessionStorage.getItem(RETURN_KEY)
    sessionStorage.removeItem(RETURN_KEY)
    if (path && /^\/pricing\?pack=(starter|standard|pro|power)$/.test(path)) return path
  } catch {}
  return '/dashboard/create'
}

// Never send emails, prompts, tokens, or reference images to analytics.
export function trackFunnel(event: string, properties?: Record<string, string | number | boolean>) {
  try { track(event, properties) } catch { /* Analytics must not block the product. */ }
}

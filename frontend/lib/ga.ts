'use client'
export const CONSENT_KEY = 'productshotai.analytics-consent'
// Keep page URLs free of personal query strings, while recognising only the
// public campaign labels we actually use. Never pass arbitrary UTM values.
export function publicCampaign(search: string): Record<string, string> | null {
  const query = new URLSearchParams(search)
  const source = query.get('utm_source') || ''
  const medium = query.get('utm_medium') || ''
  const name = query.get('utm_campaign') || ''
  if (!['instagram', 'facebook', 'tiktok', 'reddit', 'linkedin', 'newsletter'].includes(source)
    || !['organic_social', 'email', 'referral'].includes(medium)
    || !['free_prompt_builder_launch', 'candle_shot_plan', 'worked_prompt_examples'].includes(name)) return null
  return { campaign_source: source, campaign_medium: medium, campaign_name: name }
}
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }
export function gaEvent(event: string, properties?: Record<string, unknown>) {
  try { if (localStorage.getItem(CONSENT_KEY) === 'granted' && window.gtag) window.gtag('event', event, properties || {}) } catch {}
}

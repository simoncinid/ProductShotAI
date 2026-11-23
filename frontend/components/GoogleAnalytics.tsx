'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CONSENT_KEY, gaEvent, publicCampaign } from '@/lib/ga'
const ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
function safeReferrer() {
  try { const url = new URL(document.referrer); return url.origin + url.pathname } catch { return '' }
}
export function GoogleAnalytics() {
  const path = usePathname()
  const [choice, setChoice] = useState<string | null>('loading')
  const [settings, setSettings] = useState(false)
  useEffect(() => { try { setChoice(localStorage.getItem(CONSENT_KEY)) } catch { setChoice('denied') } }, [])
  useEffect(() => {
    if (!/^G-[A-Z0-9]+$/.test(ID) || choice !== 'granted') return
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || function () { window.dataLayer!.push(arguments) }
    const campaign = publicCampaign(window.location.search)
    if (campaign) window.gtag('set', campaign)
    if (!document.getElementById('productshot-ga')) {
      window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
      // Basic consent mode: nothing is loaded until explicit consent exists.
      window.gtag('set', 'send_page_view', false)
      window.gtag('set', 'page_location', window.location.origin + window.location.pathname)
      window.gtag('set', 'page_referrer', safeReferrer())
      window.gtag('js', new Date())
      window.gtag('config', ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: window.location.origin + window.location.pathname, page_referrer: safeReferrer() })
      const script = document.createElement('script'); script.id='productshot-ga'; script.async=true; script.src=`https://www.googletagmanager.com/gtag/js?id=${ID}`; document.head.appendChild(script)
    }
    // No query strings, fragments, account IDs, emails, prompts or image URLs.
    window.gtag('set', 'page_location', window.location.origin + path)
    window.gtag('set', 'page_referrer', safeReferrer())
    gaEvent('page_view', { page_location: window.location.origin + path, page_title: document.title, page_referrer: safeReferrer() })
  }, [choice, path])
  function choose(value: string) {
    try { localStorage.setItem(CONSENT_KEY, value) } catch {}
    window.gtag?.('consent', 'update', { analytics_storage: value })
    if (value === 'denied') {
      document.cookie.split(';').forEach(c => { const name=c.split('=')[0].trim(); if (/^_ga/.test(name)) ['', window.location.hostname, '.productshotai.com'].forEach(domain => { document.cookie=`${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}` }) })
    }
    setChoice(value); setSettings(false)
  }
  if (!/^G-[A-Z0-9]+$/.test(ID)) return null
  return <>{choice === null || settings ? <aside aria-label="Analytics preferences" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl rounded-xl border border-slate-600 bg-slate-950 p-5 text-white shadow-xl"><p className="font-semibold">Help us improve ProductShotAI</p><p className="mt-2 text-sm text-slate-300">Allow optional Google Analytics to measure visits and steps such as signup and checkout? Your choice won’t affect your account. <Link className="underline" href="/privacy">Privacy</Link></p><div className="mt-4 flex flex-wrap gap-3"><button onClick={() => choose('denied')} className="rounded-lg border border-slate-400 px-4 py-3">Reject analytics</button><button onClick={() => choose('granted')} className="rounded-lg bg-teal-300 px-4 py-3 font-semibold text-black">Allow analytics</button></div></aside> : <button className="fixed bottom-2 left-2 z-40 rounded bg-slate-950 px-3 py-2 text-xs text-slate-300" onClick={() => setSettings(true)}>Analytics preferences</button>}</>
}

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setAuthToken } from '@/lib/auth'
import { trackFunnel } from '@/lib/funnel'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export default function Recover() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    setToken(new URLSearchParams(window.location.hash.slice(1)).get('token') || '')
    window.history.replaceState(null, '', '/recover')
  }, [])
  async function activate() {
    setBusy(true); setError('')
    try {
      const response = await fetch(`${API}/api/recovery/activate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const data = await response.json()
      if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Please try again.')
      setAuthToken(data.access_token)
      trackFunnel('recovery_activated')
      router.push('/pricing')
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); setBusy(false) }
  }
  return <main className="mx-auto min-h-[70vh] max-w-xl px-6 py-16 text-white">
    <p className="text-sm uppercase tracking-widest text-teal-300">A personal welcome back</p>
    <h1 className="mt-4 text-4xl font-semibold">We’re sorry for the trouble.</h1>
    <p className="mt-6 text-lg text-slate-300">We fixed an account verification issue and improved the mobile experience. Your studio is ready for another try.</p>
    <p className="mt-4 text-slate-300">Continue to verify your email and sign in securely. Your personal 30% discount will appear on the pricing page and apply automatically to one credit pack.</p>
    {error && <p role="alert" className="mt-6 rounded-lg border border-red-400 p-4">{error}</p>}
    {token ? <button disabled={busy} onClick={activate} className="mt-8 w-full rounded-xl bg-teal-300 px-6 py-4 font-semibold text-slate-950 disabled:opacity-60">{busy ? 'Opening your account…' : 'Activate my account & view my 30% offer'}</button> : <p className="mt-8">Open your personal email link to continue. Already used it? <Link href="/login" className="underline">Sign in here</Link>; your offer stays attached to your account.</p>}
    <p className="mt-5 text-sm text-slate-400">Only continue if this invitation was sent to your email address. This link signs in to that account. Keep it private.</p>
  </main>
}

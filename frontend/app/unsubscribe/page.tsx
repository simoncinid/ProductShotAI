'use client'
import { useEffect, useState } from 'react'
export default function Unsubscribe() {
  const [token, setToken] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { setToken(new URLSearchParams(window.location.hash.slice(1)).get('token') || ''); window.history.replaceState(null, '', '/unsubscribe') }, [])
  async function confirm() {
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/recovery/unsubscribe`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({token}) })
      if (!r.ok) throw new Error('Please open the unsubscribe link from your email and try again.')
      setDone(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.') }
  }
  return <main className="mx-auto min-h-[60vh] max-w-xl px-6 py-16 text-white"><h1 className="text-3xl">{done ? 'You’re unsubscribed' : 'Email preferences'}</h1><p className="mt-6">{done ? 'You will not receive further recovery campaign emails. Your account and offer remain available.' : 'Stop receiving recovery campaign emails from ProductShotAI.'}</p>{!done && <button disabled={!token} onClick={confirm} className="mt-6 rounded-lg bg-teal-300 px-6 py-4 font-semibold text-black disabled:opacity-50">Unsubscribe</button>}{error && <p role="alert">{error}</p>}</main>
}

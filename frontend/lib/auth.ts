'use client'

import { useSyncExternalStore } from 'react'

const FAKE_AUTH = process.env.NEXT_PUBLIC_FAKE_AUTH === '1'

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
    window.dispatchEvent(new Event('auth-change'))
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

export const isAuthenticated = (): boolean => {
  return FAKE_AUTH || getAuthToken() !== null
}

function subscribe(listener: () => void) {
  window.addEventListener('storage', listener)
  window.addEventListener('auth-change', listener)
  return () => {
    window.removeEventListener('storage', listener)
    window.removeEventListener('auth-change', listener)
  }
}

// null during server rendering/hydration, then the actual browser session.
export function useAuthenticated(): boolean | null {
  return useSyncExternalStore(subscribe, isAuthenticated, () => null)
}

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    window.dispatchEvent(new Event('auth-change'))
  }
}

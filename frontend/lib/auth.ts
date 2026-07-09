'use client'

const FAKE_AUTH = process.env.NEXT_PUBLIC_FAKE_AUTH === '1'

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
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

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

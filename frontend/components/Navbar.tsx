'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { userApi, authApi } from '@/lib/api'
import { isAuthenticated, clearAuth } from '@/lib/auth'
import { useState } from 'react'

export function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const authenticated = isAuthenticated()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: authenticated,
    retry: false,
  })

  const handleLogout = async () => {
    await authApi.logout()
    clearAuth()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-rich-black">
                Product<span className="text-vivid-yellow">Shot</span>AI
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/how-it-works"
              className="text-rich-black hover:text-vivid-yellow px-3 py-2 rounded-md text-sm font-medium transition"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-rich-black hover:text-vivid-yellow px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className="text-rich-black hover:text-vivid-yellow px-3 py-2 rounded-md text-sm font-medium transition"
            >
              FAQ
            </Link>
            {authenticated ? (
              <>
                {user && (
                  <span className="text-rich-black px-3 py-2 text-sm">
                    Credits: <span className="font-bold">{user.credits_balance}</span>
                  </span>
                )}
                <Link
                  href="/dashboard"
                  className="bg-rich-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-rich-black hover:text-vivid-yellow px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/create"
                  className="text-rich-black hover:text-vivid-yellow px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Try Free
                </Link>
                <Link
                  href="/login"
                  className="text-rich-black hover:text-vivid-yellow px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-vivid-yellow text-rich-black px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-rich-black p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/how-it-works" className="block px-3 py-2 text-rich-black">How It Works</Link>
            <Link href="/pricing" className="block px-3 py-2 text-rich-black">Pricing</Link>
            <Link href="/faq" className="block px-3 py-2 text-rich-black">FAQ</Link>
            {authenticated ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-rich-black">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-rich-black">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/create" className="block px-3 py-2 text-rich-black">Try Free</Link>
                <Link href="/login" className="block px-3 py-2 text-rich-black">Login</Link>
                <Link href="/signup" className="block px-3 py-2 text-rich-black">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

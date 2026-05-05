'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Studio' },
  { href: '/dashboard/create', label: 'Generate Image' },
  { href: '/dashboard/shooting', label: 'Full Shooting' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/generations', label: 'Library' },
  { href: '/dashboard/brand-identity', label: 'Brand' },
]

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true
  if (href === '/dashboard/products' && pathname.startsWith('/dashboard/products')) return true
  if (href === '/dashboard/shooting' && pathname.startsWith('/dashboard/shooting')) return true
  return false
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) {
      router.push('/login')
    }
  }, [authenticated, router])

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: authenticated,
    retry: false,
  })

  if (!authenticated || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  const credits = user?.credits_balance ?? 0

  return (
    <div className="h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top,_#22334f_0%,_#0f1727_45%,_#090e18_100%)]">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 overflow-hidden rounded-2xl border border-white/15 bg-white/5 text-white shadow-soft backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">ProductShotAI Studio</p>
              {user?.email && <p className="text-xs text-white/65">{user.email}</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-white/25 bg-black/20 px-3 py-1.5">
                <span className="text-xs text-white/70">Credits: </span>
                <span className="text-sm font-semibold">{credits}</span>
              </div>
              <Link href="/pricing" className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#122035] hover:bg-white/90">
                Buy Credits
              </Link>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 px-3 py-3">
            {navItems.map(({ href, label }) => {
              const active = isActivePath(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-white bg-white text-[#122035]'
                      : 'border-white/30 bg-white/5 text-white hover:bg-white/15'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

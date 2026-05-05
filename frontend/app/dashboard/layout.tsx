'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { authApi, userApi } from '@/lib/api'
import { clearAuth, isAuthenticated } from '@/lib/auth'

const studioNav = [
  { href: '/dashboard', label: 'Studio', glyph: 'S' },
  { href: '/dashboard/create', label: 'Generate Image', glyph: 'G' },
  { href: '/dashboard/shooting', label: 'Full Shooting', glyph: 'F' },
  { href: '/dashboard/products', label: 'Products', glyph: 'P' },
  { href: '/dashboard/generations', label: 'Library', glyph: 'L' },
  { href: '/dashboard/brand-identity', label: 'Brand', glyph: 'B' },
]

function isActive(pathname: string, href: string) {
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
    if (!authenticated) router.push('/login')
  }, [authenticated, router])

  const { data: user, isLoading: userLoading } = useQuery({
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

  if (!authenticated || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16]">
        <p className="text-white/70">Loading...</p>
      </div>
    )
  }

  const credits = user?.credits_balance ?? 0

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_25%_12%,_#1a2a43_0%,_#0c1320_45%,_#090d16_100%)] text-white">
      <div className="grid h-full grid-cols-[78px,minmax(0,1fr)] gap-3 p-3 md:grid-cols-[264px,minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-[22px] border border-white/10 bg-[#0b111d]/90 px-2 py-3 backdrop-blur md:px-3 md:py-4">
          <div className="mb-4 flex items-center gap-2 px-1.5 md:px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-sm font-extrabold text-[#0b111d]">
              PS
            </div>
            <div className="hidden md:block">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/85">Studio</p>
              <p className="text-[11px] text-white/55">Creative Workspace</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-auto px-1">
            {studioNav.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-2.5 rounded-xl px-2 py-2.5 transition ${
                    active
                      ? 'bg-gradient-to-r from-cyan-300/25 to-blue-400/20 text-cyan-100'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                      active ? 'bg-cyan-200/25 text-cyan-100' : 'bg-white/6 text-white/70 group-hover:bg-white/10'
                    }`}
                  >
                    {item.glyph}
                  </span>
                  <span className="hidden text-sm font-medium md:block">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-3 space-y-2 border-t border-white/10 px-1 pt-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Credits</p>
              <p className="mt-1 text-lg font-semibold">{credits}</p>
            </div>
            <Link
              href="/pricing"
              className="block rounded-xl bg-white px-3 py-2 text-center text-xs font-semibold text-[#0b111d] transition hover:bg-white/90"
            >
              Buy Credits
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-white/20 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="min-h-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#0f1726]/85 shadow-[0_30px_90px_rgba(2,7,14,0.45)] backdrop-blur">
          <div className="h-full overflow-hidden p-3 md:p-5">{children}</div>
        </main>
      </div>
    </div>
  )
}


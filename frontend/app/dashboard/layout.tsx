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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f4fb]">
        <p className="text-[#1e1a28]/70">Loading...</p>
      </div>
    )
  }

  const credits = user?.credits_balance ?? 0

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_15%_10%,_#f1ebff_0%,_#f7f5fc_38%,_#ffffff_100%)] text-[#181420]">
      <div className="grid h-full grid-cols-[78px,minmax(0,1fr)] gap-3 p-3 md:grid-cols-[264px,minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-[22px] border border-[#e7e0f4] bg-white/95 px-2 py-3 shadow-[0_12px_30px_rgba(102,73,164,0.08)] backdrop-blur md:px-3 md:py-4">
          <div className="mb-4 flex items-center gap-2 px-1.5 md:px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#d8b6ff] to-[#8d5cff] text-sm font-extrabold text-white">
              PS
            </div>
            <div className="hidden md:block">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6c42b4]">Studio</p>
              <p className="text-[11px] text-[#1e1a28]/55">Creative Workspace</p>
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
                      ? 'bg-gradient-to-r from-[#f0e7ff] to-[#e3d3ff] text-[#5b34a0]'
                      : 'text-[#1e1a28]/70 hover:bg-[#f5f0ff] hover:text-[#1e1a28]'
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                      active
                        ? 'bg-[#d8c0ff] text-[#5b34a0]'
                        : 'bg-[#f3edf9] text-[#1e1a28]/65 group-hover:bg-[#ece3fb]'
                    }`}
                  >
                    {item.glyph}
                  </span>
                  <span className="hidden text-sm font-medium md:block">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-3 space-y-2 border-t border-[#ece5f8] px-1 pt-3">
            <div className="rounded-xl border border-[#ece5f8] bg-[#faf8ff] px-2 py-2">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#1e1a28]/45">Credits</p>
              <p className="mt-1 text-lg font-semibold">{credits}</p>
            </div>
            <Link
              href="/pricing"
              className="block rounded-xl bg-[#1f162f] px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-[#2f2145]"
            >
              Buy Credits
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-[#ded4ef] px-3 py-2 text-xs font-medium text-[#1e1a28]/80 transition hover:bg-[#f5f0ff] hover:text-[#1e1a28]"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="min-h-0 overflow-hidden rounded-[26px] border border-[#e7e0f4] bg-white shadow-[0_20px_50px_rgba(48,30,84,0.08)] backdrop-blur">
          <div className="h-full overflow-hidden p-3 md:p-5">{children}</div>
        </main>
      </div>
    </div>
  )
}

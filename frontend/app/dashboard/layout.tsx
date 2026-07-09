'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import {
  CreditCard,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { authApi, userApi } from '@/lib/api'
import { clearAuth, isAuthenticated } from '@/lib/auth'

const studioNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, hint: 'Start here' },
  { href: '/dashboard/create', label: 'Generate', icon: WandSparkles, hint: 'Single image' },
  { href: '/dashboard/shooting', label: 'Shooting', icon: Images, hint: 'Image set' },
  { href: '/dashboard/products', label: 'Products', icon: Package, hint: 'Catalog' },
  { href: '/dashboard/generations', label: 'Library', icon: Sparkles, hint: 'Outputs' },
  { href: '/dashboard/brand-identity', label: 'Brand', icon: Palette, hint: 'Guidelines' },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
      <div className="flex min-h-screen items-center justify-center bg-[#e9ecf2]">
        <p className="text-[#767d88]">Loading workspace...</p>
      </div>
    )
  }

  const credits = user?.credits_balance ?? 0

  return (
    <div className="dashboard-shell h-screen overflow-hidden bg-[#e9ecf2] text-[#0c0c0c]">
      <div
        className="grid h-screen min-h-0 grid-cols-1 overflow-hidden transition-[grid-template-columns] duration-200 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={{ '--sidebar-width': sidebarCollapsed ? '88px' : '280px' } as React.CSSProperties}
      >
        <aside className="hidden min-h-0 border-r border-[#d0d4d4] bg-[#fefefe] lg:flex lg:flex-col">
          <div className={`border-b border-[#d0d4d4] px-4 py-5 ${sidebarCollapsed ? 'flex flex-col items-center gap-4' : ''}`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
              <Link href="/dashboard" className={`flex min-w-0 items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`} title="ProductShotAI">
                <Image src="/logo1.png" alt="ProductShotAI" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                <p className="text-[13px] font-semibold uppercase tracking-[0.35px]">ProductShotAI</p>
                <p className="mt-0.5 text-[12px] text-[#767d88]">Production workspace</p>
              </div>
                )}
              </Link>
              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded border border-[#d0d4d4] bg-white text-[#404040] transition hover:border-[#0c0c0c] hover:text-[#0c0c0c]"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              )}
            </div>
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="grid h-9 w-9 place-items-center rounded border border-[#d0d4d4] bg-white text-[#404040] transition hover:border-[#0c0c0c] hover:text-[#0c0c0c]"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
          </div>

          <nav className={`flex-1 space-y-1 overflow-auto py-4 ${sidebarCollapsed ? 'px-3' : 'px-3'}`}>
            {studioNav.map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group flex items-center rounded transition ${
                    active
                      ? 'bg-[#0c0c0c] text-white'
                      : 'text-[#404040] hover:bg-[#e9ecf2] hover:text-[#0c0c0c]'
                  } ${sidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-3'}`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded border ${
                      active
                        ? 'border-white/20 bg-white text-black'
                        : 'border-[#d0d4d4] bg-white text-[#404040] group-hover:border-[#c9ccd1]'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  {!sidebarCollapsed && (
                    <span className="min-w-0">
                    <span className="block text-[14px] font-semibold">{item.label}</span>
                    <span className={`block text-[12px] ${active ? 'text-white/60' : 'text-[#767d88]'}`}>{item.hint}</span>
                  </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className={`border-t border-[#d0d4d4] p-4 ${sidebarCollapsed ? 'space-y-3' : ''}`}>
            <div className={`rounded border border-[#d0d4d4] bg-[#e9ecf2] ${sidebarCollapsed ? 'grid place-items-center p-2' : 'p-3'}`}>
              {sidebarCollapsed ? (
                <Link href="/pricing" className="grid h-10 w-10 place-items-center rounded bg-[#0c0c0c] text-white" title={`${credits} credits`}>
                  <CreditCard className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#767d88]">Credits available</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-[28px] leading-none tracking-[-0.9px]">{credits}</p>
                    <Link href="/pricing" className="rounded bg-[#0c0c0c] px-3 py-2 text-[12px] font-semibold text-white">
                  Add
                    </Link>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full rounded border border-[#d0d4d4] bg-white text-[13px] font-semibold text-[#404040] transition hover:border-[#0c0c0c] hover:text-[#0c0c0c] ${sidebarCollapsed ? 'grid h-10 place-items-center px-0 py-0' : 'mt-3 px-3 py-2.5'}`}
              title="Logout"
            >
              {sidebarCollapsed ? <LogOut className="h-4 w-4" /> : 'Logout'}
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-[#d0d4d4] bg-[#fefefe]/92 backdrop-blur">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#767d88]">Workspace</p>
                <p className="truncate text-[16px] font-semibold text-[#0c0c0c]">AI product photo production</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/create" className="hidden rounded bg-[#0c0c0c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#404040] sm:inline-flex">
                  Generate image
                </Link>
                <Link href="/pricing" className="rounded border border-[#d0d4d4] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#404040] transition hover:border-[#0c0c0c]">
                  {credits} credits
                </Link>
              </div>
            </div>
          </header>

          <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="mx-auto h-full min-h-0 w-full max-w-[1500px] overflow-hidden px-4 py-4 md:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

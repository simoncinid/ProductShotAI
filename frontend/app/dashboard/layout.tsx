'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { authApi, userApi } from '@/lib/api'
import { clearAuth, useAuthenticated } from '@/lib/auth'

const studioNav = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: LayoutDashboard,
    hint: 'Start here',
  },
  {
    href: '/dashboard/create',
    label: 'Create photo',
    icon: WandSparkles,
    hint: 'Start with one photo',
  },
  {
    href: '/dashboard/shooting',
    label: 'Image sets',
    icon: Images,
    hint: 'Several photos at once',
  },
  {
    href: '/dashboard/products',
    label: 'Saved products',
    icon: Package,
    hint: 'Optional product details',
  },
  {
    href: '/dashboard/generations',
    label: 'My images',
    icon: Sparkles,
    hint: 'View and download',
  },
  {
    href: '/dashboard/brand-identity',
    label: 'Brand settings',
    icon: Palette,
    hint: 'Optional visual style',
  },
]

function isActive(pathname: string, href: string) {
  if (pathname === href) return true
  if (
    href === '/dashboard/products' &&
    pathname.startsWith('/dashboard/products')
  )
    return true
  if (
    href === '/dashboard/shooting' &&
    pathname.startsWith('/dashboard/shooting')
  )
    return true
  return false
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const authenticated = useAuthenticated()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (authenticated === false) router.replace('/login')
  }, [authenticated, router])

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: authenticated === true,
    retry: false,
  })

  const handleLogout = async () => {
    await authApi.logout()
    clearAuth()
    queryClient.clear()
    router.push('/')
  }

  if (!authenticated || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e9ecf2]">
        <p className="text-[#475569]">Loading workspace...</p>
      </div>
    )
  }

  if (!user)
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-slate-900">
        <h1 className="text-2xl font-semibold">We couldn’t open your studio</h1>
        <p className="mt-4">
          Your session may have expired, or the connection was interrupted.
        </p>
        <button
          className="mt-6 min-h-12 rounded-xl bg-black px-5 text-white"
          onClick={() => {
            clearAuth()
            queryClient.clear()
            router.push('/login')
          }}
        >
          Sign in again
        </button>
      </main>
    )

  const credits = user?.credits_balance ?? 0

  return (
    <div className="dashboard-shell min-h-[100dvh] bg-[#e9ecf2] text-[#0c0c0c] ">
      <div
        className="grid min-h-[100dvh] min-w-0 grid-cols-1 transition-[grid-template-columns] duration-200  lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={
          {
            '--sidebar-width': sidebarCollapsed ? '88px' : '248px',
          } as React.CSSProperties
        }
      >
        <aside className="sticky top-0 h-[100dvh] hidden min-h-0 border-r border-[#d0d4d4] bg-[#fefefe] lg:flex lg:flex-col">
          <div
            className={`border-b border-[#d0d4d4] px-4 py-5 ${sidebarCollapsed ? 'flex flex-col items-center gap-4' : ''}`}
          >
            <div
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between gap-3'}`}
            >
              <Link
                href="/dashboard"
                className={`flex min-w-0 items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
                title="ProductShotAI"
              >
                <Image
                  src="/logo1.png"
                  alt="ProductShotAI"
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 object-contain"
                />
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.35px]">
                      ProductShotAI
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#475569]">
                      Your photo studio
                    </p>
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

          <nav
            className={`flex-1 space-y-1 overflow-auto py-4 ${sidebarCollapsed ? 'px-3' : 'px-3'}`}
          >
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
                      <span className="block text-[14px] font-semibold">
                        {item.label}
                      </span>
                      <span
                        className={`block text-[13px] ${active ? 'text-white/60' : 'text-[#475569]'}`}
                      >
                        {item.hint}
                      </span>
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div
            className={`border-t border-[#d0d4d4] p-4 ${sidebarCollapsed ? 'space-y-3' : ''}`}
          >
            <div
              className={`rounded border border-[#d0d4d4] bg-[#e9ecf2] ${sidebarCollapsed ? 'grid place-items-center p-2' : 'p-3'}`}
            >
              {sidebarCollapsed ? (
                <Link
                  href="/pricing"
                  className="grid h-10 w-10 place-items-center rounded bg-[#0c0c0c] text-white"
                  title={`${credits} credits`}
                >
                  <CreditCard className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <p className="text-[13px] font-medium uppercase tracking-[0.35px] text-[#475569]">
                    Credits available
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-[28px] leading-none tracking-[-0.9px]">
                      {credits}
                    </p>
                    <Link
                      href="/pricing"
                      className="rounded bg-[#0c0c0c] px-3 py-2 text-[13px] font-semibold text-white"
                    >
                      Buy credits
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

        <div className="flex min-h-0 min-w-0 flex-col ">
          <header className="sticky top-0 z-30 shrink-0 border-b border-[#d0d4d4] bg-[#fefefe]">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
              <div className="min-w-0">
                <Link
                  href="/dashboard"
                  className="text-[13px] font-semibold text-[#0c0c0c]"
                >
                  ProductShotAI
                </Link>
                <p className="truncate text-[13px] text-[#475569]">
                  Photo studio
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/create"
                  className="hidden rounded bg-[#0c0c0c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#404040] sm:inline-flex"
                >
                  Create a photo
                </Link>
                <Link
                  href="/pricing"
                  className="rounded border border-[#d0d4d4] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#404040] transition hover:border-[#0c0c0c]"
                >
                  {credits} credits
                </Link>
                <details className="relative lg:hidden">
                  <summary
                    aria-label="More studio tools"
                    className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded border border-[#d0d4d4]"
                  >
                    <Menu className="h-5 w-5" />
                  </summary>
                  <div className="absolute right-0 top-14 z-50 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <p className="px-3 py-2 text-sm text-slate-500">
                      Optional tools
                    </p>
                    {studioNav
                      .filter((x) =>
                        [
                          '/dashboard/products',
                          '/dashboard/shooting',
                          '/dashboard/brand-identity',
                        ].includes(x.href),
                      )
                      .map((x) => (
                        <Link
                          key={x.href}
                          href={x.href}
                          onClick={(e) =>
                            e.currentTarget
                              .closest('details')
                              ?.removeAttribute('open')
                          }
                          className="flex min-h-12 items-center rounded-lg px-3 text-base hover:bg-slate-100"
                        >
                          {x.label}
                        </Link>
                      ))}
                    <button
                      onClick={handleLogout}
                      className="min-h-12 w-full border-t border-slate-200 px-3 text-left text-base"
                    >
                      Sign out
                    </button>
                  </div>
                </details>
              </div>
            </div>
            <nav
              aria-label="Studio navigation"
              className="grid grid-cols-3 border-t border-[#d0d4d4] px-2 py-2 lg:hidden"
            >
              {studioNav
                .filter((x) =>
                  [
                    '/dashboard',
                    '/dashboard/create',
                    '/dashboard/generations',
                  ].includes(x.href),
                )
                .map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive(pathname, href) ? 'page' : undefined}
                    className={`flex min-h-14 min-w-0 flex-row items-center justify-center gap-1 rounded px-1 text-[13px] font-medium ${isActive(pathname, href) ? 'bg-[#0c0c0c] text-white' : 'text-[#404040]'}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
            </nav>
          </header>

          <main className="min-h-0 min-w-0 flex-1 ">
            <div className="mx-auto min-h-0 w-full max-w-[1500px] px-4 py-4 md:px-6  lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

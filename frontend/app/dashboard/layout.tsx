'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { brandIdentityApi, productsApi, userApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Studio' },
  { href: '/dashboard/create', label: 'Genera foto' },
  { href: '/dashboard/shooting', label: 'Crea shooting' },
  { href: '/dashboard/products', label: 'Catalogo' },
  { href: '/dashboard/generations', label: 'Libreria' },
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

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: authenticated,
  })

  const { data: brandIdentity, error: brandError } = useQuery({
    queryKey: ['brand-identity'],
    queryFn: brandIdentityApi.get,
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
  const hasBrand = !!brandIdentity && !brandError
  const hasProducts = products.length > 0
  const readinessScore = [hasBrand, hasProducts, credits > 0].filter(Boolean).length
  const readinessPercent = Math.round((readinessScore / 3) * 100)

  const nextAction = !hasBrand
    ? { href: '/dashboard/brand-identity', label: 'Configura brand identity' }
    : !hasProducts
      ? { href: '/dashboard/products', label: 'Crea primo prodotto' }
      : credits <= 0
        ? { href: '/pricing', label: 'Acquista crediti' }
        : { href: '/dashboard/create', label: 'Genera prima foto' }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#22334f_0%,_#0f1727_45%,_#090e18_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-7 overflow-hidden rounded-3xl border border-white/15 bg-white/5 text-white shadow-soft backdrop-blur-sm">
          <div className="border-b border-white/10 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">ProductShotAI Studio</p>
                <h1 className="mt-2 text-3xl font-bold">
                  {user?.email ? `Bentornato ${user.email.split('@')[0]}` : 'Dashboard'}
                </h1>
                <p className="mt-2 text-sm text-white/75">
                  Flusso ottimizzato: setup una volta, poi genera foto e shooting in modo guidato.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/25 bg-black/20 px-4 py-2">
                  <p className="text-xs text-white/70">Crediti</p>
                  <p className="text-lg font-semibold">{credits}</p>
                </div>
                <Link
                  href="/pricing"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#122035] hover:bg-white/90"
                >
                  Acquista crediti
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-[1fr,auto] lg:items-end">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-white/80">
                <span>Prontezza account</span>
                <span>{readinessPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/15">
                <div className="h-2 rounded-full bg-cyan-300 transition-all" style={{ width: `${readinessPercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/70">
                {hasBrand ? 'Brand OK' : 'Brand da completare'} · {hasProducts ? `${products.length} prodotti` : 'Nessun prodotto'} · {credits > 0 ? 'Crediti disponibili' : 'Nessun credito'}
              </p>
            </div>

            <Link
              href={nextAction.href}
              className="inline-flex items-center rounded-full border border-cyan-200/70 bg-cyan-100/20 px-4 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-100/30"
            >
              Prossima azione: {nextAction.label}
            </Link>
          </div>

          <nav className="flex flex-wrap gap-2 border-t border-white/10 p-4">
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

        {children}
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/brand-identity', label: 'Brand Identity' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/generations', label: 'Generations' },
]

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
        <div className="text-center">
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  const isOverview = pathname === '/dashboard'
  const isProductsSection = pathname?.startsWith('/dashboard/products')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-dark mb-1">
          Dashboard{user?.email ? ` — ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-muted text-sm">Manage brand identity, products, and generations</p>
      </div>

      <nav className="flex flex-wrap gap-2 mb-8 border-b border-muted-dark/60">
        {navItems.map(({ href, label }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : (href === '/dashboard/products' ? isProductsSection : pathname === href)
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-t-md font-medium transition ${
                active ? 'bg-brand text-on-brand border border-b-0 border-muted-dark/60' : 'bg-on-dark/10 text-on-dark hover:bg-on-dark/20 border border-muted-dark/60 border-b-0'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}

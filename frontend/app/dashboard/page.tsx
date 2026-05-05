'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { brandIdentityApi, productsApi, userApi } from '@/lib/api'

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    retry: false,
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
  })

  const { data: brandIdentity, error: brandError, isLoading: brandLoading } = useQuery({
    queryKey: ['brand-identity'],
    queryFn: brandIdentityApi.get,
    retry: false,
  })

  if (userLoading || productsLoading || brandLoading) {
    return <p className="text-muted">Loading...</p>
  }

  const hasBrandIdentity = !!brandIdentity && !brandError
  const hasProducts = products.length > 0
  const hasCredits = (user?.credits_balance ?? 0) > 0

  const blockers = [
    {
      title: 'Brand',
      done: hasBrandIdentity,
      description: 'Set brand rules once and keep style consistent everywhere.',
      href: '/dashboard/brand-identity',
      cta: hasBrandIdentity ? 'Edit Brand' : 'Set Brand',
    },
    {
      title: 'Products',
      done: hasProducts,
      description: 'At least one product with references unlocks the fastest flow.',
      href: '/dashboard/products',
      cta: hasProducts ? 'Manage Products' : 'Create Product',
    },
    {
      title: 'Credits',
      done: hasCredits,
      description: 'Credits are required to generate 4K/8K outputs.',
      href: '/pricing',
      cta: hasCredits ? 'View Plans' : 'Buy Credits',
    },
  ]

  return (
    <div className="h-full overflow-auto">
      <section className="grid h-full content-start gap-4 lg:grid-rows-[auto,1fr]">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Studio Flow</p>
          <h2 className="mt-2 text-2xl font-bold">Generate in 3 clear steps</h2>
          <p className="mt-1 text-sm text-white/70">Set brand and products once, then generate single images or full shootings.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-2xl border border-cyan-200/40 bg-gradient-to-br from-[#10213a] to-[#1f3b63] p-5 text-white shadow-soft">
            <h3 className="text-xl font-bold">Quick Start</h3>
            <ol className="mt-3 space-y-2 text-sm text-white/85">
              <li>1. Open Generate Image for single output.</li>
              <li>2. Open Full Shooting for a batch set.</li>
              <li>3. Refine results in Creative Hub from Library or Product pages.</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/create" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#122035] hover:bg-white/90">
                Generate Image
              </Link>
              <Link href="/dashboard/shooting" className="rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                Full Shooting
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Readiness</h3>
            <div className="mt-3 grid gap-3">
          {blockers.map((item) => (
            <div key={item.title} className="rounded-xl border border-white/15 bg-black/20 p-4 text-white">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className={`mt-1 text-xs ${item.done ? 'text-emerald-300' : 'text-amber-300'}`}>
                {item.done ? 'Done' : 'Missing'}
              </p>
              <p className="mt-2 text-xs text-white/70">{item.description}</p>
              <Link href={item.href} className="mt-3 inline-flex text-sm font-semibold text-cyan-100 hover:underline">
                {item.cta}
              </Link>
            </div>
          ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

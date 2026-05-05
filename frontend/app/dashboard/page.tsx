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
    return <p className="px-2 py-3 text-[#1f1a2a]/70">Loading...</p>
  }

  const hasBrand = !!brandIdentity && !brandError
  const hasProducts = products.length > 0
  const hasCredits = (user?.credits_balance ?? 0) > 0

  const readiness = [
    {
      title: 'Brand profile',
      done: hasBrand,
      href: '/dashboard/brand-identity',
      action: hasBrand ? 'Edit' : 'Setup',
    },
    {
      title: 'Product catalog',
      done: hasProducts,
      href: '/dashboard/products',
      action: hasProducts ? 'Manage' : 'Create',
    },
    {
      title: 'Generation credits',
      done: hasCredits,
      href: '/pricing',
      action: hasCredits ? 'Review plans' : 'Buy credits',
    },
  ]

  return (
    <div className="grid h-full gap-3 lg:grid-cols-[1.35fr,0.65fr]">
      <section className="grid min-h-0 grid-rows-[auto,1fr] gap-3">
        <div className="rounded-2xl border border-[#decef8] bg-gradient-to-r from-[#f8f3ff] via-[#f3ebff] to-[#ffffff] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#5d369f]/85">Creative Studio</p>
          <h1 className="mt-1 text-2xl font-bold">Production Console</h1>
          <p className="mt-1 text-sm text-[#1f1a2a]/70">
            Build references, generate outputs, and iterate in one consistent workspace.
          </p>
        </div>

        <div className="grid min-h-0 gap-3 xl:grid-cols-2">
          <article className="flex min-h-0 flex-col rounded-2xl border border-[#e8e0f5] bg-white p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6a43ad]/75">Single Output</p>
              <h2 className="mt-1 text-xl font-semibold">Generate Image</h2>
              <p className="mt-2 text-sm text-[#1f1a2a]/70">
                Fastest path for one high-quality image from a single reference.
              </p>
            </div>
            <div className="mt-4 flex-1 rounded-xl border border-[#ede6f8] bg-[#fcfaff] p-3">
              <ol className="space-y-2 text-sm text-[#1f1a2a]/75">
                <li>1. Upload or pick a product reference.</li>
                <li>2. Define creative intent.</li>
                <li>3. Generate and open in Hub.</li>
              </ol>
            </div>
            <Link
              href="/dashboard/create"
              className="mt-4 inline-flex w-fit rounded-full bg-[#1f162f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f2145]"
            >
              Open Generate Image
            </Link>
          </article>

          <article className="flex min-h-0 flex-col rounded-2xl border border-[#e8e0f5] bg-white p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6a43ad]/75">Batch Output</p>
              <h2 className="mt-1 text-xl font-semibold">Full Shooting</h2>
              <p className="mt-2 text-sm text-[#1f1a2a]/70">
                Produce multi-image sets with coherent style and framing.
              </p>
            </div>
            <div className="mt-4 flex-1 rounded-xl border border-[#ede6f8] bg-[#fcfaff] p-3">
              <ol className="space-y-2 text-sm text-[#1f1a2a]/75">
                <li>1. Select product and reference.</li>
                <li>2. Set volume and shooting style.</li>
                <li>3. Track progress and refine outputs.</li>
              </ol>
            </div>
            <Link
              href="/dashboard/shooting"
              className="mt-4 inline-flex w-fit rounded-full border border-[#cdb9ef] px-4 py-2 text-sm font-semibold text-[#5a349f] hover:bg-[#f7f1ff]"
            >
              Open Full Shooting
            </Link>
          </article>
        </div>
      </section>

      <section className="grid min-h-0 grid-rows-[auto,1fr] gap-3">
        <div className="rounded-2xl border border-[#e8e0f5] bg-white p-4">
          <h3 className="text-sm uppercase tracking-[0.18em] text-[#6a43ad]/75">Workspace Status</h3>
          <p className="mt-2 text-sm text-[#1f1a2a]/70">Current account setup required for clean production.</p>
        </div>

        <div className="space-y-3 overflow-auto pr-1">
          {readiness.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[#e8e0f5] bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{item.title}</p>
                <span className={`text-xs ${item.done ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {item.done ? 'Ready' : 'Missing'}
                </span>
              </div>
              <Link href={item.href} className="mt-3 inline-flex text-sm font-semibold text-[#5b34a0] hover:underline">
                {item.action}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

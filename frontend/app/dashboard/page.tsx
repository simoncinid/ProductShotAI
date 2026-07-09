'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { brandIdentityApi, productsApi, userApi } from '@/lib/api'

type Product = {
  id: string
  name: string
  category?: string
  images?: Array<{ id: string; image_url: string }>
}

const recentShots = [
  { src: '/images/res1.png', label: 'Catalog hero', meta: '1:1 · 4K' },
  { src: '/images/res2.png', label: 'Lifestyle set', meta: '4:5 · 4K' },
  { src: '/images/res3.png', label: 'Campaign frame', meta: '16:9 · 8K' },
]

const playbooks = [
  {
    title: 'Generate one image',
    label: 'Fastest path',
    text: 'Upload a reference, choose the intent, generate one production-ready output.',
    href: '/dashboard/create',
    action: 'Start single image',
    image: '/images/res4.png',
  },
  {
    title: 'Run a full shooting',
    label: 'Best for sets',
    text: 'Create coherent variations for PDP galleries, Amazon listings and ad tests.',
    href: '/dashboard/shooting',
    action: 'Create image set',
    image: '/images/res5.jpeg',
  },
]

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    retry: false,
  })

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: productsApi.list,
  })

  const { data: brandIdentity, error: brandError, isLoading: brandLoading } = useQuery({
    queryKey: ['brand-identity'],
    queryFn: brandIdentityApi.get,
    retry: false,
  })

  if (userLoading || productsLoading || brandLoading) {
    return <p className="px-2 py-3 text-[#767d88]">Loading workspace...</p>
  }

  const hasBrand = !!brandIdentity && !brandError
  const hasProducts = products.length > 0
  const hasCredits = (user?.credits_balance ?? 0) > 0
  const setupItems = [
    { title: 'Brand profile', done: hasBrand, href: '/dashboard/brand-identity', action: hasBrand ? 'Review' : 'Set up' },
    { title: 'Product catalog', done: hasProducts, href: '/dashboard/products', action: hasProducts ? 'Manage' : 'Add product' },
    { title: 'Credits', done: hasCredits, href: '/pricing', action: hasCredits ? 'View balance' : 'Buy credits' },
  ]
  const completed = setupItems.filter((item) => item.done).length
  const primaryProduct = products[0]

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden">
      <section className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.45fr)_420px]">
        <div className="relative overflow-hidden rounded border border-[#27272a] bg-black p-5 text-white md:p-6">
          <Image src="/images/res6.jpeg" alt="" fill priority className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#c9ccd1]">Recommended next step</p>
            <h1 className="mt-3 text-[34px] font-normal leading-none tracking-[-1.2px] md:text-[44px]">
              Start with a single image.
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-snug text-[#e9ecf2]">
              Use one product reference to generate a clean output, then scale into full shootings once the direction is right.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/create" className="inline-flex justify-center rounded bg-white px-5 py-3 text-[14px] font-semibold text-black transition hover:bg-[#e9ecf2]">
                Generate first image
              </Link>
              <Link href="/dashboard/products" className="inline-flex justify-center rounded border border-white/35 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white hover:text-black">
                Check products
              </Link>
            </div>
          </div>
        </div>

        <aside className="rounded border border-[#d0d4d4] bg-[#fefefe] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#767d88]">Setup progress</p>
              <h2 className="mt-1 text-[28px] font-normal leading-none tracking-[-0.9px]">{completed}/3 ready</h2>
            </div>
            <span className="rounded bg-[#e9ecf2] px-2.5 py-1 text-[12px] font-semibold text-[#404040]">
              {user?.credits_balance ?? 0} credits
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {setupItems.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-3 rounded border border-[#d0d4d4] bg-white p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded text-[12px] font-semibold ${item.done ? 'bg-[#0c0c0c] text-white' : 'bg-[#e9ecf2] text-[#767d88]'}`}>
                    {item.done ? '✓' : '•'}
                  </span>
                  <p className="truncate text-[14px] font-semibold">{item.title}</p>
                </div>
                <Link href={item.href} className="shrink-0 text-[13px] font-semibold text-[#404040] underline-offset-4 hover:underline">
                  {item.action}
                </Link>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid min-h-0 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Products" value={products.length.toString()} detail={primaryProduct ? primaryProduct.name : 'Add your first product'} />
            <Metric label="Brand identity" value={hasBrand ? 'Ready' : 'Missing'} detail={hasBrand ? 'Applied to prompts' : 'Set visual rules once'} />
            <Metric label="Output mode" value="4K / 8K" detail="1 credit for 4K, 2 for 8K" />
          </div>

          <div className="grid min-h-0 gap-4 overflow-hidden lg:grid-cols-2">
            {playbooks.map((item) => (
              <article key={item.title} className="overflow-hidden rounded border border-[#d0d4d4] bg-[#fefefe]">
                <div className="relative h-32 bg-[#0c0c0c] 2xl:h-40">
                  <Image src={item.image} alt="" fill className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#767d88]">{item.label}</p>
                  <h3 className="mt-2 text-[24px] font-normal leading-none tracking-[-0.9px]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-snug text-[#767d88]">{item.text}</p>
                  <Link href={item.href} className="mt-5 inline-flex rounded bg-[#0c0c0c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#404040]">
                    {item.action}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="min-h-0 overflow-hidden rounded border border-[#d0d4d4] bg-[#fefefe] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#767d88]">Recent outputs</p>
              <h2 className="mt-1 text-[24px] font-normal leading-none tracking-[-0.9px]">Library preview</h2>
            </div>
            <Link href="/dashboard/generations" className="text-[13px] font-semibold text-[#404040] underline-offset-4 hover:underline">
              Open
            </Link>
          </div>
          <div className="mt-4 space-y-2 overflow-hidden">
            {recentShots.map((shot) => (
              <article key={shot.src} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded border border-[#d0d4d4] bg-white p-2">
                <div className="relative aspect-square overflow-hidden rounded bg-[#e9ecf2]">
                  <Image src={shot.src} alt="" fill className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="truncate text-[14px] font-semibold">{shot.label}</p>
                  <p className="mt-1 text-[12px] text-[#767d88]">{shot.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded border border-[#d0d4d4] bg-[#fefefe] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#767d88]">{label}</p>
      <p className="mt-2 text-[26px] font-normal leading-none tracking-[-0.9px]">{value}</p>
      <p className="mt-2 truncate text-[13px] text-[#767d88]">{detail}</p>
    </div>
  )
}

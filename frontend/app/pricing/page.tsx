'use client'

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { creditsApi, userApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { DynamicBackdropSection } from '@/components/DynamicBackdropSection'
import { PricingShowcase, type PricingPlan } from '@/components/PricingShowcase'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

const creditFeatures = [
  '1 credit = 4K image, 2 credits = 8K image',
  'Credits never expire — use them whenever you need',
  'No monthly fees or subscriptions',
  'Buy more credits anytime to add to your balance',
]

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authenticated = isAuthenticated()
  const queryClient = useQueryClient()

  const { data: packsData } = useQuery({
    queryKey: ['credit-packs'],
    queryFn: creditsApi.getPacks,
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: authenticated,
    retry: false,
  })

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      toast.success('Payment completed! Credits have been added to your account.')
      queryClient.invalidateQueries({ queryKey: ['user'] })
      window.history.replaceState({}, '', '/pricing')
    }
  }, [searchParams, queryClient])

  const purchaseMutation = useMutation({
    mutationFn: ({ packId, successUrl, cancelUrl }: { packId: string; successUrl: string; cancelUrl: string }) =>
      creditsApi.purchase(packId, successUrl, cancelUrl),
    onSuccess: (data) => {
      if (data?.checkout_url) {
        window.location.href = data.checkout_url
      }
    },
    onError: (error: unknown) => {
      const msg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      toast.error(msg || 'Acquisto fallito')
    },
  })

  const handlePurchase = (packId: string) => {
    if (!authenticated) {
      toast.error('Log in or sign up to purchase credits')
      router.push('/signup')
      return
    }
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    purchaseMutation.mutate({
      packId,
      successUrl: `${base}/pricing?success=1`,
      cancelUrl: `${base}/pricing`,
    })
  }

  const packs = packsData?.packs || []
  const isPopular = (id: string) => (id || '').toLowerCase() === 'standard'

  return (
    <div className="bg-page-bg">
      <section className="relative overflow-hidden bg-page-bg py-16 md:py-24">
        <div className={`${CONTAINER} relative`}>
          <div className="max-w-4xl">
            <p className="text-[14px] font-medium uppercase tracking-[0.35px] text-[#767d88]">Pricing</p>
            <h1 className="mt-5 text-[42px] font-normal leading-none tracking-[-0.9px] text-white md:text-[64px]">
              Credits for product image production, not another subscription.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-snug text-[#a7a7a7] md:text-[19px]">
              Buy once, generate when needed. Standard is the recommended first pack because it gives enough room to test multiple scenes before scaling.
            </p>
          </div>
        </div>
      </section>

      <PricingShowcase
        plans={packs.map((pack: { id: string; name: string; total_price: number; credits: number; price_per_credit: number }): PricingPlan => ({
          id: pack.id,
          name: pack.name,
          price: `$${pack.total_price.toFixed(2)}`,
          credits: pack.credits,
          each: `$${pack.price_per_credit.toFixed(2)}`,
          popular: isPopular(pack.id),
        }))}
        eyebrow="Choose a credit pack"
        title="Start with Standard, scale when the winning style is clear."
        description="The recommended pack is optimized for the first real production pass: enough variants to compare scenes, lighting and crops without jumping straight to high volume."
        balance={authenticated && user ? user.credits_balance : null}
        ctaMode="purchase"
        pending={purchaseMutation.isPending}
        onPurchase={handlePurchase}
      />

      <DynamicBackdropSection
        eyebrow="Credit-based production"
        title="Standard is the cleanest way to validate four visual directions, then scale only what works."
        ctaLabel="Start creating"
        ctaHref="/dashboard/create"
        image="/images/res6.jpeg"
        items={[
          {
            title: 'Test directions',
            text: 'Use small packs to compare lighting, backgrounds and product angles before committing to a larger set.',
            href: '/dashboard/create',
          },
          {
            title: 'Build galleries',
            text: 'Use higher credit packs for complete product pages, marketplace assets and seasonal campaign refreshes.',
            href: '/dashboard/shooting',
          },
          {
            title: 'Keep control',
            text: 'No monthly plan, no unused subscription seat. Credits stay available for the next production cycle.',
            href: '/pricing',
          },
        ]}
      />

      <section className="border-y border-[#27272a] bg-black py-16 text-white md:py-24">
        <div className={CONTAINER}>
          <div className="grid gap-10 lg:grid-cols-[minmax(280px,0.45fr)_1fr] lg:items-start">
            <div>
              <p className="text-[14px] font-medium uppercase tracking-[0.35px] text-[#767d88]">Credit rules</p>
              <h2 className="mt-5 text-[36px] font-normal leading-none tracking-[-0.9px] md:text-[48px]">
                Simple enough to decide fast.
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {creditFeatures.map((text, i) => (
                <div key={i} className="rounded-lg border border-[#27272a] bg-[#1a1a1a] p-5">
                  <p className="text-[12px] font-medium uppercase tracking-[0.35px] text-[#767d88]">0{i + 1}</p>
                  <p className="mt-4 text-[17px] leading-snug text-[#fefefe]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/10 bg-page-bg py-16 md:py-20">
        <div className={`${CONTAINER} text-center`}>
          <h2 className="text-[32px] font-normal leading-none tracking-[-0.9px] text-on-dark md:text-[44px]">Ready to start producing?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-snug text-muted">
            Sign up, purchase credits, and start creating stunning product photos.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded border border-white bg-white px-8 py-3.5 text-base font-semibold text-black transition hover:bg-black hover:text-white"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  )
}

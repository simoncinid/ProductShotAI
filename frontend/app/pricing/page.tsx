'use client'

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { creditsApi, userApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

const creditFeatures = [
  'One credit = one high-quality 8K image generation',
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
      toast.success('Pagamento completato! I crediti sono stati accreditati.')
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
      toast.error('Accedi o registrati per acquistare crediti')
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
  const isDark = (id: string) => (id || '').toLowerCase() === 'starter'
  const isPopular = (id: string) => (id || '').toLowerCase() === 'standard'

  return (
    <div className="bg-page-bg">
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden bg-white pt-16 pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">Simple, Transparent Pricing</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-primary md:text-[34px]">
              Pay only for the images you need
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] text-secondary md:text-[18px]">
              No monthly subscriptions. The more credits you buy, the less you pay per image.
            </p>
            {authenticated && user && (
              <p className="mt-5 rounded-full bg-anthracite/5 px-5 py-2 text-[15px] font-medium text-primary">
                Your balance: <span className="font-bold text-brand">{user.credits_balance} credits</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Divisore curvo ——— */}
      <div className="relative -mt-px h-10 w-full overflow-hidden bg-page-bg md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-white" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— Card pricing ——— */}
      <section className="bg-page-bg pb-16 pt-12 md:pb-24 md:pt-16">
        <div className={CONTAINER}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packs.map((pack: { id: string; name: string; total_price: number; credits: number; price_per_credit: number }) => {
              const dark = isDark(pack.id)
              const popular = isPopular(pack.id)
              return (
                <div
                  key={pack.id}
                  className={`group relative flex flex-col rounded-[20px] p-6 transition-smooth ${
                    dark ? 'bg-anthracite text-white' : 'bg-white shadow-soft'
                  } ${popular ? 'ring-2 ring-brand ring-offset-2' : ''} hover:-translate-y-1 hover:shadow-card-hover`}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-primary">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-base font-semibold capitalize">{pack.name}</h3>
                  <p className={`mt-3 text-[32px] font-bold ${dark ? 'text-white' : 'text-brand'}`}>
                    ${pack.total_price.toFixed(2)}
                  </p>
                  <p className={dark ? 'text-[13px] text-gray-400' : 'text-[13px] text-secondary'}>
                    {pack.credits} credits – ${pack.price_per_credit.toFixed(2)} each
                  </p>
                  <button
                    onClick={() => handlePurchase(pack.id)}
                    disabled={purchaseMutation.isPending}
                    className={`mt-6 w-full rounded-full py-3 text-center text-[14px] font-semibold transition-smooth disabled:opacity-50 ${
                      popular
                        ? 'bg-brand text-primary hover:scale-[1.02] hover:shadow-soft-hover'
                        : dark
                        ? 'border border-white/40 text-white hover:bg-white/10'
                        : 'border-2 border-anthracite text-anthracite hover:bg-anthracite hover:text-white'
                    }`}
                  >
                    {purchaseMutation.isPending ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Divisore curvo ——— */}
      <div className="relative h-10 w-full overflow-hidden bg-white md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute top-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 0v48h1200V0c-200 0-400 24-600 24S200 0 0 0z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— How Credits Work ——— */}
      <section className="bg-white py-16 md:py-24">
        <div className={CONTAINER}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">How Credits Work</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft md:p-8">
            <ul className="space-y-4">
              {creditFeatures.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-brand">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-[15px] leading-relaxed text-secondary md:text-[16px]">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ——— CTA Try Free ——— */}
      <section className="border-t border-gray-100 bg-page-bg py-16 md:py-20">
        <div className={`${CONTAINER} text-center`}>
          <h2 className="text-[20px] font-bold text-primary md:text-[24px]">Try It Free First</h2>
          <p className="mt-3 text-[16px] text-secondary">
            Get 3 free watermarked images per month. No credit card required.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  )
}

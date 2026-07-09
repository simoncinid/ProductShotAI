import Link from 'next/link'

export type PricingPlan = {
  id: string
  name: string
  price: string
  credits: number
  each: string
  popular?: boolean
  note?: string
}

type PricingShowcaseProps = {
  plans: PricingPlan[]
  eyebrow?: string
  title?: string
  description?: string
  balance?: number | null
  ctaMode?: 'link' | 'purchase'
  pending?: boolean
  onPurchase?: (planId: string) => void
}

const defaultNotes: Record<string, string> = {
  starter: 'Quick checks and first experiments.',
  standard: 'Best starting point for testing multiple scenes without overbuying.',
  pro: 'Enough volume for a complete product page or seasonal refresh.',
  power: 'Lowest unit cost for teams producing assets every week.',
}

function getPlanNote(plan: PricingPlan) {
  return plan.note ?? defaultNotes[plan.id.toLowerCase()] ?? 'Flexible credits for product image production.'
}

function PlanButton({
  plan,
  mode,
  pending,
  onPurchase,
  className,
}: {
  plan: PricingPlan
  mode: 'link' | 'purchase'
  pending?: boolean
  onPurchase?: (planId: string) => void
  className: string
}) {
  if (mode === 'purchase') {
    return (
      <button type="button" onClick={() => onPurchase?.(plan.id)} disabled={pending} className={className}>
        {pending ? 'Processing...' : 'Purchase'}
      </button>
    )
  }

  return (
    <Link href="/pricing" className={className}>
      View pricing
    </Link>
  )
}

export function PricingShowcase({
  plans,
  eyebrow = 'Simple transparent pricing',
  title = 'Buy credits when production needs them.',
  description = 'No subscriptions, no monthly seats. Start with the recommended pack, test directions, then scale the winning image style.',
  balance,
  ctaMode = 'link',
  pending = false,
  onPurchase,
}: PricingShowcaseProps) {
  const popularPlan = plans.find((plan) => plan.popular) ?? plans[1] ?? plans[0]
  const supportingPlans = plans.filter((plan) => plan.id !== popularPlan?.id)

  if (!popularPlan) return null

  return (
    <section className="relative overflow-hidden bg-black py-16 text-white md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-[#27272a]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[#27272a]" aria-hidden />
      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 md:px-10 lg:grid-cols-[minmax(280px,0.42fr)_minmax(0,1fr)] lg:gap-14 lg:px-14">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="text-[14px] font-medium uppercase tracking-[0.35px] text-[#767d88]">{eyebrow}</p>
            <h2 className="mt-5 max-w-xl text-[38px] font-normal leading-none tracking-[-0.9px] text-white md:text-[52px]">
              {title}
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-snug text-[#a7a7a7]">{description}</p>
          </div>

          <div className="grid gap-3 border-t border-[#27272a] pt-5 text-[14px] text-[#c9ccd1]">
            {typeof balance === 'number' && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#767d88]">Current balance</span>
                <span className="text-white">{balance} credits</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#767d88]">4K output</span>
              <span className="text-white">1 credit</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#767d88]">8K output</span>
              <span className="text-white">2 credits</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#767d88]">Expiration</span>
              <span className="text-white">Never</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <article className="relative overflow-hidden rounded-lg border border-white bg-white text-black">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_270px]">
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.35px] text-[#767d88]">Recommended pack</p>
                    <h3 className="mt-4 text-[34px] font-semibold leading-none tracking-[-0.9px] md:text-[44px]">{popularPlan.name}</h3>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(220px,1fr)] md:items-end">
                  <div>
                    <p className="text-[58px] font-semibold leading-none tracking-[-1.4px] md:text-[76px]">{popularPlan.price}</p>
                    <p className="mt-4 text-[22px] leading-tight text-[#404040]">
                      {popularPlan.credits} credits · {popularPlan.each} each
                    </p>
                  </div>
                  <div>
                    <p className="text-[16px] leading-snug text-[#767d88]">{getPlanNote(popularPlan)}</p>
                    <PlanButton
                      plan={popularPlan}
                      mode={ctaMode}
                      pending={pending}
                      onPurchase={onPurchase}
                      className="mt-6 inline-flex w-full items-center justify-center rounded border-2 border-black bg-black px-5 py-4 text-[16px] font-semibold text-white transition hover:bg-white hover:text-black disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid border-t border-[#d0d4d4] bg-[#f3f4f6] p-6 text-[14px] text-[#404040] lg:border-l lg:border-t-0">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.35px] text-[#767d88]">Why this one</p>
                  <ul className="mt-5 space-y-3">
                    <li>15 credits gives enough range for several prompt directions.</li>
                    <li>Lower unit cost than Starter without committing to team volume.</li>
                    <li>Good fit for validating one product or campaign concept.</li>
                  </ul>
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-5 md:grid-cols-3">
            {supportingPlans.map((plan) => (
              <article key={plan.id} className="flex min-h-[280px] flex-col rounded-lg border border-[#27272a] bg-[#1a1a1a] p-6">
                <h3 className="text-[24px] font-normal leading-none tracking-[-0.4px] text-white">{plan.name}</h3>
                <p className="mt-8 text-[44px] font-semibold leading-none tracking-[-1px] text-white">{plan.price}</p>
                <p className="mt-4 text-[17px] leading-tight text-[#c9ccd1]">
                  {plan.credits} credits · {plan.each} each
                </p>
                <p className="mt-4 text-[14px] leading-snug text-[#767d88]">{getPlanNote(plan)}</p>
                <PlanButton
                  plan={plan}
                  mode={ctaMode}
                  pending={pending}
                  onPurchase={onPurchase}
                  className="mt-auto inline-flex w-full items-center justify-center rounded border border-white/45 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-white hover:text-black disabled:opacity-50"
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

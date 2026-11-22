import Link from 'next/link'

export type PricingPlan = {
  id: string; name: string; price: string; credits: number; each: string; popular?: boolean; note?: string
}
type Props = {
  plans: PricingPlan[]; eyebrow?: string; title?: string; description?: string; balance?: number | null
  ctaMode?: 'link' | 'purchase'; pending?: boolean; onPurchase?: (planId: string) => void
}
const notes: Record<string, string> = {
  starter: 'A small first pack to try your own product.',
  standard: 'More room to compare backgrounds and lighting.',
  pro: 'Build a complete product image collection.',
  power: 'For stores creating new images regularly.',
}
export function PricingShowcase({ plans, eyebrow = 'Simple pricing', title = 'Choose a pack. Keep your credits.', description = 'One-time payment. No subscription. Credits never expire.', balance, ctaMode = 'link', pending = false, onPurchase }: Props) {
  if (!plans.length) return null
  return <section className="border-y border-[#27272a] bg-black py-10 text-white md:py-16">
    <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14">
      <p className="text-xs font-medium uppercase tracking-wider text-[#a7a7a7]">{eyebrow}</p>
      <h2 className="mt-3 text-[30px] leading-tight md:text-[42px]">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#a7a7a7]">{description}</p>
      {typeof balance === 'number' && <p className="mt-4 text-sm">Your balance: <strong>{balance} credits</strong></p>}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map(plan => <article key={plan.id} className={`flex min-w-0 flex-col rounded-lg border p-5 ${plan.popular ? 'border-white bg-white text-black' : 'border-[#3f3f46] bg-[#141414] text-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            {plan.popular && <span className="rounded bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Best value to start</span>}
          </div>
          <p className="mt-5 text-[40px] font-semibold leading-none tracking-tight">{plan.price}<span className={`ml-2 text-xs font-normal tracking-normal ${plan.popular ? 'text-[#52525b]' : 'text-[#a7a7a7]'}`}>USD</span></p>
          <p className="mt-3 text-base font-medium">{plan.credits} credits · {plan.each} / credit</p>
          <p className={`mt-2 text-sm ${plan.popular ? 'text-[#52525b]' : 'text-[#a7a7a7]'}`}>Up to {plan.credits} images in 4K, or {Math.floor(plan.credits / 2)} in 8K</p>
          <p className={`mb-6 mt-4 text-sm leading-relaxed ${plan.popular ? 'text-[#52525b]' : 'text-[#a7a7a7]'}`}>{plan.note ?? notes[plan.id]}</p>
          {ctaMode === 'purchase' ? <button type="button" onClick={() => onPurchase?.(plan.id)} disabled={pending} className={`mt-auto min-h-12 w-full rounded px-3 py-3 text-sm font-semibold transition disabled:opacity-50 ${plan.popular ? 'bg-black text-white hover:bg-[#333]' : 'bg-white text-black hover:bg-[#e9ecf2]'}`}>{pending ? 'Opening checkout…' : `Get ${plan.name} — ${plan.price}`}</button>
            : <Link href={`/pricing?pack=${plan.id}`} className={`mt-auto inline-flex min-h-12 items-center justify-center rounded px-3 py-3 text-sm font-semibold ${plan.popular ? 'bg-black text-white' : 'bg-white text-black'}`}>Choose {plan.name}</Link>}
        </article>)}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-[#a7a7a7]">1 credit = one 4K image. 2 credits = one 8K image. Mix both resolutions in any pack.</p>
    </div>
  </section>
}

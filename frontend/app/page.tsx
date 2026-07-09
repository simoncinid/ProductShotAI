'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { DynamicBackdropSection } from '@/components/DynamicBackdropSection'
import { PricingShowcase, type PricingPlan } from '@/components/PricingShowcase'

const CONTAINER = 'mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 lg:px-14'

function SectionScript({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-[14px] font-medium uppercase tracking-[0.35px] ${light ? 'text-muted-dark' : 'text-muted'}`}>
      {children}
    </p>
  )
}

function SectionH2({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2 className={`mt-2 text-[28px] font-normal leading-none md:text-[36px] lg:text-[40px] ${light ? 'text-primary' : 'text-on-dark'}`}>
      {children}
    </h2>
  )
}

const HERO_RESULTS = ['/images/res1.png', '/images/res2.png', '/images/res3.png'] as const

const HOW_STEPS = [
  {
    n: '01',
    title: 'Set Your Brand DNA',
    text: 'Define tone, visual style, and constraints once. ProductShotAI keeps every generation aligned automatically.',
    bullets: ['Brand tone and visual rules', 'Marketplace context', 'Reusable style memory'],
  },
  {
    n: '02',
    title: 'Upload Product Reference',
    text: 'Provide one clear product shot. The model isolates key geometry and texture for consistent placement in scenes.',
    bullets: ['PNG/JPG upload', 'Product isolation', 'Angle-safe reconstruction'],
  },
  {
    n: '03',
    title: 'Generate Prompt Set',
    text: 'Get conversion-oriented prompts for lifestyle, studio, detail and ad compositions, already adapted to your brand.',
    bullets: ['Prompt presets', 'AI prompt rewriting', 'Manual override'],
  },
  {
    n: '04',
    title: 'Export 8K Results',
    text: 'Generate clean outputs for Amazon and e-commerce. Iterate in Creative Hub, then download and publish.',
    bullets: ['4K/8K output', 'Creative Hub refinements', 'Production-ready downloads'],
  },
] as const

function HeroStudioPreview() {
  return (
    <div className="relative overflow-hidden rounded border border-[#27272a] bg-anthracite">
      <div className="grid grid-cols-[110px,1fr]">
        <aside className="border-r border-on-dark/10 bg-rich-black/70 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Studio</p>
          <div className="mt-3 space-y-2">
            {['Brand', 'Product', 'Prompts', 'Results'].map((item, i) => (
              <div
                key={item}
                className={`rounded-lg px-2 py-1.5 text-[11px] ${i === 2 ? 'bg-brand/30 text-on-dark' : 'bg-on-dark/8 text-muted'}`}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>
        <div className="p-4">
          <div className="grid gap-3 md:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-xl border border-on-dark/15 bg-page-bg/45 p-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted">Reference</p>
              <div className="mt-2 rounded-lg bg-on-dark/5 p-2">
                <Image src="/images/product1.png" alt="Product reference" width={300} height={220} className="h-36 w-full object-contain" />
              </div>
            </div>
            <div className="rounded-xl border border-on-dark/15 bg-page-bg/45 p-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted">Prompt Set</p>
              <div className="mt-2 space-y-2 text-[11px] text-muted">
                <p className="rounded-md bg-on-dark/7 px-2 py-1.5">Lifestyle hero shot with warm light</p>
                <p className="rounded-md bg-on-dark/7 px-2 py-1.5">Studio clean front angle for listing</p>
                <p className="rounded-md bg-on-dark/7 px-2 py-1.5">Macro texture detail with contrast</p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {HERO_RESULTS.map((src) => (
              <div key={src} className="overflow-hidden rounded-lg border border-on-dark/15 bg-on-dark/5">
                <Image src={src} alt="" width={220} height={150} className="h-20 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HowItWorksGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {HOW_STEPS.map((step) => (
        <article key={step.n} className="rounded border border-[#27272a] bg-[#1a1a1a] p-5 transition-smooth hover:border-[#c9ccd1]">
          <div className="flex items-center gap-3">
            <span className="rounded border border-[#27272a] px-2.5 py-1 text-[11px] font-medium text-muted">{step.n}</span>
            <h3 className="text-[18px] font-normal text-white">{step.title}</h3>
          </div>
          <p className="mt-3 text-[14px] leading-snug text-[#a7a7a7]">{step.text}</p>
          <ul className="mt-4 space-y-1.5">
            {step.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-[13px] text-[#c9ccd1]">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#767d88]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [faqCompactOpen, setFaqCompactOpen] = useState<number | null>(0)

  const faqItems = [
    { q: 'How do I get started?', a: 'Sign up, purchase a credit pack, and start generating professional product photos right away.' },
    { q: 'Do I need a subscription?', a: "No! We don't offer subscriptions. You only pay for the credits you need, when you need them." },
    { q: 'What image formats do you support?', a: 'We accept JPEG and PNG uploads. All outputs are delivered as high-quality JPEG images in 8K resolution.' },
    { q: 'What aspect ratios are available?', a: '1:1 (square, perfect for Amazon), 4:5 (portrait), and 16:9 (landscape). Default is 1:1.' },
    { q: 'How long does generation take?', a: 'Most generations complete within 30–60 seconds. You\'ll see a progress indicator while waiting.' },
    { q: 'Can I use these images on Amazon?', a: "Yes! Our images are optimized for Amazon product listings. Always check Amazon's current image policies for your category." },
  ]

  const faqCompact = [
    { q: 'How do I get started?', a: 'Sign up, buy credits, start generating. No subscription.' },
    { q: 'Do I need a subscription?', a: 'No. Pay only for the credits you need. Credits never expire.' },
    { q: 'What image formats?', a: 'JPEG and PNG in, 8K JPEG out, Amazon-optimized.' },
  ]

  const pricing: PricingPlan[] = [
    { id: 'starter', name: 'Starter', price: '$4.95', credits: 5, each: '$0.99' },
    { id: 'standard', name: 'Standard', price: '$13.35', credits: 15, each: '$0.89', popular: true },
    { id: 'pro', name: 'Pro', price: '$31.60', credits: 40, each: '$0.79' },
    { id: 'power', name: 'Power', price: '$69.00', credits: 100, each: '$0.69' },
  ]

  return (
    <div className="bg-page-bg">
      {/* ——— Hero ——— */}
      <section className="relative flex h-[calc(100vh-72px)] overflow-hidden bg-page-bg">
        <Image src="/images/res6.jpeg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/78" aria-hidden />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.56)_38%,rgba(0,0,0,0.42)_72%,rgba(0,0,0,0.64)_100%)]" aria-hidden />

        <div className={`${CONTAINER} relative flex h-full items-center`}>
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-x-16">
            <div className="hidden lg:flex lg:flex-col lg:items-start">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.35px] text-muted sm:text-xs">Product Photo AI & AI Image Product</p>
              <h1 className="font-normal leading-none text-on-dark [font-size:clamp(36px,5vw,56px)]">
                Studio Quality
                <br />
                Product Shots
                <br />
                in Seconds
              </h1>
              <p className="mt-4 max-w-md text-[14px] leading-snug text-[#c9ccd1] sm:text-[16px] md:text-[18px]">
                Create stunning product photo AI in 8K. Works for e‑commerce and Amazon. No photographer. No subscription. Pay per image.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded bg-white px-6 py-3 text-[14px] font-semibold text-black transition-smooth hover:bg-[#e9ecf2] sm:px-8 sm:py-3.5 sm:text-base"
                >
                  Get Started
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded border border-white/30 bg-transparent px-6 py-3 text-[14px] font-semibold text-white transition-smooth hover:bg-white hover:text-black sm:px-8 sm:py-3.5 sm:text-base"
                >
                  Learn More
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-muted sm:text-[12px] md:text-[13px]">
                Sign up, buy credits, create product photos. No subscription.
              </p>
            </div>

            <div className="order-1 flex flex-col items-center text-center lg:hidden">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.35px] text-muted sm:text-xs">Product Photo AI & AI Image Product</p>
              <h1 className="font-normal leading-none text-on-dark [font-size:clamp(34px,10vw,52px)]">
                Studio-Quality
                <br />
                Product Shots
                <br />
                in Seconds
              </h1>
              <p className="mt-3 max-w-md text-[14px] leading-snug text-[#c9ccd1] sm:text-[16px] md:text-[18px] mx-auto">
                Create stunning product photo AI in 8K. Works for e‑commerce and Amazon. No photographer. No subscription. Pay per image.
              </p>
            </div>

            <div className="order-2 lg:flex lg:items-start lg:min-w-0 lg:self-start">
              <div className="relative w-full min-w-0 max-w-full">
                <HeroStudioPreview />
              </div>
            </div>

            <div className="order-3 flex flex-col items-center lg:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded bg-white px-6 py-3 text-[14px] font-semibold text-black transition-smooth hover:bg-[#e9ecf2] sm:px-8 sm:py-3.5 sm:text-base"
                >
                  Get Started
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded border border-white/30 bg-transparent px-6 py-3 text-[14px] font-semibold text-white transition-smooth hover:bg-white hover:text-black sm:px-8 sm:py-3.5 sm:text-base"
                >
                  Learn More
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-muted sm:text-[12px] md:text-[13px]">
                Sign up, buy credits, create product photos. No subscription.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divisore curvo Hero → How it works */}
      <div className="relative -mt-px h-8 w-full overflow-hidden bg-page-bg md:h-16">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— How it works ——— */}
      <section className="bg-page-bg pb-12 pt-10 md:pb-28 md:pt-20">
        <div className={CONTAINER}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="h-px w-8 bg-muted md:w-12" />
              <SectionScript>How It Works</SectionScript>
              <span className="h-px w-8 bg-muted md:w-12" />
            </div>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] text-gray-300 md:mt-4 md:text-[16px]">
              A clear 4-step production system from brand setup to final 8K outputs.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-5xl md:mt-14">
            <HowItWorksGrid />
          </div>
        </div>
      </section>

      <DynamicBackdropSection
        eyebrow="ProductShotAI Intelligence"
        title="Turn a single product reference into campaign-ready worlds, controlled by brand memory and production rules."
        ctaLabel="Open Studio"
        ctaHref="/dashboard"
        image="/images/res5.jpeg"
        items={[
          {
            title: 'Brand Memory',
            text: 'Store visual rules once and reuse them across every generation, from clean catalog shots to campaign scenes.',
            href: '/dashboard/brand-identity',
          },
          {
            title: 'Scene Direction',
            text: 'Generate product prompts that preserve the item while changing lighting, context, framing and visual intent.',
            href: '/dashboard/create',
          },
          {
            title: 'Production Sets',
            text: 'Move from one approved image to complete image sets for marketplaces, PDP galleries and paid social tests.',
            href: '/dashboard/shooting',
          },
        ]}
      />

      {/* ——— Pricing ——— */}
      <PricingShowcase
        plans={pricing}
        title="Pricing that follows production volume."
        description="Standard is highlighted because it gives enough credits to test several visual directions without committing to a large pack."
      />

      {/* ——— Trusted by Amazon Sellers ——— */}
      <section className="bg-page-bg pb-12 pt-10 md:pb-28 md:pt-20">
        <div className={CONTAINER}>
          <div className="text-center">
            <SectionScript>Trusted by Amazon Sellers</SectionScript>
            <p className="mx-auto mt-2 max-w-xl text-[14px] text-gray-300 md:mt-3 md:text-[16px]">
              Our product photo AI help sellers create <strong className="text-on-dark">Amazon product photos</strong> that convert. 8K quality.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:gap-12">
            {/* Testimonial cards */}
            <div className="flex flex-col gap-4 lg:gap-6">
              {[
                { text: 'ProductShotAI saved me thousands on photography. The quality is amazing and the process is so fast.', name: 'Sarah M.', role: 'Amazon Seller' },
                { text: "I love that I only pay for what I use. No monthly fees, no commitments. Perfect for my business.", name: 'John D.', role: 'E-commerce Entrepreneur' },
              ].map((t, i) => (
                <div
                  key={i}
                  className="rounded-[20px] bg-anthracite p-4 shadow-card-hover transition-smooth hover:-translate-y-1 sm:p-6"
                >
                  <div className="mb-2 flex gap-0.5 text-brand sm:mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed text-on-dark sm:text-[15px]">{t.text}</p>
                  <p className="mt-3 text-[13px] text-muted sm:mt-4 sm:text-[14px]">{t.name} · {t.role}</p>
                </div>
              ))}
            </div>

            {/* Compact FAQ accordion */}
            <div className="rounded-[20px] border border-muted/60 bg-cream p-4 shadow-soft sm:p-6">
              <h3 className="mb-3 text-[15px] font-semibold text-primary sm:mb-4 sm:text-base">Quick answers</h3>
              <div className="space-y-2">
                {faqCompact.map((f, i) => (
                  <div key={i} className="rounded-lg border border-muted/40">
                    <button
                      onClick={() => setFaqCompactOpen(faqCompactOpen === i ? null : i)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-semibold text-primary"
                    >
                      {f.q}
                      <span className={`ml-2 shrink-0 transition-transform ${faqCompactOpen === i ? 'rotate-90' : ''}`}>
                        <svg className="h-4 w-4 text-muted-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                    {faqCompactOpen === i && (
                      <p className="border-t border-gray-100 px-4 py-3 text-[13px] text-muted-dark">{f.a}</p>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/faq" className="mt-4 inline-block text-[14px] font-semibold text-anthracite hover:underline">
                View All FAQs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Extended FAQ ——— */}
      <section className="border-t border-muted/60 bg-cream py-12 md:py-24">
        <div className={CONTAINER}>
          <div className="text-center">
            <SectionScript light>Frequently Asked Questions</SectionScript>
            <SectionH2 light>Everything you need to know</SectionH2>
          </div>

          <div className="mx-auto mt-8 max-w-3xl space-y-3 md:mt-14 md:space-y-4">
            {faqItems.map((f, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border border-muted/60 bg-cream transition-smooth hover:shadow-soft ${
                  faqOpen === i ? 'shadow-soft' : ''
                }`}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-[16px] font-semibold text-primary"
                >
                  {f.q}
                  <span className={`ml-4 shrink-0 transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>
                    <svg className={`h-5 w-5 text-muted-dark transition-transform ${faqOpen === i ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-200 ease-out ${
                    faqOpen === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-gray-100 px-6 pb-4 pt-0 text-[14px] leading-relaxed text-muted-dark">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA finale ——— */}
      <section className="relative overflow-hidden bg-anthracite py-14 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-anthracite via-anthracite to-primary/90" aria-hidden />
        <div className={`${CONTAINER} relative text-center`}>
          <h2 className="text-[22px] font-bold leading-tight text-on-dark sm:text-3xl md:text-4xl">Ready to Create Your AI Product Photo?</h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-muted md:mt-4 md:text-[16px]">Sign up and buy credits. AI product photos in seconds.</p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-on-brand shadow-soft-hover transition-smooth hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-card-hover md:mt-8 md:px-10 md:py-4 md:text-lg"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer: gestito da layout, ma per coerenza visiva la CTA è sopra. Il Footer è nel layout. */}
    </div>
  )
}

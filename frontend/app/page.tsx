'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import ProductShotAIMotion from '@/components/ProductShotAIMotion'
import { ResultGalleryModal } from '@/components/ResultGalleryModal'

const CONTAINER = 'mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 lg:px-14'

/** Section title in Playfair italic (same font as hero "Shots"/"Seconds"). Use light when section has light bg. */
function SectionScript({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`font-playfair-italic text-xl md:text-2xl lg:text-3xl ${light ? 'text-primary' : 'text-on-dark'}`}>
      {children}
    </p>
  )
}

function SectionH2({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2 className={`mt-1 text-[22px] md:text-[28px] font-bold leading-tight lg:text-[34px] ${light ? 'text-primary' : 'text-on-dark'}`}>
      {children}
    </h2>
  )
}

// Esempi di prompt (stessi del motion) e immagini risultati per How It Works
const PROMPT_EXAMPLES = [
  { tag: 'Lifestyle', text: 'Outdoor café, morning light, leather bag on table with coffee and sunglasses, lifestyle shot, on-brand for e-commerce.' },
  { tag: 'Flat lay', text: 'Flat lay of open bag with laptop and accessories, top-down view, soft light, minimalist background, e-commerce ready.' },
  { tag: 'Macro', text: 'Macro of brass buckle and leather texture, stitching details, shallow depth of field, premium look for product zoom.' },
] as const
const RESULT_IMAGES = ['/images/res1.png', '/images/res2.png', '/images/res3.png'] as const
const PRODUCT_IMAGE = '/images/product1.png'

const HOW_STEPS = [
  {
    n: 1,
    title: 'Brand Identity',
    desc: 'Tell us about your brand: style, colors, mood and where you sell. The AI will follow these guidelines every time it generates images for your products.',
    icon: '/icone/bradIdentity.png',
    media: 'icon' as const,
  },
  {
    n: 2,
    title: 'Upload Product',
    desc: 'Drop a photo of your product. We isolate the product so the AI can place it in any scene—lifestyle, flat lay, macro or studio.',
    media: 'product' as const,
  },
  {
    n: 3,
    title: 'Brand-matched Prompts',
    desc: 'We generate prompts that match your brand. Review and customize them, then trigger the generation to get your photoshoot.',
    media: 'prompts' as const,
  },
  {
    n: 4,
    title: 'Results',
    desc: 'Here are your on-brand variations in 8K, ready for e‑commerce and Amazon. Download and use them right away.',
    media: 'results' as const,
  },
]

// Layout: mobile = colonna (titolo → media full width → testo), desktop = due colonne come prima
const MEDIA_BOX_CLASS = 'h-[200px] w-full md:h-[240px] md:w-[240px] shrink-0'
const MEDIA_BOX_LEFT_COL = 'hidden md:flex shrink-0 flex-col border-r border-muted/40 bg-muted/10 p-4 md:p-5'

/** Prompt box: tag in alto, testo che riempie tutto il div */
function PromptBox({ tag, text, className = '' }: { tag: string; text: string; className?: string }) {
  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-muted/60 bg-cream p-2 text-left md:p-2 ${className}`}>
      <span className="shrink-0 truncate rounded bg-brand/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary md:text-[10px]">{tag}</span>
      <p className="min-h-0 flex-1 overflow-y-auto text-[9px] leading-tight text-primary md:text-[10px]">{text}</p>
    </div>
  )
}

/** Cella immagine risultato: cliccabile + icona espansione in basso (sempre visibile) */
function ResultImageCell({ src, index, onExpand }: { src: string; index: number; onExpand: (i: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onExpand(index)}
      className="group flex flex-col overflow-hidden rounded-lg bg-muted/20 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
    >
      <span className="relative block min-h-0 flex-1">
        <Image src={src} alt="" width={80} height={80} className="h-full w-full object-cover transition group-hover:opacity-95" />
      </span>
      <span className="flex shrink-0 items-center justify-center bg-primary/80 py-1.5 text-on-dark" aria-hidden>
        <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </span>
    </button>
  )
}

function StepCard({ step, isActive, onResultImageClick }: { step: (typeof HOW_STEPS)[0]; isActive?: boolean; onResultImageClick?: (index: number) => void }) {
  const { n, title, desc, media } = step
  return (
    <div
      className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-cream shadow-soft transition-all duration-300 md:flex-row md:rounded-3xl ${
        isActive ? 'border-brand/50 shadow-soft-hover scale-[1.02]' : 'border-muted/40 hover:border-brand/30 hover:shadow-soft-hover hover:scale-[1.01]'
      }`}
    >
      {/* Mobile: riga 1 — numero + titolo */}
      <div className="flex flex-row items-center gap-3 border-b border-muted/40 p-4 md:hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
          {n}
        </div>
        <h3 className="min-w-0 break-words text-base font-semibold text-primary">{title}</h3>
      </div>

      {/* Colonna 1 (desktop) */}
      <div className={MEDIA_BOX_LEFT_COL}>
        <div className="mb-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand md:h-9 md:w-9">
          {n}
        </div>
        <div className={`flex items-center justify-center overflow-hidden rounded-xl bg-cream shadow-sm ${MEDIA_BOX_CLASS} md:rounded-xl`}>
          {media === 'icon' && (
            <Image src="/icone/bradIdentity.png" alt="" width={120} height={120} className="h-16 w-16 object-contain md:h-20 md:w-20" />
          )}
          {media === 'product' && (
            <Image src={PRODUCT_IMAGE} alt="Product" width={200} height={200} className="h-full w-full object-contain p-3 md:p-2" />
          )}
          {media === 'prompts' && (
            <div className="grid h-full w-full grid-cols-3 grid-rows-1 gap-2 p-2 md:gap-1.5 md:p-2">
              {PROMPT_EXAMPLES.map((p, i) => (
                <PromptBox key={i} tag={p.tag} text={p.text} className="h-full" />
              ))}
            </div>
          )}
          {media === 'results' && (
            <div className="grid h-full w-full grid-cols-3 gap-2 p-2 md:gap-1.5 md:p-2">
              {RESULT_IMAGES.map((src, i) => (
                <ResultImageCell key={i} src={src} index={i} onExpand={onResultImageClick ?? (() => {})} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: blocco media a tutta larghezza */}
      <div className="flex w-full px-4 py-4 md:hidden">
        <div className={`flex w-full items-stretch justify-center overflow-hidden rounded-xl bg-muted/10 ${MEDIA_BOX_CLASS}`}>
          {media === 'icon' && (
            <div className="flex items-center justify-center">
              <Image src="/icone/bradIdentity.png" alt="" width={100} height={100} className="h-20 w-20 object-contain" />
            </div>
          )}
          {media === 'product' && (
            <Image src={PRODUCT_IMAGE} alt="Product" width={200} height={200} className="h-full w-full max-h-[200px] object-contain p-4" />
          )}
          {media === 'prompts' && (
            <div className="grid h-full w-full grid-cols-3 grid-rows-1 gap-2 p-3">
              {PROMPT_EXAMPLES.map((p, i) => (
                <PromptBox key={i} tag={p.tag} text={p.text} className="h-full" />
              ))}
            </div>
          )}
          {media === 'results' && (
            <div className="grid w-full grid-cols-3 gap-2 p-3">
              {RESULT_IMAGES.map((src, i) => (
                <ResultImageCell key={i} src={src} index={i} onExpand={onResultImageClick ?? (() => {})} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Colonna 2: titolo (solo desktop) + testo */}
      <div className="flex min-w-0 flex-1 flex-col justify-start p-4 md:p-5 md:pt-5">
        <h3 className="mb-3 hidden min-w-0 break-words text-[15px] font-semibold text-primary md:block md:text-base">{title}</h3>
        <p className="min-w-0 flex-1 break-words text-[13px] leading-relaxed text-muted-dark md:text-[14px]">{desc}</p>
      </div>
    </div>
  )
}

const TOTAL_STEPS = HOW_STEPS.length
const CAROUSEL_START_DELAY_MS = 2500
const CAROUSEL_INTERVAL_MS = 4500

function HowItWorksCarousel({ sectionRef, onResultImageClick }: { sectionRef: React.RefObject<HTMLElement | null>; onResultImageClick?: (index: number) => void }) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((i: number) => {
    const next = (i + TOTAL_STEPS) % TOTAL_STEPS
    setIndex(next)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(
      () => setIndex((prev: number) => (prev + 1) % TOTAL_STEPS),
      CAROUSEL_INTERVAL_MS
    )
  }, [])

  // Start carousel only when section is visible, after a short delay
  useEffect(() => {
    const el = sectionRef?.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) {
          if (delayRef.current) clearTimeout(delayRef.current)
          if (intervalRef.current) clearInterval(intervalRef.current)
          return
        }
        setIndex(0)
        delayRef.current = setTimeout(() => {
          intervalRef.current = setInterval(
            () => setIndex((prev: number) => (prev + 1) % TOTAL_STEPS),
            CAROUSEL_INTERVAL_MS
          )
        }, CAROUSEL_START_DELAY_MS)
      },
      { threshold: 0.2, rootMargin: '0px' }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (delayRef.current) clearTimeout(delayRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sectionRef])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const slideWidth = el.offsetWidth
    el.scrollTo({ left: index * slideWidth, behavior: 'smooth' })
  }, [index])

  return (
    <div className="w-full min-w-0">
      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-hide"
      >
        {HOW_STEPS.map((step, i) => (
          <div
            key={step.n}
            className="w-full min-w-full max-w-full flex-shrink-0 snap-center px-2 py-2"
          >
            <StepCard step={step} isActive={index === i} onResultImageClick={onResultImageClick} />
          </div>
        ))}
      </div>

      {/* Nav: prev, dots, next — below the card, no overlap */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-cream text-primary shadow-soft transition hover:border-brand hover:bg-brand hover:text-on-brand md:h-11 md:w-11"
            aria-label="Previous step"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {HOW_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`rounded-full transition-all ${
                  index === i ? 'h-2.5 w-2.5 bg-brand' : 'h-2 w-2 bg-muted hover:bg-muted-dark'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-cream text-primary shadow-soft transition hover:border-brand hover:bg-brand hover:text-on-brand md:h-11 md:w-11"
            aria-label="Next step"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[12px] text-muted">
          {index + 1} / {TOTAL_STEPS}
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [faqCompactOpen, setFaqCompactOpen] = useState<number | null>(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const howItWorksSectionRef = useRef<HTMLElement>(null)

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

  const pricing = [
    { name: 'Starter', price: '$4.95', credits: 5, each: '$0.99', dark: false },
    { name: 'Standard', price: '$13.35', credits: 15, each: '$0.89', popular: true },
    { name: 'Pro', price: '$31.60', credits: 40, each: '$0.79', dark: false },
    { name: 'Power', price: '$69.00', credits: 100, each: '$0.69', dark: false },
  ]

  return (
    <div className="bg-page-bg">
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden bg-page-bg pt-12 pb-14 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32">
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-52 bg-gradient-to-t from-page-bg/80 to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-[50%] bg-brand/10 blur-2xl pointer-events-none" aria-hidden />

        <div className={`${CONTAINER} relative`}>
          {/* Mobile: title → subtitle → animation → CTA. Desktop: 2 cols with text+CTA left, ProductShotAIMotion right. */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-x-16">
            {/* Desktop: single block left (title + paragraph + CTA right below, no gap) */}
            <div className="hidden lg:flex lg:col-start-1 lg:row-start-1 lg:flex-col lg:items-start">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted sm:text-xs">Product Photo AI & AI Image Product</p>
              <h1 className="font-extrabold leading-tight text-on-dark [font-size:clamp(26px,5vw,52px)]">
                Studio Quality
                <br />
                Product <span className="font-playfair-italic text-brand">Shots</span>
                <br />
                in <span className="font-playfair-italic text-brand">Seconds</span>
              </h1>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted sm:text-[16px] md:text-[18px]">
                Create stunning product photo AI in 8K. Works for e‑commerce and Amazon. No photographer. No subscription. Pay per image.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-on-brand shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover sm:px-8 sm:py-3.5 sm:text-base"
                >
                  Get Started
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-full bg-on-dark/10 px-6 py-3 text-[14px] font-semibold text-on-dark transition-smooth hover:bg-on-dark/20 hover:shadow-soft-hover sm:px-8 sm:py-3.5 sm:text-base"
                >
                  Learn More
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-muted sm:text-[12px] md:text-[13px]">
                Sign up, buy credits, create product photos. No subscription.
              </p>
            </div>

            {/* A: titolo + sottotitolo — solo mobile */}
            <div className="order-1 flex flex-col items-center text-center lg:hidden">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted sm:text-xs">Product Photo AI & AI Image Product</p>
              <h1 className="font-extrabold leading-tight text-on-dark [font-size:clamp(26px,5vw,52px)]">
                Studio-Quality
                <br />
                Product <span className="font-playfair-italic text-brand">Shots</span>
                <br />
                in <span className="font-playfair-italic text-brand">Seconds</span>
              </h1>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted sm:text-[16px] md:text-[18px] mx-auto">
                Create stunning product photo AI in 8K. Works for e‑commerce and Amazon. No photographer. No subscription. Pay per image.
              </p>
            </div>

            {/* B: ProductShotAIMotion — stessa animazione su mobile e desktop */}
            <div className="order-2 lg:col-start-2 lg:row-start-1 lg:flex lg:items-start lg:min-w-0 lg:self-start">
              <div className="relative w-full min-w-0 max-w-full">
                <div className="hidden lg:block absolute -inset-4 rounded-3xl bg-brand/5 blur-2xl pointer-events-none" aria-hidden />
                <ProductShotAIMotion
                  logoSrc="/logo.png"
                  productSrc="/images/product1.png"
                  results={['/images/res1.png', '/images/res2.png', '/images/res3.png']}
                />
              </div>
            </div>

            {/* C: CTA + footnote — solo mobile */}
            <div className="order-3 flex flex-col items-center lg:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-on-brand shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover sm:px-8 sm:py-3.5 sm:text-base"
                >
                  Get Started
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-full bg-on-dark/10 px-6 py-3 text-[14px] font-semibold text-on-dark transition-smooth hover:bg-on-dark/20 hover:shadow-soft-hover sm:px-8 sm:py-3.5 sm:text-base"
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
      <section ref={howItWorksSectionRef} className="bg-page-bg pb-12 pt-10 md:pb-28 md:pt-20">
        <div className={CONTAINER}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="h-px w-8 bg-muted md:w-12" />
              <SectionScript>How It Works</SectionScript>
              <span className="h-px w-8 bg-muted md:w-12" />
            </div>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] text-gray-300 md:mt-4 md:text-[16px]">
              From brand identity to upload, prompts and 8K results. Here are the four steps.
            </p>
          </div>

          {/* Carousel for mobile and desktop */}
          <div className="mt-8 md:mt-14 max-w-4xl mx-auto">
            <HowItWorksCarousel
              sectionRef={howItWorksSectionRef}
              onResultImageClick={(i) => {
                setGalleryIndex(i)
                setGalleryOpen(true)
              }}
            />
          </div>
          <ResultGalleryModal
            images={RESULT_IMAGES}
            currentIndex={galleryIndex}
            open={galleryOpen}
            onClose={() => setGalleryOpen(false)}
            onIndexChange={setGalleryIndex}
          />
        </div>
      </section>

      {/* Divisore curvo How it works → Pricing */}
      <div className="relative h-8 w-full overflow-hidden bg-cream md:h-16">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute top-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 0v48h1200V0c-200 0-400 24-600 24S200 0 0 0z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— Pricing ——— */}
      <section className="relative overflow-hidden bg-cream pb-12 pt-12 md:pb-28 md:pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-page-bg/30" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="text-center">
            <SectionScript light>Simple, Transparent Pricing</SectionScript>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] text-muted-dark md:mt-4 md:text-[16px]">
              No monthly subscription. Pay only for the images you need. The more credits you buy, the less you pay per image.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`group relative flex flex-col rounded-[20px] p-4 transition-smooth sm:p-6 ${
                  p.dark ? 'bg-anthracite text-on-dark' : 'bg-cream shadow-soft'
                } ${p.popular ? 'ring-2 ring-brand ring-offset-2' : ''} hover:-translate-y-1 hover:shadow-card-hover`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold text-on-brand sm:-top-3 sm:px-3 sm:py-1 sm:text-xs">
                    Most Popular
                  </span>
                )}
                <h3 className="text-[15px] font-semibold sm:text-base text-primary">{p.name}</h3>
                <p className={`mt-2 text-[26px] font-bold sm:mt-3 sm:text-[32px] ${p.dark ? 'text-on-dark' : 'text-anthracite'}`}>{p.price}</p>
                <p className="text-[12px] text-muted-dark sm:text-[13px]">{p.credits} credits – {p.each} each</p>
                <Link
                  href="/pricing"
                  className={`mt-4 block w-full rounded-full py-2.5 text-center text-[13px] font-semibold transition-smooth sm:mt-6 sm:py-3 sm:text-[14px] ${
                    p.popular
                      ? 'bg-brand text-on-brand hover:scale-[1.02]'
                      : p.dark
                      ? 'border border-on-dark/40 text-on-dark hover:bg-on-dark/10'
                      : 'border-2 border-anthracite text-anthracite hover:bg-anthracite hover:text-on-dark'
                  }`}
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisore curvo Pricing → Trusted */}
      <div className="relative -mt-px h-8 w-full overflow-hidden bg-page-bg md:h-16">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

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

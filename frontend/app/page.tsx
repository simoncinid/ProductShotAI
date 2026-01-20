'use client'

import Link from 'next/link'
import { useState } from 'react'
import BeforeAfter from '@/components/BeforeAfter'
import ExampleGallery from '@/components/ExampleGallery'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

function SectionScript({ children }: { children: React.ReactNode }) {
  return <p className="font-script text-2xl md:text-3xl text-primary">{children}</p>
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-1 text-[28px] font-bold leading-tight text-primary md:text-[34px]">{children}</h2>
}

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [faqCompactOpen, setFaqCompactOpen] = useState<number | null>(0)

  const faqItems = [
    { q: 'How many free images do I get?', a: 'Every device gets 3 free watermarked images per month. No signup required!' },
    { q: 'Do I need a subscription?', a: "No! We don't offer subscriptions. You only pay for the credits you need, when you need them." },
    { q: 'What image formats do you support?', a: 'We accept JPEG and PNG uploads. All outputs are delivered as high-quality JPEG images in 8K resolution.' },
    { q: 'What aspect ratios are available?', a: '1:1 (square, perfect for Amazon), 4:5 (portrait), and 16:9 (landscape). Default is 1:1.' },
    { q: 'How long does generation take?', a: 'Most generations complete within 30–60 seconds. You\'ll see a progress indicator while waiting.' },
    { q: 'Can I use these images on Amazon?', a: "Yes! Our images are optimized for Amazon product listings. Always check Amazon's current image policies for your category." },
  ]

  const faqCompact = [
    { q: 'How many free images do I get?', a: '3 free watermarked images per month, no signup required.' },
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
      <section className="relative overflow-hidden bg-white pt-16 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32">
        {/* Forma fluida in basso — pointer-events-none per non intercettare i click */}
        <div className="absolute bottom-0 left-0 right-0 h-40 md:h-52 bg-gradient-to-t from-page-bg/80 to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-[50%] bg-[#FFF9E6]/60 blur-2xl pointer-events-none" aria-hidden />

        <div className={`${CONTAINER} relative`}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary">Product Photo AI & AI Image Product</p>
              <h1 className="mb-5 font-extrabold leading-tight text-primary [font-size:clamp(32px,5vw,52px)]">
                <span className="font-black text-brand [text-shadow:0_1px_3px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.1)]">Studio-Quality Product Shots</span> in Seconds
              </h1>
              <p className="mb-8 max-w-md text-[16px] leading-relaxed text-secondary md:text-[18px] mx-auto lg:mx-0">
                Create stunning product photo AI and image product ai in 8K. Our ai image product tool works for e‑commerce and Amazon product photos. No photographer. No subscription. Pay per image.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
                >
                  Try Free Now
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-full bg-anthracite px-8 py-3.5 text-base font-semibold text-white transition-smooth hover:shadow-soft-hover"
                >
                  Learn More
                </Link>
              </div>
              <p className="mt-5 text-[12px] md:text-[13px] text-secondary">
                Get 3 free watermarked images per month. No credit card required.
              </p>
            </div>

            <div className="order-1 lg:order-2 relative">
              {/* Alone giallo tenue dietro — pointer-events-none per non intercettare i click */}
              <div className="absolute -inset-4 rounded-3xl bg-brand/5 blur-2xl pointer-events-none" aria-hidden />
              <BeforeAfter />
            </div>
          </div>
        </div>
      </section>

      {/* Divisore curvo Hero → How it works */}
      <div className="relative -mt-px h-12 w-full overflow-hidden bg-page-bg md:h-16">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-white" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— How it works ——— */}
      <section className="bg-page-bg pb-20 pt-16 md:pb-28 md:pt-20">
        <div className={CONTAINER}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-gray-300" />
              <SectionScript>How It Works</SectionScript>
              <span className="h-px w-12 bg-gray-300" />
            </div>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              { n: 1, title: 'Upload Your Photo', desc: 'Upload a photo of your product. We support JPEG and PNG. Works for any ai product photo or product photo ai use.' },
              { n: 2, title: 'Describe Your Vision', desc: 'Write a prompt for your ai image product. Our product photo AI understands e‑commerce and Amazon product photo style.' },
              { n: 3, title: 'Get Your Image', desc: 'Receive 8K image product ai in seconds. Optimized for Amazon product photos and any marketplace. Download and use.' },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="group flex flex-col items-center rounded-2xl p-8 transition-smooth hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand">
                  <span className="text-xl font-bold text-primary">{n}</span>
                </div>
                <h3 className="text-base font-semibold text-primary">{title}</h3>
                <p className="mt-2 text-center text-[14px] leading-relaxed text-secondary">{desc}</p>
              </div>
            ))}
          </div>

          {/* Example: before6 → prompt → after6 (gallery mobile, griglia desktop) */}
          <ExampleGallery />
        </div>
      </section>

      {/* Divisore curvo How it works → Pricing */}
      <div className="relative h-12 w-full overflow-hidden bg-white md:h-16">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute top-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 0v48h1200V0c-200 0-400 24-600 24S200 0 0 0z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— Pricing ——— */}
      <section className="relative overflow-hidden bg-white pb-20 pt-20 md:pb-28 md:pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-page-bg/30" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="text-center">
            <SectionScript>Simple, Transparent Pricing</SectionScript>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] text-secondary">
              No monthly subscription. Pay only for the images you need. The more credits you buy, the less you pay per image.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`group relative flex flex-col rounded-[20px] p-6 transition-smooth ${
                  p.dark ? 'bg-anthracite text-white' : 'bg-white shadow-soft'
                } ${p.popular ? 'ring-2 ring-brand ring-offset-2' : ''} hover:-translate-y-1 hover:shadow-card-hover`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-primary">
                    Most Popular
                  </span>
                )}
                <h3 className="text-base font-semibold">{p.name}</h3>
                <p className={`mt-3 text-[32px] font-bold ${p.dark ? 'text-white' : 'text-brand'}`}>{p.price}</p>
                <p className="text-[13px] text-secondary">{p.credits} credits – {p.each} each</p>
                <Link
                  href="/pricing"
                  className={`mt-6 block w-full rounded-full py-3 text-center text-[14px] font-semibold transition-smooth ${
                    p.popular
                      ? 'bg-brand text-primary hover:scale-[1.02]'
                      : p.dark
                      ? 'border border-white/40 text-white hover:bg-white/10'
                      : 'border-2 border-anthracite text-anthracite hover:bg-anthracite hover:text-white'
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
      <div className="relative -mt-px h-12 w-full overflow-hidden bg-page-bg md:h-16">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-white" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— Trusted by Amazon Sellers ——— */}
      <section className="bg-page-bg pb-20 pt-16 md:pb-28 md:pt-20">
        <div className={CONTAINER}>
          <div className="text-center">
            <SectionScript>Trusted by Amazon Sellers</SectionScript>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-secondary md:text-[16px]">
              Our product photo AI and ai image product help sellers create <strong className="text-primary">Amazon product photos</strong> that convert. Image product ai in 8K.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Testimonial cards */}
            <div className="flex flex-col gap-6">
              {[
                { text: 'ProductShotAI saved me thousands on photography. The quality is amazing and the process is so fast.', name: 'Sarah M.', role: 'Amazon Seller' },
                { text: "I love that I only pay for what I use. No monthly fees, no commitments. Perfect for my business.", name: 'John D.', role: 'E-commerce Entrepreneur' },
              ].map((t, i) => (
                <div
                  key={i}
                  className="rounded-[20px] bg-anthracite p-6 shadow-card-hover transition-smooth hover:-translate-y-1"
                >
                  <div className="mb-3 flex gap-0.5 text-brand">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[15px] leading-relaxed text-white">{t.text}</p>
                  <p className="mt-4 text-[14px] text-gray-400">{t.name} · {t.role}</p>
                </div>
              ))}
            </div>

            {/* FAQ compatto accordion */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-soft">
              <h3 className="mb-4 text-base font-semibold text-primary">Quick answers</h3>
              <div className="space-y-2">
                {faqCompact.map((f, i) => (
                  <div key={i} className="rounded-lg border border-gray-100">
                    <button
                      onClick={() => setFaqCompactOpen(faqCompactOpen === i ? null : i)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-semibold text-primary"
                    >
                      {f.q}
                      <span className={`ml-2 shrink-0 transition-transform ${faqCompactOpen === i ? 'rotate-90' : ''}`}>
                        <svg className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                    {faqCompactOpen === i && (
                      <p className="border-t border-gray-100 px-4 py-3 text-[13px] text-secondary">{f.a}</p>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/faq" className="mt-4 inline-block text-[14px] font-semibold text-brand hover:underline">
                View All FAQs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— FAQ estesa ——— */}
      <section className="border-t border-gray-200 bg-white py-20 md:py-24">
        <div className={CONTAINER}>
          <div className="text-center">
            <SectionScript>Frequently Asked Questions</SectionScript>
            <SectionH2>Everything you need to know</SectionH2>
          </div>

          <div className="mx-auto mt-14 max-w-3xl space-y-4">
            {faqItems.map((f, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border border-gray-200 bg-white transition-smooth hover:shadow-soft ${
                  faqOpen === i ? 'shadow-soft' : ''
                }`}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-[16px] font-semibold text-primary"
                >
                  {f.q}
                  <span className={`ml-4 shrink-0 transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>
                    <svg className={`h-5 w-5 text-secondary transition-transform ${faqOpen === i ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <p className="border-t border-gray-100 px-6 pb-4 pt-0 text-[14px] leading-relaxed text-secondary">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA finale ——— */}
      <section className="relative overflow-hidden bg-anthracite py-20 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-anthracite via-anthracite to-primary/90" aria-hidden />
        <div className={`${CONTAINER} relative text-center`}>
          <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">Ready to Create Your AI Product Photo?</h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-gray-400">Try our product photo AI with 3 free images. No credit card. ai image product and image product ai in seconds.</p>
          <Link
            href="/create"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-10 py-4 text-lg font-semibold text-primary shadow-soft-hover transition-smooth hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer: gestito da layout, ma per coerenza visiva la CTA è sopra. Il Footer è nel layout. */}
    </div>
  )
}

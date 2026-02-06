import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

export const metadata: Metadata = {
  title: 'Etsy Product Photos – AI Images for Handmade Candles & Crafts',
  description:
    'Create Etsy-ready product photos for handmade multi-wick candles and crafts. Cozy lifestyle scenes, macro details and flat lays generated with AI.',
  openGraph: {
    title: 'Etsy Product Photos with AI – ProductShotAI',
    description:
      'Generate warm, story-driven Etsy product photos for multi-wick candles and handmade products. Lifestyle, macro and packaging shots from one upload.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'}/use-cases/etsy-product-photos`,
  },
}

const PROMPTS = [
  'Cozy living room scene at golden hour, multi-wick candle lit on rustic wooden coffee table, soft blanket and book in background, warm ambient glow.',
  'Styled flat lay of the candle and lid on linen fabric, matches and dried flowers around, top-down view, soft diffused daylight.',
  'Macro close-up of the burning wicks and melted wax pool, focus on flame and texture, blurred background, intimate moody lighting.',
  'Packaging-focused shot with candle, box and label clearly visible on neutral backdrop, gentle shadow, ideal for Etsy listing thumbnail.',
] as const

export default function EtsyUseCasePage() {
  return (
    <div className="bg-page-bg">
      {/* Hero */}
      <section className="relative overflow-hidden bg-page-bg pt-16 pb-14 md:pt-20 md:pb-18 lg:pt-24 lg:pb-20">
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted sm:text-xs">
                Use case · Etsy sellers
              </p>
              <h1 className="text-[28px] font-extrabold leading-tight text-on-dark md:text-[34px] lg:text-[40px]">
                Etsy product photos for handmade candles
              </h1>
              <p className="mt-4 max-w-xl text-[15px] text-muted md:text-[16px]">
                Turn a simple shot of your multi‑wick candle into a complete Etsy photo set: cozy lifestyle scenes, macro details and packaging
                images that tell the story behind your brand.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-[14px] font-semibold text-on-brand shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
                >
                  Start free Etsy shoot
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-on-dark/10 px-7 py-3 text-[14px] font-semibold text-on-dark transition-smooth hover:bg-on-dark/20 hover:shadow-soft-hover"
                >
                  Login for full photoshooting
                </Link>
              </div>
              <p className="mt-3 text-[12px] text-muted">
                Upload one candle photo, get multiple Etsy-ready images in minutes with ProductShotAI.
              </p>
            </div>

            <div className="relative hidden justify-end md:flex">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute -inset-6 rounded-[32px] bg-brand/10 blur-2xl" aria-hidden />
                <div className="relative rounded-[28px] border border-muted/60 bg-cream p-4 shadow-card-hover">
                  <div className="rounded-2xl bg-white p-3 shadow-soft">
                    <p className="text-[11px] font-semibold text-muted-dark">Input candle photo → AI Etsy photoshoot</p>
                    <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-3">
                      <div className="rounded-xl bg-page-bg/90 p-2">
                        <Image
                          src="/images/candleBefore.png"
                          alt="Input multi-wick candle product photo"
                          width={260}
                          height={200}
                          className="h-full w-full rounded-lg bg-cream object-contain"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['/images/candleAfter1.png', '/images/candleAfter2.png', '/images/candleAfter3.png', '/images/candleAfter4.png'].map(
                          (src) => (
                            <div key={src} className="overflow-hidden rounded-lg bg-muted/40">
                              <Image src={src} alt="AI-generated Etsy candle product photo" width={120} height={120} className="h-full w-full object-cover" />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] text-muted-dark">
                      Show your candle lit, styled and packaged without re‑shooting. Ideal for Etsy product photos and social content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative -mt-px h-10 w-full overflow-hidden bg-cream md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute top-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 0v48h1200V0c-200 0-400 24-600 24S200 0 0 0z" fill="currentColor" />
        </svg>
      </div>

      {/* Prompts + results */}
      <section className="bg-cream py-16 md:py-24">
        <div className={CONTAINER}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div>
              <h2 className="text-[20px] font-semibold text-primary md:text-[24px]">System-generated prompts for Etsy candles</h2>
              <p className="mt-3 max-w-2xl text-[14px] text-muted-dark md:text-[15px]">
                ProductShotAI learns your candle brand identity—scents, mood, target buyer—and turns a single photo into multiple Etsy product
                images with different compositions and scenes.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {PROMPTS.map((prompt) => (
                  <div key={prompt} className="rounded-2xl border border-muted/50 bg-white p-4 shadow-soft">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-brand">Prompt example</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-secondary">{prompt}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-muted-dark">
                Adjust details like props and background, or let the AI suggest new combinations that still feel authentic to your handmade brand.
              </p>
            </div>

            <div className="rounded-[24px] border border-muted/50 bg-white p-4 shadow-soft md:p-5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-primary">Photoshoot outputs</p>
              <p className="mt-1 text-[13px] text-muted-dark">
                Example of four AI-generated candle images from one upload: cozy lifestyle, flat lay, macro flame and packaging shot.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['/images/candleAfter1.png', '/images/candleAfter2.png', '/images/candleAfter3.png', '/images/candleAfter4.png'].map((src) => (
                  <div key={src} className="overflow-hidden rounded-xl bg-muted/40">
                    <Image src={src} alt="Etsy candle AI product photo result" width={260} height={220} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO section */}
      <section className="bg-white py-16 md:py-24">
        <div className={CONTAINER}>
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-bold text-primary md:text-[26px]">
              Etsy product photos that feel handmade, generated with AI
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              On Etsy, buyers look for atmosphere and authenticity. With ProductShotAI you create candle photos that look handcrafted—warm light,
              storytelling props, intimate close‑ups—starting from a single product shot. Our product photo AI keeps your candle true to life
              while building scenes that match your brand.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              Move beyond flat DIY images. Generate image product variations for your multi‑wick candles: cozy living room scenes, stylized flat
              lays and macro shots that highlight wax texture, fragrance notes and label design. All in 8K resolution, ready for Etsy listings,
              Pinterest pins and Instagram posts.
            </p>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              <li>
                <strong className="font-semibold text-primary">Consistent Etsy storefront</strong> – keep the same lighting and mood across all
                your candle collections.
              </li>
              <li>
                <strong className="font-semibold text-primary">Story-driven visuals</strong> – show how your candles are used: evenings on the
                sofa, self-care routines, gift-ready packaging.
              </li>
              <li>
                <strong className="font-semibold text-primary">Faster content for launches</strong> – create a full gallery for each new scent in
                minutes, not days.
              </li>
            </ul>
            <p className="mt-4 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              Whether you sell candles, handmade decor or self‑care kits, ProductShotAI helps your Etsy product photos look as premium as your
              craft.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-start gap-3 rounded-[20px] border border-muted/50 bg-page-bg px-6 py-6 text-left md:mt-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-7">
            <div className="max-w-xl">
              <p className="text-[15px] font-semibold text-on-dark md:text-[16px]">
                Ready to glow up your Etsy candle photos?
              </p>
              <p className="mt-1 text-[13px] text-muted md:text-[14px]">
                Start with a free generation, then log in to build full candle photoshoots on demand.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-[14px] font-semibold text-on-brand shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
              >
                Start free generation
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-on-dark/10 px-6 py-2.5 text-[14px] font-semibold text-on-dark transition-smooth hover:bg-on-dark/20 hover:shadow-soft-hover"
              >
                Login for full photoshooting
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


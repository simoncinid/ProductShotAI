import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

export const metadata: Metadata = {
  title: 'Amazon FBA Product Photos – AI Product Photo for Amazon Sellers',
  description:
    'Create Amazon FBA product photos with AI: optimized main image, secondary images and UGC-style lifestyle shots. Product photo AI for Amazon sellers in minutes.',
  openGraph: {
    title: 'Amazon FBA Product Photos with AI – ProductShotAI',
    description:
      'Generate compliant Amazon FBA product photos, main images and UGC-style lifestyle images. Product photo AI tailored to Amazon marketplace requirements.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'}/use-cases/amazon-fba-product-photos`,
  },
}

const PROMPTS = [
  'Studio hero shot on pure white background, 1:1 aspect ratio, product centered, soft shadow, Amazon main image compliant.',
  'Lifestyle scene in a bright kitchen, product in foreground on wooden countertop, shallow depth of field, warm natural light.',
  'Close-up macro of key feature, sharp focus on texture and materials, clean blur on background, suitable for zoom on PDP.',
  'Comparison-style image showing product with key benefit highlighted through composition (no text), 4:5 aspect ratio for mobile.',
] as const

export default function AmazonFbaUseCasePage() {
  return (
    <div className="bg-page-bg">
      {/* Hero */}
      <section className="relative overflow-hidden bg-page-bg pt-16 pb-14 md:pt-20 md:pb-18 lg:pt-24 lg:pb-20">
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted sm:text-xs">
                Use case · Amazon FBA sellers
              </p>
              <h1 className="text-[28px] font-extrabold leading-tight text-on-dark md:text-[34px] lg:text-[40px]">
                Amazon FBA product photos with AI
              </h1>
              <p className="mt-4 max-w-xl text-[15px] text-muted md:text-[16px]">
                Turn a simple packshot into a full Amazon-ready photoshoot: main image on pure white, gallery shots and UGC-style lifestyle
                images — without booking a photographer.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-[14px] font-semibold text-on-brand shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
                >
                  Start free Amazon shoot
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-on-dark/10 px-7 py-3 text-[14px] font-semibold text-on-dark transition-smooth hover:bg-on-dark/20 hover:shadow-soft-hover"
                >
                  Login for full photoshooting
                </Link>
              </div>
              <p className="mt-3 text-[12px] text-muted">
                1 free watermarked image per device each month. Perfect to test AI product photos for your Amazon listings.
              </p>
            </div>

            <div className="relative hidden justify-end md:flex">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute -inset-6 rounded-[32px] bg-brand/10 blur-2xl" aria-hidden />
                <div className="relative rounded-[28px] border border-muted/60 bg-cream p-4 shadow-card-hover">
                  <div className="rounded-2xl bg-white p-3 shadow-soft">
                    <p className="text-[11px] font-semibold text-muted-dark">Input product photo → AI Amazon photoshoot</p>
                    <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-3">
                      <div className="rounded-xl bg-page-bg/90 p-2">
                        <Image
                          src="/images/product1.png"
                          alt="Input product photo for Amazon listing"
                          width={260}
                          height={200}
                          className="h-full w-full rounded-lg bg-cream object-contain"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['/images/res1.png', '/images/res2.png', '/images/res3.png', '/images/res4.png'].map((src) => (
                          <div key={src} className="overflow-hidden rounded-lg bg-muted/40">
                            <Image src={src} alt="AI-generated Amazon product photo" width={120} height={120} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] text-muted-dark">
                      Generate compliant main images and lifestyle variations from a single upload. Keep your brand consistent across every ASIN.
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
              <h2 className="text-[20px] font-semibold text-primary md:text-[24px]">System-generated prompts for Amazon FBA</h2>
              <p className="mt-3 max-w-2xl text-[14px] text-muted-dark md:text-[15px]">
                ProductShotAI uses your brand identity and product details to generate optimized prompts for Amazon: compliant main images, gallery
                shots and UGC-style product images that drive clicks and conversions.
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
                You can keep these prompts as they are or customize them. The AI product photo engine adapts to your brand voice while staying
                within Amazon guidelines.
              </p>
            </div>

            <div className="rounded-[24px] border border-muted/50 bg-white p-4 shadow-soft md:p-5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-primary">Photoshoot outputs</p>
              <p className="mt-1 text-[13px] text-muted-dark">
                Example of four AI-generated images you can get from one product upload: white background, lifestyle, macro and UGC-style scenes.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['/images/res1.png', '/images/res2.png', '/images/res3.png', '/images/res4.png'].map((src) => (
                  <div key={src} className="overflow-hidden rounded-xl bg-muted/40">
                    <Image src={src} alt="Amazon FBA AI product photo result" width={260} height={220} className="h-full w-full object-cover" />
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
              Why Amazon FBA sellers use ProductShotAI for product images
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              Amazon product photos are the first thing shoppers see in search results. With ProductShotAI you turn a single product image into a
              complete Amazon FBA photoshoot: compliant main image, detailed feature shots and scroll-stopping lifestyle visuals. Our product
              photo AI understands Amazon&apos;s constraints while giving you creative freedom.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              Instead of booking studio time or coordinating photographers, you upload one clear photo and describe your brand. The AI generates
              image product variations in 8K resolution, ready for your PDP gallery and A+ content. You keep full control over aspect ratios, style
              and composition, from clean white-background shots to on-brand lifestyle scenes.
            </p>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              <li>
                <strong className="font-semibold text-primary">Optimized for Amazon FBA listings</strong> – generate main images and secondary
                shots that respect marketplace requirements while showcasing your product clearly.
              </li>
              <li>
                <strong className="font-semibold text-primary">UGC-style product images for ads</strong> – create social and sponsored ad
                creatives that look like real user-generated content without hiring influencers.
              </li>
              <li>
                <strong className="font-semibold text-primary">Consistent visuals across ASINs</strong> – reuse your brand identity so every
                product line shares the same look, lighting and background style.
              </li>
              <li>
                <strong className="font-semibold text-primary">Fast A/B testing</strong> – quickly generate alternative angles, crops and
                backgrounds to test click‑through rate and conversion.
              </li>
            </ul>
            <p className="mt-4 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              Whether you manage one private‑label product or a full Amazon catalog, ProductShotAI becomes your always‑on creative hub for AI
              product photos, photo shootings and UGC product images.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-start gap-3 rounded-[20px] border border-muted/50 bg-page-bg px-6 py-6 text-left md:mt-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-7">
            <div className="max-w-xl">
              <p className="text-[15px] font-semibold text-on-dark md:text-[16px]">
                Ready to refresh your Amazon FBA product photos with AI?
              </p>
              <p className="mt-1 text-[13px] text-muted md:text-[14px]">
                Start with a free generation, then log in to run full photoshoots for your ASINs.
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


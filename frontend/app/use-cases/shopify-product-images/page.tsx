import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

export const metadata: Metadata = {
  title: 'Shopify Product Images – AI Photos for Skincare & Cosmetics',
  description:
    'Generate on-brand Shopify product images for women’s skincare. Hero shots, flat lays and bathroom shelf scenes from a single lotion tube photo.',
  openGraph: {
    title: 'Shopify Product Images with AI – ProductShotAI',
    description:
      'Create high-converting Shopify product images for cosmetics and skincare: PDP hero, gallery and campaign visuals tailored to your brand.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'}/use-cases/shopify-product-images`,
  },
}

const PROMPTS = [
  'Clean studio hero of a face lotion tube standing upright on soft beige background, subtle shadow, 1:1 aspect ratio, minimal feminine aesthetic.',
  'Bathroom shelf scene with the lotion tube next to a mirror, towel and small vase, morning light from the side, soft reflections.',
  'Flat lay of the tube on marble countertop with drops of serum, jade roller and cotton pads arranged around, top-down view.',
  'Hand holding the lotion tube in front of blurred bathroom background, focus on packaging and label, lifestyle UGC-style shot.',
] as const

export default function ShopifyUseCasePage() {
  return (
    <div className="bg-page-bg">
      {/* Hero */}
      <section className="relative overflow-hidden bg-page-bg pt-16 pb-14 md:pt-20 md:pb-18 lg:pt-24 lg:pb-20">
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted sm:text-xs">
                Use case · Shopify & DTC brands
              </p>
              <h1 className="text-[28px] font-extrabold leading-tight text-on-dark md:text-[34px] lg:text-[40px]">
                Shopify product images for women’s skincare
              </h1>
              <p className="mt-4 max-w-xl text-[15px] text-muted md:text-[16px]">
                Start from a single shot of your face lotion tube and generate a full set of on‑brand Shopify images: PDP hero, gallery, campaign
                creatives and UGC-style scenes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-[14px] font-semibold text-on-brand shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
                >
                  Start free Shopify shoot
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-on-dark/10 px-7 py-3 text-[14px] font-semibold text-on-dark transition-smooth hover:bg-on-dark/20 hover:shadow-soft-hover"
                >
                  Login for full photoshooting
                </Link>
              </div>
              <p className="mt-3 text-[12px] text-muted">
                Perfect for skincare and cosmetic brands that need consistent visuals across PDP, landing pages and paid campaigns.
              </p>
            </div>

            <div className="relative hidden justify-end md:flex">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute -inset-6 rounded-[32px] bg-brand/10 blur-2xl" aria-hidden />
                <div className="relative rounded-[28px] border border-muted/60 bg-cream p-4 shadow-card-hover">
                  <div className="rounded-2xl bg-white p-3 shadow-soft">
                    <p className="text-[11px] font-semibold text-muted-dark">Input cosmetic photo → AI Shopify photoshoot</p>
                    <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-3">
                      <div className="rounded-xl bg-page-bg/90 p-2">
                        <Image
                          src="/images/cosmeticBefore.png"
                          alt="Input cosmetic product photo for Shopify"
                          width={260}
                          height={200}
                          className="h-full w-full rounded-lg bg-cream object-contain"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['/images/cosmeticAfter1.png', '/images/cosmeticAfter2.png', '/images/cosmeticAfter3.png', '/images/cosmeticAfter4.png'].map(
                          (src) => (
                            <div key={src} className="overflow-hidden rounded-lg bg-muted/40">
                              <Image src={src} alt="AI-generated Shopify cosmetic product image" width={120} height={120} className="h-full w-full object-cover" />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] text-muted-dark">
                      Generate PDP hero, campaign visuals and UGC-style images while keeping packaging and brand identity consistent.
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
              <h2 className="text-[20px] font-semibold text-primary md:text-[24px]">System-generated prompts for Shopify skincare</h2>
              <p className="mt-3 max-w-2xl text-[14px] text-muted-dark md:text-[15px]">
                ProductShotAI uses your brand guidelines—colors, tone, target audience—to generate prompts that match your DTC aesthetic across
                PDP and campaigns.
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
                Tweak angles, backgrounds and props in the prompt, or let the AI propose variations for A/B testing without breaking your brand
                system.
              </p>
            </div>

            <div className="rounded-[24px] border border-muted/50 bg-white p-4 shadow-soft md:p-5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-primary">Photoshoot outputs</p>
              <p className="mt-1 text-[13px] text-muted-dark">
                Example of four AI-generated skincare images from one lotion tube upload: studio hero, bathroom shelf, flat lay and in-hand UGC-style
                shot.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['/images/cosmeticAfter1.png', '/images/cosmeticAfter2.png', '/images/cosmeticAfter3.png', '/images/cosmeticAfter4.png'].map(
                  (src) => (
                    <div key={src} className="overflow-hidden rounded-xl bg-muted/40">
                      <Image src={src} alt="Shopify skincare AI product photo result" width={260} height={220} className="h-full w-full object-cover" />
                    </div>
                  )
                )}
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
              Shopify product images that feel like your brand
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              Great DTC brands win with visuals. With ProductShotAI you transform one cosmetic product photo into a full set of Shopify‑optimized
              images: clean PDP hero shots, aspirational bathroom scenes and UGC-style content that looks real. Our product photo AI keeps your
              packaging accurate while exploring new compositions.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              Instead of planning new photoshoots for every campaign, you can generate fresh variants on demand—new backgrounds, props, lighting
              and crops—without losing your core aesthetic. Image product variations are delivered in 8K and sized for product pages, landing
              pages and paid media.
            </p>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              <li>
                <strong className="font-semibold text-primary">On-brand across all touchpoints</strong> – from PDP to homepage hero and ad
                creative.
              </li>
              <li>
                <strong className="font-semibold text-primary">Fast creative testing</strong> – generate and test multiple angles and backgrounds
                without re‑shooting.
              </li>
              <li>
                <strong className="font-semibold text-primary">Perfect for bundles and collections</strong> – reuse the same look &amp; feel across
                product families.
              </li>
            </ul>
            <p className="mt-4 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              ProductShotAI becomes your creative hub for Shopify product images, from skincare and cosmetics to any DTC category.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-start gap-3 rounded-[20px] border border-muted/50 bg-page-bg px-6 py-6 text-left md:mt-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-7">
            <div className="max-w-xl">
              <p className="text-[15px] font-semibold text-on-dark md:text-[16px]">
                Ready to refresh your Shopify skincare visuals?
              </p>
              <p className="mt-1 text-[13px] text-muted md:text-[14px]">
                Start with a free generation, then log in to build full product and campaign photoshoots.
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


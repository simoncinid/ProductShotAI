import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

export const metadata: Metadata = {
  title: 'UGC-Style Product Images – AI Content for Ads & Social',
  description:
    'Generate UGC-style product images with AI for ads, TikTok, Instagram and landing pages. In-hand, POV and lifestyle scenes from a single upload.',
  openGraph: {
    title: 'UGC-Style Product Images with AI – ProductShotAI',
    description:
      'Create scroll-stopping UGC-style product photos for a reusable water bottle: in-hand, desk and outdoor lifestyle scenes generated with AI.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'}/use-cases/ugc-product-images`,
  },
}

const PROMPTS = [
  'POV shot of a reusable water bottle held in hand in front of a laptop and notebook on a desk, natural window light, casual work-from-home vibe.',
  'Selfie-style image of person holding the bottle near face, blurred city street background, bright daylight, social-first framing.',
  'Outdoor lifestyle scene with the bottle on a rock next to backpack and sunglasses, soft sunset light, mountains slightly blurred in distance.',
  'Overhead shot of the bottle on colored background with stickers and small props around, playful UGC aesthetic, 4:5 aspect ratio for feeds.',
] as const

export default function UgcUseCasePage() {
  return (
    <div className="bg-page-bg">
      {/* Hero */}
      <section className="relative overflow-hidden bg-page-bg pt-16 pb-14 md:pt-20 md:pb-18 lg:pt-24 lg:pb-20">
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted sm:text-xs">
                Use case · UGC-style ads & social
              </p>
              <h1 className="text-[28px] font-extrabold leading-tight text-on-dark md:text-[34px] lg:text-[40px]">
                UGC-style product images with AI
              </h1>
              <p className="mt-4 max-w-xl text-[15px] text-muted md:text-[16px]">
                Start from a simple photo of a reusable water bottle and generate UGC-style content for ads, TikTok, Instagram and landing pages—
                without coordinating creators.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-[14px] font-semibold text-on-brand shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
                >
                  Start free UGC shoot
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-on-dark/10 px-7 py-3 text-[14px] font-semibold text-on-dark transition-smooth hover:bg-on-dark/20 hover:shadow-soft-hover"
                >
                  Login for full photoshooting
                </Link>
              </div>
              <p className="mt-3 text-[12px] text-muted">
                Ideal for e‑commerce owners and media buyers that need fresh creatives every week.
              </p>
            </div>

            <div className="relative hidden justify-end md:flex">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute -inset-6 rounded-[32px] bg-brand/10 blur-2xl" aria-hidden />
                <div className="relative rounded-[28px] border border-muted/60 bg-cream p-4 shadow-card-hover">
                  <div className="rounded-2xl bg-white p-3 shadow-soft">
                    <p className="text-[11px] font-semibold text-muted-dark">Input bottle photo → AI UGC photoshoot</p>
                    <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-3">
                      <div className="rounded-xl bg-page-bg/90 p-2">
                        <Image
                          src="/images/ugcBefore.png"
                          alt="Input reusable water bottle photo"
                          width={260}
                          height={200}
                          className="h-full w-full rounded-lg bg-cream object-contain"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['/images/ugcAfter1.png', '/images/ugcAfter2.png', '/images/ugcAfter3.png', '/images/ugcAfter4.png'].map((src) => (
                          <div key={src} className="overflow-hidden rounded-lg bg-muted/40">
                            <Image src={src} alt="AI-generated UGC-style product image" width={120} height={120} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] text-muted-dark">
                      Mix POV, selfie-style and flat lay scenes to feed your ad account and social calendar without extra shoots.
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
              <h2 className="text-[20px] font-semibold text-primary md:text-[24px]">System-generated prompts for UGC-style shots</h2>
              <p className="mt-3 max-w-2xl text-[14px] text-muted-dark md:text-[15px]">
                ProductShotAI turns your brand and product info into creator-like prompts: in-hand shots, POV angles and scenes that feel native to
                feeds and stories.
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
                Change channel (TikTok, Reels, Stories, static) directly in the prompt to adapt framing and aspect ratio without new photoshoots.
              </p>
            </div>

            <div className="rounded-[24px] border border-muted/50 bg-white p-4 shadow-soft md:p-5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-primary">Photoshoot outputs</p>
              <p className="mt-1 text-[13px] text-muted-dark">
                Example of four AI-generated UGC-style images from one bottle upload: desk POV, selfie-style, outdoor lifestyle and playful flat lay.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['/images/ugcAfter1.png', '/images/ugcAfter2.png', '/images/ugcAfter3.png', '/images/ugcAfter4.png'].map((src) => (
                  <div key={src} className="overflow-hidden rounded-xl bg-muted/40">
                    <Image src={src} alt="UGC-style AI product photo result" width={260} height={220} className="h-full w-full object-cover" />
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
              UGC-style product images without chasing creators
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              UGC product images work because they feel real. With ProductShotAI you generate that same energy from a single product photo. Our
              product photo AI creates POV, selfie-style and lifestyle scenes that look like they came from your community, not a studio.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              Feed your ad account, emails and landing pages with constant new creatives: image product variations in different contexts, outfits
              and locations. Keep the bottle accurate—logo, colors, shape—while changing everything around it to avoid creative fatigue.
            </p>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              <li>
                <strong className="font-semibold text-primary">Ideal for paid social</strong> – generate native-feeling images for TikTok, Reels,
                Stories and feed ads.
              </li>
              <li>
                <strong className="font-semibold text-primary">Fast creative iteration</strong> – swap backgrounds, outfits and locations via
                prompt instead of new shoots.
              </li>
              <li>
                <strong className="font-semibold text-primary">Scales to any product</strong> – reuse this flow for bottles, gadgets, accessories
                and more.
              </li>
            </ul>
            <p className="mt-4 text-[15px] leading-relaxed text-secondary md:text-[16px]">
              ProductShotAI becomes your always‑on UGC engine for product images, ready every time you need a new batch of creatives.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-start gap-3 rounded-[20px] border border-muted/50 bg-page-bg px-6 py-6 text-left md:mt-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-7">
            <div className="max-w-xl">
              <p className="text-[15px] font-semibold text-on-dark md:text-[16px]">
                Ready to scale your UGC-style creatives?
              </p>
              <p className="mt-1 text-[13px] text-muted md:text-[14px]">
                Start with a free generation, then log in to build ongoing UGC-style product photoshoots.
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


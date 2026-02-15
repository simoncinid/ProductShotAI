import Link from 'next/link'
import Image from 'next/image'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

const USE_CASES = [
  {
    slug: 'amazon-fba-product-photos',
    title: 'Amazon FBA Product Photos',
    audience: 'Amazon FBA sellers',
    description:
      'Generate Amazon-ready main images, secondary shots and UGC-style lifestyle photos. Meet marketplace requirements while testing new creative angles in minutes.',
  },
  {
    slug: 'shopify-product-images',
    title: 'Shopify & DTC Product Images',
    audience: 'Shopify and DTC brands',
    description:
      'Create on-brand hero images, PDP galleries and campaign visuals that match your brand identity without hiring a photographer.',
  },
  {
    slug: 'etsy-product-photos',
    title: 'Etsy Product Photos',
    audience: 'Etsy sellers',
    description:
      'Make handmade, vintage and digital products stand out with consistent, story-driven visuals and lifestyle backgrounds that fit your niche.',
  },
  {
    slug: 'ugc-product-images',
    title: 'UGC-Style Product Images',
    audience: 'E‑commerce owners & media buyers',
    description:
      'Generate scroll-stopping UGC-style product images for ads, social and landing pages without coordinating influencers or photoshoots.',
  },
] as const

export default function UseCasesIndexPage() {
  return (
    <div className="bg-page-bg">
      {/* Hero */}
      <section className="relative overflow-hidden bg-page-bg pt-16 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted sm:text-xs">
                AI product photo & creative hub
              </p>
              <h1 className="text-[28px] font-extrabold leading-tight text-on-dark md:text-[34px] lg:text-[40px]">
                Use cases for Amazon, Shopify, Etsy & UGC product images
              </h1>
              <p className="mt-4 max-w-xl text-[15px] text-muted md:text-[16px]">
                ProductShotAI is your creative hub for AI product photos, UGC-style shots and full photo shootings. Start from one product photo
                and generate marketplace-ready images for every channel.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-[14px] font-semibold text-on-brand shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-on-dark/10 px-7 py-3 text-[14px] font-semibold text-on-dark transition-smooth hover:bg-on-dark/20 hover:shadow-soft-hover"
                >
                  Login for full photoshooting
                </Link>
              </div>
              <p className="mt-3 text-[12px] text-muted">
                Sign up, buy credits, and start generating. No subscription.
              </p>
            </div>

            <div className="relative hidden justify-end md:flex">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute -inset-6 rounded-[32px] bg-brand/10 blur-2xl" aria-hidden />
                <div className="relative rounded-[28px] border border-muted/60 bg-cream p-4 shadow-card-hover">
                  <div className="rounded-2xl bg-white p-3 shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold text-primary">
                        AI Product Photoshoot
                      </span>
                      <span className="text-[11px] text-muted">UGC · Marketplace · PDP</span>
                    </div>
                    <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-3">
                      <div className="rounded-xl bg-page-bg/90 p-2">
                        <Image
                          src="/images/product1.png"
                          alt="Input product photo"
                          width={260}
                          height={200}
                          className="h-full w-full rounded-lg object-contain bg-cream"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['/images/res1.png', '/images/res2.png', '/images/res3.png', '/images/res4.png'].map((src) => (
                          <div key={src} className="overflow-hidden rounded-lg bg-muted/40">
                            <Image src={src} alt="Generated product shot" width={120} height={120} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] text-muted-dark">
                      Upload once. Reuse brand identity and prompts for Amazon, Shopify, Etsy and UGC-style campaigns.
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
        <svg
          viewBox="0 0 1200 48"
          fill="none"
          className="absolute top-0 left-0 w-full text-page-bg"
          preserveAspectRatio="none"
        >
          <path d="M0 0v48h1200V0c-200 0-400 24-600 24S200 0 0 0z" fill="currentColor" />
        </svg>
      </div>

      {/* Use case grid */}
      <section className="bg-cream py-16 md:py-24">
        <div className={CONTAINER}>
          <div className="text-center">
            <p className="font-playfair-italic text-2xl text-primary md:text-3xl">Use Cases</p>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] text-muted-dark md:text-[16px]">
              Explore how ProductShotAI helps different seller types generate AI product images, UGC-style content and full photoshoots tailored
              to their channels.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-2">
            {USE_CASES.map((useCase) => (
              <article
                key={useCase.slug}
                className="flex flex-col justify-between rounded-[20px] border border-muted/40 bg-white p-6 text-left shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card-hover md:p-7"
              >
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-brand">{useCase.audience}</p>
                  <h2 className="mt-2 text-[18px] font-semibold text-primary md:text-[20px]">{useCase.title}</h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted-dark md:text-[15px]">{useCase.description}</p>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/use-cases/${useCase.slug}`}
                    className="inline-flex items-center justify-center rounded-full bg-page-bg px-5 py-2.5 text-[13px] font-semibold text-on-dark transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
                  >
                    View use case
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center text-[13px] font-semibold text-anthracite hover:underline"
                  >
                    Get started →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


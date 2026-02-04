import Link from 'next/link'
import Image from 'next/image'
import ExampleGallery from '@/components/ExampleGallery'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

const PROMPT_EXAMPLES = [
  { tag: 'Lifestyle', text: 'Outdoor café, morning light, leather bag on table with coffee and sunglasses, lifestyle shot, on-brand for e-commerce.' },
  { tag: 'Flat lay', text: 'Flat lay of open bag with laptop and accessories, top-down view, soft light, minimalist background, e-commerce ready.' },
  { tag: 'Macro', text: 'Macro of brass buckle and leather texture, stitching details, shallow depth of field, premium look for product zoom.' },
] as const
const RESULT_IMAGES = ['/images/res1.png', '/images/res2.png', '/images/res3.png'] as const

const steps = [
  {
    n: 1,
    title: 'Brand Identity',
    media: 'icon' as const,
    icon: '/icone/bradIdentity.png',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Tell us about your brand: describe your average customer, where you sell (e‑commerce, Instagram, lifestyle blogs) and the photo style you want (studio, lifestyle, macro). The AI will follow these guidelines every time it generates images.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          Set up your brand identity once. Your photos stay consistent and on-brand across all listings, with the lighting and look you choose.
        </p>
      </>
    ),
  },
  {
    n: 2,
    title: 'Upload Product',
    media: 'product' as const,
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Drop a photo of your product—from your phone or an existing listing. We isolate the product so the AI can place it in any scene. We support JPEG and PNG up to 10MB.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          You can create multiple products and reuse them whenever you need new images. The AI uses the isolated product to generate consistent, professional shots.
        </p>
      </>
    ),
  },
  {
    n: 3,
    title: 'Brand-matched Prompts',
    media: 'prompts' as const,
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Based on your brand identity and product, we generate optimized prompts (lifestyle, flat lay, macro, etc.). Review and customize them, then trigger the generation to get your photoshoot.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          Use the prompts as-is or add your own instructions. The AI produces 8K images suitable for e‑commerce and Amazon, respecting your brand and product details.
        </p>
      </>
    ),
  },
  {
    n: 4,
    title: 'Results',
    media: 'results' as const,
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Here are your on-brand variations. Within 30–60 seconds you receive high-quality 8K images, optimized for e‑commerce and Amazon (correct aspect ratio, no watermarks for paid credits). Download and use them in your listings right away.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          Each image keeps your product accurate while applying the chosen style, background and lighting. Results meet marketplace quality standards and are ready for conversion-focused product pages.
        </p>
      </>
    ),
  },
]

const whyItems = [
  {
    title: 'Optimized for Amazon',
    desc: 'Our AI model understands Amazon\'s product photography requirements and creates images that are optimized for marketplace success.',
  },
  {
    title: 'Preserves Your Product',
    desc: 'The AI keeps your original product intact while transforming the background and lighting. Your product always looks accurate.',
  },
  {
    title: '8K Quality',
    desc: 'All images are generated in 8K resolution, ensuring they look great at any size and meet the highest quality standards.',
  },
  {
    title: 'Fast & Affordable',
    desc: 'Get professional product photos in seconds, not days. Pay only for what you use — no monthly subscriptions.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="bg-page-bg">
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden bg-page-bg pt-16 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-500 md:w-12" />
              <p className="font-playfair-italic text-2xl text-on-dark md:text-3xl">How It Works</p>
              <span className="h-px w-8 bg-gray-500 md:w-12" />
            </div>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-white md:text-[34px]">
              Four steps to professional product shots
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] text-gray-300 md:text-[18px]">
              From brand identity to upload, prompts and 8K results. Our product photo AI works for e‑commerce and Amazon.
            </p>
          </div>
        </div>
      </section>

      {/* Divisore curvo ——— */}
      <div className="relative -mt-px h-10 w-full overflow-hidden bg-page-bg md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— I quattro step: mobile = colonna, desktop = due colonne ——— */}
      <section className="bg-page-bg pb-16 pt-12 md:pb-24 md:pt-16">
        <div className={CONTAINER}>
          <div className="space-y-6 md:space-y-8">
            {steps.map((step) => (
              <div
                key={step.n}
                className="flex flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-soft transition-smooth hover:shadow-card-hover md:flex-row md:rounded-[24px]"
              >
                {/* Mobile: numero + titolo in una riga */}
                <div className="flex flex-row items-center gap-3 border-b border-gray-100 px-5 py-4 md:hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-rich-black">
                    {step.n}
                  </div>
                  <h2 className="min-w-0 break-words text-xl font-semibold text-primary">{step.title}</h2>
                </div>

                {/* Colonna 1 (solo desktop): numero + media */}
                <div className="hidden md:flex shrink-0 flex-col border-r border-gray-100 bg-gray-50/50 p-6">
                  <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-rich-black">
                    {step.n}
                  </div>
                  <div className="flex h-[240px] w-[240px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                    {step.media === 'icon' && (
                      <Image src={step.icon!} alt="" width={120} height={120} className="h-24 w-24 object-contain" />
                    )}
                    {step.media === 'product' && (
                      <Image src="/images/product1.png" alt="Product" width={240} height={240} className="h-full w-full object-contain p-4" />
                    )}
                    {step.media === 'prompts' && (
                      <div className="grid h-full w-full grid-cols-3 gap-2 p-3">
                        {PROMPT_EXAMPLES.map((p, i) => (
                          <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-2.5 text-left">
                            <span className="mb-1.5 truncate rounded bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-rich-black md:text-xs">{p.tag}</span>
                            <p className="line-clamp-5 text-[11px] leading-snug text-gray-800 md:text-[12px]">{p.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {step.media === 'results' && (
                      <div className="grid h-full w-full grid-cols-3 gap-2 p-3">
                        {RESULT_IMAGES.map((src, i) => (
                          <div key={i} className="overflow-hidden rounded-lg bg-gray-100">
                            <Image src={src} alt={`Result ${i + 1}`} width={80} height={80} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile: media a tutta larghezza, altezza fissa */}
                <div className="w-full px-4 py-4 md:hidden">
                  <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                    {step.media === 'icon' && (
                      <Image src={step.icon!} alt="" width={100} height={100} className="h-24 w-24 object-contain" />
                    )}
                    {step.media === 'product' && (
                      <Image src="/images/product1.png" alt="Product" width={220} height={220} className="h-full w-full object-contain p-4" />
                    )}
                    {step.media === 'prompts' && (
                      <div className="grid h-full w-full grid-cols-3 gap-2 p-3">
                        {PROMPT_EXAMPLES.map((p, i) => (
                          <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-2.5 text-left">
                            <span className="mb-1.5 truncate rounded bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-rich-black">{p.tag}</span>
                            <p className="line-clamp-4 text-[10px] leading-snug text-gray-800">{p.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {step.media === 'results' && (
                      <div className="grid h-full w-full grid-cols-3 gap-2 p-3">
                        {RESULT_IMAGES.map((src, i) => (
                          <div key={i} className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <Image src={src} alt={`Result ${i + 1}`} width={120} height={120} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonna 2: titolo (solo desktop) + testo */}
                <div className="flex min-w-0 flex-1 flex-col justify-start px-5 py-4 md:p-6 md:py-6">
                  <h2 className="mb-3 hidden min-w-0 break-words text-xl font-semibold text-primary md:block md:text-2xl">{step.title}</h2>
                  <div className="min-w-0 flex-1">{step.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Example (before → prompt → after) ——— */}
      <ExampleGallery />

      {/* Divisore curvo ——— */}
      <div className="relative h-10 w-full overflow-hidden bg-white md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute top-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 0v48h1200V0c-200 0-400 24-600 24S200 0 0 0z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— Why ProductShotAI ——— */}
      <section className="bg-white py-16 md:py-24">
        <div className={CONTAINER}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-playfair-italic text-2xl text-primary md:text-3xl">Why ProductShotAI?</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {whyItems.map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card-hover md:p-8"
              >
                <h3 className="text-base font-semibold text-primary md:text-lg">{title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/10 bg-page-bg py-16 md:py-20">
        <div className={`${CONTAINER} text-center`}>
          <p className="text-[18px] font-semibold text-white md:text-[20px]">Ready to transform your product photos?</p>
          <Link
            href="/create"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-rich-black shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
          >
            Try It Free Now
          </Link>
        </div>
      </section>
    </div>
  )
}

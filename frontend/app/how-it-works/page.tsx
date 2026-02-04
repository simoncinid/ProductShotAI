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

      {/* ——— I quattro step ——— */}
      <section className="bg-page-bg pb-16 pt-12 md:pb-24 md:pt-16">
        <div className={CONTAINER}>
          <div className="space-y-12 md:space-y-16">
            {steps.map((step) => (
              <div
                key={step.n}
                className="flex flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-soft transition-smooth hover:shadow-card-hover md:rounded-[24px] md:flex-row md:items-stretch"
              >
                {/* Numero step */}
                <div className="flex shrink-0 items-start gap-4 border-b border-gray-100 p-6 md:flex-col md:border-b-0 md:border-r md:border-gray-100 md:py-8 md:pl-8 md:pr-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand md:h-14 md:w-14">
                    <span className="text-xl font-bold text-rich-black md:text-2xl">{step.n}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-primary md:mt-2 md:text-2xl">{step.title}</h2>
                </div>

                {/* Media: icon / product / 3 prompt / 3 results — ben visibili e moderni */}
                <div className="flex shrink-0 items-center justify-center bg-gray-50/60 px-6 py-8 md:min-w-[320px] md:max-w-[420px] md:px-8 md:py-10">
                  {step.media === 'icon' && (
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-white p-6 shadow-sm md:h-40 md:w-40 md:rounded-3xl md:p-8">
                      <Image src={step.icon!} alt="" width={160} height={160} className="h-full w-full object-contain" />
                    </div>
                  )}
                  {step.media === 'product' && (
                    <div className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-white shadow-[0_8px 32px rgba(0,0,0,0.08)] md:max-w-[340px] md:rounded-3xl">
                      <div className="aspect-square w-full p-6 md:p-8 flex items-center justify-center">
                        <Image src="/images/product1.png" alt="Product" width={300} height={300} className="h-full w-full object-contain" />
                      </div>
                    </div>
                  )}
                  {step.media === 'prompts' && (
                    <div className="grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-3 md:max-w-none">
                      {PROMPT_EXAMPLES.map((p, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm md:rounded-2xl md:px-5 md:py-4"
                        >
                          <span className="mb-2 inline-block rounded-full bg-brand/20 px-2.5 py-1 text-xs font-semibold text-rich-black">
                            {p.tag}
                          </span>
                          <p className="text-[13px] font-medium leading-snug text-gray-800 md:text-[14px]">{p.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {step.media === 'results' && (
                    <div className="grid w-full max-w-sm grid-cols-3 gap-3 md:max-w-md md:gap-4">
                      {RESULT_IMAGES.map((src, i) => (
                        <div key={i} className="overflow-hidden rounded-xl shadow-[0_8px 24px rgba(0,0,0,0.1)] md:rounded-2xl">
                          <Image src={src} alt={`Result ${i + 1}`} width={200} height={200} className="aspect-square w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Testo */}
                <div className="min-w-0 flex-1 p-6 md:py-8 md:pr-8 md:pl-6">
                  <div className="md:mt-0">{step.content}</div>
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

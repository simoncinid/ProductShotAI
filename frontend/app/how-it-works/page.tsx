import Link from 'next/link'
import ExampleGallery from '@/components/ExampleGallery'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

const steps = [
  {
    n: 1,
    title: 'Upload Your Existing Product Photo',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Start with any photo of your product. It doesn&apos;t need to be perfect — our AI will enhance it. We support JPEG and PNG formats up to 10MB.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          You can use photos taken with your phone, from your existing listings, or any product image you have. The AI understands product photography and will optimize it for Amazon&apos;s requirements.
        </p>
      </>
    ),
  },
  {
    n: 2,
    title: 'Describe Your Vision',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Write a prompt in plain English describing how you want your product to look. Be specific about:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-secondary md:text-[15px]">
          <li>Background (white, colored, lifestyle scene)</li>
          <li>Lighting (soft, dramatic, natural)</li>
          <li>Style (minimalist, professional, vibrant)</li>
          <li>Any specific elements you want to add or change</li>
        </ul>
        <p className="mt-4 text-[14px] italic leading-relaxed text-secondary">
          Example: &quot;Place the product on a clean white background with soft, even lighting. Add a subtle shadow underneath. Make the colors more vibrant and ensure the product is centered.&quot;
        </p>
      </>
    ),
  },
  {
    n: 3,
    title: 'Get Your Amazon-Ready Image',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Within 30–60 seconds, receive a high-quality 8K image optimized for Amazon listings.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          Our AI keeps your original product intact while transforming the scene around it. The result is a professional product image that:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-secondary md:text-[15px]">
          <li>Meets Amazon&apos;s image quality standards</li>
          <li>Has the correct aspect ratio (1:1 for main images)</li>
          <li>Is optimized for conversion</li>
          <li>Maintains product accuracy</li>
        </ul>
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
      <section className="relative overflow-hidden bg-white pt-16 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">How It Works</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-primary md:text-[34px]">
              Three Steps to AI Product Photo & Image Product AI
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] text-secondary md:text-[18px]">
              Turn any photo into 8K ai image product and image product ai. Our product photo AI works for e‑commerce and Amazon product photos.
            </p>
          </div>
        </div>
      </section>

      {/* Divisore curvo ——— */}
      <div className="relative -mt-px h-10 w-full overflow-hidden bg-page-bg md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-white" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— I tre step ——— */}
      <section className="bg-page-bg pb-16 pt-12 md:pb-24 md:pt-16">
        <div className={CONTAINER}>
          <div className="space-y-8 md:space-y-10">
            {steps.map(({ n, title, content }) => (
              <div
                key={n}
                className="flex flex-col rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card-hover md:flex-row md:items-start md:gap-8 md:p-8"
              >
                <div className="mb-5 flex shrink-0 md:mb-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand md:h-20 md:w-20">
                    <span className="text-2xl font-bold text-primary md:text-3xl">{n}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-primary md:text-2xl">{title}</h2>
                  <div className="mt-4">{content}</div>
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
              <p className="font-script text-2xl text-primary md:text-3xl">Why ProductShotAI?</p>
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
      <section className="border-t border-gray-100 bg-page-bg py-16 md:py-20">
        <div className={`${CONTAINER} text-center`}>
          <p className="text-[18px] font-semibold text-primary md:text-[20px]">Ready to transform your product photos?</p>
          <Link
            href="/create"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
          >
            Try It Free Now
          </Link>
        </div>
      </section>
    </div>
  )
}

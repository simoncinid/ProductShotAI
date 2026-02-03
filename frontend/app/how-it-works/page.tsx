import Link from 'next/link'
import Image from 'next/image'
import ExampleGallery from '@/components/ExampleGallery'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

const steps = [
  {
    n: 1,
    title: 'Create your product',
    icon: '/icone/upload.png',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          In the dashboard, create a product by entering its name, description and any details that help the AI (category, materials, key features). Then upload a photo of the product — it can be a simple shot from your phone or an existing listing image.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          We support JPEG and PNG up to 10MB. The AI will use both the text and the image to generate consistent, professional shots. You can create multiple products and reuse them whenever you need new images.
        </p>
      </>
    ),
  },
  {
    n: 2,
    title: 'Define your Brand Identity',
    icon: '/icone/bradIdentity.png',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Set up your brand identity once: style, colors, mood and visual guidelines. The AI will follow these every time it generates images for your products, so your photos stay consistent and on-brand across all listings.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          You can specify lighting preferences, background style, and the overall look you want. This is especially useful if you have many products and want a uniform, professional catalogue without describing the same style every time.
        </p>
      </>
    ),
  },
  {
    n: 3,
    title: 'Ready-to-use prompts',
    icon: '/icone/prompt.png',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Based on your brand identity and product details, we generate optimized prompts that the AI uses to turn your product photo into a real photo-shoot style image. The prompts respect your brand guidelines and the specifics of each product.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          You can use these prompts as-is or add your own instructions (e.g. a specific background, a lifestyle scene, or seasonal styling). The AI combines everything to produce 8K images suitable for e‑commerce and Amazon.
        </p>
      </>
    ),
  },
  {
    n: 4,
    title: 'Combine two photos',
    icon: '/icone/combine.png',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          For more control, you can combine two images in one generation: for example, your product in one photo and the desired background or setting in another. Or use one photo for the product and another for a subject (e.g. a person or prop) to insert into the final shot.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary md:text-[15px]">
          This way you get a single, coherent image that merges the best of both: accurate product representation plus the exact scene or context you want. Ideal for lifestyle shots and custom compositions.
        </p>
      </>
    ),
  },
  {
    n: 5,
    title: 'Get your result',
    icon: '/icone/result.png',
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-secondary md:text-[16px]">
          Choose how many images to generate per run. Within 30–60 seconds you receive high-quality 8K images, optimized for e‑commerce and Amazon (correct aspect ratio, no watermarks for paid credits). Download and use them in your listings right away.
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
              Five steps to professional product shots
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] text-gray-300 md:text-[18px]">
              From product and brand identity to prompts, combined photos and 8K results. Our product photo AI works for e‑commerce and Amazon.
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

      {/* ——— I cinque step ——— */}
      <section className="bg-page-bg pb-16 pt-12 md:pb-24 md:pt-16">
        <div className={CONTAINER}>
          <div className="space-y-8 md:space-y-10">
            {steps.map(({ n, title, icon, content }) => (
              <div
                key={n}
                className="flex flex-col rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card-hover md:flex-row md:items-start md:gap-8 md:p-8"
              >
                <div className="mb-5 flex shrink-0 flex-col items-center gap-3 md:mb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand md:h-12 md:w-12">
                    <span className="text-lg font-bold text-rich-black md:text-xl">{n}</span>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center md:h-16 md:w-16">
                    <Image src={icon} alt="" width={64} height={64} className="h-12 w-12 object-contain md:h-14 md:w-14" />
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

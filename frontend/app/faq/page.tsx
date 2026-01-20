'use client'

import { useState } from 'react'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

const faqs = [
  { q: "How many free images do I get?", a: "Every device gets 3 free watermarked images per month. This is tracked by device ID and IP address. No signup or credit card required!" },
  { q: "What is the watermark on free images?", a: "Free images include a diagonal watermark that says 'AI SAMPLE – UPGRADE FOR CLEAN IMAGE'. This watermark is designed to be clearly visible and difficult to remove. To get clean images without watermark, sign up and purchase credits." },
  { q: "Do I need a subscription?", a: "No! We don't offer monthly subscriptions. You only pay for the credits you need, when you need them. Credits never expire, so you can use them at your own pace." },
  { q: "What image formats do you support?", a: "We accept JPEG and PNG uploads (up to 10MB). All outputs are delivered as high-quality JPEG images in 8K resolution, optimized for Amazon listings." },
  { q: "What aspect ratios are available?", a: "You can choose from three aspect ratios: 1:1 (square, perfect for Amazon main images), 4:5 (portrait), and 16:9 (landscape). The default is 1:1 for Amazon compatibility." },
  { q: "How long does generation take?", a: "Most generations complete within 30-60 seconds. The AI processes your image and prompt, then returns a high-quality 8K result. You'll see a progress indicator while waiting." },
  { q: "Can I use these images on Amazon?", a: "Yes! Our images are specifically optimized for Amazon product listings. However, you should always ensure your images comply with Amazon's current image requirements and policies. We recommend reviewing Amazon's guidelines for your specific category." },
  { q: "What happens if a generation fails?", a: "If a generation fails, you won't be charged a credit (for paid users). Free users won't have their free generation count deducted. You can simply try again with a different prompt or image." },
  { q: "Do credits expire?", a: "No, credits never expire. Once you purchase credits, they remain in your account until you use them. There's no time limit or expiration date." },
  { q: "Can I get a refund?", a: "We don't offer refunds for credit purchases, but credits never expire so you can use them whenever you need. If you experience technical issues, please contact our support team." },
  { q: "Is my data secure?", a: "Yes, we take data security seriously. Your images are stored securely and are only used for generation purposes. We don't share your data with third parties. See our Privacy Policy for more details." },
  { q: "Can I use the images commercially?", a: "Yes, once you generate an image (whether free or paid), you have the right to use it for commercial purposes including Amazon listings, marketing materials, and other business uses." },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="bg-page-bg">
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden bg-white pt-16 pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">Frequently Asked Questions</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-primary md:text-[34px]">
              AI Product Photo & Product Photo AI – FAQ
            </h1>
          </div>
        </div>
      </section>

      {/* Divisore curvo ——— */}
      <div className="relative -mt-px h-10 w-full overflow-hidden bg-page-bg md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-white" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— Lista FAQ accordion ——— */}
      <section className="bg-page-bg pb-16 pt-12 md:pb-24 md:pt-16">
        <div className={CONTAINER}>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border border-gray-200 bg-white transition-smooth hover:shadow-soft ${openIndex === i ? 'shadow-soft' : ''}`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-[16px] font-semibold text-primary"
                >
                  {faq.q}
                  <span className={`ml-4 shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-45' : ''}`}>
                    <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-200 ease-out ${openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-gray-100 px-6 pb-4 pt-0 text-[14px] leading-relaxed text-secondary">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA Still have questions ——— */}
      <section className="bg-page-bg py-16 md:py-20">
        <div className={CONTAINER}>
          <div className="mx-auto max-w-2xl rounded-[20px] border border-gray-100 bg-white p-8 text-center shadow-soft md:p-10">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">Still have questions?</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
            <p className="mt-4 text-[16px] text-secondary">
              Can&apos;t find the answer you&apos;re looking for? Please reach out to our support team.
            </p>
            <a
              href="mailto:support@productshotai.com"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-[15px] font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

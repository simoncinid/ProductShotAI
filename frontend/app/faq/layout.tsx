import type { Metadata } from 'next'
import { FaqJsonLd } from './FaqJsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

export const metadata: Metadata = {
  title: 'AI Product Photo & Product Photo AI – FAQ',
  description: 'FAQ about AI product photo, product photo AI, ai image product, and image product ai. Credits, formats, Amazon product photo, watermark, pricing.',
  openGraph: {
    title: 'AI Product Photo & Product Photo AI – FAQ | ProductShotAI',
    description: 'FAQ: product photo AI, ai image product, image product ai, Amazon product photo. Credits, formats, 8K.',
    url: `${SITE_URL}/faq`,
  },
  alternates: { canonical: `${SITE_URL}/faq` },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FaqJsonLd />
      {children}
    </>
  )
}

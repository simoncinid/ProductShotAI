import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

export const metadata: Metadata = {
  title: 'AI Product Photo Pricing | Product Photo AI – Pay per Image',
  description: 'AI product photo and product photo ai pricing. Pay only for the images you need. No subscription. From $0.69/image. ai image product and image product ai for e‑commerce.',
  openGraph: {
    title: 'AI Product Photo Pricing | ProductShotAI',
    description: 'Product photo AI pricing. Pay per image, no subscription. ai image product from $0.69. Amazon product photo ready.',
    url: `${SITE_URL}/pricing`,
  },
  alternates: { canonical: `${SITE_URL}/pricing` },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}

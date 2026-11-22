import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

export const metadata: Metadata = {
  title: 'Product Photo Pricing — Credit Packs from $4.95',
  description: 'Create 4K and 8K product photos with one-time credit packs. Starter: 5 credits for $4.95. No subscription, no monthly fee, and credits never expire.',
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

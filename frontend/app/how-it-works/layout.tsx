import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.productshotai.com'

export const metadata: Metadata = {
  title: 'How AI Product Photo & Image Product AI Works',
  description: 'Upload a product photo, choose a style and size, then review and create. A guided three-step studio. 4K costs 1 credit and 8K costs 2.',
  openGraph: {
    title: 'How AI Product Photo & Image Product AI Works – ProductShotAI',
    description: 'Product photo AI in 3 steps. ai image product and image product ai for e‑commerce. Amazon product photo ready in seconds.',
    url: `${SITE_URL}/how-it-works`,
  },
  alternates: { canonical: `${SITE_URL}/how-it-works` },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children
}

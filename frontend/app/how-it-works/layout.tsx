import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

export const metadata: Metadata = {
  title: 'How AI Product Photo & Image Product AI Works',
  description: 'How our product photo AI and ai image product tool works: upload, describe, get 8K. Create image product ai and Amazon product photos in 3 steps. No photographer.',
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

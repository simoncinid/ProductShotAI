import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

export const metadata: Metadata = {
  title: 'AI Product Photo Use Cases for Amazon, Shopify, Etsy & e‑commerce',
  description:
    'Discover AI product photo use cases for Amazon FBA sellers, Shopify store owners, Etsy sellers and e‑commerce brands. Product photo AI and UGC-style product images in minutes.',
  openGraph: {
    title: 'AI Product Photo Use Cases – ProductShotAI',
    description:
      'See how ProductShotAI helps Amazon FBA sellers, Shopify merchants, Etsy sellers and e‑commerce owners create studio-quality AI product photos and UGC-style images.',
    url: `${SITE_URL}/use-cases`,
  },
  alternates: { canonical: `${SITE_URL}/use-cases` },
}

export default function UseCasesLayout({ children }: { children: React.ReactNode }) {
  return children
}


import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

export const metadata: Metadata = {
  title: 'AI Product Photo & Amazon Product Photo – Blog',
  description: 'Tips on AI product photo, product photo AI, ai image product, and Amazon product photo. Best practices, how-to guides, and image product ai for e‑commerce.',
  openGraph: {
    title: 'AI Product Photo & Amazon Product Photo – Blog | ProductShotAI',
    description: 'Product photo AI tips, ai image product guides, Amazon product photo best practices. Image product ai for e‑commerce.',
    url: `${SITE_URL}/blog`,
  },
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}

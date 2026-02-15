import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

export const metadata: Metadata = {
  title: 'Create AI Product Photo | Product Photo AI Tool',
  description: 'Create AI product photos and product photo AI in seconds. Upload your image, describe your vision, get 8K ai image product. Sign up to start. Amazon product photo ready.',
  openGraph: {
    title: 'Create AI Product Photo | Product Photo AI – ProductShotAI',
    description: 'Create AI product photos in seconds. Product photo AI and ai image product tool. 8K. Sign up to start. Amazon product photo ready.',
    url: `${SITE_URL}/create`,
  },
  alternates: { canonical: `${SITE_URL}/create` },
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children
}

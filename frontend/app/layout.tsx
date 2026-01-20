import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display, Great_Vibes } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-playfair',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ProductShotAI – AI Product Photo & Product Photo AI | Image Product AI',
    template: '%s | ProductShotAI',
  },
  description: 'Create stunning AI product photos and product photo AI in seconds. Free ai image product and image product ai tool. 8K quality for e‑commerce and Amazon product photos. No subscription.',
  keywords: ['ai product photo', 'product photo ai', 'ai image product', 'image product ai', 'amazon product photo', 'AI product photography', 'product image generator', 'ecommerce product photos'],
  authors: [{ name: 'ProductShotAI', url: SITE_URL }],
  creator: 'ProductShotAI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'ProductShotAI',
    title: 'ProductShotAI – AI Product Photo & Product Photo AI | Image Product AI',
    description: 'Create stunning AI product photos and product photo AI in seconds. Free ai image product tool. 8K for e‑commerce and Amazon product photos. No subscription.',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'ProductShotAI - AI product photo and product photo AI' }],
  },
  twitter: {
    card: 'summary',
    title: 'ProductShotAI – AI Product Photo & Product Photo AI',
    description: 'Create AI product photos in seconds. Product photo AI, ai image product. 8K quality. Amazon product photos. No subscription.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  category: 'technology',
}

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ProductShotAI',
  url: SITE_URL,
  description: 'AI product photo and product photo AI tool. Create ai image product and image product ai in seconds. Amazon product photos. 8K quality.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/create?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ProductShotAI',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'AI product photo, product photo AI, ai image product, and image product ai generator. Amazon product photo tool.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${greatVibes.variable}`}>
      <body className="font-sans antialiased text-primary">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

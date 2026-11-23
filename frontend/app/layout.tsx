import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from './providers'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { SiteChrome } from '@/components/SiteChrome'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.productshotai.com'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AI Product Photography for Ecommerce | ProductShotAI',
    template: '%s | ProductShotAI',
  },
  description: 'Create 4K and 8K product photos for your online store from a reference image. Catalog, lifestyle, and ad images. Credit packs from $4.95. No subscription.',
  keywords: ['ai product photo', 'product photo ai', 'ai image product', 'image product ai', 'amazon product photo', 'AI product photography', 'product image generator', 'ecommerce product photos'],
  authors: [{ name: 'ProductShotAI', url: SITE_URL }],
  creator: 'ProductShotAI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'ProductShotAI',
    title: 'AI Product Photography for Ecommerce | ProductShotAI',
    description: 'Turn a product reference into 4K and 8K catalog images, lifestyle scenes, and ads. Packs from $4.95. No subscription.',
    images: [{ url: '/logo1.png', width: 512, height: 512, alt: 'ProductShotAI - AI product photo and product photo AI' }],
  },
  twitter: {
    card: 'summary',
    title: 'AI Product Photography for Ecommerce | ProductShotAI',
    description: 'Create product photos for your online store in 4K or 8K. One-time credit packs from $4.95.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: '/logo1.png',
    apple: '/logo1.png',
  },
  category: 'technology',
}

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ProductShotAI',
  url: SITE_URL,
  description: 'AI product photography for ecommerce stores. Create catalog, lifestyle, and advertising images from a product reference.',

}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ProductShotAI',
  url: SITE_URL,
  logo: `${SITE_URL}/logo1.png`,
  description: 'AI product photography software for online stores.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased text-on-dark">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  )
}

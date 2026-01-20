import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display, Great_Vibes } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

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
  title: 'ProductShotAI - AI Amazon Product Photos',
  description: 'Transform your product photos into high-quality 8K Amazon-ready images with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${greatVibes.variable}`}>
      <body className="font-sans antialiased text-primary">
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

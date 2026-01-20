import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://productshotai.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/dashboard/', '/images/generated/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/dashboard', '/dashboard/', '/images/generated/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

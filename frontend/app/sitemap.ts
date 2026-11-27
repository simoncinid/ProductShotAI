import { growthArticles } from "@/lib/growth-articles";
import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.productshotai.com";

const blogSlugs = [
  ...Object.keys(growthArticles),
  "amazon-product-images-best-practices",
  "ai-vs-photographer-for-ecommerce",
  "improve-click-through-rate-better-images",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2026-11-27T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE_URL}/tools/product-photo-prompt-generator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${BASE_URL}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${BASE_URL}/use-cases`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${BASE_URL}/use-cases/amazon-fba-product-photos`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/use-cases/shopify-product-images`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/use-cases/etsy-product-photos`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/use-cases/ugc-product-images`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    ...(growthArticles[slug]
      ? { lastModified: new Date(growthArticles[slug].date + "T00:00:00Z") }
      : {}),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}

import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.productshotai.com";

export const metadata: Metadata = {
  title: "Product Photo Pricing — Credit Packs from $4.95",
  description:
    "Create 4K and 8K product photos with one-time credit packs. Starter: 5 credits for $4.95. No subscription, no monthly fee, and credits never expire.",
  openGraph: {
    title: "AI Product Photo Pricing | ProductShotAI",
    description:
      "One-time credit packs from $4.95 USD. A 4K image uses 1 credit; 8K uses 2. No subscription.",
    url: `${SITE_URL}/pricing`,
  },
  alternates: { canonical: `${SITE_URL}/pricing` },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

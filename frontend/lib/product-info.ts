// Public product facts, checked against /api/credits/packs on 27 November 2026.
// Keep this snapshot aligned with backend/app/credit_packs.py when prices change.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.productshotai.com";
export const publicCreditPacks = [
  {
    id: "starter",
    name: "Starter",
    credits: 5,
    price_per_credit: 0.99,
    total_price: 4.95,
  },
  {
    id: "standard",
    name: "Standard",
    credits: 15,
    price_per_credit: 0.89,
    total_price: 13.35,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 40,
    price_per_credit: 0.79,
    total_price: 31.6,
  },
  {
    id: "power",
    name: "Power",
    credits: 100,
    price_per_credit: 0.69,
    total_price: 69.0,
  },
];
export const publicPricingPlans = publicCreditPacks.map((pack) => ({
  id: pack.id,
  name: pack.name,
  credits: pack.credits,
  price: `$${pack.total_price.toFixed(2)}`,
  each: `$${pack.price_per_credit.toFixed(2)}`,
  popular: pack.id === "standard",
}));
export const softwareApplication = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#application`,
  name: "ProductShotAI",
  url: SITE_URL,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web browser",
  description:
    "AI product photography from a reference image. Create 4K or 8K catalog, lifestyle and social still images with one-time credit packs.",
  publisher: { "@id": `${SITE_URL}/#organization` },
  featureList: [
    "Reference-image product photography",
    "4K and 8K images",
    "Square, portrait and landscape formats",
    "One-time credit packs",
  ],
  offers: publicCreditPacks.map((pack) => ({
    "@type": "Offer",
    name: `${pack.name}: ${pack.credits} credits`,
    price: pack.total_price.toFixed(2),
    priceCurrency: "USD",
    url: `${SITE_URL}/pricing?pack=${pack.id}`,
    description:
      "One-time credit pack. One 4K image uses 1 credit; one 8K image uses 2 credits.",
  })),
};

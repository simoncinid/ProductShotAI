import type { Metadata } from "next";
import { FaqJsonLd } from "./FaqJsonLd";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.productshotai.com";

export const metadata: Metadata = {
  title: "ProductShotAI FAQ — Prices, Credits and Photo Requirements",
  description:
    "Answers about ProductShotAI credit packs, 4K and 8K costs, supported photos, optional brand settings and account help.",
  openGraph: {
    title:
      "ProductShotAI FAQ — Prices, Credits and Photo Requirements | ProductShotAI",
    description:
      "ProductShotAI prices, credits, photo requirements and account help.",
    url: `${SITE_URL}/faq`,
  },
  alternates: { canonical: `${SITE_URL}/faq` },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FaqJsonLd />
      {children}
    </>
  );
}

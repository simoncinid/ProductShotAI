import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.productshotai.com";

export const metadata: Metadata = {
  title: "Product Photography Guides and Free Prompt Resources",
  description:
    "Practical product photography guides, shot lists and copyable prompts for online sellers. Explore our free product photo prompt builder.",
  openGraph: {
    title:
      "Product Photography Guides and Free Prompt Resources | ProductShotAI",
    description:
      "Product photo shot lists, examples and free prompt resources for online sellers.",
    url: `${SITE_URL}/blog`,
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

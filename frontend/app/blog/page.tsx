import { growthArticles } from "@/lib/growth-articles";
import Link from "next/link";

const blogPosts = [
  ...Object.entries(growthArticles).map(([slug, post]) => ({ slug, ...post })),
  {
    slug: "amazon-product-images-best-practices",
    title: "Amazon Product Images Best Practices",
    excerpt:
      "Learn the essential guidelines for creating product images that convert on Amazon. From lighting to composition, we cover everything you need to know.",
    date: "2024-01-15",
  },
  {
    slug: "ai-vs-photographer-for-ecommerce",
    title: "AI vs Photographer: Which is Better for E-commerce?",
    excerpt:
      "Compare the costs, quality, and speed of AI-generated product photos versus traditional photography. Discover when each approach makes sense.",
    date: "2024-01-10",
  },
  {
    slug: "improve-click-through-rate-better-images",
    title: "How to Improve Click-Through Rate with Better Main Images",
    excerpt:
      "Your main product image is the first thing customers see. Learn proven strategies to make your images stand out and drive more clicks.",
    date: "2024-01-05",
  },
];

export default function BlogPage() {
  return (
    <div className="bg-page-bg">
      <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24 lg:px-14">
        <div className="max-w-4xl">
          <p className="text-[14px] font-medium uppercase tracking-[0.35px] text-muted">
            Production notes
          </p>
          <h1 className="mt-5 text-[40px] font-normal leading-none tracking-[-0.9px] text-white md:text-[56px]">
            Product photography guides you can put to work
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-snug text-[#a7a7a7]">
            Practical shot lists, copyable prompts and examples for
            photographing the products you sell.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14">
        <Link
          href="/tools/product-photo-prompt-generator"
          className="inline-flex min-h-12 rounded-lg border border-white/40 px-5 py-3 font-semibold text-white"
        >
          Free tool: build a product photo prompt →
        </Link>
      </div>

      <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24 lg:px-14">
        <div className="grid gap-5 md:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="flex min-h-[320px] flex-col rounded-lg border border-[#27272a] bg-[#1a1a1a] p-6 transition hover:border-[#c9ccd1]"
            >
              <div className="text-[12px] font-medium uppercase tracking-[0.35px] text-[#767d88]">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <h2 className="mt-5 text-[24px] font-normal leading-none tracking-[-0.4px] text-white">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-[#c9ccd1]"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-4 text-[15px] leading-snug text-[#a7a7a7]">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-auto inline-flex w-fit rounded border border-white/35 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-white hover:text-black"
              >
                Read more
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

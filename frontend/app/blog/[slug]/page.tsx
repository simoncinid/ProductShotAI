import Image from "next/image";
import { growthArticles } from "@/lib/growth-articles";
import { StartPhotoCTA } from "@/components/StartPhotoCTA";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.productshotai.com";

const blogPosts: Record<
  string,
  {
    title: string;
    date: string;
    excerpt?: string;
    image?: string;
    referenceImage?: string;
    content: string;
  }
> = {
  ...growthArticles,
  "amazon-product-images-best-practices": {
    title: "Amazon Product Images Best Practices",
    date: "2024-01-15",
    excerpt:
      "Best practices for Amazon product images: lighting, composition, formats. AI product photo and product photo AI tips for Amazon listings.",
    content: `
      <p>Creating high-quality product images is crucial for success on Amazon. Your main product image is often the first thing potential customers see, and it can make or break a sale. Here are the essential best practices for Amazon product images.</p>
      
      <h2>1. Follow Amazon's Technical Requirements</h2>
      <p>Amazon has specific technical requirements for product images:</p>
      <ul>
        <li>Amazon lists 500–10,000 pixels on the longest side; 1,000+ enables zoom</li>
        <li>JPEG is recommended; TIFF, PNG and non-animated GIF are also listed as supported</li>
        <li>Check the image and category guide before choosing your main-image framing</li>
        <li>The ProductShotAI upload limit is 10 MB; this is separate from Amazon’s file requirements</li>
      </ul>
      
      <p>Checked against <a href="https://sellercentral.amazon.com/gp/help/external/G1881?language=en_US" target="_blank" rel="noreferrer">Amazon’s product image requirements</a> on 27 November 2026. Rules can differ by image role and category; verify them before publishing.</p>
      <h2>2. Use Clean, White Backgrounds</h2>
      <p>Amazon requires main product images to have a pure white background (RGB 255, 255, 255). This ensures consistency across the marketplace and helps your product stand out. The product should fill at least 85% of the image frame.</p>
      
      <h2>3. Show Only the Product</h2>
      <p>Your main image should show only the product being sold. Avoid including props, text overlays, or lifestyle elements in the main image. Save those for additional images.</p>
      
      <h2>4. Use Professional Lighting</h2>
      <p>Good lighting is essential. Use soft, even lighting that eliminates harsh shadows. This makes your product look professional and helps customers see details clearly.</p>
      
      <h2>5. Show Multiple Angles</h2>
      <p>Use your additional image slots to show different angles, close-ups of important features, and the product in use. This gives customers a complete picture of what they're buying.</p>
      
      <h2>6. Optimize for Mobile</h2>
      <p>Many Amazon customers shop on mobile devices. Ensure your images are clear and readable on small screens. Test how your images look on a phone before publishing.</p>
      
      <h2>7. Keep It Simple</h2>
      <p>Cluttered images confuse customers. Keep your main image simple and focused on the product. Let the product speak for itself.</p>
      
      <p>By following these best practices, you'll create product images that not only meet Amazon's requirements but also drive conversions and sales.</p>
    `,
  },
  "ai-vs-photographer-for-ecommerce": {
    title: "AI vs Photographer: Which is Better for E-commerce?",
    date: "2024-01-10",
    excerpt:
      "AI product photo vs photographer: cost, speed, quality. When to use product photo AI and ai image product for e‑commerce.",
    content: `
      <p>The debate between AI-generated product photos and traditional photography is heating up in the e-commerce world. Both approaches have their merits, and the best choice depends on your specific needs.</p>
      
      <h2>Cost Comparison</h2>
      <p>Traditional photography can cost $50-$500+ per product, depending on complexity. AI-generated images cost a fraction of that - typically under $1 per image when buying credits in bulk.</p>
      
      <h2>Speed</h2>
      <p>AI wins hands down on speed. Allow a few minutes per generated image; timing varies with resolution and provider demand. Traditional photography requires scheduling, shooting, editing, and can take days or weeks.</p>
      
      <h2>Quality</h2>
      <p>Modern AI models produce stunning results that rival professional photography for product images. However, for complex lifestyle shots or unique artistic requirements, a photographer might still have the edge.</p>
      
      <h2>Consistency</h2>
      <p>Using the same reference and instructions can help keep a collection coherent, but AI can still change labels, colours and proportions. Review each output against the actual product.</p>
      
      <h2>Scalability</h2>
      <p>AI scales effortlessly. Need 100 product images? No problem. With photography, scaling means more time, more cost, and more complexity.</p>
      
      <h2>When to Use Each</h2>
      <p><strong>Use AI when:</strong></p>
      <ul>
        <li>You need many product images quickly</li>
        <li>Budget is a concern</li>
        <li>You want consistent style across products</li>
        <li>You're selling standard products that don't require unique artistic vision</li>
      </ul>
      
      <p><strong>Use a photographer when:</strong></p>
      <ul>
        <li>You need complex lifestyle photography</li>
        <li>You have unique artistic requirements</li>
        <li>You need images of people using your products</li>
        <li>You have a large budget and time for the process</li>
      </ul>
      
      <p>For most Amazon sellers, AI-generated product photos offer the best balance of quality, cost, and speed.</p>
    `,
  },
  "improve-click-through-rate-better-images": {
    title: "How to Improve Click-Through Rate with Better Main Images",
    date: "2024-01-05",
    excerpt:
      "Improve CTR with better product images. AI product photo and image product ai tips for e‑commerce and Amazon product photos.",
    content: `
      <p>Your main product image is your first impression on Amazon. It's what customers see in search results, and it directly impacts whether they click through to your listing. Here's how to optimize it for maximum click-through rate.</p>
      
      <h2>1. Make It Stand Out</h2>
      <p>In a sea of similar products, your image needs to catch the eye. Use vibrant colors, clear composition, and ensure your product is the hero of the image. Avoid cluttered backgrounds that distract from the product.</p>
      
      <h2>2. Show the Product Clearly</h2>
      <p>Customers need to see what they're buying. Ensure your product is in sharp focus, well-lit, and takes up most of the image frame. Blurry or distant shots reduce trust and clicks.</p>
      
      <h2>3. Use High Resolution</h2>
      <p>Amazon allows zooming on product images. High-resolution images (1000px+) enable customers to see details, which increases confidence and click-through rate. Always use the highest quality image possible.</p>
      
      <h2>4. Optimize for Mobile</h2>
      <p>Customers may view your listing on a small phone screen. Your image must look great on small screens. Test your image on a phone to ensure it's clear and compelling at thumbnail size.</p>
      
      <h2>5. Show Value</h2>
      <p>If your product has unique features, make them visible in the main image. Show what makes your product different or better than competitors.</p>
      
      <h2>6. A/B Test</h2>
      <p>Don't guess what works - test it. Try different images and measure which ones get more clicks. Amazon's data can help you understand which images perform best.</p>
      
      <h2>7. Follow Amazon Guidelines</h2>
      <p>Images that violate Amazon's guidelines get suppressed in search. Always follow the rules: white background, product only, no text overlays, proper sizing.</p>
      
      <h2>8. Consider Your Competition</h2>
      <p>Look at top-selling products in your category. What do their images have in common? Learn from successful listings while maintaining your unique brand identity.</p>
      
      <p>Remember: Your main image is often the only chance to grab a customer's attention in search results. Invest time and resources into making it perfect.</p>
    `,
  },
};

export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = blogPosts[params.slug];
  if (!post) return {};
  const desc =
    post.excerpt ||
    "AI product photo, product photo AI, and Amazon product photo tips from ProductShotAI.";
  return {
    title: post.title,
    description: desc,
    openGraph: {
      title: post.title,
      description: desc,
      url: `${SITE_URL}/blog/${params.slug}`,
      type: "article",
      publishedTime: post.date,
      ...(post.image
        ? {
            images: [
              { url: post.image, width: 1024, height: 1024, alt: post.title },
            ],
          }
        : {}),
    },
    alternates: { canonical: `${SITE_URL}/blog/${params.slug}` },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug];

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    description:
      post.excerpt ||
      "AI product photo, product photo AI, and Amazon product photo tips from ProductShotAI.",
    url: `${SITE_URL}/blog/${params.slug}`,
    ...(post.image ? { image: `${SITE_URL}${post.image}` } : {}),
    author: { "@type": "Organization", name: "ProductShotAI" },
    publisher: {
      "@type": "Organization",
      name: "ProductShotAI",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo1.png` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/blog"
          className="mb-8 inline-block font-medium text-brand hover:underline"
        >
          ← Back to Blog
        </Link>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 text-primary shadow-soft md:p-8">
          <div className="mb-4 text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1 className="mb-8 text-3xl leading-tight sm:text-5xl font-bold text-primary">
            {post.title}
          </h1>
          {post.image && (
            <figure className="mb-8">
              <div
                className={post.referenceImage ? "grid grid-cols-2 gap-3" : ""}
              >
                {post.referenceImage && (
                  <div>
                    <Image
                      src={post.referenceImage}
                      alt="Original candle jar reference photo"
                      width={1024}
                      height={1024}
                      sizes="(max-width: 767px) 45vw, 350px"
                      className="aspect-square w-full rounded-xl bg-slate-100 object-contain"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Reference photo
                    </p>
                  </div>
                )}
                <div>
                  <Image
                    src={post.image}
                    alt={`${post.title} — AI-generated illustration`}
                    width={1024}
                    height={1024}
                    sizes={
                      post.referenceImage
                        ? "(max-width: 767px) 45vw, 350px"
                        : "(max-width: 767px) 100vw, 700px"
                    }
                    className={
                      post.referenceImage
                        ? "aspect-square w-full rounded-xl bg-slate-100 object-cover"
                        : "mx-auto max-h-[420px] w-full rounded-xl object-contain bg-slate-100"
                    }
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    AI-generated illustration
                  </p>
                </div>
              </div>
              <figcaption className="mt-2 text-xs text-slate-500">
                Illustrative example. Generated product details may differ from
                the reference.
              </figcaption>
            </figure>
          )}
          <div
            className="[&_a]:text-teal-800 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-teal-700 [&_blockquote]:bg-slate-50 [&_blockquote]:p-4 [&_blockquote]:leading-relaxed [&_blockquote]:text-slate-700 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-3 [&_ol]:mb-5 [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-semibold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary [&_li]:text-slate-700 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-slate-700 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
        <aside className="mt-8 rounded-xl border border-white/20 bg-neutral-900 p-6 text-white">
          <h2 className="text-2xl font-semibold">
            Try the scene with your own product
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            Build a prompt for free, or create an image in the studio with a
            one-time credit pack. Starter: 5 credits for $4.95 USD. No
            subscription.
          </p>
          <Link
            href="/tools/product-photo-prompt-generator"
            className="mt-5 inline-flex min-h-12 items-center rounded-lg border border-white px-5 py-3 font-semibold"
          >
            Build a free prompt →
          </Link>
          <StartPhotoCTA
            placement="article_bottom"
            className="ml-0 mt-3 w-full sm:ml-3 sm:w-auto"
          />
        </aside>
      </div>
    </>
  );
}

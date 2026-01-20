import Link from 'next/link'

const blogPosts = [
  {
    slug: 'amazon-product-images-best-practices',
    title: 'Amazon Product Images Best Practices',
    excerpt: 'Learn the essential guidelines for creating product images that convert on Amazon. From lighting to composition, we cover everything you need to know.',
    date: '2024-01-15',
  },
  {
    slug: 'ai-vs-photographer-for-ecommerce',
    title: 'AI vs Photographer: Which is Better for E-commerce?',
    excerpt: 'Compare the costs, quality, and speed of AI-generated product photos versus traditional photography. Discover when each approach makes sense.',
    date: '2024-01-10',
  },
  {
    slug: 'improve-click-through-rate-better-images',
    title: 'How to Improve Click-Through Rate with Better Main Images',
    excerpt: 'Your main product image is the first thing customers see. Learn proven strategies to make your images stand out and drive more clicks.',
    date: '2024-01-05',
  },
]

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-rich-black mb-4">
          AI Product Photo & Amazon Product Photo Blog
        </h1>
        <p className="text-xl text-gray-600">
          Product photo AI tips, ai image product guides, and image product ai best practices for e‑commerce and Amazon sellers
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition"
          >
            <div className="text-sm text-gray-500 mb-2">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <h2 className="text-3xl font-bold text-rich-black mb-4">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-vivid-yellow transition"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {post.excerpt}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-vivid-yellow hover:underline font-semibold"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

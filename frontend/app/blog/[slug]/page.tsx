import { notFound } from 'next/navigation'
import Link from 'next/link'

const blogPosts: Record<string, { title: string; date: string; content: string }> = {
  'amazon-product-images-best-practices': {
    title: 'Amazon Product Images Best Practices',
    date: '2024-01-15',
    content: `
      <p>Creating high-quality product images is crucial for success on Amazon. Your main product image is often the first thing potential customers see, and it can make or break a sale. Here are the essential best practices for Amazon product images.</p>
      
      <h2>1. Follow Amazon's Technical Requirements</h2>
      <p>Amazon has specific technical requirements for product images:</p>
      <ul>
        <li>Main image must be at least 1000 pixels on the longest side</li>
        <li>Images should be in JPEG format</li>
        <li>Use 1:1 aspect ratio for main images</li>
        <li>Maximum file size of 10MB</li>
      </ul>
      
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
  'ai-vs-photographer-for-ecommerce': {
    title: 'AI vs Photographer: Which is Better for E-commerce?',
    date: '2024-01-10',
    content: `
      <p>The debate between AI-generated product photos and traditional photography is heating up in the e-commerce world. Both approaches have their merits, and the best choice depends on your specific needs.</p>
      
      <h2>Cost Comparison</h2>
      <p>Traditional photography can cost $50-$500+ per product, depending on complexity. AI-generated images cost a fraction of that - typically under $1 per image when buying credits in bulk.</p>
      
      <h2>Speed</h2>
      <p>AI wins hands down on speed. You can get a professional product image in 30-60 seconds. Traditional photography requires scheduling, shooting, editing, and can take days or weeks.</p>
      
      <h2>Quality</h2>
      <p>Modern AI models produce stunning results that rival professional photography for product images. However, for complex lifestyle shots or unique artistic requirements, a photographer might still have the edge.</p>
      
      <h2>Consistency</h2>
      <p>AI provides perfect consistency. Every image follows the same style and quality standards. With photographers, results can vary based on the photographer, lighting conditions, and other factors.</p>
      
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
  'improve-click-through-rate-better-images': {
    title: 'How to Improve Click-Through Rate with Better Main Images',
    date: '2024-01-05',
    content: `
      <p>Your main product image is your first impression on Amazon. It's what customers see in search results, and it directly impacts whether they click through to your listing. Here's how to optimize it for maximum click-through rate.</p>
      
      <h2>1. Make It Stand Out</h2>
      <p>In a sea of similar products, your image needs to catch the eye. Use vibrant colors, clear composition, and ensure your product is the hero of the image. Avoid cluttered backgrounds that distract from the product.</p>
      
      <h2>2. Show the Product Clearly</h2>
      <p>Customers need to see what they're buying. Ensure your product is in sharp focus, well-lit, and takes up most of the image frame. Blurry or distant shots reduce trust and clicks.</p>
      
      <h2>3. Use High Resolution</h2>
      <p>Amazon allows zooming on product images. High-resolution images (1000px+) enable customers to see details, which increases confidence and click-through rate. Always use the highest quality image possible.</p>
      
      <h2>4. Optimize for Mobile</h2>
      <p>Over 60% of Amazon shopping happens on mobile. Your image must look great on small screens. Test your image on a phone to ensure it's clear and compelling at thumbnail size.</p>
      
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
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug]

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/blog"
        className="text-vivid-yellow hover:underline mb-8 inline-block"
      >
        ← Back to Blog
      </Link>

      <article>
        <div className="text-sm text-gray-500 mb-4">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <h1 className="text-5xl font-bold text-rich-black mb-8">
          {post.title}
        </h1>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}

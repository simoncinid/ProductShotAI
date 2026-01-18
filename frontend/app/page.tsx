import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-rich-black mb-6">
            AI-Powered Product Photos
            <br />
            <span className="text-vivid-yellow">Amazon Ready in Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your product photos into high-quality 8K images optimized for Amazon listings. 
            No photographer needed. No monthly fees. Pay only for what you use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="bg-vivid-yellow text-rich-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition shadow-lg"
            >
              Try Free Now
            </Link>
            <Link
              href="/how-it-works"
              className="bg-rich-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition"
            >
              Learn More
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Get 3 free watermarked images per month • No credit card required
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-rich-black text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-vivid-yellow w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-rich-black">1</span>
              </div>
              <h3 className="text-xl font-semibold text-rich-black mb-2">Upload Your Photo</h3>
              <p className="text-gray-600">
                Upload a photo of your product. We support JPEG and PNG formats.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-vivid-yellow w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-rich-black">2</span>
              </div>
              <h3 className="text-xl font-semibold text-rich-black mb-2">Describe Your Vision</h3>
              <p className="text-gray-600">
                Write a prompt describing how you want your product to look. Our AI understands Amazon product photography.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-vivid-yellow w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-rich-black">3</span>
              </div>
              <h3 className="text-xl font-semibold text-rich-black mb-2">Get Your Image</h3>
              <p className="text-gray-600">
                Receive a high-quality 8K image optimized for Amazon. Download and use it immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Summary */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-rich-black text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            No monthly subscriptions. Pay only for the images you need. 
            The more credits you buy, the less you pay per image.
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="border-2 border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-rich-black mb-2">Starter</h3>
              <div className="text-3xl font-bold text-vivid-yellow mb-1">$4.95</div>
              <div className="text-sm text-gray-600 mb-4">5 credits • $0.99 each</div>
              <Link
                href="/pricing"
                className="block bg-rich-black text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
              >
                View Details
              </Link>
            </div>
            <div className="border-2 border-vivid-yellow rounded-lg p-6 text-center relative">
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-vivid-yellow text-rich-black px-3 py-1 rounded-full text-xs font-semibold">
                POPULAR
              </span>
              <h3 className="text-xl font-bold text-rich-black mb-2">Standard</h3>
              <div className="text-3xl font-bold text-vivid-yellow mb-1">$13.35</div>
              <div className="text-sm text-gray-600 mb-4">15 credits • $0.89 each</div>
              <Link
                href="/pricing"
                className="block bg-rich-black text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
              >
                View Details
              </Link>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-rich-black mb-2">Pro</h3>
              <div className="text-3xl font-bold text-vivid-yellow mb-1">$31.60</div>
              <div className="text-sm text-gray-600 mb-4">40 credits • $0.79 each</div>
              <Link
                href="/pricing"
                className="block bg-rich-black text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
              >
                View Details
              </Link>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-rich-black mb-2">Power</h3>
              <div className="text-3xl font-bold text-vivid-yellow mb-1">$69.00</div>
              <div className="text-sm text-gray-600 mb-4">100 credits • $0.69 each</div>
              <Link
                href="/pricing"
                className="block bg-rich-black text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-rich-black text-center mb-12">
            Trusted by Amazon Sellers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 mb-4">
                "ProductShotAI saved me thousands on photography. The quality is amazing and the process is so fast."
              </p>
              <p className="font-semibold text-rich-black">— Sarah M., Amazon Seller</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 mb-4">
                "I love that I only pay for what I use. No monthly fees, no commitments. Perfect for my business."
              </p>
              <p className="font-semibold text-rich-black">— John D., E-commerce Entrepreneur</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 mb-4">
                "The 8K quality is incredible. My product images stand out and my conversion rate improved significantly."
              </p>
              <p className="font-semibold text-rich-black">— Maria L., FBA Seller</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-rich-black text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-rich-black mb-2">
                How many free images do I get?
              </h3>
              <p className="text-gray-600">
                Every device gets 3 free watermarked images per month. No signup required!
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-rich-black mb-2">
                Do I need a subscription?
              </h3>
              <p className="text-gray-600">
                No! We don't offer subscriptions. You only pay for the credits you need, when you need them.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-rich-black mb-2">
                What image formats do you support?
              </h3>
              <p className="text-gray-600">
                We accept JPEG and PNG uploads. All outputs are delivered as high-quality JPEG images in 8K resolution.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="text-vivid-yellow hover:underline font-semibold"
            >
              View All FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-rich-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Product Photos?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start with 3 free images today. No credit card required.
          </p>
          <Link
            href="/create"
            className="bg-vivid-yellow text-rich-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-rich-black mb-4">
          How It Works
        </h1>
        <p className="text-xl text-gray-600">
          Transform your product photos into Amazon-ready images in three simple steps
        </p>
      </div>

      <div className="space-y-12 mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-shrink-0">
            <div className="bg-vivid-yellow w-24 h-24 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-rich-black">1</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-rich-black mb-4">
              Upload Your Existing Product Photo
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Start with any photo of your product. It doesn't need to be perfect - 
              our AI will enhance it. We support JPEG and PNG formats up to 10MB.
            </p>
            <p className="text-gray-600">
              You can use photos taken with your phone, from your existing listings, 
              or any product image you have. The AI understands product photography 
              and will optimize it for Amazon's requirements.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-shrink-0">
            <div className="bg-vivid-yellow w-24 h-24 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-rich-black">2</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-rich-black mb-4">
              Describe Your Vision
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Write a prompt in plain English describing how you want your product to look. 
              Be specific about:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>Background (white, colored, lifestyle scene)</li>
              <li>Lighting (soft, dramatic, natural)</li>
              <li>Style (minimalist, professional, vibrant)</li>
              <li>Any specific elements you want to add or change</li>
            </ul>
            <p className="text-gray-600">
              Example: "Place the product on a clean white background with soft, 
              even lighting. Add a subtle shadow underneath. Make the colors more 
              vibrant and ensure the product is centered."
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-shrink-0">
            <div className="bg-vivid-yellow w-24 h-24 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-rich-black">3</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-rich-black mb-4">
              Get Your Amazon-Ready Image
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Within 30-60 seconds, receive a high-quality 8K image optimized for Amazon listings.
            </p>
            <p className="text-gray-600 mb-4">
              Our AI model is specifically trained to understand Amazon product photography 
              requirements and keeps your original product intact while transforming the scene 
              around it. The result is a professional product image that:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Meets Amazon's image quality standards</li>
              <li>Has the correct aspect ratio (1:1 for main images)</li>
              <li>Is optimized for conversion</li>
              <li>Maintains product accuracy</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-bold text-rich-black mb-4">
          Why ProductShotAI?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-rich-black mb-2">Optimized for Amazon</h3>
            <p className="text-gray-600">
              Our AI model understands Amazon's product photography requirements 
              and creates images that are optimized for marketplace success.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-rich-black mb-2">Preserves Your Product</h3>
            <p className="text-gray-600">
              The AI keeps your original product intact while transforming the background 
              and lighting. Your product always looks accurate.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-rich-black mb-2">8K Quality</h3>
            <p className="text-gray-600">
              All images are generated in 8K resolution, ensuring they look great 
              at any size and meet the highest quality standards.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-rich-black mb-2">Fast & Affordable</h3>
            <p className="text-gray-600">
              Get professional product photos in seconds, not days. 
              Pay only for what you use - no monthly subscriptions.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <a
          href="/create"
          className="inline-block bg-vivid-yellow text-rich-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition"
        >
          Try It Free Now
        </a>
      </div>
    </div>
  )
}

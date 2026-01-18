export default function FAQPage() {
  const faqs = [
    {
      question: "How many free images do I get?",
      answer: "Every device gets 3 free watermarked images per month. This is tracked by device ID and IP address. No signup or credit card required!"
    },
    {
      question: "What is the watermark on free images?",
      answer: "Free images include a diagonal watermark that says 'AI SAMPLE – UPGRADE FOR CLEAN IMAGE'. This watermark is designed to be clearly visible and difficult to remove. To get clean images without watermark, sign up and purchase credits."
    },
    {
      question: "Do I need a subscription?",
      answer: "No! We don't offer monthly subscriptions. You only pay for the credits you need, when you need them. Credits never expire, so you can use them at your own pace."
    },
    {
      question: "What image formats do you support?",
      answer: "We accept JPEG and PNG uploads (up to 10MB). All outputs are delivered as high-quality JPEG images in 8K resolution, optimized for Amazon listings."
    },
    {
      question: "What aspect ratios are available?",
      answer: "You can choose from three aspect ratios: 1:1 (square, perfect for Amazon main images), 4:5 (portrait), and 16:9 (landscape). The default is 1:1 for Amazon compatibility."
    },
    {
      question: "How long does generation take?",
      answer: "Most generations complete within 30-60 seconds. The AI processes your image and prompt, then returns a high-quality 8K result. You'll see a progress indicator while waiting."
    },
    {
      question: "Can I use these images on Amazon?",
      answer: "Yes! Our images are specifically optimized for Amazon product listings. However, you should always ensure your images comply with Amazon's current image requirements and policies. We recommend reviewing Amazon's guidelines for your specific category."
    },
    {
      question: "What happens if a generation fails?",
      answer: "If a generation fails, you won't be charged a credit (for paid users). Free users won't have their free generation count deducted. You can simply try again with a different prompt or image."
    },
    {
      question: "Do credits expire?",
      answer: "No, credits never expire. Once you purchase credits, they remain in your account until you use them. There's no time limit or expiration date."
    },
    {
      question: "Can I get a refund?",
      answer: "We don't offer refunds for credit purchases, but credits never expire so you can use them whenever you need. If you experience technical issues, please contact our support team."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. Your images are stored securely and are only used for generation purposes. We don't share your data with third parties. See our Privacy Policy for more details."
    },
    {
      question: "Can I use the images commercially?",
      answer: "Yes, once you generate an image (whether free or paid), you have the right to use it for commercial purposes including Amazon listings, marketing materials, and other business uses."
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-rich-black mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-gray-600">
          Everything you need to know about ProductShotAI
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold text-rich-black mb-3">
              {faq.question}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-rich-black mb-4">
          Still have questions?
        </h2>
        <p className="text-gray-600 mb-6">
          Can't find the answer you're looking for? Please reach out to our support team.
        </p>
        <a
          href="mailto:support@productshotai.com"
          className="inline-block bg-vivid-yellow text-rich-black px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}

const faqs = [
  { q: 'How many free images do I get?', a: 'Every device gets 3 free watermarked images per month. This is tracked by device ID and IP address. No signup or credit card required!' },
  { q: "What is the watermark on free images?", a: "Free images include a diagonal watermark that says 'AI SAMPLE – UPGRADE FOR CLEAN IMAGE'. To get clean images without watermark, sign up and purchase credits." },
  { q: "Do I need a subscription?", a: "No! We don't offer monthly subscriptions. You only pay for the credits you need, when you need them. Credits never expire." },
  { q: "What image formats do you support?", a: "We accept JPEG and PNG uploads (up to 10MB). All outputs are delivered as high-quality JPEG images in 8K resolution, optimized for Amazon listings." },
  { q: "What aspect ratios are available?", a: "1:1 (square, perfect for Amazon main images), 4:5 (portrait), and 16:9 (landscape). The default is 1:1 for Amazon compatibility." },
  { q: "How long does generation take?", a: "Most generations complete within 30-60 seconds. The AI processes your image and prompt, then returns a high-quality 8K result." },
  { q: "Can I use these images on Amazon?", a: "Yes! Our images are specifically optimized for Amazon product listings. Always ensure your images comply with Amazon's current image requirements." },
  { q: "What happens if a generation fails?", a: "If a generation fails, you won't be charged a credit (for paid users). Free users won't have their free generation count deducted." },
  { q: "Do credits expire?", a: "No, credits never expire. Once you purchase credits, they remain in your account until you use them." },
  { q: "Can I get a refund?", a: "We don't offer refunds for credit purchases, but credits never expire. If you experience technical issues, please contact our support team." },
  { q: "Is my data secure?", a: "Yes. Your images are stored securely and are only used for generation purposes. We don't share your data with third parties." },
  { q: "Can I use the images commercially?", a: "Yes, once you generate an image you have the right to use it for commercial purposes including Amazon listings and marketing." },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export function FaqJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
}

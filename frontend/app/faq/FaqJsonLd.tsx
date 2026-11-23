const faqs = [
  { q: 'How do I get started?', a: 'Sign up for an account, purchase a credit pack, and start generating professional product photos right away. No subscription required!' },
  { q: "Do I need a subscription?", a: "No! We don't offer monthly subscriptions. You only pay for the credits you need, when you need them. Credits never expire." },
  { q: "What image formats do you support?", a: "We accept JPEG and PNG uploads (up to 10MB). Choose 4K for 1 credit per image or 8K for 2 credits. Review generated details before publishing." },
  { q: "What aspect ratios are available?", a: "1:1 (square, perfect for Amazon main images), 4:5 (portrait), and 16:9 (landscape). The default is 1:1 for Amazon compatibility." },
  { q: "How long does generation take?", a: "Allow a few minutes. Timing varies with resolution and provider demand. Your generation status is visible in the studio." },
  { q: "Can I use these images on Amazon?", a: "Yes! Our images are specifically optimized for Amazon product listings. Always ensure your images comply with Amazon's current image requirements." },
  { q: "What happens if a generation fails?", a: "If a generation fails, you won't be charged a credit. You can simply try again with a different prompt or image." },
  { q: "Do credits expire?", a: "No, credits never expire. Once you purchase credits, they remain in your account until you use them." },
  { q: "Can I get a refund?", a: "We don't offer refunds for credit purchases, but credits never expire. If you experience technical issues, please contact our support team." },
  { q: "Is my data secure?", a: "Yes. Your images are stored securely and are only used for generation purposes. Your reference is processed by our AI generation providers to create your images." },
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

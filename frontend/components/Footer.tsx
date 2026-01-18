import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-rich-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              Product<span className="text-vivid-yellow">Shot</span>AI
            </h3>
            <p className="text-gray-400 text-sm">
              AI-powered product photography for Amazon sellers
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/how-it-works" className="hover:text-vivid-yellow transition">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-vivid-yellow transition">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-vivid-yellow transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/blog" className="hover:text-vivid-yellow transition">Blog</Link></li>
              <li><Link href="/terms" className="hover:text-vivid-yellow transition">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-vivid-yellow transition">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="mailto:support@productshotai.com" className="hover:text-vivid-yellow transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} ProductShotAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

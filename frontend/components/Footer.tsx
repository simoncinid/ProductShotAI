import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-muted/40 bg-cream">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-10 lg:px-14">
        <Link href="/" className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-primary">
          <Image src="/logo1.png" alt="" width={50} height={50} className="object-contain" />
          ProductShotAI
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-secondary">
          <Link href="/how-it-works" className="transition hover:text-primary">How it works</Link>
          <Link href="/pricing" className="transition hover:text-primary">Pricing</Link>
          <Link href="/faq" className="transition hover:text-primary">FAQ</Link>
          <Link href="/blog" className="transition hover:text-primary">Blog</Link>
          <Link href="/create" className="transition hover:text-primary">Create</Link>
          <Link href="/privacy" className="transition hover:text-primary">Privacy</Link>
          <Link href="/terms" className="transition hover:text-primary">Terms</Link>
          <a href="mailto:reservationwebbitz@gmail.com" className="transition hover:text-primary">Contact</a>
        </nav>
        <p className="text-[13px] text-secondary">© 2026 ProductShotAI. All rights reserved.</p>
      </div>
    </footer>
  )
}

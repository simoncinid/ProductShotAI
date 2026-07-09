import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-[#27272a] bg-black">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-10 lg:px-14">
        <Link href="/" className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.35px] text-white">
          <Image src="/logo1.png" alt="" width={50} height={50} className="object-contain" />
          ProductShotAI
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#767d88]">
          <Link href="/how-it-works" className="transition hover:text-white">How it works</Link>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
          <Link href="/faq" className="transition hover:text-white">FAQ</Link>
          <Link href="/blog" className="transition hover:text-white">Blog</Link>
          <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
          <Link href="/terms" className="transition hover:text-white">Terms</Link>
          <a href="mailto:reservationwebbitz@gmail.com" className="transition hover:text-white">Contact</a>
        </nav>
        <p className="text-[13px] text-[#767d88]">© 2026 ProductShotAI. All rights reserved.</p>
      </div>
    </footer>
  )
}

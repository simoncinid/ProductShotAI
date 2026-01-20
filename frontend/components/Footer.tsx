import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-[#0D1117] text-gray-400">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-10 lg:px-14">
        <Link href="/" className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-white">
          <Image src="/logo.png" alt="" width={28} height={28} className="object-contain" />
          Product<span className="text-brand">Shot</span>AI
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-[13px]">
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
          <a href="mailto:support@productshotai.com" className="hover:text-white transition">Contact</a>
        </nav>
        <p className="text-[13px]">© ProductShotAI, All rights reserved</p>
      </div>
    </footer>
  )
}

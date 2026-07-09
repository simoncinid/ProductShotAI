import Image from 'next/image'
import Link from 'next/link'

type DynamicBackdropItem = {
  title: string
  text: string
  href: string
}

export function DynamicBackdropSection({
  eyebrow,
  title,
  ctaLabel,
  ctaHref,
  image,
  items,
}: {
  eyebrow: string
  title: string
  ctaLabel: string
  ctaHref: string
  image: string
  items: DynamicBackdropItem[]
}) {
  return (
    <section className="relative overflow-hidden bg-black py-16 text-white md:py-24">
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        className="dynamic-backdrop-image object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[18px]" aria-hidden />
      <div className="absolute inset-0 bg-black/25" aria-hidden />

      <div className="relative mx-auto grid max-w-[1600px] gap-10 px-6 md:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)] lg:px-14">
        <div className="flex min-h-[440px] flex-col justify-center md:min-h-[520px]">
          <p className="text-[14px] font-medium text-white/85">{eyebrow}</p>
          <h2 className="mt-8 max-w-3xl text-[34px] font-normal leading-[1.05] tracking-[-0.9px] md:text-[48px]">
            {title}
          </h2>
          <Link
            href={ctaHref}
            className="mt-10 inline-flex w-fit rounded border border-white/65 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white hover:text-black"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="flex flex-col justify-center">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group border-t border-white/70 py-7 last:border-b"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-[26px] font-normal leading-none tracking-[-0.6px] text-white">{item.title}</h3>
                  <p className="mt-3 max-w-xl text-[15px] leading-snug text-white/70">{item.text}</p>
                </div>
                <span className="shrink-0 text-[24px] leading-none text-white/80 transition group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

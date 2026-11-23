import Link from "next/link";
import Image from "next/image";
import { StartPhotoCTA } from "@/components/StartPhotoCTA";

const steps = [
  {
    title: "Upload your photo",
    text: "Open Create photo and upload a JPG or PNG, up to 10 MB. Use a sharp photo with the whole product visible. You can also choose a product you already saved.",
    detail: "No brand setup is required.",
    image: "/images/product1.png",
    alt: "Product reference: brown leather bag on a plain background",
  },
  {
    title: "Choose your style and size",
    text: "Choose a suggested style, then square (1:1), portrait (4:5) or landscape (16:9). Start in 4K for 1 credit per image, or choose 8K for 2 credits. You can add a short instruction.",
    detail:
      "For a new background, describe the setting and ask to keep the product details.",
    image: "/images/res4.png",
    alt: "AI-generated example of the bag in a studio setting",
  },
  {
    title: "Review, create and download",
    text: "Review your photo, choices, credit balance and exact cost. Press Create once. Allow a few minutes; the status remains visible. Download the finished image or find it again in My images.",
    detail:
      "Check labels, colours and proportions before using an AI image in your store.",
    image: "/images/res1.png",
    alt: "AI-generated lifestyle example of the bag at a café",
  },
];
export default function HowItWorksPage() {
  return (
    <div className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-20">
        <p className="text-xs uppercase tracking-wider text-slate-400">
          The photo studio
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          From your product photo to a new scene in three steps.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
          A guided workspace on your phone or computer. Your reference photo,
          settings and credit cost stay in view.
        </p>
        <StartPhotoCTA placement="how_it_works_hero" className="mt-7" />
        <div className="mt-12 space-y-7">
          {steps.map((step, index) => (
            <section
              key={step.title}
              className="grid items-center gap-6 rounded-2xl border border-white/15 bg-neutral-900 p-5 sm:p-8 md:grid-cols-[220px_1fr]"
            >
              <figure>
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={400}
                  height={400}
                  sizes="(max-width: 767px) 100vw, 220px"
                  className={`mx-auto aspect-square w-full max-w-[320px] rounded-xl bg-white ${index === 0 ? "object-contain" : "object-cover"}`}
                />
                <figcaption className="mt-2 text-xs text-slate-400">
                  {index === 0 ? "Reference photo" : "AI-generated example"}
                </figcaption>
              </figure>
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  Step {index + 1} of 3
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{step.title}</h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-slate-300">
                  {step.text}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {step.detail}
                </p>
              </div>
            </section>
          ))}
        </div>
        <section className="mt-10 rounded-2xl border border-white/15 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Start with a small pack.</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">
            Starter gives you 5 credits for $4.95 USD: up to five 4K images.
            Credits never expire. No subscription. Your account needs a
            confirmed email before you purchase.
          </p>
          <StartPhotoCTA placement="how_it_works_bottom" className="mt-6" />
          <p className="mt-4 text-sm text-slate-400">
            Creating a full collection? Optional{" "}
            <Link href="/dashboard/products" className="text-white underline">
              saved products
            </Link>
            , brand settings and image sets are also available in your account.
          </p>
        </section>
      </div>
    </div>
  );
}

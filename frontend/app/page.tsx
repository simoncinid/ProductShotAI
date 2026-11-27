import { publicPricingPlans, softwareApplication } from "@/lib/product-info";
import Link from "next/link";
import Image from "next/image";
import { StartPhotoCTA } from "@/components/StartPhotoCTA";
import { PricingShowcase } from "@/components/PricingShowcase";

const container = "mx-auto max-w-6xl px-5 sm:px-8";
const examples = [
  {
    name: "Leather bag",
    before: "product1.png",
    after: "res1.png",
    style: "Lifestyle scene",
  },
  {
    name: "Candle",
    before: "candleBefore.png",
    after: "candleAfter1.png",
    style: "Product styling",
  },
  {
    name: "Water bottle",
    before: "ugcBefore.png",
    after: "ugcAfter1.png",
    style: "In-hand scene",
  },
];
const steps = [
  [
    "Upload your product photo",
    "Use a clear JPG or PNG, up to 10 MB. A phone photo is enough to get started.",
  ],
  [
    "Choose the look",
    "Pick a style, a square, portrait or landscape format, and 4K or 8K. Add a short instruction if you want.",
  ],
  [
    "Review, create, download",
    "See the exact credit cost before you create. Your finished images stay in your library.",
  ],
];
const faqs = [
  [
    "What do I get for $4.95?",
    "Starter includes 5 credits: up to five 4K images, or two 8K images and one 4K image. Each generation creates one image. It is a one-time payment, with no subscription.",
  ],
  [
    "Do I need to write prompts or set up a brand?",
    "No. The photo studio guides you through three steps. Choose a style and use the suggested instructions, or add your own. Brand settings and image sets are optional tools.",
  ],
  [
    "How long does an image take?",
    "Allow a few minutes. Time varies with resolution and provider demand. You can see the status in your studio and come back to your image library.",
  ],
  [
    "Will the product look exactly the same?",
    "AI can change small details, labels or proportions. Use a sharp reference photo and check every result before publishing it. The examples illustrate possible looks; results vary.",
  ],
];

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplication),
        }}
      />
      <section
        className={`${container} grid items-center gap-9 py-10 md:grid-cols-2 md:gap-12 md:py-20`}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            AI product photography for online stores
          </p>
          <h1 className="mt-5 text-[38px] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[60px]">
            One product photo.
            <br />
            <span className="text-slate-400">A whole new look.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
            Turn your product photo into clean catalog images, lifestyle scenes
            and social content. Upload, choose a style, and create.
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:items-start">
            <StartPhotoCTA placement="homepage_hero" />
            <p className="text-sm text-slate-400">
              One-time payment · No subscription · Credits never expire
            </p>
            <Link
              href="#examples"
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-white underline underline-offset-4"
            >
              See the before & after examples ↓
            </Link>
          </div>
        </div>
        <figure className="min-w-0">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-neutral-900">
            <Image
              src="/images/res1.png"
              alt="AI-generated lifestyle example: a brown leather bag on a café table"
              width={1024}
              height={1024}
              priority
              sizes="(max-width: 767px) 100vw, 560px"
              className="aspect-square w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 w-[30%] overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-black">
                Your starting photo
              </p>
              <Image
                src="/images/product1.png"
                alt="Original leather bag reference on a plain background"
                width={260}
                height={260}
                sizes="160px"
                className="aspect-square w-full object-contain"
              />
            </div>
            <span className="absolute right-3 top-3 rounded bg-black/75 px-3 py-1.5 text-xs text-white">
              AI-generated example
            </span>
          </div>
          <figcaption className="mt-3 text-xs leading-relaxed text-slate-400">
            A reference photo becomes a new scene. Examples are AI-generated;
            check product details before publishing.
          </figcaption>
        </figure>
      </section>
      <section
        id="examples"
        className="scroll-mt-24 border-y border-white/10 bg-[#111] py-12 md:py-20"
      >
        <div className={container}>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            See what you can make
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Your product, in a different setting.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-300">
            Start with the photo you already have. Explore a new scene before
            arranging another shoot.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {examples.map((example) => (
              <figure
                key={example.name}
                className="overflow-hidden rounded-xl border border-white/15 bg-black"
              >
                <div className="grid grid-cols-2 gap-px bg-white/15">
                  {[
                    ["before", example.before],
                    ["AI example", example.after],
                  ].map(([label, src]) => (
                    <div key={label} className="min-w-0 bg-white">
                      <Image
                        src={`/images/${src}`}
                        alt={`${example.name}: ${label}`}
                        width={512}
                        height={512}
                        sizes="(max-width: 1023px) 45vw, 180px"
                        className={`aspect-square w-full ${label === "before" ? "object-contain" : "object-cover"}`}
                      />
                      <p className="bg-white px-3 py-2 text-xs font-semibold text-black">
                        {label === "before"
                          ? "Your photo"
                          : "AI-generated scene"}
                      </p>
                    </div>
                  ))}
                </div>
                <figcaption className="p-4">
                  <strong>{example.name}</strong>
                  <p className="mt-1 text-sm text-slate-400">{example.style}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-5 text-sm text-slate-400">
            Illustrative examples. Generated details may differ from the
            reference.
          </p>
          <Link
            href="/use-cases/ugc-product-images"
            className="mt-5 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
          >
            Explore UGC-style product images →
          </Link>
        </div>
      </section>
      <section className={`${container} py-12 md:py-20`}>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Three steps. Everything in view.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <article
              key={title}
              className="rounded-xl border border-white/15 p-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-relaxed text-slate-400">{text}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-400">
          4K = 1 credit per image. 8K = 2 credits. No brand setup required.
        </p>
        <Link
          href="/how-it-works"
          className="mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          Walk through the photo studio →
        </Link>
      </section>
      <section className={`${container} pb-12 md:pb-16`}>
        <div className="rounded-2xl border border-white/20 bg-neutral-900 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Free, no account needed
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Need a starting prompt for your product?
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">
            Choose a product, setting and format. Our free builder gives you
            copyable instructions to use with your reference photo.
          </p>
          <Link
            href="/tools/product-photo-prompt-generator"
            className="mt-5 inline-flex min-h-12 items-center rounded-lg border border-white px-5 py-3 font-semibold"
          >
            Build a free product photo prompt →
          </Link>
        </div>
      </section>
      <PricingShowcase
        plans={publicPricingPlans}
        title="Start small. Buy more when you need them."
        description="Try your own product with Starter: 5 credits for $4.95 USD. Payment is handled by Stripe. No monthly fee."
      />
      <section className={`${container} py-12 md:py-20`}>
        <h2 className="text-3xl font-semibold md:text-4xl">Before you start</h2>
        <div className="mt-7 max-w-3xl divide-y divide-white/15">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="min-h-8 cursor-pointer text-lg font-medium">
                {question}
              </summary>
              <p className="mt-3 leading-relaxed text-slate-400">{answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-white/15 bg-neutral-900 p-6 sm:p-9">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Try it with a product you actually sell.
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-slate-300">
            Create your account, confirm your email, then get your first credit
            pack. Your studio is ready on your phone or computer.
          </p>
          <StartPhotoCTA
            placement="homepage_bottom"
            className="mt-6 w-full sm:w-auto"
          />
          <p className="mt-4 text-sm text-slate-400">
            Need help?{" "}
            <a
              href="mailto:reservationwebbitz@gmail.com"
              className="text-white underline underline-offset-4"
            >
              Email us
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

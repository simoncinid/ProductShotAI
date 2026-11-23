import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StartPhotoCTA } from "@/components/StartPhotoCTA";

export const metadata: Metadata = {
  title: "AI UGC-Style Product Images from Your Photo",
  description:
    "Create in-hand, desk and outdoor product photos from one reference image. See before and after examples. Start with 5 credits for $4.95. No subscription.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.productshotai.com"}/use-cases/ugc-product-images`,
  },
  openGraph: {
    title: "UGC-Style Product Images from Your Photo",
    description:
      "One bottle photo, four AI-generated settings. See examples and start with a $4.95 credit pack.",
    images: [
      {
        url: "/images/ugcAfter1.png",
        width: 1024,
        height: 1024,
        alt: "AI-generated water bottle in-hand scene",
      },
    ],
  },
};
const scenes = [
  {
    name: "In-hand at a desk",
    image: "ugcAfter1.png",
    prompt:
      "Show this bottle held in one hand at a desk, with a laptop softly blurred in the background. Natural window light. Keep the bottle shape, cap and colour.",
  },
  {
    name: "Selfie-style framing",
    image: "ugcAfter2.png",
    prompt:
      "Create a casual scene with an AI-generated person holding this bottle. Bright daylight, soft city background. Keep the bottle clearly visible and preserve its details.",
  },
  {
    name: "Outdoor lifestyle",
    image: "ugcAfter3.png",
    prompt:
      "Place this bottle beside a backpack outdoors. Warm evening light and a soft mountain background. Preserve the bottle colour and proportions.",
  },
  {
    name: "Colourful flat lay",
    image: "ugcAfter4.png",
    prompt:
      "Create an overhead flat lay of this bottle on a colourful background with a few simple props. Keep the product unobstructed. Portrait framing.",
  },
];
export default function UgcUseCasePage() {
  return (
    <div className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-20">
        <section className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Product photos for social content
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              UGC-style product images, from the photo you already have.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              Put your product in an in-hand scene, a desk setup or an outdoor
              setting. Create still images with a casual, social-first look.
            </p>
            <StartPhotoCTA
              placement="ugc_hero"
              className="mt-7 w-full sm:w-auto"
            />
            <p className="mt-3 text-sm text-slate-400">
              5 credits · Up to five 4K images · No subscription
            </p>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-xl bg-white">
                <Image
                  src="/images/ugcBefore.png"
                  alt="Reference photo of a reusable water bottle"
                  width={512}
                  height={512}
                  priority
                  sizes="(max-width: 767px) 45vw, 260px"
                  className="aspect-square w-full object-contain"
                />
                <p className="p-3 text-xs font-semibold text-black">
                  Your starting photo
                </p>
              </div>
              <div className="overflow-hidden rounded-xl bg-white">
                <Image
                  src="/images/ugcAfter1.png"
                  alt="AI-generated example: the bottle held in a hand at a desk"
                  width={512}
                  height={512}
                  priority
                  sizes="(max-width: 767px) 45vw, 260px"
                  className="aspect-square w-full object-cover"
                />
                <p className="p-3 text-xs font-semibold text-black">
                  AI-generated scene
                </p>
              </div>
            </div>
            <figcaption className="px-1 pb-1 pt-3 text-xs leading-relaxed text-slate-400">
              Illustrative example. AI can alter details; review your result
              before publishing.
            </figcaption>
          </figure>
        </section>
        <section className="mt-14 border-y border-white/15 py-9">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            How to create your first scene
          </h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              [
                "Upload a clear reference",
                "Use a JPG or PNG up to 10 MB. Make the product and its label easy to see.",
              ],
              [
                "Choose Lifestyle and a format",
                "Select a style in Create photo. Add one of the scene instructions below to describe the setting.",
              ],
              [
                "Review the cost and create",
                "Choose 4K for 1 credit or 8K for 2. Review the result, then download it from My images.",
              ],
            ].map(([title, text], index) => (
              <li key={title}>
                <p className="font-semibold">
                  {index + 1}. {title}
                </p>
                <p className="mt-2 leading-relaxed text-slate-400">{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-semibold">
            Four scene ideas to start with
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-300">
            Use these instructions as a starting point in the studio. Replace
            the setting to suit your product. Each generation creates one still
            image.
          </p>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            {scenes.map((scene) => (
              <article
                key={scene.name}
                className="overflow-hidden rounded-xl border border-white/15 bg-neutral-900"
              >
                <Image
                  src={`/images/${scene.image}`}
                  alt={`AI-generated product image example: ${scene.name}`}
                  width={700}
                  height={700}
                  sizes="(max-width: 639px) 100vw, 50vw"
                  className="aspect-square w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    AI-generated example
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{scene.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {scene.prompt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-semibold">
            A social look with clear expectations
          </h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            These are AI-created product illustrations, not photos submitted by
            customers or real customer endorsements. ProductShotAI generates
            still images; this workflow does not create videos. Check labels,
            proportions and colours against your reference.
          </p>
          <p className="mt-4 leading-relaxed text-slate-400">
            When posting realistic AI imagery, use the disclosures required by
            your platform.{" "}
            <a
              href="https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content"
              target="_blank"
              rel="noreferrer"
              className="text-white underline"
            >
              TikTok explains its AI-content labels here.
            </a>
          </p>
          <Link
            href="/how-it-works"
            className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4"
          >
            See the complete photo workflow →
          </Link>
        </section>
        <section className="mt-12 rounded-2xl border border-white/15 bg-neutral-900 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">
            Try a new scene for your own product.
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            Start with 5 credits for $4.95 USD. Choose one scene, check the
            result, then explore another look.
          </p>
          <StartPhotoCTA
            placement="ugc_bottom"
            className="mt-6 w-full sm:w-auto"
          />
        </section>
      </div>
    </div>
  );
}

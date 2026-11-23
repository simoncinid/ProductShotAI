import type { Metadata } from "next";
import Link from "next/link";
import PromptBuilder from "./PromptBuilder";

const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.productshotai.com"}/tools/product-photo-prompt-generator`;
export const metadata: Metadata = {
  title: "Free Product Photography Prompt Generator — No Signup",
  description:
    "Build and copy a product photography prompt for candles, bottles, bags or skincare. Choose lighting, scene and format. Free text tool, no signup or image upload.",
  alternates: { canonical: url },
  twitter: {
    card: "summary_large_image",
    title: "Free Product Photography Prompt Generator",
    description:
      "Build and copy a text prompt. No signup, email or image upload.",
    images: ["/images/ugcAfter1.png"],
  },
  openGraph: {
    title: "Free Product Photography Prompt Generator",
    description:
      "Choose your product, scene and format. Copy a ready-to-use prompt without an account.",
    url,
    images: [
      {
        url: "/images/ugcAfter1.png",
        width: 1024,
        height: 1024,
        alt: "AI-generated product photography example",
      },
    ],
  },
};
export default function PromptGeneratorPage() {
  return (
    <div className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-16">
        <p className="text-xs uppercase tracking-wider text-slate-400">
          A free tool by ProductShotAI
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Product photography prompt generator
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
          Describe your product, choose a scene and copy a prompt. No signup. No
          credits. Use the text with your own reference photo.
        </p>
        <div className="mt-9">
          <PromptBuilder />
        </div>
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-semibold">
            Make your prompt work harder
          </h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 leading-relaxed text-slate-300">
            <li>
              Use a sharp reference with the whole product visible. A prompt
              cannot reliably recover an unreadable label.
            </li>
            <li>
              Describe one scene and one lighting direction. Start simple, then
              change one element at a time.
            </li>
            <li>
              Ask to preserve recognisable details. Still check the result: AI
              can alter logos, packaging or proportions.
            </li>
            <li>
              Match your output format in the image tool. Mentioning 4:5 in a
              prompt does not replace that tool’s format setting.
            </li>
          </ul>
          <p className="mt-5 leading-relaxed text-slate-400">
            Need a starting point? Read our{" "}
            <Link
              href="/blog/candle-product-photography-at-home"
              className="text-white underline"
            >
              candle photography guide
            </Link>{" "}
            or the{" "}
            <Link
              href="/blog/ai-product-photography-prompts"
              className="text-white underline"
            >
              worked product prompt examples
            </Link>
            .
          </p>
        </section>
        <section className="mt-10 max-w-3xl">
          <h2 className="text-2xl font-semibold">
            Questions about the free builder
          </h2>
          <details className="mt-5 border-b border-white/15 py-4">
            <summary className="cursor-pointer font-semibold">
              Is this an image generator?
            </summary>
            <p className="mt-3 leading-relaxed text-slate-400">
              No. It builds a text prompt from your choices. You can copy the
              prompt into an image tool. ProductShotAI image generation is a
              separate paid service.
            </p>
          </details>
          <details className="border-b border-white/15 py-4">
            <summary className="cursor-pointer font-semibold">
              Can I use it without a ProductShotAI account?
            </summary>
            <p className="mt-3 leading-relaxed text-slate-400">
              Yes. Building and copying a prompt is free and does not require an
              email address or account.
            </p>
          </details>
          <details className="border-b border-white/15 py-4">
            <summary className="cursor-pointer font-semibold">
              Does it guarantee exact product details?
            </summary>
            <p className="mt-3 leading-relaxed text-slate-400">
              No. The prompt asks the image model to preserve your reference,
              but generated labels, materials and proportions can change. Review
              every image before you use it.
            </p>
          </details>
        </section>
      </div>
    </div>
  );
}

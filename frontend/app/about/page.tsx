import type { Metadata } from "next";
import Link from "next/link";
import { StartPhotoCTA } from "@/components/StartPhotoCTA";
import {
  publicCreditPacks,
  SITE_URL,
  softwareApplication,
} from "@/lib/product-info";

export const metadata: Metadata = {
  title: "About ProductShotAI — Product Photos, Prices and How It Works",
  description:
    "What ProductShotAI does, how credits work, supported formats, image limits and contact details. AI product photography from a reference photo. Packs start at $4.95 USD.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About ProductShotAI",
    description:
      "Product photography from your reference image, with one-time credit packs.",
    url: `${SITE_URL}/about`,
  },
};
export default function AboutPage() {
  return (
    <div className="bg-black text-white">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 md:py-16">
        <p className="text-xs uppercase tracking-wider text-slate-400">
          Product information · reviewed 27 November 2026
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          What is ProductShotAI?
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          <strong className="text-white">
            ProductShotAI is a browser-based AI product photography tool.
          </strong>{" "}
          Upload a reference photo of a product, choose a scene and format, then
          generate a still image for your online store or marketing. Image
          generation uses one-time credit packs, starting at $4.95 USD for 5
          credits. There is no subscription.
        </p>
        <StartPhotoCTA placement="about_top" className="mt-7" />
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">The short answers</h2>
          <dl className="mt-5 divide-y divide-white/15">
            {[
              [
                "What do I upload?",
                "A JPG or PNG reference image, up to 10 MB. A sharp photo with the whole product visible works best.",
              ],
              [
                "What can I create?",
                "Clean-background, lifestyle, studio and colourful social still images. This photo workflow does not create videos.",
              ],
              [
                "Which resolutions and formats?",
                "4K or 8K, with square (1:1), portrait (4:5) or wide (16:9) framing.",
              ],
              [
                "How many credits does an image use?",
                "One 4K image uses 1 credit. One 8K image uses 2 credits. A generation creates one image. The studio shows the cost before you start.",
              ],
              [
                "Do credits expire?",
                "Purchased credits do not expire. You can mix 4K and 8K images within a pack.",
              ],
              [
                "Do I need brand settings?",
                "No. The guided Create photo studio works from an upload. Saved products, brand settings and image sets are optional tools.",
              ],
              [
                "Are product details guaranteed to stay exact?",
                "No. AI can change labels, logos, colours or proportions. Compare each output with the real product before publishing. Use an original photograph when exact detail or scale is essential.",
              ],
              [
                "How long does it take?",
                "Allow a few minutes. Generation time varies with resolution and provider demand. You can see the job status and find completed work in My images.",
              ],
            ].map(([q, a]) => (
              <div key={q} className="py-5">
                <dt className="font-semibold">{q}</dt>
                <dd className="mt-2 leading-relaxed text-slate-300">{a}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">
            Credit packs and image costs
          </h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            All prices below are one-time pack prices in USD. An 8K image uses
            twice the credits of a 4K image. Stripe shows your final total,
            including any personal offer, before you pay.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-white/20">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                ProductShotAI credit packs in US dollars
              </caption>
              <thead className="bg-white/10">
                <tr>
                  <th scope="col" className="p-3">
                    Pack
                  </th>
                  <th scope="col" className="p-3">
                    Price USD
                  </th>
                  <th scope="col" className="p-3">
                    Credits
                  </th>
                  <th scope="col" className="p-3">
                    4K images, up to
                  </th>
                </tr>
              </thead>
              <tbody>
                {publicCreditPacks.map((p) => (
                  <tr key={p.id} className="border-t border-white/15">
                    <th scope="row" className="p-3 font-medium">
                      {p.name}
                    </th>
                    <td className="p-3">${p.total_price.toFixed(2)}</td>
                    <td className="p-3">{p.credits}</td>
                    <td className="p-3">{p.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            For example, Starter can create five 4K images, or two 8K images
            plus one 4K image.{" "}
            <Link href="/pricing" className="text-white underline">
              See pricing and choose a pack →
            </Link>
          </p>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">What is free?</h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            The{" "}
            <Link
              href="/tools/product-photo-prompt-generator"
              className="text-white underline"
            >
              product photography prompt builder
            </Link>{" "}
            is a separate free text tool. It needs no account or upload and does
            not generate an image. The reference-image studio requires an
            account, email confirmation and credits.
          </p>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">
            How to use the photo studio
          </h2>
          <ol className="mt-5 list-decimal space-y-3 pl-5 leading-relaxed text-slate-300">
            <li>Upload your reference photo.</li>
            <li>
              Choose the style, format and resolution. Add a short instruction
              if needed.
            </li>
            <li>
              Review the cost, create the image and download the result after
              checking it.
            </li>
          </ol>
          <p className="mt-4">
            <Link href="/how-it-works" className="underline">
              See the guided workflow →
            </Link>
          </p>
        </section>
        <section className="mt-12 rounded-xl border border-white/20 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">Contact and image handling</h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            Questions about your account or an image? Email{" "}
            <a
              href="mailto:reservationwebbitz@gmail.com"
              className="break-all text-white underline"
            >
              reservationwebbitz@gmail.com
            </a>
            . Reference images are processed by external AI generation services
            to produce your result. Read our{" "}
            <Link href="/privacy" className="text-white underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-white underline">
              Terms
            </Link>{" "}
            for the details.
          </p>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplication),
          }}
        />
      </div>
    </div>
  );
}

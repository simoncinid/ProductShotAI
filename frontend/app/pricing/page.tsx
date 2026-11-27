import { Suspense } from "react";
import Link from "next/link";
import { PricingShowcase } from "@/components/PricingShowcase";
import { DynamicBackdropSection } from "@/components/DynamicBackdropSection";
import { publicPricingPlans, softwareApplication } from "@/lib/product-info";
import PricingCheckout from "./PricingCheckout";

const CONTAINER = "mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14";
const creditFeatures = [
  "1 credit = 4K image, 2 credits = 8K image",
  "Credits never expire — use them whenever you need",
  "No monthly fees or subscriptions",
  "Buy more credits anytime to add to your balance",
];
export default function PricingPage() {
  return (
    <div className="bg-page-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplication),
        }}
      />
      <section className="relative overflow-hidden bg-page-bg py-10 md:py-16">
        <div className={`${CONTAINER} relative`}>
          <div className="max-w-4xl">
            <p className="text-[14px] font-medium uppercase tracking-[0.35px] text-[#767d88]">
              Pricing
            </p>
            <h1 className="mt-5 text-[42px] font-normal leading-none tracking-[-0.9px] text-white md:text-[64px]">
              Product photos from $4.95. No subscription.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-snug text-[#a7a7a7] md:text-[19px]">
              Buy a credit pack, upload your product photo, and create your
              first image. One credit creates a 4K image; two credits create an
              8K image. Credits never expire.
            </p>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <PricingShowcase
            plans={publicPricingPlans}
            eyebrow="Choose a credit pack"
            title="Choose your first photo pack."
            description="One-time payment in USD. No subscription. Confirm the total at Stripe checkout."
          />
        }
      >
        <PricingCheckout />
      </Suspense>
      <DynamicBackdropSection
        eyebrow="Your next step"
        title="Start with one product. Keep the images you like."
        ctaLabel="Start creating"
        ctaHref="/dashboard/create"
        image="/images/res6.jpeg"
        items={[
          {
            title: "Test directions",
            text: "Use small packs to compare lighting, backgrounds and product angles before committing to a larger set.",
            href: "/dashboard/create",
          },
          {
            title: "Build galleries",
            text: "Use higher credit packs for complete product pages, marketplace assets and seasonal campaign refreshes.",
            href: "/dashboard/shooting",
          },
          {
            title: "Keep control",
            text: "No monthly plan, no unused subscription seat. Credits stay available for the next production cycle.",
            href: "/pricing",
          },
        ]}
      />

      <section className="border-y border-[#27272a] bg-black py-16 text-white md:py-24">
        <div className={CONTAINER}>
          <div className="grid gap-10 lg:grid-cols-[minmax(280px,0.45fr)_1fr] lg:items-start">
            <div>
              <p className="text-[14px] font-medium uppercase tracking-[0.35px] text-[#767d88]">
                Credit rules
              </p>
              <h2 className="mt-5 text-[36px] font-normal leading-none tracking-[-0.9px] md:text-[48px]">
                Simple enough to decide fast.
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {creditFeatures.map((text, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#27272a] bg-[#1a1a1a] p-5"
                >
                  <p className="text-[12px] font-medium uppercase tracking-[0.35px] text-[#767d88]">
                    0{i + 1}
                  </p>
                  <p className="mt-4 text-[17px] leading-snug text-[#fefefe]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="border-t border-white/10 bg-page-bg py-16 md:py-20">
        <div className={`${CONTAINER} text-center`}>
          <h2 className="text-[32px] font-normal leading-none tracking-[-0.9px] text-on-dark md:text-[44px]">
            Ready to start producing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-snug text-muted">
            Sign up, purchase credits, and start creating stunning product
            photos.
          </p>
          <Link
            href="/pricing?pack=starter"
            className="mt-8 inline-flex items-center justify-center rounded border border-white bg-white px-8 py-3.5 text-base font-semibold text-black transition hover:bg-black hover:text-white"
          >
            Choose Starter — $4.95
          </Link>
        </div>
      </section>
    </div>
  );
}

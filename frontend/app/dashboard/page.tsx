'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Images,
  UploadCloud,
  WandSparkles,
} from 'lucide-react'
import { getAbsoluteImageUrl, userApi } from '@/lib/api'

export default function DashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    retry: false,
  })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['studio-recent-images'],
    queryFn: () => userApi.getGenerations(1, 3),
  })
  const items =
    data?.items?.filter(
      (g: { status: string; output_image_url?: string }) =>
        g.status === 'completed' && g.output_image_url,
    ) || []
  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-10 text-slate-900">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
        <p className="text-sm font-semibold text-teal-800">
          Welcome to your photo studio
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Turn a product photo into something ready to share.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          You only need a photo of your product. We’ll guide you through the
          rest — no design skills or product setup required.
        </p>
        <Link
          href="/dashboard/create"
          className="mt-6 inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-teal-800 px-6 py-4 text-base font-semibold text-white hover:bg-teal-900"
        >
          Create a product photo <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-3 text-sm text-slate-600">
          {user?.credits_balance ?? 0} credits available · A 4K image uses 1
          credit. Uploading and choosing a look use no credits.
        </p>
      </section>
      <section aria-labelledby="how-title">
        <h2 id="how-title" className="text-xl font-semibold">
          Three simple steps
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: UploadCloud,
              title: '1. Add your photo',
              text: 'Choose a clear JPG or PNG photo from your phone or computer.',
            },
            {
              icon: WandSparkles,
              title: '2. Choose a look',
              text: 'Pick a style, image shape and quality. Add instructions only if you want to.',
            },
            {
              icon: CheckCircle2,
              title: '3. Check, then create',
              text: 'See the exact credit cost first. Save your finished image to your device.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <Icon className="h-7 w-7 text-teal-800" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Your latest images</h2>
          <Link
            href="/dashboard/generations"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-teal-800"
          >
            View My images <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <p role="status" className="mt-4 text-slate-600">
            Loading your images…
          </p>
        ) : isError ? (
          <p className="mt-4 text-slate-600">
            We couldn’t load your latest images.{' '}
            <Link href="/dashboard/generations" className="underline">
              Open My images to try again.
            </Link>
          </p>
        ) : items.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {items.map((g: { id: string; output_image_url: string }) => (
              <Link
                key={g.id}
                href={`/dashboard/hub?generation_id=${g.id}`}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <img
                  src={
                    getAbsoluteImageUrl(g.output_image_url) ||
                    g.output_image_url
                  }
                  alt="Your generated product photo"
                  className="aspect-square w-full object-contain"
                />
                <span className="block min-h-11 px-4 py-3 font-medium text-teal-800">
                  Open image →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center rounded-xl bg-slate-50 px-5 py-8 text-center">
            <ImagePlus className="h-9 w-9 text-slate-400" />
            <p className="mt-3 font-medium">
              Your finished photos will appear here.
            </p>
            <p className="mt-2 text-slate-600">
              Create your first one using a photo you already have.
            </p>
            <Link
              href="/dashboard/create"
              className="mt-4 min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold"
            >
              Create my first photo
            </Link>
          </div>
        )}
      </section>
      <details className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <summary className="min-h-9 cursor-pointer text-lg font-semibold">
          More tools, when you need them
        </summary>
        <p className="mt-3 leading-relaxed text-slate-600">
          These tools are optional. You can create a single photo without
          setting them up.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              href: '/dashboard/products',
              title: 'Saved products',
              text: 'Save product photos and descriptions to reuse later.',
            },
            {
              href: '/dashboard/shooting',
              title: 'Create an image set',
              text: 'Create several photos for one saved product.',
            },
            {
              href: '/dashboard/brand-identity',
              title: 'Brand settings',
              text: 'Keep a consistent look across your products.',
            },
          ].map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="rounded-xl border border-slate-200 p-4 hover:border-teal-700"
            >
              <p className="font-semibold text-teal-800">{x.title} →</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {x.text}
              </p>
            </Link>
          ))}
        </div>
      </details>
    </div>
  )
}

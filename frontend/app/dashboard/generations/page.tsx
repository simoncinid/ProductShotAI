'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ImagePlus, Loader2 } from 'lucide-react'
import {
  generationsApi,
  productsApi,
  getAbsoluteImageUrl,
  userApi,
} from '@/lib/api'
import { useAuthenticated } from '@/lib/auth'
import { DownloadImage } from '@/components/DownloadImage'
const PAGE_SIZE = 12
export default function GenerationsPage() {
  const authenticated = useAuthenticated()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState('all')
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: authenticated === true,
  })
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['generations', selected, page],
    queryFn: () =>
      selected === 'all'
        ? userApi.getGenerations(page, PAGE_SIZE)
        : selected === 'standalone'
          ? generationsApi.getNoProduct(page, PAGE_SIZE)
          : productsApi.getGenerations(selected, page, PAGE_SIZE),
    enabled: authenticated === true,
    refetchInterval: (q) =>
      q.state.data?.items?.some((g: { status: string }) =>
        ['pending', 'processing'].includes(g.status),
      )
        ? 4000
        : false,
  })
  const items = data?.items ?? [],
    totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10 text-slate-900">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">My images</h1>
            <p className="mt-3 text-base text-slate-600">
              Your created photos, all in one place. Download a photo or open it
              to make a new version.
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="inline-flex min-h-12 items-center rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white"
          >
            Create a photo
          </Link>
        </div>
        <label htmlFor="image-filter" className="mb-2 mt-6 block font-medium">
          Show images
        </label>
        <select
          id="image-filter"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value)
            setPage(1)
          }}
          className="min-h-12 w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3"
        >
          <option value="all">All my images</option>
          <option value="standalone">Images without a saved product</option>
          {products.map((p: { id: string; name: string }) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </section>
      {isLoading ? (
        <p role="status" className="p-5">
          Loading your images…
        </p>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-white p-6"
        >
          <p>We couldn’t load your images. They haven’t been removed.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 min-h-12 rounded-xl border border-slate-300 px-5"
          >
            Try again
          </button>
        </div>
      ) : !items.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <ImagePlus className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold">
            {selected === 'all'
              ? 'Your first photo is waiting to be created'
              : 'No photos match this selection'}
          </h2>
          <p className="mt-3 text-slate-600">
            {selected === 'all'
              ? 'Start with a photo of your product. We’ll guide you through each step.'
              : 'Choose All my images to see every photo, or create a new one.'}
          </p>
          <Link
            href="/dashboard/create"
            className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white"
          >
            Create a product photo
          </Link>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(
            (g: {
              id: string
              output_image_url?: string
              status: string
              created_at: string
            }) => {
              const url = g.output_image_url
                ? getAbsoluteImageUrl(g.output_image_url) || g.output_image_url
                : ''
              return (
                <article
                  key={g.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  {g.status === 'completed' && url ? (
                    <>
                      <Link
                        href={`/dashboard/hub?generation_id=${g.id}`}
                        aria-label="Open photo"
                      >
                        <img
                          src={url}
                          alt="Your created product photo"
                          className="aspect-square w-full bg-slate-50 object-contain"
                        />
                      </Link>
                      <div className="p-4">
                        <p className="text-sm text-slate-500">
                          {new Date(g.created_at).toLocaleDateString()}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <DownloadImage
                            url={url}
                            label="Download"
                            className="rounded-lg border border-slate-300 px-3 text-sm font-semibold"
                          />
                          <Link
                            href={`/dashboard/hub?generation_id=${g.id}`}
                            className="inline-flex min-h-12 items-center px-2 text-sm font-semibold text-teal-800"
                          >
                            Open photo →
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      role="status"
                      className="flex aspect-square flex-col items-center justify-center p-6 text-center"
                    >
                      {g.status === 'failed' ? (
                        <>
                          <p className="font-semibold">
                            This photo couldn’t be created
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Try a clearer source photo or different
                            instructions.
                          </p>
                          <Link
                            href="/dashboard/create"
                            className="mt-4 min-h-11 text-teal-800 underline"
                          >
                            Create a new photo
                          </Link>
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
                          <p className="mt-4 font-medium">
                            Creating your photo…
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            It will appear here automatically.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </article>
              )
            },
          )}
        </section>
      )}
      {totalPages > 1 && (
        <nav
          aria-label="Image pages"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { generationsApi, productsApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const PAGE_SIZE = 12
const NO_PRODUCT_VALUE = ''

export default function GenerationsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string>(NO_PRODUCT_VALUE)
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) router.push('/login')
  }, [authenticated, router])

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
    enabled: authenticated,
  })

  const isNoProduct = selected === NO_PRODUCT_VALUE
  const { data, isLoading } = useQuery({
    queryKey: ['generations', selected, page],
    queryFn: () =>
      isNoProduct
        ? generationsApi.getNoProduct(page, PAGE_SIZE)
        : productsApi.getGenerations(selected, page, PAGE_SIZE),
    enabled: authenticated,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1
  const selectedProduct = products.find((p: { id: string }) => p.id === selected)

  const hubUrl = (genId: string) =>
    isNoProduct
      ? `/dashboard/hub?generation_id=${genId}`
      : `/dashboard/hub?generation_id=${genId}&product_id=${selected}`

  if (!authenticated) return null

  return (
    <div className="mx-auto h-full max-w-6xl overflow-auto space-y-6">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Generation Library</h1>
            <p className="mt-1 text-sm text-white/70">Filter by product and reopen outputs instantly in Creative Hub.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/create" className="rounded-full border border-white/25 px-4 py-2 text-sm text-white hover:bg-white/10">
              New image
            </Link>
            <Link href="/dashboard/shooting" className="rounded-full border border-white/25 px-4 py-2 text-sm text-white hover:bg-white/10">
              New shooting
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm text-white/70">Product filter</label>
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value)
              setPage(1)
            }}
            className="w-full max-w-sm rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white"
          >
            <option value={NO_PRODUCT_VALUE}>No product (NO PRODUCT)</option>
            {products.map((p: { id: string; name: string }) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <p className="text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <section className="rounded-2xl border border-white/15 bg-black/20 p-10 text-center text-white">
          <p>No generations found for {isNoProduct ? 'NO PRODUCT' : selectedProduct?.name ?? 'this product'}.</p>
        </section>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map(
              (gen: {
                id: string
                output_image_url?: string
                status: string
                created_at: string
              }) => {
                const imageUrl = gen.output_image_url
                  ? getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url
                  : null

                return (
                  <article key={gen.id} className="overflow-hidden rounded-xl border border-white/15 bg-white/10 text-white">
                    {imageUrl ? (
                      <>
                        <Link href={hubUrl(gen.id)}>
                          <img src={imageUrl} alt="Generated" className="h-52 w-full object-cover" />
                        </Link>
                        <div className="p-3 text-sm flex items-center justify-between">
                          <span className="text-white/70">{new Date(gen.created_at).toLocaleDateString()}</span>
                          <div className="flex items-center gap-3">
                            <a href={imageUrl} download className="text-white/75 hover:underline">
                              Download
                            </a>
                            <Link href={hubUrl(gen.id)} className="font-semibold text-cyan-100 hover:underline">
                              Open in Hub
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-52 items-center justify-center text-sm text-white/70">{gen.status}</div>
                    )}
                  </article>
                )
              },
            )}
          </section>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 items-center">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-white/25 px-4 py-2 text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-white/70">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border border-white/25 px-4 py-2 text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

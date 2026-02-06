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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-on-dark">Generations</h1>
        <label className="flex items-center gap-2">
          <span className="text-muted text-sm">Show:</span>
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value)
              setPage(1)
            }}
            className="border border-muted rounded-lg px-3 py-2 bg-on-dark/10 text-on-dark focus:ring-2 focus:ring-brand focus:border-transparent min-w-[200px]"
          >
            <option value={NO_PRODUCT_VALUE}>NO PRODUCT</option>
            {products.map((p: { id: string; name: string }) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <p className="text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-on-dark/10 border border-muted-dark/60 rounded-lg p-12 text-center">
          <p className="text-muted mb-4">
            No generations yet for {isNoProduct ? '"No product"' : selectedProduct?.name ?? 'this product'}.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-block bg-brand text-on-brand px-6 py-3 rounded-md font-semibold"
          >
            Create image
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(
              (gen: {
                id: string
                output_image_url?: string
                status: string
                prompt?: string
                final_prompt?: string
                apply_brand_identity?: boolean
                created_at: string
              }) => {
                const imageUrl = gen.output_image_url
                  ? getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url
                  : null
                return (
                  <div
                    key={gen.id}
                    className="border border-muted-dark/60 rounded-lg overflow-hidden bg-cream group relative"
                  >
                    {imageUrl ? (
                      <>
                        <Link
                          href={hubUrl(gen.id)}
                          className="block w-full focus:outline-none focus:ring-2 focus:ring-brand focus:ring-inset"
                        >
                          <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-48 object-cover group-hover:opacity-95 transition cursor-pointer"
                          />
                        </Link>
                        <div className="p-2 flex items-center justify-between gap-2 text-xs text-muted-dark bg-cream border-t border-muted/40">
                          <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                          <a
                            href={imageUrl}
                            download
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/20 hover:bg-muted/30 text-primary"
                            title="Download"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Download
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-48 bg-muted/20 flex items-center justify-center">
                          <span className="text-muted-dark text-sm">{gen.status}</span>
                        </div>
                        <div className="p-2 text-xs text-muted-dark bg-cream">
                          {new Date(gen.created_at).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                )
              }
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 items-center">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-muted rounded bg-on-dark/10 text-on-dark disabled:opacity-50 hover:bg-on-dark/20"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-muted rounded bg-on-dark/10 text-on-dark disabled:opacity-50 hover:bg-on-dark/20"
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

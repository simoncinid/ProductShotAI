'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { generationsApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const PAGE_SIZE = 12

export default function GenerationsNoProductPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) router.push('/login')
  }, [authenticated, router])

  const { data, isLoading } = useQuery({
    queryKey: ['generations-no-product', page],
    queryFn: () => generationsApi.getNoProduct(page, PAGE_SIZE),
    enabled: authenticated,
  })

  if (!authenticated) return null

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Generations (no product)</h1>
      <p className="text-gray-400 mb-6">Generations created without selecting a product.</p>

      {isLoading ? (
        <p className="text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-white/10 border border-gray-600 rounded-lg p-12 text-center">
          <p className="text-gray-300 mb-4">No generations yet for &quot;No product&quot;</p>
          <Link href="/dashboard/create" className="inline-block bg-vivid-yellow text-rich-black px-6 py-3 rounded-md font-semibold">
            Create image
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((gen: { id: string; output_image_url?: string; status: string; prompt?: string; final_prompt?: string; apply_brand_identity?: boolean; created_at: string }) => (
              <div key={gen.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                {gen.output_image_url ? (
                  <img
                    src={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url}
                    alt="Generated"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">{gen.status}</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{gen.final_prompt || gen.prompt || '—'}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                    {gen.apply_brand_identity && <span className="text-amber-700 font-medium">Brand identity applied</span>}
                  </div>
                  {gen.output_image_url && (
                    <a
                      href={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url}
                      download
                      className="mt-2 inline-block text-sm text-rich-black font-medium hover:underline"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 items-center">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-gray-500 rounded bg-white/10 text-gray-200 disabled:opacity-50 hover:bg-white/20"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-gray-500 rounded bg-white/10 text-gray-200 disabled:opacity-50 hover:bg-white/20"
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

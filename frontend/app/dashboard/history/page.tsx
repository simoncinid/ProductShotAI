'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const PAGE_SIZE = 12

export default function DashboardHistoryPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) {
      router.push('/login')
    }
  }, [authenticated, router])

  const { data, isLoading } = useQuery({
    queryKey: ['generations', page],
    queryFn: () => userApi.getGenerations(page, PAGE_SIZE),
    enabled: authenticated,
  })

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-rich-black mb-2">
            Generation History
          </h1>
          <p className="text-gray-600">
            All your AI-generated product photos
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-vivid-yellow hover:underline font-medium self-start sm:self-auto"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-600">Loading generations...</p>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((gen: any) => (
              <div
                key={gen.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {gen.output_image_url ? (
                  <img
                    src={gen.output_image_url}
                    alt="Generated"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">{gen.status}</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{gen.prompt}</p>
                  <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                    {gen.output_image_url && (
                      <a
                        href={gen.output_image_url}
                        download
                        className="text-vivid-yellow hover:underline font-medium"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                className="px-4 py-2 rounded-md border border-gray-300 text-rich-black font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNext}
                className="px-4 py-2 rounded-md border border-gray-300 text-rich-black font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No generations yet</p>
          <Link
            href="/dashboard/create"
            className="inline-block bg-vivid-yellow text-rich-black px-6 py-3 rounded-md font-semibold hover:bg-opacity-90"
          >
            Create Your First Image
          </Link>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { shootingApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const POLL_INTERVAL_MS = 4000

export default function ShootingResultPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  const { data: shooting, isLoading, error, refetch } = useQuery({
    queryKey: ['shooting', id],
    queryFn: () => shootingApi.get(id),
    enabled: isAuthenticated() && !!id,
    refetchInterval: (query) => {
      const d = query.state.data
      if (!d) return false
      const allDone = d.generations?.every((g: { status: string }) => g.status === 'completed' || g.status === 'failed')
      return allDone ? false : POLL_INTERVAL_MS
    },
  })

  if (!id || !isAuthenticated()) return null
  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-12 text-gray-600">Loading...</div>
  if (error || !shooting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-600">Shooting not found.</p>
        <Link href="/dashboard/shooting" className="mt-4 inline-block text-vivid-yellow hover:underline">← New shooting</Link>
      </div>
    )
  }

  const generations = shooting.generations ?? []
  const completed = generations.filter((g: { status: string }) => g.status === 'completed')
  const pending = generations.filter((g: { status: string }) => g.status !== 'completed' && g.status !== 'failed')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-rich-black">Shooting results</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/shooting" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-rich-black">
            New shooting
          </Link>
          <Link href="/dashboard" className="text-vivid-yellow hover:underline">← Dashboard</Link>
        </div>
      </div>

      {/* Original reference */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-rich-black mb-4">Product / Reference photo</h2>
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-w-md">
          <img
            src={getAbsoluteImageUrl(shooting.reference_image_url) ?? shooting.reference_image_url}
            alt="Reference"
            className="w-full h-auto object-contain max-h-80 mx-auto"
          />
        </div>
      </section>

      {/* Generated images - creative hub style */}
      <section>
        <h2 className="text-lg font-semibold text-rich-black mb-4">
          Generated images {pending.length > 0 && `(${completed.length}/${generations.length} ready)`}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {generations.map((gen: { id: string; status: string; output_image_url: string | null; error_message: string | null }) => (
            <div key={gen.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
              {gen.status === 'completed' && gen.output_image_url ? (
                <>
                  <Link href={`/dashboard/hub?generation_id=${gen.id}`} className="block focus:outline-none focus:ring-2 focus:ring-vivid-yellow focus:ring-inset">
                    <img
                      src={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url}
                      alt=""
                      className="w-full h-48 object-cover hover:opacity-95 transition"
                    />
                  </Link>
                  <div className="p-3 flex flex-wrap gap-2">
                    <a
                      href={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url}
                      download
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-md text-sm font-medium text-rich-black hover:bg-gray-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download
                    </a>
                    <Link
                      href={`/dashboard/hub?generation_id=${gen.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-vivid-yellow text-rich-black rounded-md text-sm font-semibold hover:bg-opacity-90"
                    >
                      Edit in Hub
                    </Link>
                  </div>
                </>
              ) : gen.status === 'failed' ? (
                <div className="w-full h-48 bg-red-50 flex flex-col items-center justify-center p-4">
                  <span className="text-red-600 text-sm font-medium">Error</span>
                  <span className="text-gray-500 text-xs mt-1">{gen.error_message || 'Generation failed'}</span>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">{gen.status === 'processing' ? 'Processing…' : gen.status}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {pending.length > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Auto-refresh. {pending.length} image{pending.length === 1 ? '' : 's'} processing.
        </p>
      )}
    </div>
  )
}

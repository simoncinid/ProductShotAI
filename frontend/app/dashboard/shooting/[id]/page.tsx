'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { shootingApi, getAbsoluteImageUrl } from '@/lib/api'
import { DownloadImage } from '@/components/DownloadImage'
import { isAuthenticated, useAuthenticated } from '@/lib/auth'

const POLL_INTERVAL_MS = 4000

export default function ShootingResultPage() {
  const authenticated = useAuthenticated()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  const {
    data: shooting,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['shooting', id],
    queryFn: () => shootingApi.get(id),
    enabled: !!authenticated && !!id,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      const allDone = data.generations?.every(
        (g: { status: string }) =>
          g.status === 'completed' || g.status === 'failed',
      )
      return allDone ? false : POLL_INTERVAL_MS
    },
  })

  if (!id || !authenticated) return null
  if (isLoading)
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-[#0f172a]/70">
        Loading...
      </div>
    )

  if (error || !shooting) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-[#0f172a]/70">Shooting not found.</p>
        <Link
          href="/dashboard/shooting"
          className="mt-4 inline-block text-[#115e59] hover:underline"
        >
          Create a new image set
        </Link>
      </div>
    )
  }

  const generations = shooting.generations ?? []
  const completed = generations.filter(
    (g: { status: string }) => g.status === 'completed',
  )
  const failed = generations.filter(
    (g: { status: string }) => g.status === 'failed',
  )
  const pending = generations.filter(
    (g: { status: string }) =>
      g.status !== 'completed' && g.status !== 'failed',
  )
  const completionRate = generations.length
    ? Math.round((completed.length / generations.length) * 100)
    : 0

  return (
    <div className="mx-auto h-auto max-w-6xl   space-y-6">
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 text-[#0f172a]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Image set results</h1>
            <p className="mt-1 text-sm text-[#0f172a]/70">
              {pending.length > 0
                ? `Processing: ${completed.length}/${generations.length} completed`
                : `Completed: ${completed.length} success, ${failed.length} failed`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/shooting"
              className="rounded-full border border-[#cbd5e1] px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc]"
            >
              New image set
            </Link>
            <Link
              href="/dashboard/generations"
              className="rounded-full border border-[#cbd5e1] px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc]"
            >
              My images
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 rounded-full bg-[#eadff9]">
            <div
              className="h-2 rounded-full bg-[#7c4fd0] transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 text-[#0f172a]">
        <h2 className="mb-3 text-lg font-semibold">Reference image</h2>
        <img
          src={
            getAbsoluteImageUrl(shooting.reference_image_url) ??
            shooting.reference_image_url
          }
          alt="Reference"
          className="max-h-72 rounded-xl border border-[#e2d8f2]"
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#0f172a]">
          Generated images
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {generations.map(
            (gen: {
              id: string
              status: string
              output_image_url: string | null
              error_message: string | null
            }) => (
              <article
                key={gen.id}
                className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a]"
              >
                {gen.status === 'completed' && gen.output_image_url ? (
                  <>
                    <Link href={`/dashboard/hub?generation_id=${gen.id}`}>
                      <img
                        src={
                          getAbsoluteImageUrl(gen.output_image_url) ??
                          gen.output_image_url
                        }
                        alt="Generated"
                        className="h-52 w-full bg-slate-50 object-contain"
                      />
                    </Link>
                    <div className="flex items-center justify-between gap-2 p-3 text-sm">
                      <DownloadImage
                        url={
                          getAbsoluteImageUrl(gen.output_image_url) ??
                          gen.output_image_url
                        }
                        label="Download"
                        className="rounded-xl border border-slate-300 px-3 text-sm font-medium"
                      />
                      <Link
                        href={`/dashboard/hub?generation_id=${gen.id}`}
                        className="font-semibold text-[#115e59] hover:underline"
                      >
                        Open photo
                      </Link>
                    </div>
                  </>
                ) : gen.status === 'failed' ? (
                  <div className="flex h-52 flex-col items-center justify-center px-4 text-center">
                    <p className="font-semibold text-red-600">
                      Generation failed
                    </p>
                    <p className="mt-1 text-xs text-[#0f172a]/70">
                      {gen.error_message || 'Unknown error'}
                    </p>
                  </div>
                ) : (
                  <div className="flex h-52 items-center justify-center text-sm text-[#0f172a]/70">
                    {gen.status === 'processing' ? 'Processing...' : gen.status}
                  </div>
                )}
              </article>
            ),
          )}
        </div>
      </section>
    </div>
  )
}

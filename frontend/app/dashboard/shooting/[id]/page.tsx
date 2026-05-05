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

  const { data: shooting, isLoading, error } = useQuery({
    queryKey: ['shooting', id],
    queryFn: () => shootingApi.get(id),
    enabled: isAuthenticated() && !!id,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      const allDone = data.generations?.every((g: { status: string }) => g.status === 'completed' || g.status === 'failed')
      return allDone ? false : POLL_INTERVAL_MS
    },
  })

  if (!id || !isAuthenticated()) return null
  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-12 text-white/70">Loading...</div>

  if (error || !shooting) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-white/70">Shooting non trovato.</p>
        <Link href="/dashboard/shooting" className="mt-4 inline-block text-cyan-100 hover:underline">
          Create new shooting
        </Link>
      </div>
    )
  }

  const generations = shooting.generations ?? []
  const completed = generations.filter((g: { status: string }) => g.status === 'completed')
  const failed = generations.filter((g: { status: string }) => g.status === 'failed')
  const pending = generations.filter((g: { status: string }) => g.status !== 'completed' && g.status !== 'failed')
  const completionRate = generations.length ? Math.round((completed.length / generations.length) * 100) : 0

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Risultati shooting</h1>
            <p className="mt-1 text-sm text-white/70">
              {pending.length > 0
                ? `Elaborazione in corso: ${completed.length}/${generations.length} completate`
                : `Completato: ${completed.length} ok, ${failed.length} fallite`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/shooting" className="rounded-full border border-white/25 px-4 py-2 text-sm text-white hover:bg-white/10">
              Nuovo shooting
            </Link>
            <Link href="/dashboard/generations" className="rounded-full border border-white/25 px-4 py-2 text-sm text-white hover:bg-white/10">
              Libreria
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 rounded-full bg-on-dark/10">
            <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <h2 className="mb-3 text-lg font-semibold">Reference image</h2>
        <img
          src={getAbsoluteImageUrl(shooting.reference_image_url) ?? shooting.reference_image_url}
          alt="Reference"
          className="max-h-72 rounded-xl border border-white/20"
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Generated images</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {generations.map((gen: { id: string; status: string; output_image_url: string | null; error_message: string | null }) => (
            <article key={gen.id} className="overflow-hidden rounded-xl border border-white/15 bg-white/10 text-white">
              {gen.status === 'completed' && gen.output_image_url ? (
                <>
                  <Link href={`/dashboard/hub?generation_id=${gen.id}`}>
                    <img
                      src={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url}
                      alt="Generated"
                      className="h-52 w-full object-cover"
                    />
                  </Link>
                  <div className="flex items-center justify-between gap-2 p-3 text-sm">
                    <a
                      href={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url}
                      download
                      className="rounded-md border border-white/30 px-3 py-1.5 hover:bg-white/10"
                    >
                      Download
                    </a>
                    <Link href={`/dashboard/hub?generation_id=${gen.id}`} className="font-semibold text-cyan-100 hover:underline">
                      Edit in Hub
                    </Link>
                  </div>
                </>
              ) : gen.status === 'failed' ? (
                <div className="flex h-52 flex-col items-center justify-center px-4 text-center">
                  <p className="font-semibold text-red-600">Generation failed</p>
                  <p className="mt-1 text-xs text-white/70">{gen.error_message || 'Unknown error'}</p>
                </div>
              ) : (
                <div className="flex h-52 items-center justify-center text-sm text-white/70">
                  {gen.status === 'processing' ? 'Processing...' : gen.status}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productsApi, uploadApi, shootingApi, userApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

const SHOOTING_STYLE_OPTIONS = [
  { value: 'Clean e-commerce set', label: 'E-commerce clean' },
  { value: 'Studio shooting', label: 'Studio' },
  { value: 'Lifestyle', label: 'Lifestyle' },
  { value: 'Zoom into details', label: 'Detail zoom' },
  { value: 'Mix (balanced)', label: 'Mix balanced' },
]

export default function ShootingWizardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetProductId = searchParams.get('product_id')
  const presetReferenceUrl = searchParams.get('reference_url')
  const [productId, setProductId] = useState<string | null>(presetProductId)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(presetReferenceUrl)
  const [count, setCount] = useState(4)
  const [shootingStyle, setShootingStyle] = useState(SHOOTING_STYLE_OPTIONS[0].value)
  const [resolution, setResolution] = useState<'4k' | '8k'>('4k')
  const [reviewPrompts, setReviewPrompts] = useState(false)
  const [prompts, setPrompts] = useState<string[]>([])
  const [phase, setPhase] = useState<'setup' | 'review'>('setup')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: isAuthenticated(),
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: isAuthenticated(),
  })

  const { data: productDetail } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.get(productId!),
    enabled: !!productId,
  })

  const credits = user?.credits_balance ?? 0
  const canChoose8k = credits >= 2

  useEffect(() => {
    if (!canChoose8k && resolution === '8k') setResolution('4k')
  }, [canChoose8k, resolution])

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadImage,
    onSuccess: (data) => {
      setReferenceImageUrl(data.image_url)
      toast.success('Reference uploaded')
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Upload failed')
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data: { product_id: string; reference_image_url: string; prompts: string[]; aspect_ratio: string; resolution: string }) =>
      shootingApi.generate(data),
    onSuccess: (data) => {
      toast.success('Shooting started')
      router.push(`/dashboard/shooting/${data.shooting_id}`)
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Starting shooting failed')
    },
  })

  const startGeneration = (generatedPrompts: string[]) => {
    if (!productId || !referenceImageUrl || generatedPrompts.length === 0) return

    generateMutation.mutate({
      product_id: productId,
      reference_image_url: referenceImageUrl,
      prompts: generatedPrompts,
      aspect_ratio: '1:1',
      resolution,
    })
  }

  const promptsMutation = useMutation({
    mutationFn: (data: { product_id: string; shooting_style: string; count: number }) => shootingApi.createPrompts(data),
    onSuccess: (data) => {
      if (reviewPrompts) {
        setPrompts(data.prompts)
        setPhase('review')
        toast.success('Prompts ready, review and launch')
      } else {
        startGeneration(data.prompts)
      }
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Prompt generation failed')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  const handleCreateShooting = () => {
    if (!productId || !referenceImageUrl) {
      toast.error('Select product and reference image')
      return
    }

    promptsMutation.mutate({ product_id: productId, shooting_style: shootingStyle, count })
  }

  if (!isAuthenticated()) return null
  if (productsLoading) return <div className="p-8 text-muted">Loading...</div>

  if (products.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-on-dark mb-3">Shooting multiplo</h1>
        <p className="text-muted mb-6">Prima crea almeno un prodotto con immagini reference.</p>
        <Link href="/dashboard/products" className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary">
          Crea prodotto
        </Link>
      </div>
    )
  }

  const totalCredits = count * (resolution === '8k' ? 2 : 1)
  const stepProductDone = !!productId
  const stepReferenceDone = !!referenceImageUrl

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white">Crea shooting</h1>
          <p className="mt-1 text-sm text-white/70">Flusso guidato per generare un set coerente di immagini in pochi passaggi.</p>
        </div>
        <Link href="/dashboard/create" className="rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10">
          Genera foto singola
        </Link>
      </div>

      {phase === 'setup' ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <section className="space-y-5 rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">1. Seleziona prodotto</h2>
                <span className={`text-xs font-semibold ${stepProductDone ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {stepProductDone ? 'Completato' : 'Richiesto'}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {products.map((p: { id: string; name: string }) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProductId(p.id)
                      setReferenceImageUrl(null)
                    }}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      productId === p.id
                        ? 'border-white bg-white text-[#13233d]'
                        : 'border-white/25 bg-white/5 text-white hover:bg-white/15'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">2. Scegli reference</h2>
                  <span className={`text-xs font-semibold ${stepReferenceDone ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {stepReferenceDone ? 'Completato' : 'Richiesto'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                >
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {uploadMutation.isPending && <p className="mt-2 text-sm text-muted">Uploading...</p>}

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(productDetail?.images as { id: string; image_url: string }[] | undefined)?.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setReferenceImageUrl(img.image_url)}
                    className={`overflow-hidden rounded-lg border-2 ${
                      referenceImageUrl === img.image_url ? 'border-cyan-200' : 'border-transparent'
                    }`}
                  >
                    <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="" className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>

              {referenceImageUrl && (
                <div className="mt-3 rounded-lg border border-white/20 bg-black/20 p-3">
                  <p className="mb-2 text-xs text-emerald-300">Reference selezionata</p>
                  <img
                    src={getAbsoluteImageUrl(referenceImageUrl) ?? referenceImageUrl}
                    alt="Reference selected"
                    className="max-h-44 rounded-lg"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-cyan-200/40 bg-gradient-to-br from-[#10223d] to-[#1f3b61] p-5 text-white">
            <h2 className="text-lg font-semibold">3. Configura e lancia</h2>
            <p className="text-sm text-white/75">L'AI genera i prompt in automatico, tu scegli solo obiettivo e volume.</p>

            <div>
              <label className="mb-1 block text-sm text-white/90">Numero immagini</label>
              <input
                type="number"
                min={2}
                max={10}
                value={count}
                onChange={(e) => setCount(Math.min(10, Math.max(2, Number(e.target.value) || 2)))}
                className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-white/70">Consigliato: 4 per test rapido, 8-10 per set completo.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/90">Stile shooting</label>
              <select
                value={shootingStyle}
                onChange={(e) => setShootingStyle(e.target.value)}
                className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm"
              >
                {SHOOTING_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/90">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as '4k' | '8k')}
                className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm"
              >
                <option value="4k">4K - 1 credito / immagine</option>
                <option value="8k" disabled={!canChoose8k}>
                  8K - 2 crediti / immagine{!canChoose8k ? ' (servono almeno 2 crediti)' : ''}
                </option>
              </select>
              {!canChoose8k && <p className="mt-1 text-xs text-amber-200">Crediti attuali: {credits}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={reviewPrompts}
                onChange={(e) => setReviewPrompts(e.target.checked)}
                className="rounded"
              />
              Voglio revisionare i prompt prima del lancio
            </label>

            <div className="rounded-xl border border-white/25 bg-black/20 p-4 text-sm text-white/85">
              <p>Costo stimato: {totalCredits} crediti</p>
              <p className="mt-1 text-xs">{count} immagini x {resolution === '8k' ? 2 : 1} credito/i per immagine.</p>
            </div>

            <button
              type="button"
              onClick={handleCreateShooting}
              disabled={!productId || !referenceImageUrl || promptsMutation.isPending || generateMutation.isPending}
              className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1f2d45] hover:bg-white/90 disabled:opacity-50"
            >
              {promptsMutation.isPending
                ? 'Genero prompt...'
                : generateMutation.isPending
                  ? 'Avvio shooting...'
                  : reviewPrompts
                    ? 'Genera prompt e rivedi'
                    : 'Avvia shooting'}
            </button>
          </section>
        </div>
      ) : (
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">Review prompt ({prompts.length})</h2>
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            >
              Torna a setup
            </button>
          </div>

          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <div key={index} className="rounded-xl border border-white/15 bg-black/20 p-3">
                <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold">Prompt {index + 1}</p>
                  <EditPromptWithAI
                    value={prompt}
                    onChange={(newVal) => {
                      const next = [...prompts]
                      next[index] = newVal
                      setPrompts(next)
                    }}
                    buttonLabel="Migliora con AI"
                    applyLabel="Applica"
                  />
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    const next = [...prompts]
                    next[index] = e.target.value
                    setPrompts(next)
                  }}
                  rows={4}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => startGeneration(prompts)}
              disabled={generateMutation.isPending}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#13233d] disabled:opacity-50"
            >
              {generateMutation.isPending ? 'Avvio shooting...' : 'Avvia shooting'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productsApi, generationApi, userApi, getAbsoluteImageUrl, getDeviceId } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { ResultPopup } from '@/components/ResultPopup'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

const POLL_INTERVAL_MS = 3000

function startPolling(
  generationId: string,
  onCompleted: (imageUrl: string) => void,
  onFailed: (message: string) => void,
) {
  const id = setInterval(async () => {
    try {
      const res = await generationApi.getGeneration(generationId, undefined)
      if (res.status === 'completed') {
        clearInterval(id)
        const url = getAbsoluteImageUrl(res.output_image_url) ?? res.output_image_url ?? ''
        if (url) onCompleted(url)
      } else if (res.status === 'failed') {
        clearInterval(id)
        onFailed(res.error_message || 'Generation failed')
      }
    } catch {
      // retry next poll
    }
  }, POLL_INTERVAL_MS)

  return () => clearInterval(id)
}

export default function HubPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const generationId = searchParams.get('generation_id')
  const productId = searchParams.get('product_id')
  const imageId = searchParams.get('image_id')
  const imageUrlParam = searchParams.get('image_url')

  const [mode, setMode] = useState<'similar' | 'modify'>('similar')
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [resolution, setResolution] = useState<'4k' | '8k'>('4k')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const stopPollingRef = useRef<(() => void) | null>(null)

  const { data: generation } = useQuery({
    queryKey: ['generation', generationId],
    queryFn: () => generationApi.getGeneration(generationId!, undefined),
    enabled: !!generationId && isAuthenticated(),
  })

  const productIdFromGen = generation && 'product_id' in generation
    ? (generation as { product_id?: string }).product_id
    : undefined

  const effectiveProductId = productId || productIdFromGen

  const { data: product } = useQuery({
    queryKey: ['product', effectiveProductId],
    queryFn: () => productsApi.get(effectiveProductId!),
    enabled: isAuthenticated() && !!effectiveProductId,
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: isAuthenticated(),
  })

  const credits = user?.credits_balance ?? 0
  const canChoose8k = credits >= 2

  useEffect(() => {
    if (!canChoose8k && resolution === '8k') setResolution('4k')
  }, [canChoose8k, resolution])

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  useEffect(() => {
    if (mode === 'similar') {
      setPrompt('Keep the same product and style, change angle and composition slightly while preserving lighting consistency.')
    } else {
      setPrompt('')
    }
  }, [mode])

  useEffect(() => {
    return () => {
      stopPollingRef.current?.()
    }
  }, [])

  const displayImageUrl = (() => {
    if (generationId && generation?.output_image_url) {
      return getAbsoluteImageUrl(generation.output_image_url) ?? generation.output_image_url
    }

    if (imageUrlParam) return getAbsoluteImageUrl(imageUrlParam) ?? imageUrlParam

    if (productId && imageId && product?.images) {
      const img = (product.images as { id: string; image_url: string }[]).find((i) => i.id === imageId)
      return img ? (getAbsoluteImageUrl(img.image_url) ?? img.image_url) : null
    }

    return null
  })()

  const hubProductId = effectiveProductId
  const canUseProductContext = !!hubProductId && !!product

  const generateMutation = useMutation({
    mutationFn: (data: Parameters<typeof generationApi.generatePaid>[0]) => generationApi.generatePaid(data),
    onSuccess: (data) => {
      if (data?.status === 'processing' && data?.generation_id) {
        stopPollingRef.current = startPolling(
          data.generation_id,
          (url) => {
            setIsGenerating(false)
            toast.success('Generation completed')
            setResultImageUrl(url)
          },
          (msg) => {
            setIsGenerating(false)
            toast.error(msg)
          },
        )
      } else if (data?.status === 'completed' && data?.output_image_url) {
        setIsGenerating(false)
        setResultImageUrl(getAbsoluteImageUrl(data.output_image_url) ?? data.output_image_url ?? null)
      } else {
        setIsGenerating(false)
      }
    },
    onError: (e: unknown) => {
      setIsGenerating(false)
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Generation failed')
    },
  })

  const handleGenerate = () => {
    if (!displayImageUrl || !prompt.trim()) {
      toast.error('Add a prompt before generating')
      return
    }

    setIsGenerating(true)

    const payload = canUseProductContext && hubProductId
      ? {
          prompt: product!.product_prompt,
          image_url: displayImageUrl,
          aspect_ratio: aspectRatio,
          resolution,
          device_id: getDeviceId(),
          product_id: hubProductId,
          apply_brand_identity: product?.default_apply_brand_identity ?? false,
          user_prompt_input: prompt.trim(),
        }
      : {
          prompt: prompt.trim(),
          image_url: displayImageUrl,
          aspect_ratio: aspectRatio,
          resolution,
          device_id: getDeviceId(),
        }

    generateMutation.mutate(payload)
  }

  if (!displayImageUrl && !generationId && !productId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-muted">No image selected. Open this page from products or generations.</p>
        <Link href="/dashboard/products" className="mt-4 inline-block text-brand hover:underline">
          Products
        </Link>
      </div>
    )
  }

  if (productId && !imageUrlParam && !imageId && !generationId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-muted">Missing image_id or image_url for this product.</p>
        <Link href={`/dashboard/products/${productId}`} className="mt-4 inline-block text-brand hover:underline">
          Product
        </Link>
      </div>
    )
  }

  if (productId && imageId && product && !(product.images as { id: string }[] | undefined)?.find((i) => i.id === imageId)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-muted">Image not found for this product.</p>
        <Link href={`/dashboard/products/${productId}`} className="mt-4 inline-block text-brand hover:underline">
          Product
        </Link>
      </div>
    )
  }

  if (!displayImageUrl && (generationId || productId)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-muted">Loading image...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Creative Hub</h1>
          <p className="mt-1 text-sm text-white/70">Ottimizza una foto esistente con variazioni rapide o modifiche precise.</p>
        </div>
        <div className="flex gap-2">
          <a
            href={displayImageUrl!}
            download
            className="rounded-full border border-white/25 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Download reference
          </a>
          <Link
            href={effectiveProductId ? `/dashboard/products/${effectiveProductId}` : '/dashboard/generations'}
            className="rounded-full border border-white/25 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
          <img src={displayImageUrl!} alt="Reference" className="max-h-[500px] w-full rounded-xl object-contain bg-black/20" />
          {canUseProductContext && (
            <p className="mt-3 text-xs text-emerald-300">
              Contesto prodotto attivo: prompt base e brand identity applicabili automaticamente.
            </p>
          )}

          {imageUrlParam && (
            <Link
              href={`/dashboard/shooting?reference_url=${encodeURIComponent(imageUrlParam)}${productId ? `&product_id=${productId}` : ''}`}
              className="mt-3 inline-block text-sm text-cyan-100 hover:underline"
            >
              Usa questa immagine per avviare uno shooting
            </Link>
          )}
        </section>

        <section className="rounded-2xl border border-cyan-200/40 bg-gradient-to-br from-[#10223d] to-[#1f3b61] p-5 text-white space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('similar')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${mode === 'similar' ? 'bg-white text-[#13233d]' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Variazione simile
            </button>
            <button
              type="button"
              onClick={() => setMode('modify')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${mode === 'modify' ? 'bg-white text-[#13233d]' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Modifica immagine
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
              <label className="text-sm font-medium text-white">
                {mode === 'similar' ? 'Descrivi la variazione' : 'Descrivi cosa cambiare'}
              </label>
              <EditPromptWithAI value={prompt} onChange={setPrompt} buttonLabel="Migliora con AI" applyLabel="Applica" />
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'similar'
                  ? 'es. stessa scena, angolo diverso, più contrasto...'
                  : 'es. rimuovi sfondo, aggiungi ombra, colori più caldi...'
              }
              rows={6}
              className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-sm text-white/80 underline underline-offset-4"
          >
            {showAdvanced ? 'Nascondi impostazioni avanzate' : 'Mostra impostazioni avanzate'}
          </button>

          {showAdvanced && (
            <div className="space-y-3 rounded-xl border border-white/25 bg-black/20 p-4">
              <div>
                <label className="mb-1 block text-sm text-white/90">Aspect ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:5">4:5 (Portrait)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/90">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as '4k' | '8k')}
                  className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm"
                >
                  <option value="4k">4K - 1 credito</option>
                  <option value="8k" disabled={!canChoose8k}>
                    8K - 2 crediti{!canChoose8k ? ' (minimo 2 crediti)' : ''}
                  </option>
                </select>
                {!canChoose8k && <p className="mt-1 text-xs text-amber-200">Crediti attuali: {credits}</p>}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#13233d] hover:bg-white/90 disabled:opacity-50"
          >
            {isGenerating ? 'Generazione in corso...' : 'Genera variazione'}
          </button>
        </section>
      </div>

      {resultImageUrl && <ResultPopup imageUrl={resultImageUrl} onClose={() => setResultImageUrl(null)} />}
    </div>
  )
}

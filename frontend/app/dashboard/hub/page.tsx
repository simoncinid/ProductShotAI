'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  productsApi,
  generationApi,
  userApi,
  getAbsoluteImageUrl,
  getDeviceId,
} from '@/lib/api'
import { isAuthenticated, useAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { DownloadImage } from '@/components/DownloadImage'
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
        const url =
          getAbsoluteImageUrl(res.output_image_url) ??
          res.output_image_url ??
          ''
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
  const authenticated = useAuthenticated()
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
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [inlineError, setInlineError] = useState('')
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const stopPollingRef = useRef<(() => void) | null>(null)
  const requestStarted = useRef(false)

  const { data: generation, isError: generationError } = useQuery({
    queryKey: ['generation', generationId],
    queryFn: () => generationApi.getGeneration(generationId!, undefined),
    enabled: !!generationId && !!authenticated,
  })

  const productIdFromGen =
    generation && 'product_id' in generation
      ? (generation as { product_id?: string }).product_id
      : undefined

  const effectiveProductId = productId || productIdFromGen

  const { data: product } = useQuery({
    queryKey: ['product', effectiveProductId],
    queryFn: () => productsApi.get(effectiveProductId!),
    enabled: !!authenticated && !!effectiveProductId,
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: !!authenticated,
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
      setPrompt(
        'Keep the same product and style, change angle and composition slightly while preserving lighting consistency.',
      )
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
      return (
        getAbsoluteImageUrl(generation.output_image_url) ??
        generation.output_image_url
      )
    }

    if (imageUrlParam)
      return getAbsoluteImageUrl(imageUrlParam) ?? imageUrlParam

    if (productId && imageId && product?.images) {
      const img = (product.images as { id: string; image_url: string }[]).find(
        (i) => i.id === imageId,
      )
      return img ? (getAbsoluteImageUrl(img.image_url) ?? img.image_url) : null
    }

    return null
  })()

  const hubProductId = effectiveProductId
  const canUseProductContext = !!hubProductId && !!product

  const generateMutation = useMutation({
    mutationFn: (data: Parameters<typeof generationApi.generatePaid>[0]) =>
      generationApi.generatePaid(data),
    onSuccess: (data) => {
      if (data?.status === 'processing' && data?.generation_id) {
        stopPollingRef.current = startPolling(
          data.generation_id,
          (url) => {
            setIsGenerating(false)
            requestStarted.current = false
            toast.success('Generation completed')
            setResultImageUrl(url)
          },
          (msg) => {
            setIsGenerating(false)
            requestStarted.current = false
            toast.error(msg)
          },
        )
      } else if (data?.status === 'completed' && data?.output_image_url) {
        setIsGenerating(false)
        requestStarted.current = false
        setResultImageUrl(
          getAbsoluteImageUrl(data.output_image_url) ??
            data.output_image_url ??
            null,
        )
      } else {
        setIsGenerating(false)
        requestStarted.current = false
      }
    },
    onError: (e: unknown) => {
      setIsGenerating(false)
      requestStarted.current = false
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail
          : null
      setInlineError(
        msg ||
          'We could not start your image. Your original photo is safe. Please try again.',
      )
      toast.error(msg || 'Generation failed')
    },
  })

  const handleGenerate = () => {
    if (isGenerating || requestStarted.current) return
    if (credits < (resolution === '8k' ? 2 : 1)) {
      setInlineError(
        'You need more credits to create this version. Your original image will stay unchanged.',
      )
      return
    }
    setInlineError('')
    if (!displayImageUrl || !prompt.trim()) {
      toast.error('Describe what you would like to change first')
      return
    }

    requestStarted.current = true
    setIsGenerating(true)

    const payload =
      canUseProductContext && hubProductId
        ? {
            prompt: product!.product_prompt,
            image_url: displayImageUrl,
            aspect_ratio: aspectRatio,
            resolution,
            device_id: getDeviceId(),
            product_id: hubProductId,
            apply_brand_identity:
              product?.default_apply_brand_identity ?? false,
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
        <p className="text-[#0f172a]/70">
          Choose one of your images to download it or create a new version.
        </p>
        <Link
          href="/dashboard/products"
          className="mt-4 inline-block text-[#115e59] hover:underline"
        >
          Products
        </Link>
      </div>
    )
  }

  if (productId && !imageUrlParam && !imageId && !generationId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-[#0f172a]/70">
          Choose a photo from this product before creating a new version.
        </p>
        <Link
          href={`/dashboard/products/${productId}`}
          className="mt-4 inline-block text-[#115e59] hover:underline"
        >
          Product
        </Link>
      </div>
    )
  }

  if (
    productId &&
    imageId &&
    product &&
    !(product.images as { id: string }[] | undefined)?.find(
      (i) => i.id === imageId,
    )
  ) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-[#0f172a]/70">Image not found for this product.</p>
        <Link
          href={`/dashboard/products/${productId}`}
          className="mt-4 inline-block text-[#115e59] hover:underline"
        >
          Product
        </Link>
      </div>
    )
  }

  if (generationError)
    return (
      <div className="rounded-xl bg-white p-6 text-slate-900">
        <h1 className="text-2xl font-semibold">We couldn’t open this photo</h1>
        <p className="mt-3">
          The link may be unavailable, or the connection was interrupted.
        </p>
        <Link
          href="/dashboard/generations"
          className="mt-5 inline-flex min-h-12 items-center text-teal-800 underline"
        >
          Back to My images
        </Link>
      </div>
    )
  if (!displayImageUrl && (generationId || productId)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-[#0f172a]/70">Loading image...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto h-auto max-w-6xl  ">
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            View & edit photo
          </h1>
          <p className="mt-1 text-sm text-[#0f172a]/70">
            Download your photo, or create a new version. Your original will
            stay unchanged.
          </p>
        </div>
        <div className="flex gap-2">
          <DownloadImage
            url={displayImageUrl!}
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold"
          />
          <Link
            href={
              effectiveProductId
                ? `/dashboard/products/${effectiveProductId}`
                : '/dashboard/generations'
            }
            className="rounded-full border border-[#cbd5e1] px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc]"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 text-[#0f172a]">
          <img
            src={displayImageUrl!}
            alt="Reference"
            className="max-h-[500px] w-full rounded-xl object-contain bg-[#f8fafc]"
          />
          {canUseProductContext && (
            <p className="mt-3 text-xs text-emerald-600">
              Saved product details will be used for your new version.
            </p>
          )}

          {imageUrlParam && (
            <Link
              href={`/dashboard/shooting?reference_url=${encodeURIComponent(imageUrlParam)}${productId ? `&product_id=${productId}` : ''}`}
              className="mt-3 inline-block text-sm text-[#115e59] hover:underline"
            >
              Use this image to start a full shooting
            </Link>
          )}
        </section>

        <section className="rounded-2xl border border-[#e2e8f0] bg-gradient-to-br from-[#f8f3ff] to-[#ffffff] p-5 text-[#0f172a] space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('similar')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${mode === 'similar' ? 'bg-white text-[#261f32]' : 'bg-[#f8fafc] text-[#0f172a] hover:bg-[#f2e9ff]'}`}
            >
              Create a similar photo
            </button>
            <button
              type="button"
              onClick={() => setMode('modify')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${mode === 'modify' ? 'bg-white text-[#261f32]' : 'bg-[#f8fafc] text-[#0f172a] hover:bg-[#f2e9ff]'}`}
            >
              Change something
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
              <label
                htmlFor="edit-photo-instructions"
                className="text-sm font-medium text-[#0f172a]"
              >
                {mode === 'similar'
                  ? 'Describe the variation'
                  : 'Describe what to change'}
              </label>
              <EditPromptWithAI
                value={prompt}
                onChange={setPrompt}
                buttonLabel="Improve with AI"
                applyLabel="Apply"
              />
            </div>

            <textarea
              id="edit-photo-instructions"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'similar'
                  ? 'e.g. same setup, different angle, stronger contrast...'
                  : 'e.g. remove background, add shadow, warmer colors...'
              }
              rows={6}
              className="w-full rounded-lg border border-[#d2c2ea] bg-[#f8fafc] px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#0f172a]/70"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-sm text-[#0f172a]/80 underline underline-offset-4"
          >
            {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
          </button>

          {showAdvanced && (
            <div className="space-y-3 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
              <div>
                <label
                  htmlFor="studio-aspect-ratio"
                  className="mb-1 block text-sm text-[#0f172a]/90"
                >
                  Aspect ratio
                </label>
                <select
                  id="studio-aspect-ratio"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full rounded-md border border-[#d2c2ea] bg-[#f8fafc] px-3 py-2 text-sm"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:5">4:5 (Portrait)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="studio-resolution"
                  className="mb-1 block text-sm text-[#0f172a]/90"
                >
                  Resolution
                </label>
                <select
                  id="studio-resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as '4k' | '8k')}
                  className="w-full rounded-md border border-[#d2c2ea] bg-[#f8fafc] px-3 py-2 text-sm"
                >
                  <option value="4k">4K - 1 credit</option>
                  <option value="8k" disabled={!canChoose8k}>
                    8K - 2 credits{!canChoose8k ? ' (minimum 2 credits)' : ''}
                  </option>
                </select>
                {!canChoose8k && (
                  <p className="mt-1 text-xs text-amber-600">
                    Current credits: {credits}
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="rounded-xl bg-teal-50 p-4 text-base text-teal-900">
            This new version uses {resolution === '8k' ? 2 : 1}{' '}
            {resolution === '8k' ? 'credits' : 'credit'}. Your balance:{' '}
            {credits} credits.
          </p>
          {credits < (resolution === '8k' ? 2 : 1) && (
            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center font-semibold text-teal-800 underline"
            >
              View credit packs →
            </Link>
          )}
          {inlineError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"
            >
              {inlineError}
            </p>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              !prompt.trim() ||
              isGenerating ||
              credits < (resolution === '8k' ? 2 : 1)
            }
            className="w-full rounded-full bg-[#115e59] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2f2145] disabled:opacity-50"
          >
            {isGenerating
              ? 'Creating your new photo…'
              : `Create new version · ${resolution === '8k' ? '2 credits' : '1 credit'}`}
          </button>
        </section>
      </div>

      {resultImageUrl && (
        <ResultPopup
          imageUrl={resultImageUrl}
          onClose={() => setResultImageUrl(null)}
        />
      )}
    </div>
  )
}

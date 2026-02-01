'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productsApi, generationApi, getAbsoluteImageUrl, getDeviceId } from '@/lib/api'
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
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const stopPollingRef = useRef<(() => void) | null>(null)

  const { data: generation } = useQuery({
    queryKey: ['generation', generationId],
    queryFn: () => generationApi.getGeneration(generationId!, undefined),
    enabled: !!generationId && isAuthenticated(),
  })

  const productIdFromGen = generation && 'product_id' in generation ? (generation as { product_id?: string }).product_id : undefined
  const effectiveProductId = productId || productIdFromGen

  const { data: product } = useQuery({
    queryKey: ['product', effectiveProductId],
    queryFn: () => productsApi.get(effectiveProductId!),
    enabled: isAuthenticated() && !!effectiveProductId,
  })

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  useEffect(() => {
    if (mode === 'similar') {
      setPrompt('Same style and product, slight variation. Keep composition and lighting consistent.')
    } else {
      setPrompt('')
    }
  }, [mode])

  useEffect(() => {
    return () => { stopPollingRef.current?.() }
  }, [])

  const displayImageUrl = (() => {
    if (generationId && generation?.output_image_url) {
      return getAbsoluteImageUrl(generation.output_image_url) ?? generation.output_image_url
    }
    if (imageUrlParam) return getAbsoluteImageUrl(imageUrlParam) ?? imageUrlParam
    if (productId && imageId && product?.images) {
      const img = product.images.find((i: { id: string }) => i.id === imageId)
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
            toast.success('Generation completed!')
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
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Generation failed')
    },
  })

  const handleGenerate = () => {
    if (!displayImageUrl || !prompt.trim()) {
      toast.error('Enter a description to generate')
      return
    }
    setIsGenerating(true)
    const payload = canUseProductContext && hubProductId
      ? {
          prompt: product!.product_prompt,
          image_url: displayImageUrl,
          aspect_ratio: aspectRatio,
          resolution: '8k',
          device_id: getDeviceId(),
          product_id: hubProductId,
          apply_brand_identity: product?.default_apply_brand_identity ?? false,
          user_prompt_input: prompt.trim(),
        }
      : {
          prompt: prompt.trim(),
          image_url: displayImageUrl,
          aspect_ratio: aspectRatio,
          resolution: '8k',
          device_id: getDeviceId(),
        }
    generateMutation.mutate(payload)
  }

  if (!displayImageUrl && !generationId && !productId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-gray-600">Specify an image via link (product_id + image_id, generation_id, or image_url).</p>
        <Link href="/dashboard/products" className="mt-4 inline-block text-vivid-yellow hover:underline">← Products</Link>
      </div>
    )
  }

  if (productId && !imageUrlParam && !imageId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-gray-600">Missing image_id or image_url for this product.</p>
        <Link href={`/dashboard/products/${productId}`} className="mt-4 inline-block text-vivid-yellow hover:underline">← Product</Link>
      </div>
    )
  }

  if (productId && imageId && product && !product.images?.find((i: { id: string }) => i.id === imageId)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-gray-600">Image not found for this product.</p>
        <Link href={`/dashboard/products/${productId}`} className="mt-4 inline-block text-vivid-yellow hover:underline">← Product</Link>
      </div>
    )
  }

  if (!displayImageUrl && (generationId || productId)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-gray-600">Loading image...</p>
        <Link href="/dashboard" className="mt-4 inline-block text-vivid-yellow hover:underline">← Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-rich-black">Creative Hub</h1>
        <Link href={productId ? `/dashboard/products/${productId}` : '/dashboard'} className="text-vivid-yellow hover:underline">
          {productId ? '← Product' : '← Dashboard'}
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={displayImageUrl!}
              alt="Reference"
              className="w-full h-auto object-contain max-h-[400px] mx-auto"
            />
          </div>
          {canUseProductContext && (
            <p className="text-sm text-gray-500">Product context active: prompt and brand identity will be applied if configured.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('similar')}
              className={`px-4 py-2 rounded-lg font-medium transition ${mode === 'similar' ? 'bg-vivid-yellow text-rich-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Generate similar
            </button>
            <button
              type="button"
              onClick={() => setMode('modify')}
              className={`px-4 py-2 rounded-lg font-medium transition ${mode === 'modify' ? 'bg-vivid-yellow text-rich-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Edit image
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <label className="block text-sm font-medium text-rich-black">
                {mode === 'similar' ? 'Variation description (optional)' : 'What to change'}
              </label>
              <EditPromptWithAI value={prompt} onChange={setPrompt} buttonLabel="Edit prompt with AI" applyLabel="Apply" />
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'similar' ? 'E.g.: same colors, slightly lighter background...' : 'E.g.: change background to white, add soft shadow...'}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-vivid-yellow focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rich-black mb-2">Aspect ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="1:1">1:1 (Square)</option>
              <option value="4:5">4:5 (Portrait)</option>
              <option value="16:9">16:9 (Landscape)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-rich-black text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>

          {imageUrlParam && (
            <Link
              href={`/dashboard/shooting?reference_url=${encodeURIComponent(imageUrlParam)}${productId ? `&product_id=${productId}` : ''}`}
              className="block text-center text-sm text-vivid-yellow hover:underline"
            >
              Use this image in a product photoshooting →
            </Link>
          )}
        </div>
      </div>

      {resultImageUrl && (
        <ResultPopup
          imageUrl={resultImageUrl}
          onClose={() => setResultImageUrl(null)}
          isFree={false}
        />
      )}
    </div>
  )
}

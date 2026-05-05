'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { generationApi, getAbsoluteImageUrl, getDeviceId, productsApi, uploadApi, userApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { ResultPopup } from '@/components/ResultPopup'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

const POLL_INTERVAL_MS = 3000

const GOAL_PRESETS = [
  {
    id: 'catalog',
    label: 'Catalog clean',
    prompt:
      'Place the product on a clean white background, centered, with soft diffused light and a natural shadow for a premium ecommerce look.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    prompt:
      'Place the product in a natural lifestyle context with realistic props, warm light, shallow depth of field, and editorial composition.',
  },
  {
    id: 'hero',
    label: 'Hero shot',
    prompt:
      'Create a dramatic hero shot with directional studio light, deep contrast, premium reflections, and a cinematic product focus.',
  },
  {
    id: 'social',
    label: 'Social ad',
    prompt:
      'Generate a high-converting social ad visual with a vivid background, clean negative space for copy, and bold product framing.',
  },
]

type ProductImage = {
  id: string
  image_url: string
}

type ProductDetail = {
  id: string
  product_prompt: string
  default_apply_brand_identity: boolean
  images?: ProductImage[]
}

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

export default function DashboardCreatePage() {
  const router = useRouter()
  const [sourceMode, setSourceMode] = useState<'upload' | 'catalog'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedCatalogImageId, setSelectedCatalogImageId] = useState('')
  const [useProductContext, setUseProductContext] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(GOAL_PRESETS[0].id)
  const [prompt, setPrompt] = useState(GOAL_PRESETS[0].prompt)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [resolution, setResolution] = useState<'4k' | '8k'>('4k')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stopPollingRef = useRef<(() => void) | null>(null)

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: isAuthenticated(),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: isAuthenticated(),
  })

  const { data: productDetail } = useQuery<ProductDetail>({
    queryKey: ['product', selectedProductId],
    queryFn: () => productsApi.get(selectedProductId),
    enabled: isAuthenticated() && !!selectedProductId,
  })

  const credits = user?.credits_balance ?? 0
  const canChoose8k = credits >= 2

  useEffect(() => {
    if (!canChoose8k && resolution === '8k') setResolution('4k')
  }, [canChoose8k, resolution])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      stopPollingRef.current?.()
    }
  }, [previewUrl])

  useEffect(() => {
    if (!selectedProductId) {
      setUseProductContext(false)
      setSelectedCatalogImageId('')
      if (sourceMode === 'catalog') {
        setImageUrl(null)
        setPreviewUrl(null)
      }
      return
    }
    setUseProductContext(true)
  }, [selectedProductId, sourceMode])

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadImage,
    onSuccess: (data, variables) => {
      if (variables !== selectedFile) return
      setImageUrl(data.image_url)
      toast.success('Reference uploaded')
    },
    onError: (error: unknown) => {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Upload failed')
    },
  })

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
        toast.success('Generation completed')
        setResultImageUrl(getAbsoluteImageUrl(data.output_image_url) ?? data.output_image_url ?? null)
      } else {
        setIsGenerating(false)
      }
    },
    onError: (error: unknown) => {
      setIsGenerating(false)
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Generation failed')
    },
  })

  const productImages = useMemo(() => productDetail?.images ?? [], [productDetail?.images])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSourceMode('upload')
    setSelectedCatalogImageId('')
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setImageUrl(null)
    uploadMutation.mutate(file)
  }

  const handleGoalChange = (goalId: string) => {
    setSelectedGoal(goalId)
    const preset = GOAL_PRESETS.find((item) => item.id === goalId)
    if (preset) setPrompt(preset.prompt)
  }

  const handleSelectCatalogImage = (img: ProductImage) => {
    setSourceMode('catalog')
    setSelectedCatalogImageId(img.id)
    setImageUrl(img.image_url)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(getAbsoluteImageUrl(img.image_url) ?? img.image_url)
  }

  const handleGenerate = () => {
    if (!imageUrl || !prompt.trim()) {
      toast.error('Select a reference and define your prompt')
      return
    }

    setIsGenerating(true)

    const canUseProductPayload = useProductContext && !!selectedProductId && !!productDetail

    const payload = canUseProductPayload
      ? {
          prompt: productDetail.product_prompt,
          image_url: imageUrl,
          aspect_ratio: aspectRatio,
          resolution,
          device_id: getDeviceId(),
          product_id: selectedProductId,
          apply_brand_identity: productDetail.default_apply_brand_identity,
          user_prompt_input: prompt.trim(),
        }
      : {
          prompt: prompt.trim(),
          image_url: imageUrl,
          aspect_ratio: aspectRatio,
          resolution,
          device_id: getDeviceId(),
        }

    generateMutation.mutate(payload)
  }

  const effectivePreviewUrl = previewUrl
  const stepReferenceDone = !!imageUrl
  const stepPromptDone = !!prompt.trim()

  return (
    <div className="mx-auto h-full max-w-6xl overflow-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Generate Image</h1>
          <p className="mt-1 text-sm text-white/70">
            Guided flow: 1) pick reference, 2) define output, 3) generate.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <section className="space-y-5 rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">1. Reference</h2>
            <span className={`text-xs font-semibold ${stepReferenceDone ? 'text-emerald-300' : 'text-amber-300'}`}>
              {stepReferenceDone ? 'Done' : 'Required'}
            </span>
          </div>

          <div className="rounded-xl border border-white/15 bg-black/20 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSourceMode('upload')}
                className={`rounded-full px-4 py-2 text-sm ${sourceMode === 'upload' ? 'bg-white text-[#13233d]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('catalog')}
                className={`rounded-full px-4 py-2 text-sm ${sourceMode === 'catalog' ? 'bg-white text-[#13233d]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                From catalog
              </button>
            </div>

            {sourceMode === 'upload' ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {effectivePreviewUrl ? (
                  <>
                    <img src={effectivePreviewUrl} alt="Preview" className="max-h-72 w-full rounded-xl object-contain bg-black/20" />
                    {uploadMutation.isPending && <p className="text-sm text-white/70">Upload in corso...</p>}
                    {imageUrl && <p className="text-sm text-emerald-300">Reference ready</p>}
                  </>
                ) : (
                  <p className="text-sm text-white/75">Upload a JPG/PNG reference to start.</p>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                >
                  {effectivePreviewUrl ? 'Change file' : 'Select file'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value)
                    setSelectedCatalogImageId('')
                    setImageUrl(null)
                    setPreviewUrl(null)
                  }}
                  className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white"
                >
                  <option value="">Select product...</option>
                  {products.map((p: { id: string; name: string }) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {!selectedProductId ? (
                  <p className="text-sm text-white/75">Select a product to load its references.</p>
                ) : productImages.length === 0 ? (
                  <p className="text-sm text-white/75">No references available for this product.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {productImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleSelectCatalogImage(img)}
                        className={`overflow-hidden rounded-lg border-2 ${
                          selectedCatalogImageId === img.id ? 'border-cyan-200' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={getAbsoluteImageUrl(img.image_url) ?? img.image_url}
                          alt="Reference"
                          className="h-24 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {effectivePreviewUrl && (
                  <img src={effectivePreviewUrl} alt="Catalog preview" className="max-h-72 w-full rounded-xl object-contain bg-black/20" />
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">2. Obiettivo creativo</h2>
              <span className={`text-xs font-semibold ${stepPromptDone ? 'text-emerald-300' : 'text-amber-300'}`}>
              {stepPromptDone ? 'Done' : 'Required'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {GOAL_PRESETS.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => handleGoalChange(goal.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selectedGoal === goal.id
                      ? 'border-white bg-white text-[#13233d]'
                      : 'border-white/25 bg-white/5 text-white hover:bg-white/15'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="text-sm font-medium">Prompt finale</label>
                <EditPromptWithAI value={prompt} onChange={setPrompt} buttonLabel="Improve with AI" applyLabel="Apply" />
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white placeholder:text-white/60"
                placeholder="Describe the result you want..."
              />
            </div>

            {selectedProductId && (
              <label className="mt-3 flex items-center gap-2 text-sm text-white/85">
                <input
                  type="checkbox"
                  checked={useProductContext}
                  onChange={(e) => setUseProductContext(e.target.checked)}
                />
                Apply product context (base prompt + brand identity)
              </label>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-cyan-200/40 bg-gradient-to-br from-[#10223d] to-[#1f3b61] p-5 text-white">
          <h2 className="text-lg font-semibold">3. Generate</h2>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-sm text-white/85 underline underline-offset-4"
          >
            {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
          </button>

          {showAdvanced && (
            <div className="space-y-3 rounded-xl border border-white/20 bg-black/20 p-4">
              <div>
                <label className="mb-1 block text-sm text-white/90">Aspect ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white"
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
                  className="w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white"
                >
                  <option value="4k">4K - 1 credito</option>
                  <option value="8k" disabled={!canChoose8k}>
                    8K - 2 credits{!canChoose8k ? ' (requires at least 2 credits)' : ''}
                  </option>
                </select>
                {!canChoose8k && <p className="mt-1 text-xs text-amber-200">Current credits: {credits}</p>}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/25 bg-black/20 p-4 text-sm text-white/85">
            <p>{resolution === '8k' ? 'Estimated cost: 2 credits' : 'Estimated cost: 1 credit'}</p>
            <p className="mt-1 text-xs">Result will be saved in Library and editable in Creative Hub.</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!imageUrl || !prompt.trim() || isGenerating || uploadMutation.isPending}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#13233d] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate image'}
          </button>

          {isGenerating && <p className="text-center text-xs text-white/70">Typical time: 30-90 seconds</p>}
        </section>
      </div>

      {resultImageUrl && <ResultPopup imageUrl={resultImageUrl} onClose={() => setResultImageUrl(null)} />}
    </div>
  )
}

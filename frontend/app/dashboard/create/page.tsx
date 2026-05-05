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
  const [step, setStep] = useState<1 | 2 | 3>(1)
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
  const stepReady = {
    1: stepReferenceDone,
    2: stepPromptDone,
    3: stepReferenceDone && stepPromptDone,
  } as const

  return (
    <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[1.2fr,0.8fr]">
      <section className="flex min-h-0 flex-col rounded-2xl border border-[#e8e0f5] bg-white">
        <div className="flex items-center justify-between border-b border-[#ece4f9] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#6a43ad]/75">Generate Image</p>
            <h1 className="text-xl font-semibold">Creative Session</h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s as 1 | 2 | 3)}
                className={`h-8 rounded-lg px-3 text-xs font-semibold ${
                  step === s
                    ? 'bg-[#eee4ff] text-[#5b34a0]'
                    : 'border border-[#ded3f3] bg-white text-[#1f1a2a]/65 hover:bg-[#f7f1ff]'
                }`}
              >
                Step {s}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    sourceMode === 'upload'
                      ? 'bg-[#1f162f] text-white'
                      : 'border border-[#ded3f3] bg-white text-[#1f1a2a] hover:bg-[#f7f1ff]'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('catalog')}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    sourceMode === 'catalog'
                      ? 'bg-[#1f162f] text-white'
                      : 'border border-[#ded3f3] bg-white text-[#1f1a2a] hover:bg-[#f7f1ff]'
                  }`}
                >
                  Product catalog
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
                  {!effectivePreviewUrl && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border border-[#d9caef] bg-[#faf7ff] px-4 py-3 text-sm text-[#1f1a2a] hover:bg-[#f2e9ff]"
                    >
                      Select image file
                    </button>
                  )}
                  {effectivePreviewUrl && (
                    <div className="space-y-2">
                      <img src={effectivePreviewUrl} alt="Preview" className="max-h-[360px] w-full rounded-xl object-contain bg-[#f3eef9]" />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg border border-[#d9caef] px-3 py-1.5 text-sm text-[#1f1a2a] hover:bg-[#f7f1ff]"
                        >
                          Change file
                        </button>
                        {uploadMutation.isPending && <span className="text-xs text-[#1f1a2a]/60">Uploading...</span>}
                        {imageUrl && <span className="text-xs text-emerald-600">Reference ready</span>}
                      </div>
                    </div>
                  )}
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
                    className="w-full rounded-lg border border-[#d9caef] bg-white px-3 py-2 text-sm text-[#1f1a2a]"
                  >
                    <option value="">Select product...</option>
                    {products.map((p: { id: string; name: string }) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  {selectedProductId && productImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {productImages.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => handleSelectCatalogImage(img)}
                          className={`overflow-hidden rounded-lg border-2 ${
                            selectedCatalogImageId === img.id ? 'border-[#8f62d7]' : 'border-transparent'
                          }`}
                        >
                          <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="Reference" className="h-24 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {effectivePreviewUrl && (
                    <img
                      src={effectivePreviewUrl}
                      alt="Selected reference"
                      className="max-h-[360px] w-full rounded-xl object-contain bg-[#f3eef9]"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {GOAL_PRESETS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleGoalChange(goal.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedGoal === goal.id
                        ? 'border-[#8f62d7] bg-[#f4ecff] text-[#3e246f]'
                        : 'border-[#ded3f3] bg-white text-[#1f1a2a] hover:bg-[#f7f1ff]'
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-[#1f1a2a]">Prompt</label>
                  <EditPromptWithAI value={prompt} onChange={setPrompt} buttonLabel="Improve with AI" applyLabel="Apply" />
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={9}
                  className="w-full rounded-xl border border-[#d9caef] bg-white px-3 py-2 text-[#1f1a2a] placeholder:text-[#1f1a2a]/45"
                  placeholder="Describe the desired output..."
                />
              </div>

              {selectedProductId && (
                <label className="flex items-center gap-2 text-sm text-[#1f1a2a]/80">
                  <input type="checkbox" checked={useProductContext} onChange={(e) => setUseProductContext(e.target.checked)} />
                  Apply product context (base prompt + brand identity)
                </label>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="text-sm text-[#5b34a0] underline underline-offset-4"
              >
                {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
              </button>

              {showAdvanced && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-[#1f1a2a]/65">Aspect ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full rounded-lg border border-[#d9caef] bg-white px-3 py-2 text-sm text-[#1f1a2a]"
                    >
                      <option value="1:1">1:1</option>
                      <option value="4:5">4:5</option>
                      <option value="16:9">16:9</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-[#1f1a2a]/65">Resolution</label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value as '4k' | '8k')}
                      className="w-full rounded-lg border border-[#d9caef] bg-white px-3 py-2 text-sm text-[#1f1a2a]"
                    >
                      <option value="4k">4K - 1 credit</option>
                      <option value="8k" disabled={!canChoose8k}>
                        8K - 2 credits{!canChoose8k ? ' (requires 2+ credits)' : ''}
                      </option>
                    </select>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-[#e7def4] bg-[#faf7ff] p-3 text-sm text-[#1f1a2a]/80">
                <p>{resolution === '8k' ? 'Estimated cost: 2 credits' : 'Estimated cost: 1 credit'}</p>
                {!canChoose8k && <p className="mt-1 text-xs text-amber-600">Current credits: {credits}</p>}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!imageUrl || !prompt.trim() || isGenerating || uploadMutation.isPending}
                className="w-full rounded-xl bg-[#1f162f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f2145] disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate image'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#ece4f9] px-4 py-3">
          <button
            type="button"
            onClick={() => setStep((prev) => (prev === 1 ? prev : ((prev - 1) as 1 | 2 | 3)))}
            disabled={step === 1}
            className="rounded-lg border border-[#d9caef] px-3 py-1.5 text-xs text-[#1f1a2a] disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep((prev) => (prev === 3 ? prev : ((prev + 1) as 1 | 2 | 3)))}
            disabled={(step === 1 && !stepReady[1]) || (step === 2 && !stepReady[2]) || step === 3}
            className="rounded-lg bg-[#eee4ff] px-3 py-1.5 text-xs font-semibold text-[#5b34a0] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>

      <aside className="flex min-h-0 flex-col rounded-2xl border border-[#e8e0f5] bg-[#fdfbff]">
        <div className="border-b border-[#ece4f9] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6a43ad]/70">Session Status</p>
          <p className="mt-1 text-sm text-[#1f1a2a]/70">Reference, prompt, and generation readiness.</p>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          <div className="rounded-xl border border-[#e7def4] bg-white p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#1f1a2a]/55">Reference</p>
            <p className={`mt-1 text-sm ${stepReferenceDone ? 'text-emerald-600' : 'text-amber-600'}`}>
              {stepReferenceDone ? 'Ready' : 'Missing'}
            </p>
          </div>
          <div className="rounded-xl border border-[#e7def4] bg-white p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#1f1a2a]/55">Prompt</p>
            <p className={`mt-1 text-sm ${stepPromptDone ? 'text-emerald-600' : 'text-amber-600'}`}>
              {stepPromptDone ? 'Ready' : 'Missing'}
            </p>
          </div>
          <div className="rounded-xl border border-[#e7def4] bg-white p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#1f1a2a]/55">Mode</p>
            <p className="mt-1 text-sm text-[#1f1a2a]/80">{sourceMode === 'upload' ? 'Direct upload' : 'Product catalog'}</p>
          </div>
          <div className="rounded-xl border border-[#e7def4] bg-white p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[#1f1a2a]/55">Output</p>
            <p className="mt-1 text-sm text-[#1f1a2a]/80">{resolution.toUpperCase()} · {aspectRatio}</p>
          </div>
        </div>
      </aside>

      {resultImageUrl && <ResultPopup imageUrl={resultImageUrl} onClose={() => setResultImageUrl(null)} />}
    </div>
  )
}

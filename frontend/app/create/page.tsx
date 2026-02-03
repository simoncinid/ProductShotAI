'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery } from '@tanstack/react-query'
import { uploadApi, generationApi, productsApi, brandIdentityApi, getDeviceId, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { ResultPopup } from '@/components/ResultPopup'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

const LOADING_MESSAGES = ['Processing your image…', 'Adding the finishing touches...', 'Almost there...']

const POLL_INTERVAL_MS = 3000

function startPolling(
  generationId: string,
  deviceId: string | undefined,
  onCompleted: (imageUrl: string) => void,
  onFailed: (message: string) => void,
) {
  const id = setInterval(async () => {
    try {
      const res = await generationApi.getGeneration(generationId, deviceId)
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

export default function CreatePage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const authenticated = mounted && isAuthenticated()
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [applyBrandIdentity, setApplyBrandIdentity] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stopPollingRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: authenticated,
  })
  const { data: brandIdentity, isFetched: brandFetched } = useQuery({
    queryKey: ['brand-identity'],
    queryFn: () => brandIdentityApi.get(),
    enabled: authenticated && !selectedProductId && applyBrandIdentity,
    retry: false,
  })
  const selectedProduct = selectedProductId ? products.find((p: { id: string }) => p.id === selectedProductId) : null
  const noProductWantsBrandButMissing = authenticated && !selectedProductId && applyBrandIdentity && brandFetched && !brandIdentity

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadImage,
    onSuccess: (data, variables) => {
      if (variables !== selectedFile) return
      setImageUrl(data.image_url)
      toast.success('Image uploaded successfully!')
    },
    onError: (error: unknown) => {
      const msg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      toast.error(msg || 'Upload failed')
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data: Parameters<typeof generationApi.generatePaid>[0]) => {
      if (authenticated) return generationApi.generatePaid(data)
      return generationApi.generateFree(data)
    },
    onSuccess: (data) => {
      if (data?.status === 'processing' && data?.generation_id) {
        const stop = startPolling(
          data.generation_id,
          authenticated ? undefined : getDeviceId(),
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
        stopPollingRef.current = stop
      } else if (data?.status === 'completed' && data?.output_image_url) {
        setIsGenerating(false)
        toast.success('Generation completed!')
        setResultImageUrl(getAbsoluteImageUrl(data.output_image_url) ?? data.output_image_url ?? null)
      } else {
        setIsGenerating(false)
      }
    },
    onError: (error: unknown) => {
      setIsGenerating(false)
      const errorMsg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Generation failed'
      toast.error(errorMsg ?? 'Generation failed')
      if (typeof errorMsg === 'string' && errorMsg.includes('limit reached')) {
        setTimeout(() => router.push('/signup'), 2000)
      }
    },
  })

  useEffect(() => {
    return () => {
      stopPollingRef.current?.()
    }
  }, [])

  // Messaggi rotanti durante l'attesa
  useEffect(() => {
    if (!isGenerating) return
    setLoadingIndex(0)
    const t = setInterval(() => setLoadingIndex((i) => i + 1), 1500)
    return () => clearInterval(t)
  }, [isGenerating])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setImageUrl(null)
      uploadMutation.mutate(file)
    }
  }

  const handleChangeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleGenerate = () => {
    if (!imageUrl) {
      toast.error('Please upload an image')
      return
    }
    const noProduct = !selectedProductId
    if (noProduct && !prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }
    setIsGenerating(true)
    const basePayload = {
      image_url: imageUrl,
      aspect_ratio: aspectRatio,
      resolution: '8k',
      device_id: getDeviceId(),
    }
    if (authenticated) {
      generateMutation.mutate({
        ...basePayload,
        prompt: noProduct ? prompt.trim() : (prompt.trim() || ' '),
        product_id: noProduct ? null : selectedProductId,
        apply_brand_identity: noProduct ? applyBrandIdentity : undefined,
        user_prompt_input: noProduct ? undefined : (prompt.trim() || undefined),
      })
    } else {
      generateMutation.mutate({
        ...basePayload,
        prompt: prompt.trim(),
        device_id: getDeviceId(),
      })
    }
  }

  const loadingMessage = isGenerating ? LOADING_MESSAGES[loadingIndex % LOADING_MESSAGES.length] : ''

  return (
    <div className="bg-page-bg">
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden bg-page-bg pt-14 pb-12 md:pt-16 md:pb-14 lg:pt-20 lg:pb-16">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-500 md:w-12" />
              <p className="font-script text-2xl text-on-dark md:text-3xl">Create</p>
              <span className="h-px w-8 bg-gray-500 md:w-12" />
            </div>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-white md:text-[34px]">
              Create Your AI Product Photo
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[16px] text-gray-300 md:text-[18px]">
              Upload your product image—our product photo AI creates ai image product and image product ai in 8K. Amazon product photo ready.
            </p>
            {!authenticated && (
              <p className="mt-3 text-[13px] text-gray-400">
                Free users get watermarked images.{' '}
<Link href="/signup" className="font-semibold text-anthracite hover:underline">
                Sign up
              </Link>{' '}
                for clean images without watermark.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Divisore curvo ——— */}
      <div className="relative -mt-px h-10 w-full overflow-hidden bg-page-bg md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— Form a 2 colonne ——— */}
      <section className="bg-page-bg pb-16 pt-10 md:pb-24 md:pt-14">
        <div className={CONTAINER}>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Upload + Aspect Ratio */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft md:p-8">
              <label className="block text-[15px] font-semibold text-primary md:text-base">
                Upload Product Image
              </label>
              <div className="mt-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-colors hover:border-gray-300 md:p-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto max-h-64 w-auto rounded-xl object-contain"
                    />
                    {uploadMutation.isPending && (
                      <p className="flex items-center justify-center gap-1.5 text-[14px] text-secondary">Uploading…</p>
                    )}
                    {uploadMutation.isError && (
                      <p className="flex flex-wrap items-center justify-center gap-2 text-[14px]">
                        <span className="text-red-600">Upload failed.</span>
                        <button
                          type="button"
                          onClick={() => selectedFile && uploadMutation.mutate(selectedFile)}
                          className="font-semibold text-anthracite underline hover:no-underline"
                        >
                          Retry
                        </button>
                      </p>
                    )}
                    {imageUrl && (
                      <p className="flex items-center justify-center gap-1.5 text-[14px] text-green-600">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Image uploaded
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleChangeImage}
                      className="block w-full text-center text-[13px] text-secondary underline hover:text-primary"
                    >
                      Change image
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                    </svg>
                    <span className="mt-3 block text-[14px] font-medium text-primary">Click to upload</span>
                    <span className="mt-1 block text-[12px] text-secondary">JPEG or PNG (max 10MB)</span>
                  </label>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-[15px] font-semibold text-primary md:text-base">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="1:1">1:1 (Square — Amazon Main)</option>
                  <option value="4:5">4:5 (Portrait)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
              </div>
            </div>

            {/* Prompt + Generate */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft md:p-8">
              {authenticated && (
                <>
                  <label className="block text-[15px] font-semibold text-primary md:text-base">
                    Product (optional)
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">NO PRODUCT</option>
                    {products.map((p: { id: string; name: string }) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {!selectedProductId ? (
                    <>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="applyBi"
                          checked={applyBrandIdentity}
                          onChange={(e) => setApplyBrandIdentity(e.target.checked)}
                        />
                        <label htmlFor="applyBi" className="text-[14px] text-primary">Apply Brand Identity</label>
                      </div>
                      {noProductWantsBrandButMissing && (
                        <p className="mt-2 text-[13px] text-amber-600">
                          Define Brand Identity in dashboard first.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-[13px] text-secondary">
                      Brand identity: On/Off based on product setting
                    </p>
                  )}
                  <div className="mt-4" />
                </>
              )}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="block text-[15px] font-semibold text-primary md:text-base">
                  {selectedProductId ? 'Additional instructions (optional)' : 'Describe Your Vision'}
                </label>
                <EditPromptWithAI value={prompt} onChange={setPrompt} buttonLabel="Edit prompt with AI" applyLabel="Apply" />
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={selectedProductId ? 'Extra notes for this generation...' : 'Example: Place the product on a clean white background with soft lighting, add a subtle shadow underneath, make the colors more vibrant...'}
                rows={8}
                className="mt-3 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <p className="mt-2 text-[13px] text-secondary">
                {selectedProductId ? 'Optional: add instructions to combine with the product prompt.' : 'Describe how you want your product to look. Be specific about background, lighting, and style.'}
              </p>

              <button
                onClick={handleGenerate}
                disabled={!imageUrl || (!selectedProductId && !prompt.trim()) || isGenerating || noProductWantsBrandButMissing}
                className="mt-6 w-full rounded-full bg-brand py-3.5 text-[15px] font-semibold text-rich-black shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? 'Generating... (30–90 sec)' : 'Generate Image'}
              </button>

              {isGenerating && (
                <p className="mt-4 text-center text-[14px] text-secondary">{loadingMessage}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popup risultato: sia per utenti loggati (senza watermark) sia free (con watermark da backend) */}
      {resultImageUrl && (
        <ResultPopup
          imageUrl={resultImageUrl}
          onClose={() => setResultImageUrl(null)}
          isFree={!authenticated}
        />
      )}
    </div>
  )
}

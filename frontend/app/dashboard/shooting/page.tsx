'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productsApi, uploadApi, shootingApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

const SHOOTING_STYLE_OPTIONS = [
  { value: 'Zoom into details', label: 'Zoom on details (close-up, texture)' },
  { value: 'Lifestyle', label: 'Lifestyle (usage context, environment)' },
  { value: 'Studio shooting', label: 'Studio shooting (neutral background, controlled light)' },
  { value: 'Mix: 3 zoomed 1 detail 2 lifestyle (one with text)', label: 'Mix: 3 zoom, 1 detail, 2 lifestyle (one with text)' },
  { value: 'Un po\' e un po\'', label: 'Mix (balanced)' },
  { value: 'Clean e-commerce set', label: 'Clean e-commerce set (white, minimal)' },
]

const STEPS = ['Product', 'Reference photo', 'Count & style', 'Prompt', 'Generate'] as const

export default function ShootingWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [productId, setProductId] = useState<string | null>(null)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [count, setCount] = useState(4)
  const [shootingStyle, setShootingStyle] = useState(SHOOTING_STYLE_OPTIONS[0].value)
  const [prompts, setPrompts] = useState<string[]>([])
  const [promptIndex, setPromptIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: isAuthenticated(),
  })

  const { data: productDetail } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.get(productId!),
    enabled: !!productId && step === 1,
  })

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadImage,
    onSuccess: (data) => {
      setReferenceImageUrl(data.image_url)
      toast.success('Image uploaded')
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Upload failed')
    },
  })

  const promptsMutation = useMutation({
    mutationFn: (data: { product_id: string; shooting_style: string; count: number }) => shootingApi.createPrompts(data),
    onSuccess: (data) => {
      setPrompts(data.prompts)
      setPromptIndex(0)
      setStep(3) // review prompts (step 3 = Prompt)
      toast.success('Prompts generated')
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Prompt generation failed')
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data: { product_id: string; reference_image_url: string; prompts: string[]; aspect_ratio: string }) => shootingApi.generate(data),
    onSuccess: (data) => {
      toast.success('Shooting started')
      router.push(`/dashboard/shooting/${data.shooting_id}`)
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Starting shooting failed')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReferenceFile(file)
      uploadMutation.mutate(file)
    }
  }

  const handleSelectProductImage = (imageUrl: string) => {
    setReferenceImageUrl(imageUrl)
    setReferenceFile(null)
  }

  const handleGeneratePrompts = () => {
    if (!productId) return
    promptsMutation.mutate({ product_id: productId, shooting_style: shootingStyle, count })
  }

  const handleConfirmPrompt = () => {
    if (promptIndex < prompts.length - 1) {
      setPromptIndex(promptIndex + 1)
    } else {
      setStep(4) // final step: Generate
    }
  }

  const handleStartGeneration = () => {
    if (!productId || !referenceImageUrl || prompts.length === 0) return
    generateMutation.mutate({
      product_id: productId,
      reference_image_url: referenceImageUrl,
      prompts,
      aspect_ratio: '1:1',
    })
  }

  if (!isAuthenticated()) return null
  if (productsLoading) return <div className="p-8 text-gray-400">Loading...</div>

  if (products.length === 0 && step === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Product Photoshooting</h1>
        <p className="text-gray-400 mb-6">You don&apos;t have any products yet. Create a product to generate a shooting.</p>
        <Link href="/dashboard/products" className="inline-block px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold">
          Create product
        </Link>
        <Link href="/dashboard" className="ml-4 text-vivid-yellow hover:underline">← Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Product Photoshooting</h1>
        <Link href="/dashboard" className="text-vivid-yellow hover:underline">← Dashboard</Link>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step ? setStep(i) : undefined}
            className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium ${
              i === step ? 'bg-vivid-yellow text-rich-black' : i < step ? 'bg-white/20 text-gray-200 border border-gray-500' : 'bg-white/10 text-gray-500 border border-gray-600'
            } ${i < step ? 'cursor-pointer' : ''}`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {/* Step 0: Select product */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Select product</h2>
          <div className="grid gap-2">
            {products.map((p: { id: string; name: string }) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setProductId(p.id); setStep(1); }}
                className={`text-left p-4 rounded-lg border-2 transition text-gray-200 ${
                  productId === p.id ? 'border-vivid-yellow bg-vivid-yellow/20 text-white' : 'border-gray-600 hover:border-gray-500 bg-white/5'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Reference photo */}
      {step === 1 && productId && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Reference photo</h2>
          <p className="text-sm text-gray-400">Upload a photo or choose from a product image.</p>
          <div className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center bg-white/5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/10 border border-gray-500 text-gray-200 rounded-md font-medium hover:bg-white/20"
            >
              Upload image
            </button>
            {uploadMutation.isPending && <p className="mt-2 text-sm text-gray-400">Uploading…</p>}
          </div>
          {productDetail?.images?.length ? (
            <div>
              <p className="text-sm font-medium text-gray-200 mb-2">Or choose from product images:</p>
              <div className="flex flex-wrap gap-2">
                {(productDetail.images as { id: string; image_url: string }[]).map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleSelectProductImage(img.image_url)}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-500 hover:border-vivid-yellow focus:ring-2 focus:ring-vivid-yellow"
                  >
                    <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {referenceImageUrl && (
            <div className="mt-4">
              <p className="text-sm text-green-400 mb-2">✓ Image selected</p>
              <img src={getAbsoluteImageUrl(referenceImageUrl) ?? referenceImageUrl} alt="" className="max-h-40 rounded-lg border border-gray-600" />
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold">
                  Next
                </button>
                <button type="button" onClick={() => setReferenceImageUrl(null)} className="px-4 py-2 border border-gray-500 text-gray-200 rounded-md hover:bg-white/10">Change</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Count + style */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Number of photos and style</h2>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Number of photos (2–10)</label>
            <input
              type="number"
              min={2}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(2, parseInt(e.target.value, 10) || 2)))}
              className="w-full border border-gray-500 rounded-lg px-3 py-2 bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Shooting style (suggestions)</label>
            <select
              value={shootingStyle}
              onChange={(e) => setShootingStyle(e.target.value)}
              className="w-full border border-gray-500 rounded-lg px-3 py-2 bg-white text-gray-900"
            >
              {SHOOTING_STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleGeneratePrompts} disabled={promptsMutation.isPending} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50">
              {promptsMutation.isPending ? 'Generating prompts…' : 'Generate prompts with AI'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border border-gray-500 text-gray-200 rounded-md hover:bg-white/10">Back</button>
          </div>
        </div>
      )}

      {/* Step 3: Review/edit prompts one by one */}
      {step === 3 && prompts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-white">
              Prompt {promptIndex + 1} di {prompts.length}
            </h2>
            <EditPromptWithAI
              value={prompts[promptIndex] ?? ''}
              onChange={(newVal) => {
                const next = [...prompts]
                next[promptIndex] = newVal
                setPrompts(next)
              }}
              buttonLabel="Edit prompt with AI"
              applyLabel="Apply"
            />
          </div>
          <p className="text-sm text-gray-400">Edit if needed (e.g. add text on photo, zoom details) and confirm.</p>
          <textarea
            value={prompts[promptIndex] ?? ''}
            onChange={(e) => {
              const next = [...prompts]
              next[promptIndex] = e.target.value
              setPrompts(next)
            }}
            rows={8}
            className="w-full border border-gray-500 rounded-lg px-3 py-2 font-mono text-sm bg-white text-gray-900"
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleConfirmPrompt} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold">
              {promptIndex < prompts.length - 1 ? 'Confirm and next' : 'Confirm and go to Generate'}
            </button>
            {promptIndex > 0 && (
              <button type="button" onClick={() => setPromptIndex(promptIndex - 1)} className="px-4 py-2 border border-gray-500 text-gray-200 rounded-md hover:bg-white/10">Back</button>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Generate */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Generate shooting</h2>
          <p className="text-gray-400">{prompts.length} images will be generated (1 credit each).</p>
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={generateMutation.isPending}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50"
          >
            {generateMutation.isPending ? 'Starting…' : 'Generate'}
          </button>
          <button type="button" onClick={() => setStep(3)} className="block w-full text-center text-vivid-yellow hover:underline">
            ← Edit prompts
          </button>
        </div>
      )}
    </div>
  )
}

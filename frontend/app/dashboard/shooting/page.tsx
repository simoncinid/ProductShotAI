'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  productsApi,
  uploadApi,
  shootingApi,
  userApi,
  getAbsoluteImageUrl,
} from '@/lib/api'
import { isAuthenticated, useAuthenticated } from '@/lib/auth'
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
  const authenticated = useAuthenticated()
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetProductId = searchParams.get('product_id')
  const presetReferenceUrl = searchParams.get('reference_url')
  const [productId, setProductId] = useState<string | null>(presetProductId)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(
    presetReferenceUrl,
  )
  const [count, setCount] = useState(4)
  const [shootingStyle, setShootingStyle] = useState(
    SHOOTING_STYLE_OPTIONS[0].value,
  )
  const [resolution, setResolution] = useState<'4k' | '8k'>('4k')
  const [reviewPrompts, setReviewPrompts] = useState(true)
  const [prompts, setPrompts] = useState<string[]>([])
  const [phase, setPhase] = useState<'setup' | 'review'>('setup')
  const [setupStep, setSetupStep] = useState<1 | 2>(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: !!authenticated,
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: !!authenticated,
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
          ? (e as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail
          : null
      toast.error(msg || 'Upload failed')
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data: {
      product_id: string
      reference_image_url: string
      prompts: string[]
      aspect_ratio: string
      resolution: string
    }) => shootingApi.generate(data),
    onSuccess: (data) => {
      toast.success('Shooting started')
      router.push(`/dashboard/shooting/${data.shooting_id}`)
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail
          : null
      toast.error(msg || 'Starting shooting failed')
    },
  })

  const startGeneration = (generatedPrompts: string[]) => {
    if (
      !productId ||
      !referenceImageUrl ||
      generatedPrompts.length === 0 ||
      generateMutation.isPending ||
      credits < generatedPrompts.length * (resolution === '8k' ? 2 : 1)
    )
      return

    generateMutation.mutate({
      product_id: productId,
      reference_image_url: referenceImageUrl,
      prompts: generatedPrompts,
      aspect_ratio: '1:1',
      resolution,
    })
  }

  const promptsMutation = useMutation({
    mutationFn: (data: {
      product_id: string
      shooting_style: string
      count: number
    }) => shootingApi.createPrompts(data),
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
          ? (e as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail
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

    if (credits < count * (resolution === '8k' ? 2 : 1)) {
      toast.error('Please get enough credits for this set before continuing.')
      return
    }
    promptsMutation.mutate({
      product_id: productId,
      shooting_style: shootingStyle,
      count,
    })
  }

  if (!authenticated) return null
  if (productsLoading)
    return <div className="p-8 text-[#0f172a]/70">Loading...</div>

  if (products.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="mb-3 text-2xl font-bold text-[#0f172a]">
          Create an image set
        </h1>
        <p className="mb-6 text-[#0f172a]/70">
          Image sets use a saved product and its photos. For the simplest start,
          create one photo first — no product setup required.
        </p>
        <Link
          href="/dashboard/products"
          className="inline-flex rounded-full bg-[#115e59] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Save a product
        </Link>
        <Link
          href="/dashboard/create"
          className="mt-4 block min-h-12 font-semibold text-teal-800 underline"
        >
          Create a single photo instead →
        </Link>
      </div>
    )
  }

  const totalCredits = count * (resolution === '8k' ? 2 : 1)
  const stepProductDone = !!productId
  const stepReferenceDone = !!referenceImageUrl

  return (
    <div className="grid h-auto min-h-0  gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      {phase === 'setup' ? (
        <>
          <section className="flex min-h-0 flex-col rounded-2xl border border-[#e2e8f0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#115e59]/75">
                  Create an image set
                </p>
                <h1 className="text-xl font-semibold">
                  Several photos, one product
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSetupStep(1)}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold ${
                    setupStep === 1
                      ? 'bg-[#ccfbf1] text-[#115e59]'
                      : 'border border-[#cbd5e1] bg-white text-[#0f172a]/65 hover:bg-[#f7f1ff]'
                  }`}
                >
                  1. Product & photo
                </button>
                <button
                  type="button"
                  onClick={() => setSetupStep(2)}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold ${
                    setupStep === 2
                      ? 'bg-[#ccfbf1] text-[#115e59]'
                      : 'border border-[#cbd5e1] bg-white text-[#0f172a]/65 hover:bg-[#f7f1ff]'
                  }`}
                >
                  2. Style & cost
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              {setupStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {products.map((p: { id: string; name: string }) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProductId(p.id)
                          setReferenceImageUrl(null)
                        }}
                        className={`rounded-lg border px-3 py-2 text-left text-sm ${
                          productId === p.id
                            ? 'border-[#0f766e] bg-[#f0fdfa] text-[#3e246f]'
                            : 'border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f7f1ff]'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#0f172a]/75">
                      Select one product reference or upload a new image.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-[#cbd5e1] px-3 py-1.5 text-xs text-[#0f172a] hover:bg-[#f7f1ff]"
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

                  {(
                    productDetail?.images as
                      | { id: string; image_url: string }[]
                      | undefined
                  )?.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        productDetail?.images as {
                          id: string
                          image_url: string
                        }[]
                      ).map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setReferenceImageUrl(img.image_url)}
                          className={`overflow-hidden rounded-lg border-2 ${
                            referenceImageUrl === img.image_url
                              ? 'border-[#0f766e]'
                              : 'border-transparent'
                          }`}
                        >
                          <img
                            src={
                              getAbsoluteImageUrl(img.image_url) ??
                              img.image_url
                            }
                            alt=""
                            className="h-24 w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {referenceImageUrl && (
                    <img
                      src={
                        getAbsoluteImageUrl(referenceImageUrl) ??
                        referenceImageUrl
                      }
                      alt="Selected reference"
                      className="max-h-[340px] w-full rounded-xl object-contain bg-[#f1f5f9]"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="studio-number-of-images"
                      className="mb-1 block text-sm text-[#0f172a]/90"
                    >
                      Number of images
                    </label>
                    <input
                      id="studio-number-of-images"
                      type="number"
                      min={2}
                      max={10}
                      value={count}
                      onChange={(e) =>
                        setCount(
                          Math.min(
                            10,
                            Math.max(2, Number(e.target.value) || 2),
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-sm text-[#0f172a]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="studio-shooting-style"
                      className="mb-1 block text-sm text-[#0f172a]/90"
                    >
                      Shooting style
                    </label>
                    <select
                      id="studio-shooting-style"
                      value={shootingStyle}
                      onChange={(e) => setShootingStyle(e.target.value)}
                      className="w-full rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-sm text-[#0f172a]"
                    >
                      {SHOOTING_STYLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
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
                      onChange={(e) =>
                        setResolution(e.target.value as '4k' | '8k')
                      }
                      className="w-full rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-sm text-[#0f172a]"
                    >
                      <option value="4k">4K - 1 credit / image</option>
                      <option value="8k" disabled={!canChoose8k}>
                        8K - 2 credits / image
                        {!canChoose8k ? ' (requires at least 2 credits)' : ''}
                      </option>
                    </select>
                    {!canChoose8k && (
                      <p className="mt-1 text-xs text-amber-600">
                        Your balance: {credits}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#0f172a]/90">
                    <input
                      type="checkbox"
                      checked={reviewPrompts}
                      onChange={(e) => setReviewPrompts(e.target.checked)}
                      className="rounded"
                    />
                    Review image descriptions before creating
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#e2e8f0] px-4 py-3">
              <button
                type="button"
                onClick={() => setSetupStep(1)}
                disabled={setupStep === 1}
                className="rounded-lg border border-[#cbd5e1] px-3 py-1.5 text-xs text-[#0f172a] disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setSetupStep(2)}
                disabled={
                  setupStep === 2 || !stepProductDone || !stepReferenceDone
                }
                className="rounded-lg bg-[#ccfbf1] px-3 py-1.5 text-xs font-semibold text-[#115e59] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>

          <aside className="flex min-h-0 flex-col rounded-2xl border border-[#e2e8f0] bg-[#f8fafc]">
            <div className="border-b border-[#e2e8f0] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#115e59]/75">
                Your image set
              </p>
              <p className="mt-1 text-sm text-[#0f172a]/70">
                Check your product, photo and total cost before creating.
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#0f172a]/55">
                  Product
                </p>
                <p
                  className={`mt-1 text-sm ${stepProductDone ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {stepProductDone ? 'Selected' : 'Missing'}
                </p>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#0f172a]/55">
                  Reference
                </p>
                <p
                  className={`mt-1 text-sm ${stepReferenceDone ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {stepReferenceDone ? 'Selected' : 'Missing'}
                </p>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-3 text-sm text-[#0f172a]/80">
                <p>Your balance: {credits} credits</p>
                <p className="mt-1">Style: {shootingStyle}</p>
                <p className="mt-1">
                  Output: {count} images · {resolution.toUpperCase()}
                </p>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-3 text-sm text-[#0f172a]/85">
                <p>Total cost: {totalCredits} credits</p>
                <p className="mt-1 text-xs">
                  {count} images x {resolution === '8k' ? 2 : 1} credit(s) each.
                </p>
              </div>
            </div>
            {credits < totalCredits && (
              <p className="px-4 text-base text-slate-700">
                You need {totalCredits - credits} more credits for this set.{' '}
                <Link
                  href="/pricing"
                  className="font-semibold text-teal-800 underline"
                >
                  View credit packs
                </Link>
              </p>
            )}
            <div className="border-t border-[#e2e8f0] p-4">
              <button
                type="button"
                onClick={handleCreateShooting}
                disabled={
                  setupStep !== 2 ||
                  !productId ||
                  !referenceImageUrl ||
                  credits < totalCredits ||
                  promptsMutation.isPending ||
                  generateMutation.isPending
                }
                className="w-full rounded-xl bg-[#115e59] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2f2145] disabled:opacity-50"
              >
                {promptsMutation.isPending
                  ? 'Generating prompts...'
                  : generateMutation.isPending
                    ? 'Starting shooting...'
                    : reviewPrompts
                      ? 'Review image descriptions'
                      : `Create ${count} photos · ${totalCredits} credits`}
              </button>
            </div>
          </aside>
        </>
      ) : (
        <section className="col-span-full rounded-2xl border border-[#e2e8f0] bg-white p-4 text-[#0f172a]">
          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">
              Review your {prompts.length} image descriptions
            </h2>
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="rounded-md border border-[#cbd5e1] px-3 py-1.5 text-sm text-[#0f172a] hover:bg-[#f7f1ff]"
            >
              Back to setup
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {prompts.map((prompt, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
                  <label
                    htmlFor={`set-description-${index}`}
                    className="text-sm font-semibold"
                  >
                    Image {index + 1} description
                  </label>
                  <EditPromptWithAI
                    value={prompt}
                    onChange={(newVal) => {
                      const next = [...prompts]
                      next[index] = newVal
                      setPrompts(next)
                    }}
                    buttonLabel="Improve with AI"
                    applyLabel="Apply"
                  />
                </div>
                <textarea
                  aria-label={`Image ${index + 1} description`}
                  id={`set-description-${index}`}
                  value={prompt}
                  onChange={(e) => {
                    const next = [...prompts]
                    next[index] = e.target.value
                    setPrompts(next)
                  }}
                  rows={5}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-sm text-[#0f172a]"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => startGeneration(prompts)}
              disabled={
                generateMutation.isPending ||
                prompts.some((p) => !p.trim()) ||
                credits < prompts.length * (resolution === '8k' ? 2 : 1)
              }
              className="rounded-xl bg-[#115e59] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {generateMutation.isPending
                ? 'Starting shooting...'
                : `Create ${prompts.length} photos · ${prompts.length * (resolution === '8k' ? 2 : 1)} credits`}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

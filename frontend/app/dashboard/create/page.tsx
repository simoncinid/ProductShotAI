'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  UploadCloud,
} from 'lucide-react'
import {
  generationApi,
  getAbsoluteImageUrl,
  getDeviceId,
  productsApi,
  uploadApi,
  userApi,
} from '@/lib/api'
import { useAuthenticated } from '@/lib/auth'
import { trackFunnel } from '@/lib/funnel'
import { ResultPopup } from '@/components/ResultPopup'

const STYLES = [
  {
    id: 'catalog',
    name: 'Clean background',
    detail: 'A simple white background for your online store.',
    image: '/images/product1.png',
    prompt:
      'Place the product on a clean white background, centered, with soft diffused light and a natural shadow for an ecommerce product photo.',
  },
  {
    id: 'lifestyle',
    name: 'Natural setting',
    detail: 'Show your product in a realistic everyday scene.',
    image: '/images/res1.png',
    prompt:
      'Place the product in a natural lifestyle setting with realistic props, soft natural light, and editorial composition.',
  },
  {
    id: 'hero',
    name: 'Studio spotlight',
    detail: 'Dramatic lighting that makes your product stand out.',
    image: '/images/res4.png',
    prompt:
      'Create a dramatic product photo with directional studio light, premium reflections, and a cinematic focus.',
  },
  {
    id: 'social',
    name: 'Colourful advert',
    detail: 'A bold background with room for your own text.',
    image: '/images/ugcAfter4.png',
    prompt:
      'Create a colourful advertising product photo with a vivid background and clear negative space for text. Do not add any text.',
  },
]
const FORMATS = [
  { value: '1:1', name: 'Square', hint: 'Online store', shape: 'h-6 w-6' },
  { value: '4:5', name: 'Portrait', hint: 'Social feed', shape: 'h-7 w-5' },
  { value: '16:9', name: 'Wide', hint: 'Website banner', shape: 'h-4 w-8' },
]
const button =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-50'
const panel = 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-7'
type Product = {
  id: string
  name: string
  product_prompt: string
  default_apply_brand_identity: boolean
  images?: { id: string; image_url: string }[]
}
type Draft = {
  step?: number
  imageUrl: string
  productId: string
  mode: 'upload' | 'catalog'
  style: string
  notes: string
  ratio: string
  resolution: '4k' | '8k'
  useContext: boolean
}
function errorText(error: unknown, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: string } } })
    ?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function DashboardCreatePage() {
  const authenticated = useAuthenticated()
  const cache = useQueryClient()
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    enabled: authenticated === true,
  })
  const { data: products = [], isError: productsError } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: authenticated === true,
  })
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'upload' | 'catalog'>('upload')
  const [productId, setProductId] = useState('')
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => productsApi.get(productId),
    enabled: !!productId && authenticated === true,
  })
  const [imageUrl, setImageUrl] = useState('')
  const [preview, setPreview] = useState('')
  const [style, setStyle] = useState('catalog')
  const [notes, setNotes] = useState('')
  const [ratio, setRatio] = useState('1:1')
  const [resolution, setResolution] = useState<'4k' | '8k'>('4k')
  const [useContext, setUseContext] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [result, setResult] = useState('')
  const [activeGeneration, setActiveGeneration] = useState('')
  const [restored, setRestored] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const uploadVersion = useRef(0)
  const fileRef = useRef<File | null>(null)
  const inFlight = useRef(false)
  const draftLoaded = useRef(false)
  const selectedStyle = STYLES.find((s) => s.id === style) || STYLES[0]
  const cost = resolution === '8k' ? 2 : 1
  const credits = user?.credits_balance ?? 0
  const prompt = `${selectedStyle.prompt} Preserve the exact product, shape, colour, branding and packaging.${notes.trim() ? ` Additional instructions: ${notes.trim()}` : ''}`
  const draftKey = user ? `studio-draft:${user.id}` : ''

  useEffect(() => {
    if (!draftKey || draftLoaded.current) return
    draftLoaded.current = true
    try {
      const saved = sessionStorage.getItem(draftKey)
      if (saved) {
        const d: Draft = JSON.parse(saved)
        if (d.imageUrl && /^https?:\/\/|^\/api\/storage\//.test(d.imageUrl)) {
          setImageUrl(d.imageUrl)
          setProductId(d.productId || '')
          setMode(d.mode === 'catalog' ? 'catalog' : 'upload')
          setStyle(STYLES.some((s) => s.id === d.style) ? d.style : 'catalog')
          setNotes(d.notes || '')
          setRatio(FORMATS.some((f) => f.value === d.ratio) ? d.ratio : '1:1')
          setResolution(d.resolution === '8k' ? '8k' : '4k')
          setUseContext(!!d.useContext)
          setStep(d.step && d.step >= 1 && d.step <= 3 ? d.step : 1)
          setRestored(true)
        }
      }
      const active = sessionStorage.getItem(`${draftKey}:generation`)
      if (active) {
        setActiveGeneration(active)
        setGenerating(true)
        setStep(3)
        inFlight.current = true
      }
    } catch {
      /* Browser storage may be unavailable. */
    }
  }, [draftKey])
  useEffect(() => {
    if (!draftKey || !draftLoaded.current) return
    try {
      if (imageUrl)
        sessionStorage.setItem(
          draftKey,
          JSON.stringify({
            step,
            imageUrl,
            productId,
            mode,
            style,
            notes,
            ratio,
            resolution,
            useContext,
          }),
        )
    } catch {}
  }, [
    draftKey,
    step,
    imageUrl,
    productId,
    mode,
    style,
    notes,
    ratio,
    resolution,
    useContext,
  ])
  useEffect(
    () => () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    },
    [preview],
  )
  useEffect(() => {
    if (!generating) return
    const timer = setInterval(() => setElapsed((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [generating])
  useEffect(() => {
    if (!activeGeneration) return
    let cancelled = false
    let busy = false
    const startedChecking = Date.now()
    const finish = () => {
      setGenerating(false)
      setActiveGeneration('')
      inFlight.current = false
      try {
        sessionStorage.removeItem(`${draftKey}:generation`)
      } catch {}
    }
    async function poll() {
      if (busy) return
      busy = true
      try {
        const status = await generationApi.getGeneration(activeGeneration)
        if (cancelled) return
        if (status.status === 'completed' && status.output_image_url) {
          setError('')
          finish()
          setResult(
            getAbsoluteImageUrl(status.output_image_url) ||
              status.output_image_url,
          )
          cache.invalidateQueries({ queryKey: ['user'] })
          cache.invalidateQueries({ queryKey: ['generations'] })
          trackFunnel('generation_completed')
        } else if (status.status === 'failed') {
          finish()
          setError(
            status.error_message ||
              'This image could not be created. Your photo and settings are still here. Please try again.',
          )
          trackFunnel('generation_failed')
        }
      } catch (e) {
        const status = (e as { response?: { status?: number } })?.response
          ?.status
        // The ID is reserved in the browser before the first POST reaches the server.
        if (status === 404 && Date.now() - startedChecking < 15000) return
        if (!cancelled)
          setError(
            status === 401
              ? 'Your session has expired. Sign in again, then return here to check your photo.'
              : 'We are still checking your image. You can safely retry the connection without creating another image, or check My images.',
          )
      } finally {
        busy = false
      }
    }
    poll()
    const timer = setInterval(poll, 3000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [activeGeneration, cache, draftKey])
  function go(next: number) {
    if (generating) return
    setStep(next)
    setError('')
    requestAnimationFrame(() => {
      heading.current?.focus()
      heading.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    trackFunnel('studio_step_viewed', { step: next })
  }
  async function upload(file: File) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadError(
        'Please choose a JPG or PNG photo. HEIC photos need to be saved as JPG first.',
      )
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        'This photo is larger than 10 MB. Please choose a smaller JPG or PNG.',
      )
      return
    }
    const version = ++uploadVersion.current
    try {
      if (draftKey) sessionStorage.removeItem(draftKey)
    } catch {}
    fileRef.current = file
    setPreview(URL.createObjectURL(file))
    setImageUrl('')
    setUploading(true)
    setUploadError('')
    try {
      const data = await uploadApi.uploadImage(file)
      if (version !== uploadVersion.current) return
      setImageUrl(data.image_url)
      trackFunnel('reference_uploaded')
    } catch (e) {
      if (version === uploadVersion.current)
        setUploadError(
          errorText(
            e,
            'Your photo could not be uploaded. Check your connection and try again.',
          ),
        )
    } finally {
      if (version === uploadVersion.current) setUploading(false)
    }
  }
  function switchMode(next: 'upload' | 'catalog') {
    uploadVersion.current++
    setUploading(false)
    setMode(next)
    setImageUrl('')
    setPreview('')
    setUploadError('')
    setUseContext(false)
    try {
      if (draftKey) sessionStorage.removeItem(draftKey)
    } catch {}
  }
  async function generate(retryId?: string) {
    if (
      (!retryId && inFlight.current) ||
      !imageUrl ||
      !user ||
      (!retryId && credits < cost) ||
      uploading
    )
      return
    inFlight.current = true
    setGenerating(true)
    setElapsed(0)
    setError('')
    const requestId = retryId || crypto.randomUUID()
    try {
      sessionStorage.setItem(`${draftKey}:generation`, requestId)
    } catch {}
    setActiveGeneration(requestId)
    trackFunnel(retryId ? 'studio_connection_retry' : 'generation_requested', {
      resolution,
    })
    try {
      const context = mode === 'catalog' && useContext && product
      const data = await generationApi.generatePaid({
        request_id: requestId,
        prompt: context ? product.product_prompt : prompt,
        image_url: imageUrl,
        aspect_ratio: ratio,
        resolution,
        device_id: getDeviceId(),
        ...(context
          ? {
              product_id: product.id,
              apply_brand_identity: product.default_apply_brand_identity,
              user_prompt_input: prompt,
            }
          : {}),
      })
      if (data.generation_id) {
        // Older server versions can return their own ID during a rolling update.
        if (data.generation_id !== requestId) {
          try {
            sessionStorage.setItem(`${draftKey}:generation`, data.generation_id)
          } catch {}
          setActiveGeneration(data.generation_id)
        }
      } else {
        throw new Error('Could not confirm the image request')
      }
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (
        status &&
        status >= 400 &&
        status < 500 &&
        status !== 401 &&
        status !== 429
      ) {
        setGenerating(false)
        setActiveGeneration('')
        inFlight.current = false
        try {
          sessionStorage.removeItem(`${draftKey}:generation`)
        } catch {}
        setError(
          errorText(
            e,
            'We could not start your image. Your photo and settings are still here.',
          ),
        )
        trackFunnel('generation_failed')
      } else {
        // Keep checking the same account-bound ID after uncertain delivery. A
        // connection retry reuses this ID, so it cannot create a second job.
        setError(
          'We couldn’t confirm the connection. We’re checking your image. Retrying the connection will not create another image or use extra credits.',
        )
      }
    }
  }
  const photo =
    preview || (imageUrl ? getAbsoluteImageUrl(imageUrl) || imageUrl : '')
  const stepNames = ['Your photo', 'Style & size', 'Review & create']

  return (
    <div className="studio-flow mx-auto max-w-5xl pb-10 text-slate-900">
      <header className="mb-6">
        <p className="text-sm font-semibold text-teal-800">Your photo studio</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Create a product photo
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Start with a photo of your product. Choose a look and we’ll create a
          new image for you.
        </p>
      </header>
      {restored && !generating && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900"
        >
          Your previous photo and choices have been restored. You can continue
          where you left off.
        </p>
      )}
      <nav
        aria-label="Image creation steps"
        className="mb-6 grid grid-cols-3 gap-2 sm:gap-3"
      >
        {stepNames.map((name, i) => (
          <button
            key={name}
            disabled={generating || (i > 0 && !imageUrl)}
            onClick={() => go(i + 1)}
            aria-current={step === i + 1 ? 'step' : undefined}
            className={`flex min-h-16 items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold sm:text-base ${step === i + 1 ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-600'} disabled:cursor-not-allowed`}
          >
            <span
              className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-full sm:flex ${step === i + 1 ? 'bg-teal-800 text-white' : 'bg-slate-100'}`}
            >
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span>
              <span className="mb-1 block text-xs font-normal sm:hidden">
                Step {i + 1}
              </span>
              {name}
            </span>
          </button>
        ))}
      </nav>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className={panel} aria-busy={uploading || generating}>
          <h2
            ref={heading}
            tabIndex={-1}
            className="scroll-mt-44 text-2xl lg:scroll-mt-24 font-semibold outline-none"
          >
            {generating
              ? 'We’re creating your photo'
              : `${step}. ${stepNames[step - 1]}`}
          </h2>
          {generating ? (
            <div role="status" aria-live="polite" className="mt-6 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-700" />
              <p className="mt-5 text-lg font-semibold">
                {elapsed < 20
                  ? 'Your product photo is being prepared.'
                  : 'Your image is still being created.'}
              </p>
              <p className="mt-3 leading-relaxed text-slate-600">
                High-resolution images can take a few minutes. You don’t need to
                press Create again.
              </p>
              {photo && (
                <img
                  src={photo}
                  alt="Your source product photo"
                  className="mx-auto mt-5 h-40 w-full rounded-xl bg-slate-50 object-contain"
                />
              )}
              <Link
                href="/dashboard/generations"
                className="mt-5 inline-block text-teal-800 underline"
              >
                You can find your image in My images
              </Link>
              <p className="mt-3 text-sm text-slate-500">
                If you leave, we’ll check its status when you return to this
                page.
              </p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="mt-5 space-y-5">
                  <p className="leading-relaxed text-slate-600">
                    Choose a clear photo where the whole product is visible. A
                    phone photo is fine.
                  </p>
                  <button
                    className="min-h-11 text-sm font-medium text-teal-800 underline underline-offset-4"
                    onClick={() =>
                      switchMode(mode === 'upload' ? 'catalog' : 'upload')
                    }
                  >
                    {mode === 'upload'
                      ? 'Use a saved product instead'
                      : 'Upload a photo instead'}
                  </button>
                  {mode === 'upload' ? (
                    <>
                      <input
                        ref={input}
                        type="file"
                        accept="image/jpeg,image/png"
                        aria-label="Product photo"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) upload(file)
                          e.target.value = ''
                        }}
                      />
                      {!photo ? (
                        <button
                          onClick={() => input.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault()
                            const f = e.dataTransfer.files[0]
                            if (f) upload(f)
                          }}
                          className="flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-600 bg-teal-50 px-5 py-8 text-center"
                        >
                          <UploadCloud className="mb-3 h-9 w-9 text-teal-800" />
                          <span className="text-lg font-semibold">
                            Choose your product photo
                          </span>
                          <span className="mt-2 text-sm text-slate-600">
                            Tap to choose, or drag a photo here
                          </span>
                          <span className="mt-3 text-sm text-slate-600">
                            JPG or PNG · Up to 10 MB
                          </span>
                        </button>
                      ) : (
                        <>
                          <img
                            src={photo}
                            alt="Your product photo"
                            className="max-h-72 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
                          />
                          <button
                            className={`${button} border border-slate-300`}
                            onClick={() => input.current?.click()}
                          >
                            Change photo
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {productsError ? (
                        <p role="alert">
                          We couldn’t load your products. You can upload a photo
                          instead.
                        </p>
                      ) : !products.length ? (
                        <div className="rounded-xl bg-slate-50 p-5">
                          <p>
                            You haven’t saved any products yet. You can create a
                            photo without setting up a product.
                          </p>
                          <button
                            className={`${button} mt-3 bg-slate-900 text-white`}
                            onClick={() => switchMode('upload')}
                          >
                            Upload a photo instead
                          </button>
                        </div>
                      ) : (
                        <>
                          <label
                            className="block font-medium"
                            htmlFor="saved-product"
                          >
                            Choose your product
                          </label>
                          <select
                            id="saved-product"
                            value={productId}
                            className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base"
                            onChange={(e) => {
                              setProductId(e.target.value)
                              setImageUrl('')
                              setPreview('')
                              setUseContext(false)
                            }}
                          >
                            <option value="">Select a saved product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          {productLoading && (
                            <p role="status">Loading product photos…</p>
                          )}
                          <div className="grid grid-cols-3 gap-3">
                            {product?.images?.map((img, index) => (
                              <button
                                key={img.id}
                                aria-label={`Use product photo ${index + 1}`}
                                aria-pressed={imageUrl === img.image_url}
                                onClick={() => {
                                  setImageUrl(img.image_url)
                                  setPreview('')
                                }}
                                className={`overflow-hidden rounded-xl border-2 p-1 ${imageUrl === img.image_url ? 'border-teal-700' : 'border-slate-200'}`}
                              >
                                <img
                                  src={
                                    getAbsoluteImageUrl(img.image_url) ||
                                    img.image_url
                                  }
                                  alt="Saved product"
                                  className="aspect-square w-full object-contain"
                                />
                              </button>
                            ))}
                          </div>
                          {product && !product.images?.length && (
                            <p>
                              This product has no photos yet. Upload a photo
                              instead.
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {uploading && (
                    <p
                      role="status"
                      className="flex items-center gap-2 text-teal-800"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading your photo…
                    </p>
                  )}
                  {uploadError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"
                    >
                      <p>{uploadError}</p>
                      {fileRef.current && (
                        <button
                          className="mt-3 min-h-11 font-semibold underline"
                          onClick={() => upload(fileRef.current!)}
                        >
                          Try uploading again
                        </button>
                      )}
                    </div>
                  )}
                  {imageUrl && !uploading && (
                    <p
                      role="status"
                      className="flex items-center gap-2 font-medium text-teal-800"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Your photo is ready. Next, choose its new look.
                    </p>
                  )}
                  <p className="text-sm text-slate-500">
                    Uploading a photo uses no credits. You’ll see the cost
                    before creating an image.
                  </p>
                </div>
              )}
              {step === 2 && (
                <div className="mt-5 space-y-6">
                  <fieldset>
                    <legend className="mb-3 font-medium">
                      What should your new photo look like?
                    </legend>
                    <div className="grid grid-cols-2 gap-3">
                      {STYLES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setStyle(s.id)}
                          aria-pressed={style === s.id}
                          className={`overflow-hidden rounded-xl border-2 text-left ${style === s.id ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white'}`}
                        >
                          <img
                            src={s.image}
                            alt=""
                            className="aspect-[4/3] w-full object-cover"
                          />
                          <span className="block p-3">
                            <span className="flex items-start justify-between gap-1 font-semibold">
                              {s.name}
                              {style === s.id && (
                                <Check className="h-5 w-5 shrink-0 text-teal-800" />
                              )}
                            </span>
                            <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                              {s.detail}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Style examples only. Your image will use your own product.
                    </p>
                  </fieldset>
                  <details
                    className="rounded-xl border border-slate-200 p-4"
                    open={!!notes || undefined}
                  >
                    <summary className="min-h-8 cursor-pointer font-medium">
                      Add your own instructions (optional)
                    </summary>
                    <label
                      htmlFor="photo-instructions"
                      className="mt-4 block text-sm text-slate-600"
                    >
                      Describe any changes in your own words. No technical
                      instructions needed.
                    </label>
                    <textarea
                      id="photo-instructions"
                      maxLength={600}
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="For example: place my bag on a wooden table, next to a window."
                      className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base"
                    />
                  </details>
                  <fieldset>
                    <legend className="mb-3 font-medium">Image shape</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {FORMATS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setRatio(f.value)}
                          aria-pressed={ratio === f.value}
                          className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 px-2 py-3 ${ratio === f.value ? 'border-teal-700 bg-teal-50' : 'border-slate-200'}`}
                        >
                          <span
                            className={`${f.shape} rounded border-2 border-current`}
                          />
                          <span className="text-sm font-semibold">
                            {f.name}
                          </span>
                          <span className="text-xs text-slate-600">
                            {f.hint}
                          </span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="mb-3 font-medium">Image quality</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {(['4k', '8k'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setResolution(r)}
                          aria-pressed={resolution === r}
                          className={`min-h-24 rounded-xl border-2 p-3 text-left ${resolution === r ? 'border-teal-700 bg-teal-50' : 'border-slate-200'}`}
                        >
                          <span className="block font-semibold">
                            {r.toUpperCase()} ·{' '}
                            {r === '4k' ? '1 credit' : '2 credits'}
                          </span>
                          <span className="mt-2 block text-sm text-slate-600">
                            {r === '4k'
                              ? 'Great for online stores and social posts'
                              : 'Extra detail for large images and close-ups'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {mode === 'catalog' && product && (
                    <label className="flex min-h-12 items-start gap-3 rounded-xl bg-slate-50 p-4">
                      <input
                        type="checkbox"
                        checked={useContext}
                        onChange={(e) => setUseContext(e.target.checked)}
                        className="mt-1 h-5 w-5"
                      />
                      <span>
                        Use this product’s saved description
                        {product.default_apply_brand_identity
                          ? ' and brand settings'
                          : ''}
                        <span className="mt-1 block text-sm text-slate-600">
                          Optional. Keep your saved product details consistent.
                        </span>
                      </span>
                    </label>
                  )}
                </div>
              )}
              {step === 3 && (
                <div className="mt-5 space-y-5">
                  <p className="text-slate-600">
                    Check your choices. Nothing is created or charged until you
                    press Create.
                  </p>
                  {photo && (
                    <img
                      src={photo}
                      alt="Product photo to use"
                      className="max-h-60 w-full rounded-xl bg-slate-50 object-contain"
                    />
                  )}
                  <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 px-4">
                    <Review
                      label="Look"
                      value={selectedStyle.name}
                      edit={() => go(2)}
                    />
                    <Review
                      label="Shape"
                      value={`${FORMATS.find((f) => f.value === ratio)?.name} (${ratio})`}
                      edit={() => go(2)}
                    />
                    <Review
                      label="Quality"
                      value={resolution.toUpperCase()}
                      edit={() => go(2)}
                    />
                  </dl>
                  {notes && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="font-medium">Your instructions</p>
                      <p className="mt-2 whitespace-pre-wrap break-words text-slate-600">
                        {notes}
                      </p>
                    </div>
                  )}
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                    <p className="text-xl font-semibold">
                      This image uses {cost} {cost === 1 ? 'credit' : 'credits'}
                    </p>
                    <p className="mt-2 text-teal-900">
                      Your balance: {credits} credits
                      {credits >= cost
                        ? `. After a successful image: ${credits - cost} credits.`
                        : `. You need ${cost - credits} more to create this image.`}
                    </p>
                  </div>
                  {user && credits < cost ? (
                    <div>
                      <p className="mb-3 leading-relaxed text-slate-600">
                        Your photo and choices will be kept while you get
                        credits. Return here when you’re ready.
                      </p>
                      <Link
                        href="/pricing"
                        className={`${button} w-full bg-teal-800 text-white`}
                      >
                        View credit packs <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => generate()}
                      disabled={!imageUrl || uploading || !user}
                      className={`${button} w-full bg-teal-800 text-white hover:bg-teal-900`}
                    >
                      Create my photo · {cost}{' '}
                      {cost === 1 ? 'credit' : 'credits'}{' '}
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  )}
                  <p className="text-center text-sm text-slate-500">
                    Your result will appear here and be saved in My images.
                  </p>
                </div>
              )}
            </>
          )}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"
            >
              <p>{error}</p>
              {generating &&
                activeGeneration &&
                (error.startsWith('Your session') ? (
                  <Link
                    href="/login"
                    className="mt-3 inline-flex min-h-12 items-center font-semibold underline"
                  >
                    Sign in again
                  </Link>
                ) : (
                  <button
                    className="mt-3 min-h-12 font-semibold underline"
                    onClick={() => generate(activeGeneration)}
                  >
                    Retry connection safely
                  </button>
                ))}
              {!generating && (
                <button
                  className="mt-3 min-h-11 font-semibold underline"
                  onClick={() => generate()}
                >
                  Try creating again · {cost}{' '}
                  {cost === 1 ? 'credit' : 'credits'}
                </button>
              )}
            </div>
          )}
          {!generating && (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              {step > 1 ? (
                <button
                  onClick={() => go(step - 1)}
                  className={`${button} border border-slate-300`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <span className="text-sm text-slate-500">Step 1 of 3</span>
              )}
              {step < 3 && (
                <button
                  disabled={!imageUrl || uploading}
                  onClick={() => go(step + 1)}
                  className={`${button} bg-teal-800 text-white`}
                >
                  {step === 1 ? 'Choose a style' : 'Review my photo'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </section>
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className={`${panel} hidden lg:block`}>
            <p className="font-semibold">Your photo at a glance</p>
            {photo ? (
              <img
                src={photo}
                alt="Selected product"
                className="mt-4 h-40 w-full rounded-xl bg-slate-50 object-contain"
              />
            ) : (
              <div className="mt-4 flex h-32 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <ImagePlus className="h-10 w-10" />
              </div>
            )}
            <p className="mt-4 text-sm text-slate-600">
              {imageUrl
                ? selectedStyle.name
                : 'Start by adding your product photo.'}
            </p>
            {imageUrl && (
              <p className="mt-2 text-sm text-slate-600">
                {resolution.toUpperCase()} ·{' '}
                {FORMATS.find((f) => f.value === ratio)?.name} · {cost}{' '}
                {cost === 1 ? 'credit' : 'credits'}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-white/70 p-5 text-sm leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-900">
              A good starting photo helps
            </p>
            <p className="mt-2">
              Keep the whole product in view, with clear details and good light.
              We’ll use this photo as the reference for your new image.
            </p>
            <p className="mt-3">
              You can change your choices before creating. Every finished image
              is saved in{' '}
              <Link
                href="/dashboard/generations"
                className="font-medium text-teal-800 underline"
              >
                My images
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
      {result && (
        <ResultPopup imageUrl={result} onClose={() => setResult('')} />
      )}
    </div>
  )
}
function Review({
  label,
  value,
  edit,
}: {
  label: string
  value: string
  edit: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div>
        <dt className="text-sm text-slate-500">{label}</dt>
        <dd className="mt-1 font-medium">{value}</dd>
      </div>
      <button
        onClick={edit}
        className="min-h-11 px-2 text-sm font-semibold text-teal-800 underline"
        aria-label={`Change ${label.toLowerCase()}`}
      >
        Change
      </button>
    </div>
  )
}

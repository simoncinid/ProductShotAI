'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandIdentityApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'

const PHOTO_STYLE_OPTIONS = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'studioPhotoshoot', label: 'Studio shooting' },
  { value: 'flatlay', label: 'Flat lay' },
  { value: 'onModel', label: 'On model' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'minimalBackground', label: 'Minimal background' },
  { value: 'other', label: 'Other' },
]

type BrandData = {
  average_customer?: string
  sales_channels?: string
  price_range?: string
  lighting_style?: string
  photo_style?: Record<string, unknown>
  brand_notes?: string
  analysis_text?: string
  images?: { id: string; image_url: string }[]
}

export default function BrandIdentityPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) router.push('/login')
  }, [authenticated, router])

  const { data: brand, isLoading, error } = useQuery<BrandData>({
    queryKey: ['brand-identity'],
    queryFn: brandIdentityApi.get,
    enabled: authenticated,
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof brandIdentityApi.createOrUpdate>[0]) => brandIdentityApi.createOrUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-identity'] })
      toast.success('Brand identity saved')
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Save failed')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => brandIdentityApi.uploadImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-identity'] })
      toast.success('Image uploaded')
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Upload failed')
    },
  })

  const analyzeMutation = useMutation({
    mutationFn: () => brandIdentityApi.analyze(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-identity'] })
      toast.success('Analysis updated')
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Analysis failed')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => brandIdentityApi.deleteImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-identity'] })
      toast.success('Image removed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => brandIdentityApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-identity'] })
      toast.success('Brand identity deleted')
      router.push('/dashboard')
    },
  })

  if (!authenticated) return null
  if (isLoading) return <div className="p-8 text-white/70">Loading...</div>

  const is404 =
    error && typeof error === 'object' && 'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404

  const images = brand?.images ?? []
  const maxImages = 3

  const handleMultipleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    const remaining = maxImages - images.length
    const toUpload = Array.from(files).slice(0, remaining)
    toUpload.forEach((file) => uploadMutation.mutate(file))
    e.target.value = ''
  }

  return (
    <div className="mx-auto h-full max-w-6xl overflow-auto space-y-6">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Brand identity</h1>
            <p className="mt-1 text-sm text-white/70">
              Define global visual rules once. They are reused automatically across product flows.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/products" className="rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10">
              Products
            </Link>
            <button
              type="submit"
              form="brand-identity-form"
              disabled={updateMutation.isPending}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#13233d] disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <BrandIdentityForm
            formId="brand-identity-form"
            existing={is404 ? undefined : brand ?? undefined}
            onSave={(d) => updateMutation.mutate(d)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">Reference images ({images.length}/{maxImages})</h2>
          <div className="flex gap-2">
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => analyzeMutation.mutate()}
                disabled={analyzeMutation.isPending}
                className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
              >
                {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze images'}
              </button>
            )}
            <label className="cursor-pointer rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10">
              Upload
              <input type="file" accept="image/jpeg,image/png" className="hidden" multiple onChange={handleMultipleUpload} />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative h-36 w-36 overflow-hidden rounded-lg border border-white/20">
              <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="Brand reference" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => deleteImageMutation.mutate(img.id)}
                className="absolute top-1 right-1 rounded bg-red-600 px-1.5 py-0.5 text-xs text-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {!is404 && brand && (
        <section className="pb-4">
          <button
            type="button"
            onClick={() => window.confirm('Delete Brand Identity?') && deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="rounded-full border border-red-500 px-5 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Delete brand identity
          </button>
        </section>
      )}
    </div>
  )
}

function BrandIdentityForm({
  formId,
  existing,
  onSave,
}: {
  formId?: string
  existing?: {
    average_customer?: string
    sales_channels?: string
    price_range?: string
    lighting_style?: string
    photo_style?: Record<string, unknown>
    brand_notes?: string
    analysis_text?: string
  }
  onSave: (data: Record<string, unknown>) => void
}) {
  const [averageCustomer, setAverageCustomer] = useState(existing?.average_customer ?? '')
  const [salesChannels, setSalesChannels] = useState(existing?.sales_channels ?? '')
  const [priceRange, setPriceRange] = useState(existing?.price_range ?? '')
  const [lightingStyle, setLightingStyle] = useState(existing?.lighting_style ?? '')
  const photoStyleRaw =
    existing?.photo_style && typeof existing.photo_style === 'object' && 'key' in existing.photo_style
      ? String((existing.photo_style as { key?: string }).key)
      : ''
  const [photoStyleKey, setPhotoStyleKey] = useState(photoStyleRaw || '')
  const [brandNotes, setBrandNotes] = useState(existing?.brand_notes ?? '')
  const [analysis, setAnalysis] = useState(existing?.analysis_text ?? '')

  useEffect(() => {
    setAverageCustomer(existing?.average_customer ?? '')
    setSalesChannels(existing?.sales_channels ?? '')
    setPriceRange(existing?.price_range ?? '')
    setLightingStyle(existing?.lighting_style ?? '')
    const pr =
      existing?.photo_style && typeof existing.photo_style === 'object' && 'key' in existing.photo_style
        ? String((existing.photo_style as { key?: string }).key)
        : ''
    setPhotoStyleKey(pr || '')
    setBrandNotes(existing?.brand_notes ?? '')
    setAnalysis(existing?.analysis_text ?? '')
  }, [
    existing?.average_customer,
    existing?.sales_channels,
    existing?.price_range,
    existing?.lighting_style,
    existing?.photo_style,
    existing?.brand_notes,
    existing?.analysis_text,
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      average_customer: averageCustomer || undefined,
      sales_channels: salesChannels || undefined,
      price_range: priceRange || undefined,
      lighting_style: lightingStyle || undefined,
      photo_style: photoStyleKey ? { key: photoStyleKey } : undefined,
      brand_notes: brandNotes || undefined,
      analysis_text: analysis || undefined,
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4 text-white">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Cosa vendi?</label>
          <input
            type="text"
            value={salesChannels}
            onChange={(e) => setSalesChannels(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
            placeholder="e.g. cosmetics, pet food, tech accessories"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Target customer</label>
          <input
            type="text"
            value={averageCustomer}
            onChange={(e) => setAverageCustomer(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
            placeholder="e.g. women 25-40, premium buyers"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Price range</label>
          <input
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
          placeholder="e.g. budget, mid, premium"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Preferred photo style</label>
          <select
            value={photoStyleKey}
            onChange={(e) => setPhotoStyleKey(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
          >
            <option value="">Select...</option>
            {PHOTO_STYLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
          <label className="mb-1 block text-sm font-medium">Lighting style</label>
        <input
          type="text"
          value={lightingStyle}
          onChange={(e) => setLightingStyle(e.target.value)}
          className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
          placeholder="e.g. soft daylight, high contrast studio"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Brand notes</label>
        <textarea
          value={brandNotes}
          onChange={(e) => setBrandNotes(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
          placeholder="Do / do not, visual rules, mandatory elements"
        />
      </div>

      {existing && (
        <div>
          <label className="mb-1 block text-sm font-medium">Style analysis (editable)</label>
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            rows={12}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
          />
        </div>
      )}
    </form>
  )
}

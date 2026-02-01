'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandIdentityApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { getAbsoluteImageUrl } from '@/lib/api'
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

export default function BrandIdentityPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) router.push('/login')
  }, [authenticated, router])

  const { data: brand, isLoading, error } = useQuery({
    queryKey: ['brand-identity'],
    queryFn: brandIdentityApi.get,
    enabled: authenticated,
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof brandIdentityApi.createOrUpdate>[0]) => brandIdentityApi.createOrUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-identity'] })
      toast.success('Brand Identity saved')
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
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
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
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
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Analysis failed')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => brandIdentityApi.deleteImage(imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brand-identity'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => brandIdentityApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-identity'] })
      toast.success('Brand Identity deleted')
      router.push('/dashboard')
    },
  })

  if (!authenticated) return null
  if (isLoading) return <div className="p-8 text-gray-600">Loading...</div>
  const is404 = error && typeof error === 'object' && 'response' in error && (error as { response?: { status?: number } }).response?.status === 404
  if (is404) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-4">No Brand Identity. Fill in the form below and save to create one.</p>
        <BrandIdentityForm existing={undefined} onSave={(d) => updateMutation.mutate(d)} isSaving={updateMutation.isPending} />
      </div>
    )
  }

  const images = brand?.images ?? []
  const maxImages = 3

  const handleMultipleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const remaining = maxImages - images.length
    const toUpload = Array.from(files).slice(0, remaining)
    toUpload.forEach((f) => uploadMutation.mutate(f))
    e.target.value = ''
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-rich-black">Brand Identity</h1>
        <button
          type="submit"
          form="brand-identity-form"
          disabled={updateMutation.isPending}
          className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      <BrandIdentityForm
        formId="brand-identity-form"
        existing={brand ?? undefined}
        onSave={(d) => updateMutation.mutate(d)}
        isSaving={updateMutation.isPending}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-rich-black mb-2">Reference images (max 3)</h2>
        <div className="flex flex-wrap gap-4">
          {images.map((img: { id: string; image_url: string }) => (
            <div key={img.id} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
              <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => deleteImageMutation.mutate(img.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <label className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-vivid-yellow">
              <input type="file" accept="image/jpeg,image/png" className="hidden" multiple onChange={handleMultipleUpload} />
              <span className="text-gray-500 text-sm text-center px-1">+ Upload (multiple)</span>
            </label>
          )}
        </div>
        {images.length > 0 && (
          <button
            type="button"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="mt-4 px-4 py-2 bg-rich-black text-white rounded-md font-medium disabled:opacity-50"
          >
            {analyzeMutation.isPending ? 'Analyzing…' : 'Analyze images'}
          </button>
        )}
      </div>

      {brand && (
        <div className="mt-8 pt-6 border-t flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.confirm('Delete Brand Identity?') && deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium"
          >
            Delete Brand Identity
          </button>
          <button
            type="submit"
            form="brand-identity-form"
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

function BrandIdentityForm({
  formId,
  existing,
  onSave,
  isSaving,
}: {
  formId?: string
  existing?: { average_customer?: string; sales_channels?: string; price_range?: string; lighting_style?: string; photo_style?: Record<string, unknown>; brand_notes?: string; analysis_text?: string }
  onSave: (data: Record<string, unknown>) => void
  isSaving: boolean
}) {
  const [averageCustomer, setAverageCustomer] = useState(existing?.average_customer ?? '')
  const [salesChannels, setSalesChannels] = useState(existing?.sales_channels ?? '')
  const [priceRange, setPriceRange] = useState(existing?.price_range ?? '')
  const [lightingStyle, setLightingStyle] = useState(existing?.lighting_style ?? '')
  const photoStyleRaw = existing?.photo_style && typeof existing.photo_style === 'object' && 'key' in existing.photo_style ? String((existing.photo_style as { key?: string }).key) : ''
  const [photoStyleKey, setPhotoStyleKey] = useState(photoStyleRaw || '')
  const [brandNotes, setBrandNotes] = useState(existing?.brand_notes ?? '')
  const [analysis, setAnalysis] = useState(existing?.analysis_text ?? '')

  useEffect(() => {
    setAverageCustomer(existing?.average_customer ?? '')
    setSalesChannels(existing?.sales_channels ?? '')
    setPriceRange(existing?.price_range ?? '')
    setLightingStyle(existing?.lighting_style ?? '')
    const pr = existing?.photo_style && typeof existing.photo_style === 'object' && 'key' in existing.photo_style ? String((existing.photo_style as { key?: string }).key) : ''
    setPhotoStyleKey(pr || '')
    setBrandNotes(existing?.brand_notes ?? '')
    setAnalysis(existing?.analysis_text ?? '')
  }, [existing?.average_customer, existing?.sales_channels, existing?.price_range, existing?.lighting_style, existing?.photo_style, existing?.brand_notes, existing?.analysis_text])

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
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">What does your ecommerce sell?</label>
        <input type="text" value={salesChannels} onChange={(e) => setSalesChannels(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. pet food, cosmetics, clothing" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Target / typical customer</label>
        <input type="text" value={averageCustomer} onChange={(e) => setAverageCustomer(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. women 25-40, pet lover, premium" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Price range</label>
        <input type="text" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. budget, mid, premium, luxury" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Preferred photo style</label>
        <select value={photoStyleKey} onChange={(e) => setPhotoStyleKey(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
          <option value="">— Select —</option>
          {PHOTO_STYLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Lighting style</label>
        <input type="text" value={lightingStyle} onChange={(e) => setLightingStyle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. natural light, soft, daylight" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Brand notes</label>
        <textarea value={brandNotes} onChange={(e) => setBrandNotes(e.target.value)} rows={3} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Rules, do/don't, extra constraints" />
      </div>

      {existing && (
        <div>
          <h3 className="font-semibold text-rich-black mb-2">Style analysis (editable)</h3>
          <textarea value={analysis} onChange={(e) => setAnalysis(e.target.value)} rows={16} className="w-full border border-gray-300 rounded px-3 py-2 resize-y" placeholder="Analysis generated from images or write here..." />
        </div>
      )}

      {!formId && (
        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50">
          {isSaving ? 'Saving…' : 'Save Brand Identity'}
        </button>
      )}
    </form>
  )
}

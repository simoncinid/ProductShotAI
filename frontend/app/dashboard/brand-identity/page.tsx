'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandIdentityApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { getAbsoluteImageUrl } from '@/lib/api'
import toast from 'react-hot-toast'

const PHOTO_STYLE_OPTIONS = [
  'lifestylePhotos',
  'studioPhotoshoot',
  'flatlay',
  'onModel',
  'outdoor',
  'minimalBackground',
  'other',
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
        <Link href="/dashboard" className="text-vivid-yellow hover:underline mb-4 inline-block">← Dashboard</Link>
        <p className="text-gray-600 mb-4">No Brand Identity yet. Save the form below to create one.</p>
        <BrandIdentityForm existing={undefined} onSave={(d) => updateMutation.mutate(d)} isSaving={updateMutation.isPending} />
      </div>
    )
  }

  const images = brand?.images ?? []
  const maxImages = 3

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="text-vivid-yellow hover:underline mb-6 inline-block">← Dashboard</Link>
      <h1 className="text-2xl font-bold text-rich-black mb-6">Brand Identity</h1>

      <BrandIdentityForm
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
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadMutation.mutate(f)
                  e.target.value = ''
                }}
              />
              <span className="text-gray-500 text-sm">+ Upload</span>
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

      {brand?.analysis_text && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-rich-black mb-2">Style analysis</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{brand.analysis_text}</p>
        </div>
      )}

      {brand && (
        <div className="mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={() => window.confirm('Delete Brand Identity?') && deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium"
          >
            Delete Brand Identity
          </button>
        </div>
      )}
    </div>
  )
}

function BrandIdentityForm({
  existing,
  onSave,
  isSaving,
}: {
  existing?: { average_customer?: string; sales_channels?: string; price_range?: string; lighting_style?: string; photo_style?: Record<string, unknown>; color_palette?: Record<string, unknown>; brand_notes?: string }
  onSave: (data: Record<string, unknown>) => void
  isSaving: boolean
}) {
  const [averageCustomer, setAverageCustomer] = useState(existing?.average_customer ?? '')
  const [salesChannels, setSalesChannels] = useState(existing?.sales_channels ?? '')
  const [priceRange, setPriceRange] = useState(existing?.price_range ?? '')
  const [lightingStyle, setLightingStyle] = useState(existing?.lighting_style ?? '')
  const [brandNotes, setBrandNotes] = useState(existing?.brand_notes ?? '')

  useEffect(() => {
    setAverageCustomer(existing?.average_customer ?? '')
    setSalesChannels(existing?.sales_channels ?? '')
    setPriceRange(existing?.price_range ?? '')
    setLightingStyle(existing?.lighting_style ?? '')
    setBrandNotes(existing?.brand_notes ?? '')
  }, [existing?.average_customer, existing?.sales_channels, existing?.price_range, existing?.lighting_style, existing?.brand_notes])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      average_customer: averageCustomer || undefined,
      sales_channels: salesChannels || undefined,
      price_range: priceRange || undefined,
      lighting_style: lightingStyle || undefined,
      brand_notes: brandNotes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Target audience (average customer)</label>
        <input type="text" value={averageCustomer} onChange={(e) => setAverageCustomer(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. women 25–40, premium skincare" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Sales channels / place</label>
        <input type="text" value={salesChannels} onChange={(e) => setSalesChannels(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Etsy, Shopify, Instagram" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Price range</label>
        <input type="text" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. budget, mid, premium, luxury" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Lighting style</label>
        <input type="text" value={lightingStyle} onChange={(e) => setLightingStyle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. soft diffused daylight" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Brand notes</label>
        <textarea value={brandNotes} onChange={(e) => setBrandNotes(e.target.value)} rows={3} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Extra constraints, do/don't rules" />
      </div>
      <button type="submit" disabled={isSaving} className="px-6 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50">
        {isSaving ? 'Saving…' : 'Save Brand Identity'}
      </button>
    </form>
  )
}

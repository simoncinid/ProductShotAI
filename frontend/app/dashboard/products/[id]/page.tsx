'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) router.push('/login')
  }, [authenticated, router])

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
    enabled: authenticated && !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof productsApi.update>[1]) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated')
      setEditing(false)
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Update failed')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => productsApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Image uploaded')
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Upload failed')
    },
  })

  const analyzeMutation = useMutation({
    mutationFn: () => productsApi.analyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Analysis updated')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(id, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.delete(id),
    onSuccess: () => {
      toast.success('Product deleted')
      router.push('/dashboard/products')
    },
  })

  const { data: generationsData } = useQuery({
    queryKey: ['product-generations', id],
    queryFn: () => productsApi.getGenerations(id, 1, 20),
    enabled: !!id && !!product,
  })
  const generations = generationsData?.items ?? []

  if (!authenticated || !id) return null
  if (isLoading) return <div className="p-8 text-gray-600">Loading...</div>
  if (error || !product) {
    return (
      <div className="p-8">
        <Link href="/dashboard/products" className="text-vivid-yellow hover:underline">← Products</Link>
        <p className="mt-4 text-gray-600">Product not found.</p>
      </div>
    )
  }

  const images = product.images ?? []
  const maxImages = 3

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard/products" className="text-vivid-yellow hover:underline mb-6 inline-block">← Products</Link>
      <h1 className="text-2xl font-bold text-rich-black mb-6">{product.name}</h1>

      {!editing ? (
        <div className="mb-6">
          <p><span className="text-gray-500">SKU:</span> {product.sku || '—'}</p>
          <p><span className="text-gray-500">Category:</span> {product.category || '—'}</p>
          <p><span className="text-gray-500">Apply Brand Identity:</span> {product.default_apply_brand_identity ? 'Yes' : 'No'}</p>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{product.product_prompt}</p>
          <button type="button" onClick={() => setEditing(true)} className="mt-4 px-4 py-2 border border-gray-300 rounded-md">Edit</button>
        </div>
      ) : (
        <EditProductForm
          product={product}
          onSave={(data) => updateMutation.mutate(data)}
          onCancel={() => setEditing(false)}
          isSaving={updateMutation.isPending}
        />
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-rich-black mb-2">Reference images (max 3)</h2>
        <div className="flex flex-wrap gap-4">
          {images.map((img: { id: string; image_url: string }) => (
            <div key={img.id} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
              <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => deleteImageMutation.mutate(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 text-xs">Remove</button>
            </div>
          ))}
          {images.length < maxImages && (
            <label className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-vivid-yellow">
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMutation.mutate(f); e.target.value = ''; }} />
              <span className="text-gray-500 text-sm">+ Upload</span>
            </label>
          )}
        </div>
        {images.length > 0 && (
          <button type="button" onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending} className="mt-4 px-4 py-2 bg-rich-black text-white rounded-md font-medium disabled:opacity-50">
            {analyzeMutation.isPending ? 'Analyzing…' : 'Analyze images'}
          </button>
        )}
      </div>

      {product.analysis_text && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-rich-black mb-2">Style analysis</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.analysis_text}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-rich-black mb-4">Generations for this product</h2>
        {generations.length === 0 ? (
          <p className="text-gray-600">No generations yet. Select this product in <Link href="/create" className="text-vivid-yellow hover:underline">/create</Link> to generate.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.map((gen: { id: string; output_image_url?: string; status: string; created_at: string }) => (
              <div key={gen.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {gen.output_image_url ? (
                  <img src={getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url} alt="" className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center"><span className="text-gray-400 text-sm">{gen.status}</span></div>
                )}
                <div className="p-2 text-xs text-gray-500">{new Date(gen.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t">
        <button type="button" onClick={() => window.confirm('Delete this product?') && deleteMutation.mutate()} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-md font-medium">
          Delete product
        </button>
      </div>
    </div>
  )
}

function EditProductForm({
  product,
  onSave,
  onCancel,
  isSaving,
}: {
  product: { name: string; sku?: string; category?: string; default_apply_brand_identity: boolean; product_prompt: string }
  onSave: (data: { name?: string; sku?: string; category?: string; default_apply_brand_identity?: boolean; product_prompt?: string }) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [name, setName] = useState(product.name)
  const [sku, setSku] = useState(product.sku ?? '')
  const [category, setCategory] = useState(product.category ?? '')
  const [defaultApplyBrandIdentity, setDefaultApplyBrandIdentity] = useState(product.default_apply_brand_identity)
  const [productPrompt, setProductPrompt] = useState(product.product_prompt)

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave({ name, sku: sku || undefined, category: category || undefined, default_apply_brand_identity: defaultApplyBrandIdentity, product_prompt: productPrompt }); }}
      className="mb-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">SKU</label>
        <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Category</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="editBi" checked={defaultApplyBrandIdentity} onChange={(e) => setDefaultApplyBrandIdentity(e.target.checked)} />
        <label htmlFor="editBi" className="text-sm text-rich-black">Apply Brand Identity by default</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Product prompt</label>
        <textarea value={productPrompt} onChange={(e) => setProductPrompt(e.target.value)} rows={4} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
      </div>
    </form>
  )
}

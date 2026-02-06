'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) router.push('/login')
  }, [authenticated, router])

  useEffect(() => {
    if (searchParams.get('edit') === '1') setEditing(true)
  }, [searchParams])

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
  if (isLoading) return <div className="p-8 text-muted">Loading...</div>
  if (error || !product) {
    return (
      <div className="p-8">
        <Link href="/dashboard/products" className="text-brand hover:underline">← Products</Link>
        <p className="mt-4 text-muted">Product not found.</p>
      </div>
    )
  }

  const images = product.images ?? []
  const maxImages = 3

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header: name + Edit on left, "← Products" on right */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-2xl font-bold text-on-dark truncate">{product.name}</h1>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="p-2 border border-muted rounded-md hover:bg-on-dark/10 text-on-dark shrink-0"
              title="Edit product"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          )}
        </div>
        <Link href="/dashboard/products" className="text-brand hover:underline shrink-0">← Products</Link>
      </div>

      {!editing ? (
        <div className="mb-6 text-muted">
          <p><span className="text-muted">SKU:</span> {product.sku || '—'}</p>
          <p><span className="text-muted">Category:</span> {product.category || '—'}</p>
          <p><span className="text-muted">Apply Brand Identity:</span> {product.default_apply_brand_identity ? 'Yes' : 'No'}</p>
          <p className="mt-2 text-on-dark whitespace-pre-wrap">{product.product_prompt}</p>
        </div>
      ) : (
        <EditProductForm
          formId="product-edit-form"
          product={product}
          onSave={(data) => updateMutation.mutate(data)}
          onCancel={() => setEditing(false)}
          isSaving={updateMutation.isPending}
        />
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-on-dark mb-2">Reference images (max 3)</h2>
        <p className="text-sm text-muted mb-2">Click on an image to open the Creative Hub and generate variants or edits.</p>
        <div className="flex flex-wrap gap-4">
          {images.map((img: { id: string; image_url: string }) => (
            <div key={img.id} className="relative w-32 h-32 rounded-lg overflow-hidden border border-muted-dark/60 group">
              <Link
                href={`/dashboard/hub?product_id=${id}&image_id=${img.id}`}
                className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded-lg"
              >
                <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition" />
              </Link>
              <button type="button" onClick={(e) => { e.preventDefault(); deleteImageMutation.mutate(img.id); }} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 text-xs hover:bg-red-600">Remove</button>
            </div>
          ))}
          {images.length < maxImages && (
            <label className="w-32 h-32 rounded-lg border-2 border-dashed border-muted flex items-center justify-center cursor-pointer hover:border-brand bg-on-dark/5">
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMutation.mutate(f); e.target.value = ''; }} />
              <span className="text-muted text-sm">+ Upload</span>
            </label>
          )}
        </div>
        {images.length > 0 && (
          <button type="button" onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending} className="mt-4 px-4 py-2 bg-primary text-on-dark rounded-md font-medium disabled:opacity-50">
            {analyzeMutation.isPending ? 'Analyzing…' : 'Analyze images'}
          </button>
        )}
      </div>

      {/* Analysis: in view mode text only, in edit mode it's in the form */}
      {!editing && (
        <div className="mt-6">
          <h3 className="font-semibold text-on-dark mb-2">Style analysis</h3>
          {product.analysis_text ? (
            <div className="p-4 bg-on-dark/10 border border-muted-dark/60 rounded-lg">
              <p className="text-sm text-on-dark whitespace-pre-wrap">{product.analysis_text}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">No analysis. Upload images and click &quot;Analyze images&quot;.</p>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-on-dark mb-4">Generations for this product</h2>
        {generations.length === 0 ? (
          <p className="text-muted">No generations. Select this product in <Link href="/create" className="text-brand hover:underline">/create</Link> to generate.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.map((gen: { id: string; output_image_url?: string; status: string; created_at: string }) => {
              const imageUrl = gen.output_image_url ? (getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url) : null
              return (
                <div key={gen.id} className="border border-muted-dark/60 rounded-lg overflow-hidden bg-cream group">
                  {gen.output_image_url ? (
                    <>
                      <Link
                        href={`/dashboard/hub?generation_id=${gen.id}&product_id=${id}`}
                        className="block w-full focus:outline-none focus:ring-2 focus:ring-vivid-yellow focus:ring-inset"
                      >
                        <img src={imageUrl!} alt="" className="w-full h-40 object-cover group-hover:opacity-95 transition cursor-pointer" />
                      </Link>
                      <div className="p-2 flex items-center justify-between gap-2 text-xs text-muted-dark bg-cream border-t border-muted/40">
                        <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                        <a
                          href={imageUrl!}
                          download
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/20 hover:bg-muted/30 text-primary"
                          title="Download"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-40 bg-muted/20 flex items-center justify-center"><span className="text-muted text-sm">{gen.status}</span></div>
                      <div className="p-2 text-xs text-muted-dark bg-cream">{new Date(gen.created_at).toLocaleDateString()}</div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-muted-dark/60">
        <button
          type="button"
          onClick={() => window.confirm('Delete this product?') && deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded-md font-medium"
        >
          Delete product
        </button>
      </div>
    </div>
  )
}

function EditProductForm({
  formId,
  product,
  onSave,
  onCancel,
  isSaving,
}: {
  formId: string
  product: { name: string; sku?: string; category?: string; default_apply_brand_identity: boolean; product_prompt: string; analysis_text?: string }
  onSave: (data: { name?: string; sku?: string; category?: string; default_apply_brand_identity?: boolean; product_prompt?: string; analysis_text?: string }) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [name, setName] = useState(product.name)
  const [sku, setSku] = useState(product.sku ?? '')
  const [category, setCategory] = useState(product.category ?? '')
  const [defaultApplyBrandIdentity, setDefaultApplyBrandIdentity] = useState(product.default_apply_brand_identity)
  const [productPrompt, setProductPrompt] = useState(product.product_prompt)
  const [analysisText, setAnalysisText] = useState(product.analysis_text ?? '')

  useEffect(() => {
    setName(product.name)
    setSku(product.sku ?? '')
    setCategory(product.category ?? '')
    setDefaultApplyBrandIdentity(product.default_apply_brand_identity)
    setProductPrompt(product.product_prompt)
    setAnalysisText(product.analysis_text ?? '')
  }, [product.name, product.sku, product.category, product.default_apply_brand_identity, product.product_prompt, product.analysis_text])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      sku: sku || undefined,
      category: category || undefined,
      default_apply_brand_identity: defaultApplyBrandIdentity,
      product_prompt: productPrompt,
      analysis_text: analysisText || undefined,
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="mb-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-on-dark mb-1">Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-gray-900" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-dark mb-1">SKU</label>
        <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-gray-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-dark mb-1">Category</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-gray-900" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="editBi" checked={defaultApplyBrandIdentity} onChange={(e) => setDefaultApplyBrandIdentity(e.target.checked)} className="rounded border-gray-400" />
        <label htmlFor="editBi" className="text-sm text-on-dark">Apply Brand Identity by default</label>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <label className="block text-sm font-medium text-on-dark">Product prompt</label>
          <EditPromptWithAI value={productPrompt} onChange={setProductPrompt} buttonLabel="Edit prompt with AI" applyLabel="Apply" />
        </div>
        <textarea value={productPrompt} onChange={(e) => setProductPrompt(e.target.value)} rows={4} className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-gray-900" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-dark mb-1">Style analysis (editable)</label>
        <textarea value={analysisText} onChange={(e) => setAnalysisText(e.target.value)} rows={16} className="w-full border border-gray-400 rounded px-3 py-2 resize-y bg-white text-gray-900 placeholder:text-gray-500" placeholder="Generated or edited analysis..." />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-500 text-on-dark rounded-md hover:bg-white/10">Cancel</button>
      </div>
    </form>
  )
}

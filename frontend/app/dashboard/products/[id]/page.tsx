'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

type ProductImage = {
  id: string
  image_url: string
}

type ProductData = {
  id: string
  name: string
  sku?: string
  category?: string
  default_apply_brand_identity: boolean
  product_prompt: string
  analysis_text?: string
  images?: ProductImage[]
}

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

  const { data: product, isLoading, error } = useQuery<ProductData>({
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
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
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
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Upload failed')
    },
  })

  const analyzeMutation = useMutation({
    mutationFn: () => productsApi.analyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
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
    mutationFn: (imageId: string) => productsApi.deleteImage(id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Image removed')
    },
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
  if (isLoading) return <div className="p-8 text-white/70">Loading...</div>
  if (error || !product) {
    return (
      <div className="p-8">
        <Link href="/dashboard/products" className="text-purple-200 hover:underline">
          Back to products
        </Link>
        <p className="mt-4 text-white/70">Product not found.</p>
      </div>
    )
  }

  const images = product.images ?? []
  const maxImages = 3

  return (
    <div className="mx-auto h-full max-w-6xl overflow-auto space-y-6">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="mt-1 text-sm text-white/70">Product setup for single image, full shooting, and Hub refinement.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/products" className="rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10">
              Products
            </Link>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#13233d]"
              >
                Modifica
              </button>
            )}
          </div>
        </div>

        {!editing ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/20 bg-black/20 p-4 text-sm">
              <p>SKU: {product.sku || 'n/a'}</p>
              <p className="mt-1">Category: {product.category || 'n/a'}</p>
              <p className="mt-1">Brand identity default: {product.default_apply_brand_identity ? 'yes' : 'no'}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-black/20 p-4 text-sm whitespace-pre-wrap">
              {product.product_prompt}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <EditProductForm
              product={product}
              onSave={(data) => updateMutation.mutate(data)}
              onCancel={() => setEditing(false)}
              isSaving={updateMutation.isPending}
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">Reference images ({images.length}/{maxImages})</h2>
          {images.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => analyzeMutation.mutate()}
                disabled={analyzeMutation.isPending}
                className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
              >
                {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze images'}
              </button>
              <Link href="/dashboard/shooting" className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10">
                Start shooting
              </Link>
            </div>
          )}
        </div>

        <p className="mb-3 text-sm text-white/70">Clicca un'immagine per aprirla nel Creative Hub.</p>

        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative h-36 w-36 overflow-hidden rounded-lg border border-white/20">
              <Link href={`/dashboard/hub?product_id=${id}&image_id=${img.id}`} className="block w-full h-full">
                <img
                  src={getAbsoluteImageUrl(img.image_url) ?? img.image_url}
                  alt="Reference"
                  className="w-full h-full object-cover group-hover:opacity-90 transition"
                />
              </Link>
              <button
                type="button"
                onClick={() => deleteImageMutation.mutate(img.id)}
                className="absolute right-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-xs text-white"
              >
                Remove
              </button>
            </div>
          ))}

          {images.length < maxImages && (
            <label className="flex h-36 w-36 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-white/35 bg-black/20 hover:border-purple-300">
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadMutation.mutate(file)
                  e.target.value = ''
                }}
              />
              <span className="text-sm text-muted">+ Upload</span>
            </label>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link href="/dashboard/create" className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10">
            Single image
          </Link>
          <Link href="/dashboard/shooting" className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10">
            Full shooting
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <h2 className="mb-3 text-lg font-semibold">Style analysis</h2>
        {product.analysis_text ? (
          <div className="rounded-xl border border-white/20 bg-black/20 p-4">
            <p className="whitespace-pre-wrap text-sm">{product.analysis_text}</p>
          </div>
        ) : (
          <p className="text-sm text-white/70">No analysis yet. Upload references and run analysis.</p>
        )}
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <h2 className="mb-3 text-lg font-semibold">Recent generations</h2>
        {generations.length === 0 ? (
          <p className="text-sm text-white/70">No generations for this product yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {generations.map((gen: { id: string; output_image_url?: string; status: string; created_at: string }) => {
              const imageUrl = gen.output_image_url ? (getAbsoluteImageUrl(gen.output_image_url) ?? gen.output_image_url) : null
              return (
                <article key={gen.id} className="overflow-hidden rounded-lg border border-white/20 bg-white/10">
                  {imageUrl ? (
                    <>
                      <Link href={`/dashboard/hub?generation_id=${gen.id}&product_id=${id}`}>
                        <img src={imageUrl} alt="Generated" className="h-32 w-full object-cover" />
                      </Link>
                      <div className="flex items-center justify-between p-2 text-xs text-white/70">
                        <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                        <a href={imageUrl} download className="hover:underline">
                          Download
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-white/70">{gen.status}</div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="pb-6">
        <button
          type="button"
          onClick={() => window.confirm('Delete this product?') && deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="rounded-full border border-red-500 px-5 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
        >
          Delete product
        </button>
      </section>
    </div>
  )
}

function EditProductForm({
  product,
  onSave,
  onCancel,
  isSaving,
}: {
  product: {
    name: string
    sku?: string
    category?: string
    default_apply_brand_identity: boolean
    product_prompt: string
    analysis_text?: string
  }
  onSave: (data: {
    name?: string
    sku?: string
    category?: string
    default_apply_brand_identity?: boolean
    product_prompt?: string
    analysis_text?: string
  }) => void
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
  }, [
    product.name,
    product.sku,
    product.category,
    product.default_apply_brand_identity,
    product.product_prompt,
    product.analysis_text,
  ])

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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/20 bg-black/20 p-4 text-white">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={defaultApplyBrandIdentity}
          onChange={(e) => setDefaultApplyBrandIdentity(e.target.checked)}
          className="rounded"
        />
        Apply brand identity by default
      </label>

      <div>
        <div className="mb-1 flex items-center justify-between gap-2 flex-wrap">
          <label className="text-sm font-medium">Product prompt</label>
          <EditPromptWithAI value={productPrompt} onChange={setProductPrompt} buttonLabel="Improve with AI" applyLabel="Apply" />
        </div>
        <textarea
          value={productPrompt}
          onChange={(e) => setProductPrompt(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Style analysis (editable)</label>
        <textarea
          value={analysisText}
          onChange={(e) => setAnalysisText(e.target.value)}
          rows={10}
          className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isSaving} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#13233d] disabled:opacity-50">
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10">
          Cancel
        </button>
      </div>
    </form>
  )
}

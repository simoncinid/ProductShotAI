'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) router.push('/login')
  }, [authenticated, router])

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: authenticated,
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; sku?: string; category?: string; default_apply_brand_identity: boolean; product_prompt: string }) => productsApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created')
      setShowCreate(false)
      router.push(`/dashboard/products/${created.id}`)
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Create failed')
    },
  })

  if (!authenticated) return null
  if (isLoading) return <div className="p-8 text-gray-600">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="text-vivid-yellow hover:underline mb-6 inline-block">← Dashboard</Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-rich-black">Products</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold"
        >
          Create product
        </button>
      </div>

      {showCreate && (
        <CreateProductForm
          onCancel={() => setShowCreate(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isSubmitting={createMutation.isPending}
        />
      )}

      <ul className="space-y-3">
        {products.length === 0 && !showCreate && (
          <li className="text-gray-600 py-8">No products yet. Create one to use product-specific prompts in /create.</li>
        )}
        {products.map((p: { id: string; name: string; sku?: string; default_apply_brand_identity: boolean; created_at: string }) => (
          <li key={p.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <Link href={`/dashboard/products/${p.id}`} className="font-medium text-rich-black hover:underline">
              {p.name}
              {p.sku && <span className="text-gray-500 ml-2">({p.sku})</span>}
            </Link>
            <span className="text-xs text-gray-500">
              Brand identity: {p.default_apply_brand_identity ? 'On' : 'Off'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CreateProductForm({
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  onCancel: () => void
  onSubmit: (data: { name: string; sku?: string; category?: string; default_apply_brand_identity: boolean; product_prompt: string }) => void
  isSubmitting: boolean
}) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [defaultApplyBrandIdentity, setDefaultApplyBrandIdentity] = useState(true)
  const [productPrompt, setProductPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    onSubmit({
      name: name.trim(),
      sku: sku.trim() || undefined,
      category: category.trim() || undefined,
      default_apply_brand_identity: defaultApplyBrandIdentity,
      product_prompt: productPrompt.trim() || 'Professional product photo.',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
      <h2 className="text-lg font-semibold text-rich-black">New product</h2>
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
        <input type="checkbox" id="defaultBi" checked={defaultApplyBrandIdentity} onChange={(e) => setDefaultApplyBrandIdentity(e.target.checked)} />
        <label htmlFor="defaultBi" className="text-sm text-rich-black">Apply Brand Identity by default</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Product prompt</label>
        <textarea value={productPrompt} onChange={(e) => setProductPrompt(e.target.value)} rows={4} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Describe how this product should be photographed..." />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50">
          {isSubmitting ? 'Creating…' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md">
          Cancel
        </button>
      </div>
    </form>
  )
}

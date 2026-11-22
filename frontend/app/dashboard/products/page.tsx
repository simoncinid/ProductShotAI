'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import { useAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

export default function ProductsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const authenticated = useAuthenticated()

  useEffect(() => {
    if (authenticated === false) router.push('/login')
  }, [authenticated, router])

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: authenticated === true,
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string
      sku?: string
      category?: string
      default_apply_brand_identity: boolean
      product_prompt: string
    }) => productsApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created')
      setShowCreate(false)
      router.push(`/dashboard/products/${created.id}`)
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail
          : null
      toast.error(msg || 'Creation failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail
          : null
      toast.error(msg || 'Deletion failed')
    },
  })

  if (!authenticated) return null
  if (isLoading) return <div className="p-8 text-[#0f172a]/70">Loading...</div>

  return (
    <div className="grid h-auto min-h-0  gap-4 overflow-visible  xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="flex min-h-0 flex-col rounded border border-[#d0d4d4] bg-[#fefefe] text-[#0c0c0c]">
        <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-[#d0d4d4] p-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#475569]">
              Catalog
            </p>
            <h1 className="mt-1 text-[28px] font-normal leading-none tracking-[-0.9px]">
              Products
            </h1>
            <p className="mt-2 text-sm text-[#475569]">
              Optional: save product photos and descriptions so you can use them
              again. You can create a single photo without doing this.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowCreate((prev) => !prev)
              setTimeout(
                () => document.getElementById('product-name')?.focus(),
                50,
              )
            }}
            className="rounded bg-[#0c0c0c] px-4 py-2.5 text-sm font-semibold text-white"
          >
            {showCreate ? 'Close form' : 'New product'}
          </button>
        </div>

        {products.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <p className="font-semibold">No products yet</p>
              <p className="mt-1 max-w-sm text-sm text-[#475569]">
                Save a product to reuse its photos, or create a photo directly
                without setting up a catalog.
              </p>
              <Link
                href="/dashboard/create"
                className="mt-4 inline-flex min-h-12 items-center font-semibold text-teal-800 underline"
              >
                Create a photo without saving a product →
              </Link>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <section className="grid gap-3 md:grid-cols-2">
              {products.map(
                (p: {
                  id: string
                  name: string
                  sku?: string
                  default_apply_brand_identity: boolean
                }) => (
                  <article
                    key={p.id}
                    className="rounded border border-[#d0d4d4] bg-white p-4 text-[#0c0c0c]"
                  >
                    <h2 className="text-lg font-semibold">{p.name}</h2>
                    <p className="mt-1 text-sm text-[#475569]">
                      SKU: {p.sku || 'n/a'}
                    </p>
                    <p className="mt-1 text-xs text-[#475569]">
                      Brand identity:{' '}
                      {p.default_apply_brand_identity ? 'enabled' : 'disabled'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/products/${p.id}`}
                        className="rounded border border-[#d0d4d4] px-3 py-1.5 text-sm hover:border-[#0c0c0c]"
                      >
                        Photos & details
                      </Link>
                      <Link
                        href={`/dashboard/shooting?product_id=${p.id}`}
                        className="rounded border border-[#d0d4d4] px-3 py-1.5 text-sm hover:border-[#0c0c0c]"
                      >
                        Create image set
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          window.confirm('Delete this product?') &&
                          deleteMutation.mutate(p.id)
                        }
                        disabled={deleteMutation.isPending}
                        className="rounded border border-red-300/70 px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ),
              )}
            </section>
          </div>
        )}
      </section>

      <aside className="min-h-0 overflow-visible  rounded border border-[#d0d4d4] bg-[#fefefe]">
        <div className="border-b border-[#d0d4d4] p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.35px] text-[#475569]">
            Product setup
          </p>
          <h2 className="mt-1 text-[24px] font-normal leading-none tracking-[-0.9px]">
            {showCreate ? 'New product' : 'How saved products work'}
          </h2>
        </div>
        <div className="lg:h-[calc(100%-73px)]  p-4">
          {showCreate ? (
            <CreateProductForm
              onCancel={() => setShowCreate(false)}
              onSubmit={(data) => createMutation.mutate(data)}
              isSubmitting={createMutation.isPending}
            />
          ) : (
            <div className="space-y-3 text-sm text-[#475569]">
              <p className="rounded border border-[#d0d4d4] bg-white p-3 text-[#404040]">
                1. Give your product a name and a short description.
              </p>
              <p className="rounded border border-[#d0d4d4] bg-white p-3 text-[#404040]">
                2. Add clear photos of that product.
              </p>
              <p className="rounded border border-[#d0d4d4] bg-white p-3 text-[#404040]">
                3. Reuse those photos when creating an image or an image set.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

function CreateProductForm({
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  onCancel: () => void
  onSubmit: (data: {
    name: string
    sku?: string
    category?: string
    default_apply_brand_identity: boolean
    product_prompt: string
  }) => void
  isSubmitting: boolean
}) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [defaultApplyBrandIdentity, setDefaultApplyBrandIdentity] =
    useState(false)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="product-name"
            className="mb-1 block text-sm font-medium text-[#0f172a]"
          >
            Product name *
          </label>
          <input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-[#d0d4d4] bg-white px-3 py-2 text-[#0c0c0c]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="product-code"
            className="mb-1 block text-sm font-medium text-[#0f172a]"
          >
            Product code (optional)
          </label>
          <input
            id="product-code"
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded border border-[#d0d4d4] bg-white px-3 py-2 text-[#0c0c0c]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="product-category"
          className="mb-1 block text-sm font-medium text-[#0f172a]"
        >
          Category (optional)
        </label>
        <input
          id="product-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded border border-[#d0d4d4] bg-white px-3 py-2 text-[#0c0c0c]"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#0f172a]">
        <input
          type="checkbox"
          checked={defaultApplyBrandIdentity}
          onChange={(e) => setDefaultApplyBrandIdentity(e.target.checked)}
          className="rounded"
        />
        Use my saved brand settings (optional)
      </label>

      <div>
        <div className="mb-1 flex items-center justify-between gap-2 flex-wrap">
          <label
            htmlFor="product-description"
            className="text-sm font-medium text-[#0f172a]"
          >
            Product description
          </label>
          <EditPromptWithAI
            value={productPrompt}
            onChange={setProductPrompt}
            buttonLabel="Improve with AI"
            applyLabel="Apply"
          />
        </div>
        <textarea
          id="product-description"
          value={productPrompt}
          onChange={(e) => setProductPrompt(e.target.value)}
          placeholder="For example: a brown leather handbag with a gold clasp. Preserve its shape and colour."
          rows={4}
          className="w-full rounded border border-[#d0d4d4] bg-white px-3 py-2 text-[#0c0c0c]"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-[#0c0c0c] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-[#d0d4d4] px-5 py-2 text-sm text-[#404040] hover:border-[#0c0c0c]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

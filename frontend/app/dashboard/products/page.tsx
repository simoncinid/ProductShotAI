'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { EditPromptWithAI } from '@/components/EditPromptWithAI'

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
    mutationFn: (data: { name: string; sku?: string; category?: string; default_apply_brand_identity: boolean; product_prompt: string }) =>
      productsApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created')
      setShowCreate(false)
      router.push(`/dashboard/products/${created.id}`)
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
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
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      toast.error(msg || 'Deletion failed')
    },
  })

  if (!authenticated) return null
  if (isLoading) return <div className="p-8 text-muted">Loading...</div>

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Catalogo prodotti</h1>
            <p className="mt-1 text-sm text-white/70">
              Setup una volta i tuoi prodotti e riusali in foto singole, shooting e Creative Hub.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#13233d]"
          >
            {showCreate ? 'Chiudi form' : 'Nuovo prodotto'}
          </button>
        </div>

        {showCreate && (
          <div className="mt-5">
            <CreateProductForm
              onCancel={() => setShowCreate(false)}
              onSubmit={(data) => createMutation.mutate(data)}
              isSubmitting={createMutation.isPending}
            />
          </div>
        )}
      </section>

      {products.length === 0 ? (
        <section className="rounded-2xl border border-white/15 bg-black/20 p-8 text-center text-white">
          <p className="font-semibold">Nessun prodotto creato</p>
          <p className="mt-1 text-sm text-white/70">Aggiungi un prodotto con prompt base e immagini reference per semplificare il flusso operativo.</p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {products.map((p: { id: string; name: string; sku?: string; default_apply_brand_identity: boolean }) => (
            <article key={p.id} className="rounded-xl border border-white/15 bg-white/10 p-4 text-white">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-white/75">SKU: {p.sku || 'n/a'}</p>
              <p className="mt-1 text-xs text-white/70">
                Brand identity: {p.default_apply_brand_identity ? 'attiva' : 'disattiva'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/dashboard/products/${p.id}`} className="rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10">
                  Apri setup
                </Link>
                <Link href="/dashboard/shooting" className="rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10">
                  Avvia shooting
                </Link>
                <button
                  type="button"
                  onClick={() => window.confirm('Delete this product?') && deleteMutation.mutate(p.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-md border border-red-300/70 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/10"
                >
                  Elimina
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
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
  const [productPrompt, setProductPrompt] = useState('Professional product photo, clean and premium style.')

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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/20 bg-black/20 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-white">Nome prodotto *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white">SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-white">Categoria</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white">
        <input
          type="checkbox"
          checked={defaultApplyBrandIdentity}
          onChange={(e) => setDefaultApplyBrandIdentity(e.target.checked)}
          className="rounded"
        />
        Applica brand identity di default
      </label>

      <div>
        <div className="mb-1 flex items-center justify-between gap-2 flex-wrap">
          <label className="text-sm font-medium text-white">Prompt base prodotto</label>
          <EditPromptWithAI value={productPrompt} onChange={setProductPrompt} buttonLabel="Migliora con AI" applyLabel="Applica" />
        </div>
        <textarea
          value={productPrompt}
          onChange={(e) => setProductPrompt(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-white"
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#13233d] disabled:opacity-50">
          {isSubmitting ? 'Creazione...' : 'Crea prodotto'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10">
          Annulla
        </button>
      </div>
    </form>
  )
}

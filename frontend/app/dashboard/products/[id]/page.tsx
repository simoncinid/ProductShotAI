'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'

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
      toast.success('Prodotto aggiornato')
      setEditing(false)
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Aggiornamento fallito')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => productsApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Immagine caricata')
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Upload fallito')
    },
  })

  const analyzeMutation = useMutation({
    mutationFn: () => productsApi.analyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Analisi aggiornata')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(id, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.delete(id),
    onSuccess: () => {
      toast.success('Prodotto eliminato')
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
  if (isLoading) return <div className="p-8 text-gray-600">Caricamento...</div>
  if (error || !product) {
    return (
      <div className="p-8">
        <Link href="/dashboard/products" className="text-vivid-yellow hover:underline">← Prodotti</Link>
        <p className="mt-4 text-gray-600">Prodotto non trovato.</p>
      </div>
    )
  }

  const images = product.images ?? []
  const maxImages = 3

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header: nome + Edit a sinistra, "← Prodotti" a destra */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-2xl font-bold text-rich-black truncate">{product.name}</h1>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 text-rich-black shrink-0"
              title="Modifica prodotto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          )}
        </div>
        <Link href="/dashboard/products" className="text-vivid-yellow hover:underline shrink-0">← Prodotti</Link>
      </div>

      {!editing ? (
        <div className="mb-6">
          <p><span className="text-gray-500">SKU:</span> {product.sku || '—'}</p>
          <p><span className="text-gray-500">Categoria:</span> {product.category || '—'}</p>
          <p><span className="text-gray-500">Applica Brand Identity:</span> {product.default_apply_brand_identity ? 'Sì' : 'No'}</p>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{product.product_prompt}</p>
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
        <h2 className="text-lg font-semibold text-rich-black mb-2">Immagini di riferimento (max 3)</h2>
        <p className="text-sm text-gray-500 mb-2">Clicca su un&apos;immagine per aprire il Creative Hub e generare varianti o modifiche.</p>
        <div className="flex flex-wrap gap-4">
          {images.map((img: { id: string; image_url: string }) => (
            <div key={img.id} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 group">
              <Link
                href={`/dashboard/hub?product_id=${id}&image_id=${img.id}`}
                className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-vivid-yellow focus:ring-offset-2 rounded-lg"
              >
                <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition" />
              </Link>
              <button type="button" onClick={(e) => { e.preventDefault(); deleteImageMutation.mutate(img.id); }} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 text-xs hover:bg-red-600">Rimuovi</button>
            </div>
          ))}
          {images.length < maxImages && (
            <label className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-vivid-yellow">
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMutation.mutate(f); e.target.value = ''; }} />
              <span className="text-gray-500 text-sm">+ Carica</span>
            </label>
          )}
        </div>
        {images.length > 0 && (
          <button type="button" onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending} className="mt-4 px-4 py-2 bg-rich-black text-white rounded-md font-medium disabled:opacity-50">
            {analyzeMutation.isPending ? 'Analisi in corso…' : 'Analizza immagini'}
          </button>
        )}
      </div>

      {/* Analisi: in view mode solo testo, in edit mode è nel form */}
      {!editing && (
        <div className="mt-6">
          <h3 className="font-semibold text-rich-black mb-2">Analisi stile</h3>
          {product.analysis_text ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.analysis_text}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nessuna analisi. Carica immagini e clicca &quot;Analizza immagini&quot;.</p>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-rich-black mb-4">Generazioni per questo prodotto</h2>
        {generations.length === 0 ? (
          <p className="text-gray-600">Nessuna generazione. Seleziona questo prodotto in <Link href="/create" className="text-vivid-yellow hover:underline">/create</Link> per generare.</p>
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
        <button
          type="button"
          onClick={() => window.confirm('Eliminare questo prodotto?') && deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded-md font-medium"
        >
          Elimina prodotto
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
        <label className="block text-sm font-medium text-rich-black mb-1">Nome *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">SKU</label>
        <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Categoria</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="editBi" checked={defaultApplyBrandIdentity} onChange={(e) => setDefaultApplyBrandIdentity(e.target.checked)} />
        <label htmlFor="editBi" className="text-sm text-rich-black">Applica Brand Identity di default</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Prompt prodotto</label>
        <textarea value={productPrompt} onChange={(e) => setProductPrompt(e.target.value)} rows={4} className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-rich-black mb-1">Analisi stile (modificabile)</label>
        <div className="relative">
          <textarea value={analysisText} onChange={(e) => setAnalysisText(e.target.value)} rows={5} className="w-full border border-gray-300 rounded px-3 py-2 pr-24" placeholder="Analisi generata o modificata..." />
          <button type="submit" disabled={isSaving} className="absolute bottom-2 right-2 px-3 py-1.5 bg-vivid-yellow text-rich-black rounded text-sm font-semibold disabled:opacity-50">
            {isSaving ? 'Salvataggio…' : 'Salva'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Salva per aggiornare tutti i campi e l’analisi (prompt) nel database.</p>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50">Salva</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md">Annulla</button>
      </div>
    </form>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { productsApi, uploadApi, shootingApi, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'

const SHOOTING_STYLE_OPTIONS = [
  { value: 'Zoom into details', label: 'Zoom sui dettagli (close-up, texture)' },
  { value: 'Lifestyle', label: 'Lifestyle (contesto d\'uso, ambiente)' },
  { value: 'Studio shooting', label: 'Studio shooting (sfondo neutro, luce controllata)' },
  { value: 'Mix: 3 zoomed 1 detail 2 lifestyle (one with text)', label: 'Mix: 3 zoom, 1 dettaglio, 2 lifestyle (uno con testo)' },
  { value: 'Un po\' e un po\'', label: 'Un po\' e un po\' (mix equilibrato)' },
  { value: 'Clean e-commerce set', label: 'Set e-commerce pulito (bianco, minimale)' },
]

const STEPS = ['Prodotto', 'Foto riferimento', 'Numero e stile', 'Prompt', 'Genera'] as const

export default function ShootingWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [productId, setProductId] = useState<string | null>(null)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [count, setCount] = useState(4)
  const [shootingStyle, setShootingStyle] = useState(SHOOTING_STYLE_OPTIONS[0].value)
  const [prompts, setPrompts] = useState<string[]>([])
  const [promptIndex, setPromptIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
    enabled: isAuthenticated(),
  })

  const { data: productDetail } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.get(productId!),
    enabled: !!productId && step === 1,
  })

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadImage,
    onSuccess: (data) => {
      setReferenceImageUrl(data.image_url)
      toast.success('Immagine caricata')
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Upload fallito')
    },
  })

  const promptsMutation = useMutation({
    mutationFn: (data: { product_id: string; shooting_style: string; count: number }) => shootingApi.createPrompts(data),
    onSuccess: (data) => {
      setPrompts(data.prompts)
      setPromptIndex(0)
      setStep(3) // review prompts (step 3 = Prompt)
      toast.success('Prompt generati')
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Generazione prompt fallita')
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data: { product_id: string; reference_image_url: string; prompts: string[]; aspect_ratio: string }) => shootingApi.generate(data),
    onSuccess: (data) => {
      toast.success('Shooting avviato')
      router.push(`/dashboard/shooting/${data.shooting_id}`)
    },
    onError: (e: unknown) => {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail : null
      toast.error(msg || 'Avvio shooting fallito')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReferenceFile(file)
      uploadMutation.mutate(file)
    }
  }

  const handleSelectProductImage = (imageUrl: string) => {
    setReferenceImageUrl(imageUrl)
    setReferenceFile(null)
  }

  const handleGeneratePrompts = () => {
    if (!productId) return
    promptsMutation.mutate({ product_id: productId, shooting_style: shootingStyle, count })
  }

  const handleConfirmPrompt = () => {
    if (promptIndex < prompts.length - 1) {
      setPromptIndex(promptIndex + 1)
    } else {
      setStep(4) // final step: Genera
    }
  }

  const handleStartGeneration = () => {
    if (!productId || !referenceImageUrl || prompts.length === 0) return
    generateMutation.mutate({
      product_id: productId,
      reference_image_url: referenceImageUrl,
      prompts,
      aspect_ratio: '1:1',
    })
  }

  if (!isAuthenticated()) return null
  if (productsLoading) return <div className="p-8 text-gray-600">Caricamento...</div>

  if (products.length === 0 && step === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-rich-black mb-4">Product Photoshooting</h1>
        <p className="text-gray-600 mb-6">Non hai ancora prodotti. Crea un prodotto per poter generare un shooting.</p>
        <Link href="/dashboard/products" className="inline-block px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold">
          Crea prodotto
        </Link>
        <Link href="/dashboard" className="ml-4 text-vivid-yellow hover:underline">← Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-rich-black">Product Photoshooting</h1>
        <Link href="/dashboard" className="text-vivid-yellow hover:underline">← Dashboard</Link>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step ? setStep(i) : undefined}
            className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium ${
              i === step ? 'bg-vivid-yellow text-rich-black' : i < step ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
            } ${i < step ? 'cursor-pointer' : ''}`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {/* Step 0: Select product */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-rich-black">Seleziona il prodotto</h2>
          <div className="grid gap-2">
            {products.map((p: { id: string; name: string }) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setProductId(p.id); setStep(1); }}
                className={`text-left p-4 rounded-lg border-2 transition ${
                  productId === p.id ? 'border-vivid-yellow bg-vivid-yellow/10' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Reference photo */}
      {step === 1 && productId && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-rich-black">Foto di riferimento</h2>
          <p className="text-sm text-gray-600">Carica una foto o scegli da un&apos;immagine del prodotto.</p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 rounded-md font-medium text-rich-black hover:bg-gray-200"
            >
              Carica immagine
            </button>
            {uploadMutation.isPending && <p className="mt-2 text-sm text-gray-500">Upload…</p>}
          </div>
          {productDetail?.images?.length ? (
            <div>
              <p className="text-sm font-medium text-rich-black mb-2">Oppure scegli da immagini prodotto:</p>
              <div className="flex flex-wrap gap-2">
                {(productDetail.images as { id: string; image_url: string }[]).map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleSelectProductImage(img.image_url)}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-vivid-yellow focus:ring-2 focus:ring-vivid-yellow"
                  >
                    <img src={getAbsoluteImageUrl(img.image_url) ?? img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {referenceImageUrl && (
            <div className="mt-4">
              <p className="text-sm text-green-600 mb-2">✓ Immagine selezionata</p>
              <img src={getAbsoluteImageUrl(referenceImageUrl) ?? referenceImageUrl} alt="" className="max-h-40 rounded-lg border border-gray-200" />
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold">
                  Avanti
                </button>
                <button type="button" onClick={() => setReferenceImageUrl(null)} className="px-4 py-2 border border-gray-300 rounded-md">Cambia</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Count + style */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-rich-black">Numero di foto e stile</h2>
          <div>
            <label className="block text-sm font-medium text-rich-black mb-2">Numero di foto (2–10)</label>
            <input
              type="number"
              min={2}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(2, parseInt(e.target.value, 10) || 2)))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-rich-black mb-2">Stile shooting (consigli)</label>
            <select
              value={shootingStyle}
              onChange={(e) => setShootingStyle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {SHOOTING_STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleGeneratePrompts} disabled={promptsMutation.isPending} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold disabled:opacity-50">
              {promptsMutation.isPending ? 'Generazione prompt…' : 'Genera prompt con AI'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 rounded-md">Indietro</button>
          </div>
        </div>
      )}

      {/* Step 3: Review/edit prompts one by one */}
      {step === 3 && prompts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-rich-black">
            Prompt {promptIndex + 1} di {prompts.length}
          </h2>
          <p className="text-sm text-gray-600">Modifica se serve (es. aggiungere testo sulla foto, dettagli zoom) e conferma.</p>
          <textarea
            value={prompts[promptIndex] ?? ''}
            onChange={(e) => {
              const next = [...prompts]
              next[promptIndex] = e.target.value
              setPrompts(next)
            }}
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleConfirmPrompt} className="px-4 py-2 bg-vivid-yellow text-rich-black rounded-md font-semibold">
              {promptIndex < prompts.length - 1 ? 'Conferma e prossimo' : 'Conferma e vai a Genera'}
            </button>
            {promptIndex > 0 && (
              <button type="button" onClick={() => setPromptIndex(promptIndex - 1)} className="px-4 py-2 border border-gray-300 rounded-md">Indietro</button>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Generate */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-rich-black">Genera shooting</h2>
          <p className="text-gray-600">Verranno generate {prompts.length} immagini (1 credito ciascuna).</p>
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={generateMutation.isPending}
            className="w-full px-4 py-3 bg-rich-black text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
          >
            {generateMutation.isPending ? 'Avvio…' : 'Genera'}
          </button>
          <button type="button" onClick={() => setStep(3)} className="block w-full text-center text-vivid-yellow hover:underline">
            ← Modifica prompt
          </button>
        </div>
      )}
    </div>
  )
}

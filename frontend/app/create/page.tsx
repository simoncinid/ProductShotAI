'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { uploadApi, generationApi, getDeviceId, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'

const CONTAINER = 'mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14'

export default function CreatePage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const authenticated = isAuthenticated()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadImage,
    onSuccess: (data, variables) => {
      if (variables !== selectedFile) return
      setImageUrl(data.image_url)
      toast.success('Image uploaded successfully!')
    },
    onError: (error: unknown) => {
      const msg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      toast.error(msg || 'Upload failed')
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data: Parameters<typeof generationApi.generatePaid>[0]) => {
      if (authenticated) return generationApi.generatePaid(data)
      return generationApi.generateFree(data)
    },
    onSuccess: (data) => {
      toast.success('Generation completed!')
      if (authenticated) {
        router.push(`/dashboard?generation=${data.generation_id}`)
      }
      // Free users: risultato mostrato sotto via generateMutation.data.output_image_url
    },
    onError: (error: unknown) => {
      const errorMsg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Generation failed'
      toast.error(errorMsg ?? 'Generation failed')
      if (typeof errorMsg === 'string' && errorMsg.includes('limit reached')) {
        setTimeout(() => router.push('/signup'), 2000)
      }
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setImageUrl(null)
      uploadMutation.mutate(file)
    }
  }

  const handleChangeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleGenerate = () => {
    if (!imageUrl || !prompt.trim()) {
      toast.error('Please upload an image and enter a prompt')
      return
    }
    generateMutation.mutate({
      prompt: prompt.trim(),
      image_url: imageUrl,
      aspect_ratio: aspectRatio,
      resolution: '8k',
      device_id: getDeviceId(),
    })
  }

  const outputUrl = getAbsoluteImageUrl(generateMutation.data?.output_image_url) ?? generateMutation.data?.output_image_url

  return (
    <div className="bg-page-bg">
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden bg-white pt-14 pb-12 md:pt-16 md:pb-14 lg:pt-20 lg:pb-16">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-page-bg/60 to-transparent" aria-hidden />
        <div className={`${CONTAINER} relative`}>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gray-300 md:w-12" />
              <p className="font-script text-2xl text-primary md:text-3xl">Create</p>
              <span className="h-px w-8 bg-gray-300 md:w-12" />
            </div>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-primary md:text-[34px]">
              Create Your AI Product Photo
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[16px] text-secondary md:text-[18px]">
              Upload your product image—our product photo AI creates ai image product and image product ai in 8K. Amazon product photo ready.
            </p>
            {!authenticated && (
              <p className="mt-3 text-[13px] text-secondary">
                Free users get watermarked images.{' '}
                <Link href="/signup" className="font-semibold text-brand hover:underline">
                  Sign up
                </Link>{' '}
                for clean images without watermark.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Divisore curvo ——— */}
      <div className="relative -mt-px h-10 w-full overflow-hidden bg-page-bg md:h-14">
        <svg viewBox="0 0 1200 48" fill="none" className="absolute bottom-0 left-0 w-full text-white" preserveAspectRatio="none">
          <path d="M0 48V0h1200v48c-200 0-400-24-600-24S200 48 0 48z" fill="currentColor" />
        </svg>
      </div>

      {/* ——— Form a 2 colonne ——— */}
      <section className="bg-page-bg pb-16 pt-10 md:pb-24 md:pt-14">
        <div className={CONTAINER}>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Upload + Aspect Ratio */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft md:p-8">
              <label className="block text-[15px] font-semibold text-primary md:text-base">
                Upload Product Image
              </label>
              <div className="mt-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-colors hover:border-gray-300 md:p-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto max-h-64 w-auto rounded-xl object-contain"
                    />
                    {uploadMutation.isPending && (
                      <p className="flex items-center justify-center gap-1.5 text-[14px] text-secondary">Uploading…</p>
                    )}
                    {uploadMutation.isError && (
                      <p className="flex flex-wrap items-center justify-center gap-2 text-[14px]">
                        <span className="text-red-600">Upload failed.</span>
                        <button
                          type="button"
                          onClick={() => selectedFile && uploadMutation.mutate(selectedFile)}
                          className="font-semibold text-brand underline hover:no-underline"
                        >
                          Retry
                        </button>
                      </p>
                    )}
                    {imageUrl && (
                      <p className="flex items-center justify-center gap-1.5 text-[14px] text-green-600">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Image uploaded
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleChangeImage}
                      className="block w-full text-center text-[13px] text-secondary underline hover:text-primary"
                    >
                      Change image
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                    </svg>
                    <span className="mt-3 block text-[14px] font-medium text-primary">Click to upload</span>
                    <span className="mt-1 block text-[12px] text-secondary">JPEG or PNG (max 10MB)</span>
                  </label>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-[15px] font-semibold text-primary md:text-base">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="1:1">1:1 (Square — Amazon Main)</option>
                  <option value="4:5">4:5 (Portrait)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
              </div>
            </div>

            {/* Prompt + Generate */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft md:p-8">
              <label className="block text-[15px] font-semibold text-primary md:text-base">
                Describe Your Vision
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Place the product on a clean white background with soft lighting, add a subtle shadow underneath, make the colors more vibrant..."
                rows={8}
                className="mt-3 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-primary placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <p className="mt-2 text-[13px] text-secondary">
                Describe how you want your product to look. Be specific about background, lighting, and style.
              </p>

              <button
                onClick={handleGenerate}
                disabled={!imageUrl || !prompt.trim() || generateMutation.isPending}
                className="mt-6 w-full rounded-full bg-brand py-3.5 text-[15px] font-semibold text-primary shadow-soft transition-smooth hover:scale-[1.02] hover:shadow-soft-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generateMutation.isPending ? 'Generating... (30–60 sec)' : 'Generate Image'}
              </button>

              {generateMutation.isPending && (
                <p className="mt-4 text-center text-[14px] text-secondary">Processing your image…</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ——— Risultato (solo free user, i paid vanno in dashboard) ——— */}
      {outputUrl && (
        <>
          <div className="relative h-10 w-full overflow-hidden bg-white md:h-14">
            <svg viewBox="0 0 1200 48" fill="none" className="absolute top-0 left-0 w-full text-page-bg" preserveAspectRatio="none">
              <path d="M0 0v48h1200V0c-200 0-400 24-600 24S200 0 0 0z" fill="currentColor" />
            </svg>
          </div>
          <section className="bg-white py-16 md:py-20">
            <div className={CONTAINER}>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-4">
                  <span className="h-px w-8 bg-gray-300 md:w-12" />
                  <p className="font-script text-2xl text-primary md:text-3xl">Your Result</p>
                  <span className="h-px w-8 bg-gray-300 md:w-12" />
                </div>
                <h2 className="mt-3 text-[24px] font-bold text-primary md:text-[28px]">Your Generated Image</h2>
              </div>

              <div className="mx-auto mt-12 max-w-2xl rounded-[20px] border border-gray-100 bg-white p-6 shadow-soft md:p-8">
                <img
                  src={outputUrl}
                  alt="Generated"
                  className="mx-auto max-w-full rounded-xl"
                />
                <div className="mt-6 text-center">
                  <a
                    href={outputUrl}
                    download
                    className="inline-flex items-center justify-center rounded-full border-2 border-anthracite bg-anthracite px-6 py-2.5 text-[14px] font-semibold text-white transition-smooth hover:bg-anthracite/90 hover:shadow-soft-hover"
                  >
                    Download Image
                  </a>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { uploadApi, generationApi, getDeviceId, getAbsoluteImageUrl } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'
import { ResultPopup } from '@/components/ResultPopup'

const POLL_INTERVAL_MS = 3000

function startPolling(
  generationId: string,
  onCompleted: (imageUrl: string) => void,
  onFailed: (message: string) => void,
) {
  const id = setInterval(async () => {
    try {
      const res = await generationApi.getGeneration(generationId, undefined)
      if (res.status === 'completed') {
        clearInterval(id)
        const url = getAbsoluteImageUrl(res.output_image_url) ?? res.output_image_url ?? ''
        if (url) onCompleted(url)
      } else if (res.status === 'failed') {
        clearInterval(id)
        onFailed(res.error_message || 'Generation failed')
      }
    } catch {
      // retry al prossimo giro
    }
  }, POLL_INTERVAL_MS)
  return () => clearInterval(id)
}

export default function DashboardCreatePage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stopPollingRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    return () => {
      stopPollingRef.current?.()
    }
  }, [])

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
    mutationFn: (data: Parameters<typeof generationApi.generatePaid>[0]) => generationApi.generatePaid(data),
    onSuccess: (data) => {
      if (data?.status === 'processing' && data?.generation_id) {
        stopPollingRef.current = startPolling(
          data.generation_id,
          (url) => {
            setIsGenerating(false)
            toast.success('Generazione completata!')
            setResultImageUrl(url)
          },
          (msg) => {
            setIsGenerating(false)
            toast.error(msg)
          },
        )
      } else if (data?.status === 'completed' && data?.output_image_url) {
        setIsGenerating(false)
        toast.success('Generazione completata!')
        setResultImageUrl(getAbsoluteImageUrl(data.output_image_url) ?? data.output_image_url ?? null)
      } else {
        setIsGenerating(false)
      }
    },
    onError: (error: unknown) => {
      setIsGenerating(false)
      const msg = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null
      toast.error(msg || 'Generation failed')
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
    setIsGenerating(true)
    generateMutation.mutate({
      prompt: prompt.trim(),
      image_url: imageUrl,
      aspect_ratio: aspectRatio,
      resolution: '8k',
      device_id: getDeviceId(),
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-rich-black mb-4">
          Create Your Product Photo
        </h1>
        <p className="text-gray-600">
          Upload your product image and describe how you want it transformed
        </p>
        <p className="text-sm text-green-600 mt-2">
          ✓ Clean images without watermark
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rich-black mb-2">
              Upload Product Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                    className="max-w-full h-auto mx-auto rounded-lg"
                  />
                  {uploadMutation.isPending && (
                    <p className="text-sm text-gray-600">Uploading…</p>
                  )}
                  {uploadMutation.isError && (
                    <p className="text-sm">
                      <span className="text-red-600">Upload failed.</span>{' '}
                      <button
                        type="button"
                        onClick={() => selectedFile && uploadMutation.mutate(selectedFile)}
                        className="font-semibold text-vivid-yellow underline hover:no-underline"
                      >
                        Retry
                      </button>
                    </p>
                  )}
                  {imageUrl && (
                    <p className="text-sm text-green-600">✓ Image uploaded</p>
                  )}
                  <button
                    type="button"
                    onClick={handleChangeImage}
                    className="text-xs text-gray-500 underline hover:text-gray-700"
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Click to upload
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    JPEG or PNG (max 10MB)
                  </span>
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-rich-black mb-2">
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-vivid-yellow focus:border-vivid-yellow"
            >
              <option value="1:1">1:1 (Square - Amazon Main)</option>
              <option value="4:5">4:5 (Portrait)</option>
              <option value="16:9">16:9 (Landscape)</option>
            </select>
          </div>
        </div>

        {/* Prompt Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rich-black mb-2">
              Describe Your Vision
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Place the product on a clean white background with soft lighting, add a subtle shadow underneath, make the colors more vibrant..."
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-vivid-yellow focus:border-vivid-yellow"
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe how you want your product to look. Be specific about background, lighting, and style.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!imageUrl || !prompt.trim() || isGenerating}
            className="w-full bg-vivid-yellow text-rich-black px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating
              ? 'Generating... (30–90 sec)'
              : 'Generate Image'}
          </button>

          {isGenerating && (
            <div className="text-center text-sm text-gray-600">
              <p>Processing your image...</p>
              <p className="text-xs mt-1">This usually takes 30–90 seconds</p>
            </div>
          )}
        </div>
      </div>

      {resultImageUrl && (
        <ResultPopup
          imageUrl={resultImageUrl}
          onClose={() => setResultImageUrl(null)}
          isFree={false}
        />
      )}
    </div>
  )
}

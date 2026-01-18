'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { uploadApi, generationApi, getDeviceId } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function CreatePage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const authenticated = isAuthenticated()

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadImage,
    onSuccess: (data) => {
      setImageUrl(data.image_url)
      toast.success('Image uploaded successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Upload failed')
    },
  })

  const generateMutation = useMutation({
    mutationFn: (data: any) => {
      if (authenticated) {
        return generationApi.generatePaid(data)
      } else {
        return generationApi.generateFree(data)
      }
    },
    onSuccess: (data) => {
      toast.success('Generation completed!')
      if (authenticated) {
        router.push(`/dashboard?generation=${data.generation_id}`)
      } else {
        // Show result on same page for free users
        setPreviewUrl(data.output_image_url)
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Generation failed'
      toast.error(errorMsg)
      if (errorMsg.includes('limit reached')) {
        setTimeout(() => {
          router.push('/signup')
        }, 2000)
      }
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setImageUrl(null)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    uploadMutation.mutate(selectedFile)
  }

  const handleGenerate = () => {
    if (!imageUrl || !prompt.trim()) {
      toast.error('Please upload an image and enter a prompt')
      return
    }

    const deviceId = getDeviceId()
    generateMutation.mutate({
      prompt: prompt.trim(),
      image_url: imageUrl,
      aspect_ratio: aspectRatio,
      resolution: '8k',
      device_id: deviceId,
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
        {!authenticated && (
          <p className="text-sm text-gray-500 mt-2">
            Free users get watermarked images.{' '}
            <Link href="/signup" className="text-vivid-yellow hover:underline">
              Sign up
            </Link>{' '}
            for clean images without watermark.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rich-black mb-2">
              Upload Product Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto mx-auto rounded-lg"
                  />
                  {!imageUrl && (
                    <button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="bg-vivid-yellow text-rich-black px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
                    </button>
                  )}
                  {imageUrl && (
                    <p className="text-sm text-green-600">✓ Image uploaded</p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
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
                </div>
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
            disabled={!imageUrl || !prompt.trim() || generateMutation.isPending}
            className="w-full bg-vivid-yellow text-rich-black px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generateMutation.isPending
              ? 'Generating... (this may take a minute)'
              : 'Generate Image'}
          </button>

          {generateMutation.isPending && (
            <div className="text-center text-sm text-gray-600">
              <p>Processing your image...</p>
              <p className="text-xs mt-1">This usually takes 30-60 seconds</p>
            </div>
          )}
        </div>
      </div>

      {/* Result Display */}
      {previewUrl && generateMutation.data?.output_image_url && (
        <div className="mt-8 border-t pt-8">
          <h2 className="text-2xl font-bold text-rich-black mb-4">Your Generated Image</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <img
              src={generateMutation.data.output_image_url}
              alt="Generated"
              className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
            />
            <div className="mt-4 text-center">
              <a
                href={generateMutation.data.output_image_url}
                download
                className="inline-block bg-rich-black text-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-90"
              >
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

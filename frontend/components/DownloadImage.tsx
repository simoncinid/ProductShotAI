'use client'
import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { trackFunnel } from '@/lib/funnel'

export function DownloadImage({
  url,
  label = 'Download photo',
  className = '',
}: {
  url: string
  label?: string
  className?: string
}) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  async function download() {
    if (busy) return
    setBusy(true)
    setFailed(false)
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `productshotai-photo.${blob.type.includes('png') ? 'png' : 'jpg'}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      trackFunnel('image_download_ready')
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <span className="inline-flex max-w-full flex-col items-start">
      <button
        onClick={download}
        disabled={busy}
        className={`inline-flex min-h-12 items-center justify-center gap-2 ${className}`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {busy ? 'Preparing download…' : label}
      </button>
      {failed && (
        <span role="alert" className="mt-2 text-sm text-red-800">
          Download unavailable.{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Open the photo to save it
          </a>
          .
        </span>
      )}
    </span>
  )
}

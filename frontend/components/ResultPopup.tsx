'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { CheckCircle2, X } from 'lucide-react'
import { DownloadImage } from './DownloadImage'

type ResultPopupProps = { imageUrl: string; onClose: () => void }
export function ResultPopup({ imageUrl, onClose }: ResultPopupProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    close.current?.focus()
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const nodes = dialog.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex="0"]',
      )
      if (!nodes?.length) return
      const first = nodes[0],
        last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.removeEventListener('keydown', keydown)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [onClose])
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        aria-describedby="result-description"
        className="relative max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 text-slate-900 shadow-xl sm:p-7"
      >
        <button
          ref={close}
          onClick={onClose}
          aria-label="Close result"
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
        <CheckCircle2 className="h-8 w-8 text-teal-700" />
        <h2 id="result-title" className="mt-3 pr-9 text-2xl font-semibold">
          Your photo is ready
        </h2>
        <p id="result-description" className="mt-2 text-base text-slate-600">
          Saved in My images. Download it to your phone or computer.
        </p>
        <img
          src={imageUrl}
          alt="Your newly created product photo"
          className="mt-5 max-h-[50dvh] w-full rounded-xl bg-slate-50 object-contain"
        />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <DownloadImage
            url={imageUrl}
            className="rounded-xl bg-teal-800 px-5 py-3 text-base font-semibold text-white"
          />
          <Link
            href="/dashboard/generations"
            className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 px-5 py-3 text-base font-semibold"
          >
            Open My images
          </Link>
        </div>
        <button
          onClick={onClose}
          className="mt-4 min-h-11 text-base font-medium text-teal-800 underline"
        >
          Back to my photo settings
        </button>
      </div>
    </div>
  )
}

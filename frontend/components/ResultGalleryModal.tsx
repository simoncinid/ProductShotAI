'use client'

import { useEffect, useCallback } from 'react'

type ResultGalleryModalProps = {
  images: readonly string[]
  currentIndex: number
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function ResultGalleryModal({ images, currentIndex, open, onClose, onIndexChange }: ResultGalleryModalProps) {
  const index = Math.min(Math.max(0, currentIndex), images.length - 1)
  const prev = useCallback(() => {
    onIndexChange((index - 1 + images.length) % images.length)
  }, [index, images.length, onIndexChange])
  const next = useCallback(() => {
    onIndexChange((index + 1) % images.length)
  }, [index, images.length, onIndexChange])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose, prev, next])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl items-center justify-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={prev}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition hover:bg-white md:h-12 md:w-12"
          aria-label="Previous image"
        >
          <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative flex max-h-[85vh] max-w-3xl flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/40">
          <img
            src={images[index]}
            alt={`Result ${index + 1}`}
            className="max-h-[85vh] w-auto max-w-full object-contain"
          />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            {index + 1} / {images.length}
          </span>
        </div>

        <button
          type="button"
          onClick={next}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition hover:bg-white md:h-12 md:w-12"
          aria-label="Next image"
        >
          <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-lg transition hover:bg-white hover:text-primary md:right-6 md:top-6"
        aria-label="Close"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

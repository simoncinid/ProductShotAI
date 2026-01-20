'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const EXAMPLES = [
  { before: '/images/before1.png', after: '/images/after1.png' },
  { before: '/images/before2.png', after: '/images/after2.png' },
  { before: '/images/before3.png', after: '/images/after3.png' },
  { before: '/images/before4.png', after: '/images/after4.png' },
  { before: '/images/before5.png', after: '/images/after5.png' },
] as const

export default function BeforeAfter() {
  const [position, setPosition] = useState(50)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const setExample = useCallback((i: number) => {
    setActiveIndex(i)
    setPosition(50)
  }, [])

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
  }, [])

  const startDrag = useCallback((clientX: number) => {
    setIsDragging(true)
    updatePosition(clientX)
  }, [updatePosition])

  const onContainerMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-example-bar]')) return
    e.preventDefault()
    startDrag(e.clientX)
  }, [startDrag])

  const onContainerTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[data-example-bar]')) return
    if (e.touches[0]) {
      e.preventDefault()
      startDrag(e.touches[0].clientX)
    }
  }, [startDrag])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) updatePosition(e.clientX)
  }, [isDragging, updatePosition])

  const onMouseUp = useCallback(() => setIsDragging(false), [])
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      e.preventDefault()
      updatePosition(e.touches[0].clientX)
    }
  }, [isDragging, updatePosition])

  const onTouchEnd = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    if (!isDragging) return
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd])

  const { before, after } = EXAMPLES[activeIndex]

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div
        ref={containerRef}
        className="relative aspect-square overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-soft select-none cursor-ew-resize"
        onMouseDown={onContainerMouseDown}
        onTouchStart={onContainerTouchStart}
      >
        {/* After (sotto, base) — visibile a destra della levetta. <img> nativo: Next/Image a volte non aggiornava al cambio src. */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            key={after}
            src={after}
            alt="After"
            className="absolute inset-0 w-full h-full object-cover object-right select-none"
            draggable={false}
          />
        </div>
        {/* Before (sopra, clippato) — visibile a sinistra della levetta */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${position}%` }}
        >
          <img
            key={before}
            src={before}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover object-left select-none"
            draggable={false}
          />
        </div>

        {/* Levetta verticale (solo visiva, il drag è su tutto il container) */}
        <div
          className="absolute top-0 bottom-0 w-10 z-10 flex items-center justify-center -translate-x-1/2 pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center flex-shrink-0">
            <div className="flex gap-0.5">
              <span className="w-0.5 h-4 bg-gray-400 rounded-full" />
              <span className="w-0.5 h-4 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Etichette Before / After */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/50 text-white text-xs font-medium pointer-events-none">
          Before
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/50 text-white text-xs font-medium pointer-events-none">
          After
        </div>

        {/* Pulsanti Example DENTRO il container: mousedown/touchstart + stopPropagation così il drag non li cattura */}
        <div
          data-example-bar
          className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-lg bg-black/70 px-2 py-1.5 shadow-lg"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] font-medium text-white/90">Example:</span>
          {EXAMPLES.map((_, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation()
                setExample(i)
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setExample(i)
              }}
              onClick={(e) => {
                e.stopPropagation()
                setExample(i)
              }}
              className={`min-w-[36px] h-9 rounded-full text-xs font-semibold cursor-pointer transition-smooth ${
                activeIndex === i ? 'bg-brand text-primary' : 'bg-white/25 text-white hover:bg-white/40'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const PROMPT = 'a group of young boys and girls playing with the game in the photo. christmas holidays. living room'

const slides = [
  {
    n: 1,
    label: 'Your photo',
    type: 'image' as const,
    src: '/images/before6.png',
  },
  {
    n: 2,
    label: 'Your prompt',
    type: 'prompt' as const,
    text: PROMPT,
  },
  {
    n: 3,
    label: 'Result',
    type: 'image' as const,
    src: '/images/after6.png',
  },
]

const INTERVAL_MS = 3000

export default function ExampleGallery() {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const skipScrollEndRef = useRef(false)
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % 3)
    }, INTERVAL_MS)
  }, [])

  // Sincronizza scroll con index (solo carousel mobile)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    skipScrollEndRef.current = true
    const slideWidth = el.offsetWidth
    el.scrollTo({ left: index * slideWidth, behavior: 'smooth' })
    const t = setTimeout(() => { skipScrollEndRef.current = false }, 400)
    return () => clearTimeout(t)
  }, [index])

  // Avvia timer al mount
  useEffect(() => {
    startTimer()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current)
    }
  }, [startTimer])

  const handleScroll = useCallback(() => {
    if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current)
    scrollEndTimeoutRef.current = setTimeout(() => {
      scrollEndTimeoutRef.current = null
      const el = containerRef.current
      if (!el || skipScrollEndRef.current) return
      const slideWidth = el.offsetWidth
      const newIndex = Math.round(el.scrollLeft / slideWidth)
      const clamped = Math.max(0, Math.min(2, newIndex))
      if (clamped !== index) {
        setIndex(clamped)
        startTimer()
      }
    }, 150)
  }, [index, startTimer])

  const goTo = useCallback(
    (i: number) => {
      setIndex(i)
      startTimer()
    },
    [startTimer]
  )

  return (
    <section className="bg-page-bg px-4 py-8 md:py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-4 text-center md:mb-6">
          <p className="font-script text-lg text-primary md:text-2xl">Example</p>
          <h2 className="mt-0.5 text-base font-semibold text-primary md:mt-1 md:text-xl">
            From your photo to the result
          </h2>
        </div>

        {/* Mobile: carousel orizzontale, uno alla volta, auto + swipe */}
        <div className="md:hidden w-full min-w-0 overflow-hidden">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-webkit-overflow-scrolling:touch]"
          >
            {slides.map((s) => (
              <div
                key={s.n}
                className="w-full min-w-full max-w-full flex-shrink-0 snap-center overflow-hidden px-1"
              >
                <SlideContent s={s} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  index === i ? 'w-6 bg-brand' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: griglia a 3 colonne, tutte stessa altezza */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-6 md:items-stretch">
          {slides.map((s) => (
            <div key={s.n} className="h-full min-w-0">
              <SlideContent s={s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SlideContent({
  s,
}: {
  s: (typeof slides)[0]
}) {
  return (
    <div className="flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-primary">
          {s.n}
        </div>
        <span className="min-w-0 flex-1 break-words text-sm font-medium text-primary">{s.label}</span>
      </div>
      {s.type === 'image' ? (
        <div className="min-w-0 overflow-hidden rounded-lg h-[50vw] max-h-[260px] md:h-auto md:max-h-none md:flex-1 md:min-h-0">
          <img
            src={s.src}
            alt={s.label}
            className="h-full w-full max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <p className="min-w-0 break-words text-[13px] leading-relaxed text-secondary md:text-sm">
            &ldquo;{s.text}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}

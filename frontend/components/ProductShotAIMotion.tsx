'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

/**
 * ProductShotAI Motion Explainer
 *
 * What this component does
 * - Recreates (in code) the same 4-step motion explainer structure seen in the provided video.
 * - Uses a deterministic timeline (30s) and animates between scenes.
 * - Includes typewriter cursors, form typing, prompt cards confirmation, results grid, and final CTA montage.
 *
 * How to use
 * <ProductShotAIMotion
 *   logoSrc="/logo.svg"
 *   productSrc="/bag.png"
 *   results={["/r1.jpg","/r2.jpg","/r3.jpg"]}
 * />
 *
 * Notes
 * - Provide your own assets to match your brand/product.
 * - Tweak TIMELINE if you need to match your exact cut.
 */

// ---------------------------------
// Timeline (seconds)
// ---------------------------------
const TIMELINE = {
  total: 28,
  intro: { start: 0, end: 7 },
  step1: { start: 7, end: 13 },
  step2: { start: 13, end: 18 },
  step3: { start: 18, end: 25 },
  step4: { start: 25, end: 28 },
} as const

// ---------------------------------
// Helpers
// ---------------------------------
function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function progressBetween(t: number, start: number, end: number) {
  return clamp01((t - start) / (end - start))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// Easing that feels "SaaS / UI"
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function useTimelineClock(durationSeconds: number, autoplay = true) {
  const prefersReducedMotion = useReducedMotion()
  const [t, setT] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!autoplay) return
    if (prefersReducedMotion) {
      // Jump to end if reduced motion.
      setT(durationSeconds)
      return
    }

    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now
      const elapsed = (now - startRef.current) / 1000
      const next = Math.min(durationSeconds, elapsed)
      setT(next)
      if (next < durationSeconds) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [autoplay, durationSeconds, prefersReducedMotion])

  return { t }
}

// ---------------------------------
// Small UI Primitives
// ---------------------------------
function SoftCard({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={
        'rounded-xl md:rounded-2xl bg-white/95 shadow-soft border border-white/20 ' +
        className
      }
    >
      {children}
    </div>
  )
}

function Pill({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={
        'inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-[10px] md:text-xs font-semibold bg-white/10 text-on-dark ' +
        className
      }
    >
      {children}
    </span>
  )
}

function Cursor({ className = '' }: { className?: string }) {
  return (
    <span
      className={
        'inline-block w-[4px] md:w-[5px] h-[1em] align-[-0.1em] bg-brand ml-0.5 rounded-sm animate-[blink_1s_step-end_infinite] ' +
        className
      }
    />
  )
}

function TypeLine({
  text,
  t,
  start,
  end,
  showCursor = true,
}: {
  text: string
  t: number
  start: number
  end: number
  showCursor?: boolean
}) {
  const p = progressBetween(t, start, end)
  const eased = easeOutCubic(p)
  const chars = Math.floor(text.length * eased)
  return (
    <span>
      {text.slice(0, chars)}
      {showCursor && p < 1 ? <Cursor /> : null}
    </span>
  )
}

/** Segmento di testo con stile (indici inclusi start, esclusi end) */
type TextSegment = { start: number; end: number; className: string }

/** Scrive una stringa lettera per lettera dall'inizio, con segmenti stilizzati (giallo, corsivo, ecc.) */
function TypedTextWithStyles({
  fullText,
  segments,
  charCount,
  showCursor,
}: {
  fullText: string
  segments: TextSegment[]
  charCount: number
  showCursor: boolean
}) {
  if (charCount <= 0) {
    return showCursor ? <Cursor /> : null
  }
  const visible = fullText.slice(0, charCount)
  const parts: { text: string; className: string }[] = []
  let pos = 0
  while (pos < visible.length) {
    const seg = segments.find((s) => s.start <= pos && s.end > pos)
    const end = seg ? Math.min(seg.end, visible.length) : visible.length
    const text = fullText.slice(pos, end)
    if (text.length > 0) {
      parts.push({ text, className: seg?.className ?? 'text-on-dark' })
    }
    pos = end
  }
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} className={p.className}>
          {p.text}
        </span>
      ))}
      {showCursor ? <Cursor /> : null}
    </>
  )
}

function UnderlineSweep({ t, start, end }: { t: number; start: number; end: number }) {
  const p = easeOutCubic(progressBetween(t, start, end))
  return (
    <div className="h-[2px] w-full bg-transparent mt-1.5">
      <div
        className="h-[2px] bg-brand rounded-full"
        style={{ width: `${p * 42}%` }}
      />
    </div>
  )
}

function ImageReadyBadge({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 520, damping: 36 }}
          className="absolute left-0 right-0 bottom-4 md:bottom-5 flex justify-center pointer-events-none"
        >
          <span className="rounded-xl bg-anthracite/95 text-white px-4 py-2.5 shadow-soft border border-white/10 flex items-center justify-center gap-2"
          >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold" aria-hidden>✓</span>
          <span className="text-sm font-semibold">Ready</span>
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

// ---------------------------------
// Main Component
// ---------------------------------
export default function ProductShotAIMotion({
  logoSrc,
  productSrc,
  results,
  autoplay = true,
}: {
  logoSrc: string
  productSrc: string
  results: [string, string, string]
  autoplay?: boolean
}) {
  const { t } = useTimelineClock(TIMELINE.total, autoplay)

  const scene = useMemo(() => {
    if (t < TIMELINE.intro.end) return 'intro' as const
    if (t < TIMELINE.step1.end) return 'step1' as const
    if (t < TIMELINE.step2.end) return 'step2' as const
    if (t < TIMELINE.step3.end) return 'step3' as const
    return 'step4' as const
  }, [t])

  return (
    <div className="w-full">
      {/* Keyframes for cursor blink */}
      <style>{`
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>

      {/* Stage: +25% larghezza (max-w-4xl → 70rem), palette sito */}
      <div className="relative w-full min-h-[420px] aspect-[4/3] sm:min-h-[480px] md:aspect-[5/3] md:min-h-[520px] lg:min-h-[600px] max-w-[70rem] mx-auto overflow-hidden rounded-2xl md:rounded-3xl bg-page-bg border border-white/10">
        {/* Sfondo base */}
        <div className="absolute inset-0 bg-gradient-to-b from-page-bg to-anthracite" />

        {/* Scene switch */}
        <div className="relative z-10 w-full h-full">
          <AnimatePresence mode="wait">
            {scene === 'intro' ? (
              <motion.div
                key="intro"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <IntroScene t={t} />
              </motion.div>
            ) : null}

            {scene === 'step1' ? (
              <motion.div
                key="step1"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Step1BrandIdentity t={t} />
              </motion.div>
            ) : null}

            {scene === 'step2' ? (
              <motion.div
                key="step2"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Step2Upload t={t} productSrc={productSrc} />
              </motion.div>
            ) : null}

            {scene === 'step3' ? (
              <motion.div
                key="step3"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Step3Prompts t={t} />
              </motion.div>
            ) : null}

            {scene === 'step4' ? (
              <motion.div
                key="step4"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Step4Results t={t} results={results} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------
// Scene: Intro (step 0) – dall’angolo in alto a sinistra, una lettera alla volta
// ---------------------------------
const INTRO_LINE1 = 'Your brand. One product photo. Full photoshoot.'
const INTRO_LINE1_SEGMENTS: TextSegment[] = [
  { start: 0, end: 5, className: 'text-on-dark font-bold' },
  { start: 5, end: 10, className: 'text-brand font-bold' },
  { start: 10, end: 16, className: 'text-on-dark font-bold' },
  { start: 16, end: 24, className: 'text-on-dark font-bold italic' },
  { start: 24, end: 32, className: 'text-on-dark font-bold' },
  { start: 32, end: 37, className: 'text-on-dark font-bold' },
  { start: 37, end: 38, className: 'text-brand font-bold' },
  { start: 38, end: 47, className: 'text-on-dark font-bold' },
  { start: 47, end: 48, className: 'text-on-dark font-bold' },
]

const INTRO_LINE2 = 'A creative hub that keeps every shot on-brand.'
const INTRO_LINE2_SEGMENTS: TextSegment[] = [
  { start: 0, end: 3, className: 'text-gray-300 font-medium' },
  { start: 3, end: 15, className: 'text-on-dark font-medium italic' },
  { start: 15, end: 36, className: 'text-gray-300 font-medium' },
  { start: 36, end: 45, className: 'text-brand font-medium' },
  { start: 45, end: 46, className: 'text-gray-300 font-medium' },
]

function IntroScene({ t }: { t: number }) {
  const p1 = progressBetween(t, 0.4, 3.2)
  const p2 = progressBetween(t, 2.8, 5.2)
  const chars1 = Math.floor(INTRO_LINE1.length * easeOutCubic(p1))
  const chars2 = Math.floor(INTRO_LINE2.length * easeOutCubic(p2))
  const cursorOnLine1 = p1 < 1
  const cursorOnLine2 = !cursorOnLine1 && p2 < 1

  return (
    <div className="absolute inset-0 p-6 md:p-8 text-left">
      <div className="max-w-3xl">
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug tracking-tight font-sans">
          <TypedTextWithStyles
            fullText={INTRO_LINE1}
            segments={INTRO_LINE1_SEGMENTS}
            charCount={chars1}
            showCursor={cursorOnLine1}
          />
        </p>
        <p className="mt-3 md:mt-4 text-sm md:text-base lg:text-lg text-gray-300 font-sans leading-snug">
          <TypedTextWithStyles
            fullText={INTRO_LINE2}
            segments={INTRO_LINE2_SEGMENTS}
            charCount={chars2}
            showCursor={cursorOnLine2}
          />
        </p>
        <div className="mt-3 max-w-md">
          <UnderlineSweep t={t} start={4.2} end={6} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------
// Scene: Step 1
// ---------------------------------
function Step1BrandIdentity({ t }: { t: number }) {
  const p = progressBetween(t, TIMELINE.step1.start, TIMELINE.step1.end)
  const enter = easeOutCubic(clamp01((p - 0.15) / 0.2))

  // Typing segments inside inputs.
  const s = TIMELINE.step1.start
  const line1 = { start: s + 1.2, end: s + 2.0 }
  const line2 = { start: s + 2.4, end: s + 3.2 }
  const line3 = { start: s + 3.2, end: s + 4.2 }

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-6">
      <Header title="1. Brand Identity" subtitle="Tell us about your brand." />
      <div className="flex-1 min-h-0 flex items-center justify-center py-3 md:py-4">
        <motion.div
          className="w-full max-w-xl max-h-full px-2"
          initial={false}
          style={{ opacity: enter, y: lerp(18, 0, enter), scale: lerp(0.98, 1, enter) }}
        >
          <SoftCard className="p-4 md:p-6 relative w-full">
            <Label text="Describe average customer" />
            <InputLike>
              <TypeLine
                text="Young professionals, health-conscious, minimal aesthetic"
                t={t}
                start={line1.start}
                end={line1.end}
              />
            </InputLike>
            <div className="mt-3 md:mt-4">
              <Label text="Where do you sell?" muted />
              <InputLike>
                <TypeLine
                  text="E-commerce, Instagram, lifestyle blogs"
                  t={t}
                  start={line2.start}
                  end={line2.end}
                />
              </InputLike>
            </div>
            <div className="mt-3 md:mt-4">
              <Label text="Photo style" />
              <InputLike>
                <TypeLine text="Studio, lifestyle, macro" t={t} start={line3.start} end={line3.end} />
              </InputLike>
            </div>
          </SoftCard>
        </motion.div>
      </div>
    </div>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="shrink-0 pb-2 md:pb-3">
      <div className="text-base md:text-lg lg:text-xl font-bold tracking-tight text-on-dark font-sans">{title}</div>
      <div className="mt-1 text-xs md:text-sm text-gray-400 font-sans">{subtitle}</div>
    </div>
  )
}

function Label({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className={'text-[10px] md:text-xs font-semibold font-sans ' + (muted ? 'text-gray-600' : 'text-gray-800')}>
      {text}
    </div>
  )
}

function InputLike({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base font-semibold font-sans bg-white border-2 border-brand shadow-[0_0_0_2px_rgba(254,231,22,0.25)] text-gray-900">
      {children}
    </div>
  )
}

// ---------------------------------
// Scene: Step 2 — Product hero, ben visibile e moderno
// ---------------------------------
function Step2Upload({ t, productSrc }: { t: number; productSrc: string }) {
  const p = progressBetween(t, TIMELINE.step2.start, TIMELINE.step2.end)
  const enter = easeOutCubic(clamp01((p - 0.10) / 0.25))
  const toastOn = p > 0.55

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-6">
      <Header title="2. Upload Product" subtitle="Drop a photo. We isolate the product." />
      <div className="flex-1 min-h-0 flex items-center justify-center py-3 md:py-4">
        <motion.div
          className="w-full h-full max-w-[420px] md:max-w-[480px] max-h-[320px] md:max-h-[380px] flex items-center justify-center"
          initial={false}
          style={{ opacity: enter, y: lerp(18, 0, enter), scale: lerp(0.98, 1, enter) }}
        >
          <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
            {/* Glow sottile brand sul bordo */}
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-brand/20 pointer-events-none" />
            <motion.div
              className="absolute inset-4 md:inset-6 flex items-center justify-center rounded-xl md:rounded-2xl bg-white overflow-hidden"
              initial={false}
              animate={{ scale: toastOn ? 1.02 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <img
                src={productSrc}
                alt="Uploaded product"
                className="w-full h-full object-contain p-4 md:p-6"
              />
            </motion.div>
            <ImageReadyBadge visible={toastOn} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ---------------------------------
// Scene: Step 3 — 3 prompt generati, ben visibili e moderni
// ---------------------------------
const PROMPT_EXAMPLES: { tag: string; text: string }[] = [
  {
    tag: 'Lifestyle',
    text: 'Outdoor café, morning light, leather bag on table with coffee and sunglasses, lifestyle shot, on-brand for e-commerce.',
  },
  {
    tag: 'Flat lay',
    text: 'Flat lay of open bag with laptop and accessories, top-down view, soft light, minimalist background, e-commerce ready.',
  },
  {
    tag: 'Macro',
    text: 'Macro of brass buckle and leather texture, stitching details, shallow depth of field, premium look for product zoom.',
  },
]

function Step3Prompts({ t }: { t: number }) {
  const p = progressBetween(t, TIMELINE.step3.start, TIMELINE.step3.end)
  const enter = easeOutCubic(clamp01((p - 0.08) / 0.18))
  const c1 = p > 0.28
  const c2 = p > 0.34
  const c3 = p > 0.50
  const showCTA = p > 0.58
  const confirmed = [c1, c2, c3]
  const textProgress = [clamp01((p - 0.08) / 0.20), 1, 1]

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-6">
      <Header title="3. Brand-matched Prompts" subtitle="Review and customize your prompts." />
      <div className="flex-1 min-h-0 flex items-center justify-center py-2 md:py-3 overflow-hidden">
        <motion.div
          className="w-full h-full max-w-4xl flex flex-col items-center justify-center gap-3 md:gap-4"
          initial={false}
          style={{ opacity: enter, y: lerp(18, 0, enter), scale: lerp(0.98, 1, enter) }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full flex-1 min-h-0 content-center">
            {PROMPT_EXAMPLES.map((ex, i) => (
              <PromptCard
                key={i}
                idx={i + 1}
                tag={ex.tag}
                text={ex.text}
                textProgress={textProgress[i]}
                confirmed={confirmed[i]}
              />
            ))}
          </div>
          <AnimatePresence>
            {showCTA ? (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                className="shrink-0"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-full bg-brand text-rich-black px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold shadow-soft font-sans"
                >
                  Generate Photoshoot <span className="ml-1">✨</span>
                </motion.button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function PromptCard({
  idx,
  tag,
  text,
  textProgress,
  confirmed,
}: {
  idx: number
  tag: string
  text: string
  textProgress: number
  confirmed: boolean
}) {
  const typedChars = Math.floor(text.length * easeOutCubic(clamp01(textProgress)))

  return (
    <motion.div
      layout
      className={`w-full flex flex-col rounded-2xl md:rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
        confirmed
          ? 'bg-white/95 border-brand/40 shadow-[0_8px_24px_rgba(254,231,22,0.15)]'
          : 'bg-white/90 border-white/30 shadow-soft'
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-3.5 border-b border-gray-200/80">
        <span className="text-xs md:text-sm font-bold text-anthracite font-sans">Prompt {idx}</span>
        <span className="rounded-full bg-brand/20 text-rich-black px-2.5 py-1 text-[10px] md:text-xs font-semibold">
          {tag}
        </span>
      </div>
      <div className="flex-1 min-h-[72px] md:min-h-[88px] px-4 py-3 md:px-5 md:py-4">
        <p className="text-[13px] md:text-[15px] font-medium leading-snug text-gray-800 font-sans">
          {text.slice(0, typedChars)}
          {!confirmed && typedChars < text.length ? <Cursor /> : null}
        </p>
      </div>
      <div className="px-4 pb-4 md:px-5 md:pb-5">
        <div
          className={`rounded-xl py-2.5 md:py-3 text-center text-xs md:text-sm font-semibold font-sans ${
            confirmed ? 'bg-brand text-rich-black' : 'bg-gray-200/80 text-gray-600'
          }`}
        >
          {confirmed ? '✓ Confirmed' : 'Confirm'}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------
// Scene: Step 4 — 3 immagini generate (res1, res2, res3) in evidenza, layout moderno
// ---------------------------------
function Step4Results({ t, results }: { t: number; results: [string, string, string] }) {
  const p = progressBetween(t, TIMELINE.step4.start, TIMELINE.step4.end)
  const enter = easeOutCubic(clamp01((p - 0.08) / 0.22))

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-6">
      <Header title="4. Results" subtitle="Here are your on-brand variations." />
      <div className="flex-1 min-h-0 flex items-center justify-center py-3 md:py-4 overflow-hidden">
        <motion.div
          className="w-full h-full max-w-4xl flex items-center justify-center"
          initial={false}
          style={{ opacity: enter, y: lerp(18, 0, enter) }}
        >
          <div className="grid grid-cols-3 gap-2 md:gap-4 w-full h-full max-h-[220px] sm:max-h-[280px] md:max-h-[340px]">
            <ResultImageCard src={results[0]} delay={0.05} />
            <ResultImageCard src={results[1]} delay={0.12} />
            <ResultImageCard src={results[2]} delay={0.19} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ResultImageCard({ src, delay }: { src: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32, delay }}
      className="relative w-full h-full min-h-[140px] md:min-h-[180px] rounded-2xl md:rounded-3xl overflow-hidden bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/30"
    >
      <img
        src={src}
        alt="Generated result"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-black/5 pointer-events-none" />
    </motion.div>
  )
}

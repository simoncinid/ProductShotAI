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
  total: 30,
  intro: { start: 0, end: 5 },
  step1: { start: 5, end: 11 },
  step2: { start: 11, end: 16 },
  step3: { start: 16, end: 23 },
  step4: { start: 23, end: 26 },
  outro: { start: 26, end: 30 },
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
          className="absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-5 rounded-xl bg-anthracite/95 text-white px-4 py-2.5 shadow-soft border border-white/10 flex items-center justify-center gap-2"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold" aria-hidden>✓</span>
          <span className="text-sm font-semibold">Ready</span>
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
    if (t < TIMELINE.step4.end) return 'step4' as const
    return 'outro' as const
  }, [t])

  // Background subtly shifts darker for the final montage.
  const bgP = progressBetween(t, TIMELINE.outro.start, TIMELINE.outro.end)
  const bgOpacity = lerp(0, 1, easeOutCubic(bgP))

  return (
    <div className="w-full">
      {/* Keyframes for cursor blink */}
      <style>{`
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>

      {/* Stage: più alto e largo, palette sito */}
      <div className="relative w-full min-h-[420px] aspect-[4/3] sm:min-h-[480px] md:aspect-[5/3] md:min-h-[520px] lg:min-h-[600px] max-w-4xl mx-auto overflow-hidden rounded-2xl md:rounded-3xl bg-page-bg border border-white/10">
        {/* Sfondo base */}
        <div className="absolute inset-0 bg-gradient-to-b from-page-bg to-anthracite" />

        {/* Wash per outro (scura leggermente) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"
          style={{ opacity: bgOpacity }}
        />

        {/* Top-left brand */}
        <div className="absolute top-4 left-4 md:top-5 md:left-6 flex items-center gap-2 z-30">
          <img src={logoSrc} alt="ProductShotAI" className="h-6 w-6 md:h-7 md:w-7" />
          <div className="text-sm md:text-base font-semibold text-on-dark">ProductShotAI</div>
        </div>

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

            {scene === 'outro' ? (
              <motion.div
                key="outro"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <OutroCTA t={t} results={results} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------
// Scene: Intro
// ---------------------------------
function IntroScene({ t }: { t: number }) {
  const l1Start = 0.8
  const l1End = 2.2
  const l2Start = 1.6
  const l2End = 3.2
  const subStart = 2.6
  const subEnd = 3.8

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 pt-14 md:pt-16">
      <div className="w-full max-w-2xl text-center md:text-left">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight font-bold tracking-tight text-on-dark font-sans">
          <div>
            <TypeLine
              text="Your brand. One product photo."
              t={t}
              start={l1Start}
              end={l1End}
            />
          </div>
          <div className="mt-1 md:mt-2">
            <TypeLine text="Full photoshoot." t={t} start={l2Start} end={l2End} />
          </div>
        </div>
        <div className="mt-3 md:mt-4 text-sm md:text-base text-gray-400 max-w-lg mx-auto md:mx-0">
          <span className="relative inline-block">
            <TypeLine
              text="A creative hub that keeps every shot on-brand."
              t={t}
              start={subStart}
              end={subEnd}
              showCursor={false}
            />
            <div className="absolute left-0 bottom-0 w-full max-w-sm">
              <UnderlineSweep t={t} start={subStart + 0.2} end={subEnd + 0.6} />
            </div>
          </span>
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
    <div className="absolute inset-0 flex flex-col p-4 md:p-6 pt-14 md:pt-16">
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
// Scene: Step 2
// ---------------------------------
function Step2Upload({ t, productSrc }: { t: number; productSrc: string }) {
  const p = progressBetween(t, TIMELINE.step2.start, TIMELINE.step2.end)
  const enter = easeOutCubic(clamp01((p - 0.10) / 0.25))
  const toastOn = p > 0.55

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-6 pt-14 md:pt-16">
      <Header title="2. Upload Product" subtitle="Drop a photo. We isolate the product." />
      <div className="flex-1 min-h-0 flex items-center justify-center py-3 md:py-4">
        <motion.div
          className="w-full max-w-[280px] md:max-w-[340px] aspect-square"
          initial={false}
          style={{ opacity: enter, y: lerp(18, 0, enter), scale: lerp(0.98, 1, enter) }}
        >
          <div className="relative w-full h-full rounded-2xl border-2 border-dashed border-white/25 bg-white/5">
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-4 md:p-5"
              initial={false}
              animate={{ scale: toastOn ? 1.03 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="bg-white/95 rounded-xl shadow-soft p-4 md:p-5 w-full h-full flex items-center justify-center">
                <img
                  src={productSrc}
                  alt="Uploaded product"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
            </motion.div>
            <ImageReadyBadge visible={toastOn} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ---------------------------------
// Scene: Step 3
// ---------------------------------
function Step3Prompts({ t }: { t: number }) {
  const p = progressBetween(t, TIMELINE.step3.start, TIMELINE.step3.end)
  const enter = easeOutCubic(clamp01((p - 0.08) / 0.18))

  // Confirm timings within scene
  const c1 = p > 0.28
  const c2 = p > 0.34
  const c3 = p > 0.50
  const showCTA = p > 0.58

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-6 pt-14 md:pt-16">
      <Header title="3. Brand-matched Prompts" subtitle="Review and customize your prompts." />
      <div className="flex-1 min-h-0 flex items-center justify-center py-3 md:py-4 overflow-hidden">
        <motion.div
          className="w-full max-w-3xl px-2 flex flex-col items-center"
          initial={false}
          style={{ opacity: enter, y: lerp(18, 0, enter), scale: lerp(0.98, 1, enter) }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full max-w-[800px]">
            <PromptCard
              idx={1}
              tag="Lifestyle"
              textProgress={clamp01((p - 0.08) / 0.20)}
              text="Professional product photography in a relaxed outdoor café setting, morning light, soft shadows, leather bag on wooden table with coffee and sunglasses, lifestyle context, high resolution, clean composition, on-brand aesthetic for e-commerce and social media."
              confirmed={c1}
            />
            <PromptCard
              idx={2}
              tag="Flat lay"
              textProgress={1}
              text="Flat lay lifestyle shot of open leather bag with laptop, glasses, and accessories neatly arranged inside, top-down view, soft natural lighting, minimalist background, perfect for e-commerce and Instagram, high resolution."
              confirmed={c2}
            />
            <PromptCard
              idx={3}
              tag="Macro"
              textProgress={1}
              text="Extreme close-up macro photography of brass buckle and leather texture, fine details of stitching and hardware, shallow depth of field, premium craftsmanship emphasis, high resolution product detail for e-commerce and editorial use."
              confirmed={c3}
            />
          </div>
          <AnimatePresence>
            {showCTA ? (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                className="mt-4 md:mt-5 flex justify-center shrink-0"
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
    <SoftCard className="w-full flex flex-col p-3 md:p-4 relative min-h-[180px] md:min-h-[200px]">
      <div className="flex items-start justify-between gap-2 shrink-0">
        <div className="text-[10px] md:text-xs font-semibold text-secondary font-sans">Prompt {idx}</div>
        <Pill>{tag}</Pill>
      </div>
      <div className="mt-2 md:mt-3 text-[11px] md:text-xs font-semibold leading-snug text-primary font-sans flex-1 min-h-[80px] overflow-y-auto max-h-[120px]">
        {text.slice(0, typedChars)}
        {!confirmed && typedChars < text.length ? <Cursor /> : null}
      </div>
      <div className="mt-3 shrink-0">
        <div
          className={
            'w-full rounded-lg py-2 text-center text-xs font-semibold font-sans ' +
            (confirmed
              ? 'bg-brand text-rich-black'
              : 'bg-white/20 text-on-dark')
          }
        >
          {confirmed ? 'Confirmed' : 'Confirm'}
        </div>
      </div>
    </SoftCard>
  )
}

// ---------------------------------
// Scene: Step 4
// ---------------------------------
function Step4Results({ t, results }: { t: number; results: [string, string, string] }) {
  const p = progressBetween(t, TIMELINE.step4.start, TIMELINE.step4.end)
  const enter = easeOutCubic(clamp01((p - 0.08) / 0.22))

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-6 pt-14 md:pt-16">
      <Header title="4. Results" subtitle="Here are your on-brand variations." />
      <div className="flex-1 min-h-0 flex items-center justify-center py-3 md:py-4 overflow-hidden">
        <motion.div
          className="w-full max-w-2xl px-2 flex items-center justify-center"
          initial={false}
          style={{ opacity: enter, y: lerp(18, 0, enter) }}
        >
          <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
            <ImageCard src={results[0]} className="aspect-[4/3]" delay={0.06} />
            <ImageCard src={results[1]} className="aspect-[4/3]" delay={0.12} />
            <ImageCard src={results[2]} className="col-span-2 aspect-[2/1]" delay={0.18} muted />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ImageCard({
  src,
  className,
  delay,
  muted,
}: {
  src: string
  className: string
  delay: number
  muted?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: muted ? 0.6 : 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, delay }}
      className={'rounded-xl overflow-hidden shadow-soft ' + className}
    >
      <img src={src} alt="Result" className="w-full h-full object-cover" />
    </motion.div>
  )
}

// ---------------------------------
// Scene: Outro CTA (3 card + CTA sotto, proporzionato)
// ---------------------------------
function OutroCTA({ t, results }: { t: number; results: [string, string, string] }) {
  const p = progressBetween(t, TIMELINE.outro.start, TIMELINE.outro.end)
  const enter = easeOutCubic(clamp01(p / 0.22))

  return (
    <div className="absolute inset-0 flex flex-col p-4 md:p-6 pt-14 md:pt-16 pb-3 md:pb-4">
      <div className="shrink-0 mb-3 md:mb-4">
        <div className="text-base md:text-lg lg:text-xl font-bold text-on-dark font-sans text-center">ProductShotAI</div>
      </div>
      <motion.div
        className="flex-1 min-h-0 flex items-stretch gap-2 md:gap-3 justify-center"
        initial={false}
        style={{ opacity: enter }}
      >
        <TallCard src={results[0]} />
        <TallCard src={results[1]} />
        <TallCard src={results[2]} />
      </motion.div>
      <motion.div
        className="shrink-0 pt-3 md:pt-4 flex flex-col items-center justify-center text-center"
        initial={false}
        style={{ opacity: enter }}
      >
        <p className="text-sm md:text-base lg:text-lg font-bold text-on-dark font-sans">Ready for your brand?</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-2 rounded-full bg-brand text-rich-black px-5 py-2 md:px-6 md:py-2.5 text-sm md:text-base font-semibold shadow-soft font-sans"
        >
          Try ProductShotAI
        </motion.button>
      </motion.div>
    </div>
  )
}

function TallCard({ src }: { src: string }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-white/15 shadow-soft">
      <img src={src} alt="Result" className="w-full h-full object-cover" />
    </div>
  )
}

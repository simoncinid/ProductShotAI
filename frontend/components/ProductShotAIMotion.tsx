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

  const reset = () => {
    startRef.current = null
    setT(0)
  }

  return { t, setT, reset }
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
        'rounded-2xl bg-white shadow-[0_18px_45px_rgba(20,20,20,0.10)] border border-black/5 ' +
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
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-black/5 text-black/70 ' +
        className
      }
    >
      {children}
    </span>
  )
}

function Cursor({ className = '' }: { className?: string }) {
  // Blink via CSS so it stays consistent with timeline.
  return (
    <span
      className={
        'inline-block w-[6px] h-[1.2em] align-[-0.15em] bg-sky-400 ml-1 rounded-sm animate-[blink_1s_step-end_infinite] ' +
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
    <div className="h-[3px] w-full bg-transparent mt-2">
      <div
        className="h-[3px] bg-sky-400 rounded-full"
        style={{ width: `${p * 42}%` }}
      />
    </div>
  )
}

function Toast({
  text,
  visible,
}: {
  text: string
  visible: boolean
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 520, damping: 36 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-6 rounded-2xl bg-[#2a160f] text-white px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.20)]"
        >
          <div className="flex items-center gap-3 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="leading-snug">{text}</span>
          </div>
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
  const { t, setT, reset } = useTimelineClock(TIMELINE.total, autoplay)

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

      {/* Stage */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-3xl bg-[#fbf7f3] border border-black/5">
        {/* Warm paper tint */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),rgba(251,247,243,1))]" />

        {/* Dark wash for outro */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 10%, rgba(30,16,10,0.00), rgba(30,16,10,0.85))',
            opacity: bgOpacity,
          }}
        />

        {/* Top-left brand */}
        <div className="absolute top-8 left-10 flex items-center gap-3">
          <img src={logoSrc} alt="ProductShotAI" className="h-8 w-8" />
          <div className="text-lg font-semibold text-black/85">ProductShotAI</div>
        </div>

        {/* Developer controls (optional). Click timeline in dev. */}
        <div className="absolute top-6 right-6 hidden lg:flex items-center gap-3 text-xs text-black/50">
          <button
            className="rounded-full px-3 py-1 bg-white/70 border border-black/5"
            onClick={() => reset()}
          >
            Restart
          </button>
          <input
            className="w-40"
            type="range"
            min={0}
            max={TIMELINE.total}
            step={0.01}
            value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
          />
          <span className="tabular-nums">{t.toFixed(2)}s</span>
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
  // Typing blocks: line 1 then line 2.
  const l1Start = 0.8
  const l1End = 2.2
  const l2Start = 1.6
  const l2End = 3.2
  const subStart = 2.6
  const subEnd = 3.8

  return (
    <div className="absolute inset-0">
      <div className="absolute left-16 top-[46%] -translate-y-1/2 max-w-4xl">
        <div className="text-[64px] leading-[1.02] font-extrabold tracking-tight text-[#2a160f]">
          <div>
            <TypeLine
              text="Your brand. One product photo."
              t={t}
              start={l1Start}
              end={l1End}
            />
          </div>
          <div className="mt-2">
            <TypeLine text="Full photoshoot." t={t} start={l2Start} end={l2End} />
          </div>
        </div>

        <div className="mt-6 text-2xl text-[#6b5a52]">
          <div className="max-w-2xl">
            <span className="relative">
              <TypeLine
                text="A creative hub that keeps every shot on-brand."
                t={t}
                start={subStart}
                end={subEnd}
                showCursor={false}
              />
              <div className="absolute -left-1 -bottom-3 w-[520px]">
                <UnderlineSweep t={t} start={subStart + 0.2} end={subEnd + 0.6} />
              </div>
            </span>
          </div>
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
    <div className="absolute inset-0">
      <Header title="1. Brand Identity" subtitle="Tell us about your brand." />

      <motion.div
        className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2"
        initial={false}
        style={{ opacity: enter, y: lerp(18, 0, enter), scale: lerp(0.98, 1, enter) }}
      >
        <SoftCard className="w-[980px] h-[420px] p-10 relative">
          <Label text="Describe average customer" />
          <InputLike>
            <TypeLine
              text="Young professionals, health-conscious, minimal aesthetic"
              t={t}
              start={line1.start}
              end={line1.end}
            />
          </InputLike>

          <div className="mt-8">
            <Label text="Where do you sell?" muted />
            <InputLike active>
              <TypeLine
                text="E-commerce, Instagram, lifestyle blogs"
                t={t}
                start={line2.start}
                end={line2.end}
              />
            </InputLike>
          </div>

          <div className="mt-8">
            <Label text="Photo style" />
            <InputLike active>
              <TypeLine text="Studio, lifestyle, macro" t={t} start={line3.start} end={line3.end} />
            </InputLike>
          </div>
        </SoftCard>
      </motion.div>
    </div>
  )
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="absolute left-16 top-14">
      <div className="text-5xl font-extrabold tracking-tight text-[#2a160f]">{title}</div>
      <div className="mt-3 text-xl text-[#6b5a52]">{subtitle}</div>
    </div>
  )
}

function Label({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className={'text-sm font-semibold ' + (muted ? 'text-black/25' : 'text-black/45')}>
      {text}
    </div>
  )
}

function InputLike({
  children,
  active,
}: {
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <div
      className={
        'mt-3 rounded-xl px-6 py-5 text-2xl font-semibold bg-black/5 text-black/80 border ' +
        (active ? 'border-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.15)]' : 'border-transparent')
      }
    >
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
    <div className="absolute inset-0">
      <Header title="2. Upload Product" subtitle="Drop a photo. We isolate the product." />

      <motion.div
        className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2"
        initial={false}
        style={{ opacity: enter, y: lerp(18, 0, enter), scale: lerp(0.98, 1, enter) }}
      >
        <div className="relative w-[560px] h-[560px] rounded-[34px] border-[3px] border-dashed border-black/35 bg-white/20">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{ scale: toastOn ? 1.03 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="bg-white rounded-2xl shadow-[0_18px_45px_rgba(20,20,20,0.12)] p-8">
              <img
                src={productSrc}
                alt="Uploaded product"
                className="w-[260px] h-[200px] object-contain"
              />
            </div>
          </motion.div>

          <Toast
            visible={toastOn}
            text="Product analyzed correctly. Ready to generate prompts for your photoshoot"
          />
        </div>
      </motion.div>
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
    <div className="absolute inset-0">
      <Header title="3. Brand-matched Prompts" subtitle="Review and customize your prompts." />

      <motion.div
        className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2"
        initial={false}
        style={{ opacity: enter, y: lerp(18, 0, enter), scale: lerp(0.98, 1, enter) }}
      >
        <div className="flex items-center gap-10">
          <PromptCard
            idx={1}
            tag="Studio"
            textProgress={clamp01((p - 0.08) / 0.20)}
            text="Studio clean, soft shadow, high res"
            confirmed={c1}
          />
          <PromptCard
            idx={2}
            tag="Lifestyle"
            textProgress={1}
            text="Lifestyle kitchen, morning"
            confirmed={c2}
          />
          <PromptCard
            idx={3}
            tag="Macro"
            textProgress={1}
            text="Macro detail, texture focus"
            confirmed={c3}
          />
        </div>

        <AnimatePresence>
          {showCTA ? (
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              className="mt-10 flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-full bg-[#2a160f] text-white px-10 py-5 text-xl font-semibold shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
              >
                Generate Photoshoot <span className="ml-2">✨</span>
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
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
    <SoftCard className="w-[360px] h-[300px] p-8 relative">
      <div className="flex items-start justify-between">
        <div className="text-sm font-semibold text-black/35">Prompt {idx}</div>
        <Pill className="bg-black/0 text-black/45 border border-black/10">{tag}</Pill>
      </div>

      <div className="mt-4 text-3xl font-extrabold leading-snug text-black/80">
        {text.slice(0, typedChars)}
        {!confirmed && typedChars < text.length ? <Cursor /> : null}
      </div>

      <div className="absolute left-8 right-8 bottom-8">
        <div
          className={
            'w-full rounded-xl py-4 text-center font-semibold ' +
            (confirmed
              ? 'bg-[#6fb30f] text-white'
              : 'bg-black/5 text-black/70')
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
    <div className="absolute inset-0">
      <Header title="4. Results" subtitle="Here are your on-brand variations." />

      <motion.div
        className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2"
        initial={false}
        style={{ opacity: enter, y: lerp(18, 0, enter) }}
      >
        <div className="grid grid-cols-2 gap-10">
          <ImageCard src={results[0]} className="w-[560px] h-[290px]" delay={0.06} />
          <ImageCard src={results[1]} className="w-[560px] h-[290px]" delay={0.12} />
          <div className="col-span-2 flex justify-start">
            <ImageCard src={results[2]} className="w-[560px] h-[290px]" delay={0.18} muted />
          </div>
        </div>
      </motion.div>
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
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: muted ? 0.55 : 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, delay }}
      className={'rounded-3xl overflow-hidden shadow-[0_18px_45px_rgba(20,20,20,0.12)] ' + className}
    >
      <img src={src} alt="Result" className="w-full h-full object-cover" />
    </motion.div>
  )
}

// ---------------------------------
// Scene: Outro CTA (3 tall cards)
// ---------------------------------
function OutroCTA({ t, results }: { t: number; results: [string, string, string] }) {
  const p = progressBetween(t, TIMELINE.outro.start, TIMELINE.outro.end)
  const enter = easeOutCubic(clamp01(p / 0.22))

  return (
    <div className="absolute inset-0">
      <motion.div
        className="absolute inset-0 px-10 py-10"
        initial={false}
        style={{ opacity: enter }}
      >
        <div className="w-full h-full flex items-stretch gap-6">
          <TallCard src={results[0]} />
          <TallCard src={results[1]} />
          <TallCard src={results[2]} />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-16 text-center">
          <div className="text-5xl font-extrabold text-white drop-shadow">Ready for your brand?</div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-400 text-white px-10 py-4 text-xl font-semibold shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          >
            Try ProductShotAI
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

function TallCard({ src }: { src: string }) {
  return (
    <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <img src={src} alt="CTA card" className="w-full h-full object-cover" />
    </div>
  )
}

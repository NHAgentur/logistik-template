'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'

import { BrandBlock } from './brand-block'

const FRAME_COUNT = 60
const LAST_FRAME = FRAME_COUNT - 1

// Files are 1-indexed on disk: 001.webp ... 060.webp.
const framePath = (i: number): string =>
  `/truck-frames/${String(i + 1).padStart(3, '0')}.webp`

// ── Scroll choreography (single sticky section over a ~250vh container) ──
//
//   0.00 – 0.70  ORBIT       camera arcs 180° around the truck
//                            frame index → round((p / 0.70) * 59), clamped
//                            background stays bright (sky from the frames)
//
//   0.70 – 0.85  DARKEN      zinc-950 overlay fades 0 → 1
//                            truck stays at frame 59 (rear view)
//                            truck scale 1.00 → 0.85, opacity 1.00 → 0.15
//
//   0.85 – 1.00  BRAND       brand block fades in, staggered:
//                            wordmark   0.85 → 0.90  (leads)
//                            headline   0.88 → 0.93  (~150ms after wordmark)
//                            sub + CTA  0.91 → 0.97  (last)
//                            each layer translates 40px → 0
//
// Tweak any single number above and the rest stays coherent.
const ORBIT_END = 0.7
const DARKEN_END = 0.85

export function HeroTruckReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])

  const [framesReady, setFramesReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  const reducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = (): void => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const animate = mounted && !isMobile && !reducedMotion

  // Preload every frame up front; only flip framesReady once Promise.all settles.
  useEffect(() => {
    if (!animate) return
    let cancelled = false
    const images: HTMLImageElement[] = []
    const promises: Promise<void>[] = []
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new window.Image()
      img.decoding = 'async'
      img.src = framePath(i)
      images[i] = img
      promises.push(
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve() // tolerate misses so the gate never hangs
        }),
      )
    }
    imagesRef.current = images
    void Promise.all(promises).then(() => {
      if (!cancelled) setFramesReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [animate])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Orbit: progress 0 → 0.70 maps to frame 0 → 59, then clamps at 59.
  const orbitFrame = useTransform(
    scrollYProgress,
    [0, ORBIT_END],
    [0, LAST_FRAME],
    { clamp: true },
  )

  // Darken phase (0.70 → 0.85)
  const overlayOpacity = useTransform(
    scrollYProgress,
    [ORBIT_END, DARKEN_END],
    [0, 1],
    { clamp: true },
  )
  const truckScale = useTransform(
    scrollYProgress,
    [ORBIT_END, DARKEN_END],
    [1, 0.85],
    { clamp: true },
  )
  const truckOpacity = useTransform(
    scrollYProgress,
    [ORBIT_END, DARKEN_END],
    [1, 0.15],
    { clamp: true },
  )

  // Brand reveal (0.85 → 1.00) — staggered by shifted ranges (~150ms feel).
  const wordmarkOpacity = useTransform(scrollYProgress, [0.85, 0.9], [0, 1], {
    clamp: true,
  })
  const wordmarkY = useTransform(scrollYProgress, [0.85, 0.9], [40, 0], {
    clamp: true,
  })
  const headlineOpacity = useTransform(scrollYProgress, [0.88, 0.93], [0, 1], {
    clamp: true,
  })
  const headlineY = useTransform(scrollYProgress, [0.88, 0.93], [40, 0], {
    clamp: true,
  })
  const subOpacity = useTransform(scrollYProgress, [0.91, 0.97], [0, 1], {
    clamp: true,
  })
  const subY = useTransform(scrollYProgress, [0.91, 0.97], [40, 0], {
    clamp: true,
  })

  // ── rAF-throttled canvas paint ─────────────────────────────────────────
  // Listening to orbitFrame fires on every scroll tick; we coalesce into a
  // single rAF callback that reads the latest target index and paints only
  // when the rounded integer index has changed since the last paint.
  const targetIdx = useRef(0)
  const lastPainted = useRef(-1)
  const rafScheduled = useRef(false)

  const schedulePaint = (): void => {
    if (rafScheduled.current) return
    rafScheduled.current = true
    requestAnimationFrame(() => {
      rafScheduled.current = false
      const canvas = canvasRef.current
      if (!canvas) return
      const idx = targetIdx.current
      if (idx === lastPainted.current) return
      paintFrame(canvas, imagesRef.current[idx])
      lastPainted.current = idx
    })
  }

  useMotionValueEvent(orbitFrame, 'change', (latest) => {
    if (!animate || !framesReady) return
    const idx = Math.min(LAST_FRAME, Math.max(0, Math.round(latest)))
    if (idx === targetIdx.current) return
    targetIdx.current = idx
    schedulePaint()
  })

  // Resize → reset DPR-aware canvas size and repaint whatever's current.
  useEffect(() => {
    if (!animate) return
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      const idx = lastPainted.current >= 0 ? lastPainted.current : 0
      paintFrame(canvas, imagesRef.current[idx])
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [animate])

  // Initial paint once frames finish preloading.
  useEffect(() => {
    if (!animate || !framesReady) return
    const canvas = canvasRef.current
    if (!canvas) return
    paintFrame(canvas, imagesRef.current[0])
    lastPainted.current = 0
  }, [animate, framesReady])

  // Mobile + prefers-reduced-motion: skip the whole sequence. Render the
  // side view (frame 030) with the brand block stacked below it.
  if (mounted && !animate) {
    return (
      <section className="relative isolate overflow-hidden bg-zinc-950">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-10 px-6 py-20">
          <Image
            src="/truck-frames/030.webp"
            alt="White Nordhaven truck, side view"
            width={1600}
            height={900}
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="h-auto w-full max-w-3xl object-contain"
          />
          <BrandBlock />
        </div>
      </section>
    )
  }

  return (
    <div ref={containerRef} className="relative h-[250vh] bg-zinc-950">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-zinc-950">
        {/* z-10 — orbiting truck (its frames carry the bright sky for 0.00–0.70) */}
        <motion.canvas
          ref={canvasRef}
          role="img"
          aria-label="White truck rotating from front to rear view"
          style={{ opacity: truckOpacity, scale: truckScale }}
          className="absolute inset-0 z-10 h-full w-full"
        />

        {/* z-20 — zinc-950 overlay fades in during the darken phase (0.70–0.85) */}
        <motion.div
          aria-hidden
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 z-20 bg-zinc-950"
        />

        {/* z-30 — brand reveal sits above the darkened truck (0.85–1.00) */}
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
          <BrandBlock
            motionStyles={{
              wordmark: { opacity: wordmarkOpacity, y: wordmarkY },
              headline: { opacity: headlineOpacity, y: headlineY },
              sub: { opacity: subOpacity, y: subY },
            }}
          />
        </div>

        {/* z-40 — preload skeleton; subtle pulse on bg-zinc-900 until ready */}
        {!framesReady && (
          <div
            aria-hidden
            className="absolute inset-0 z-40 animate-pulse bg-zinc-900"
          />
        )}
      </div>
    </div>
  )
}

function paintFrame(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | undefined,
): void {
  if (!img || !img.complete || img.naturalWidth === 0) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const scale = Math.min(
    canvas.width / img.naturalWidth,
    canvas.height / img.naturalHeight,
  )
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
}

'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'

const FRAME_COUNT = 60

const framePath = (i: number): string =>
  `/truck-frames/${String(i + 1).padStart(3, '0')}.webp`

interface HeroTruckRevealProps {
  children: ReactNode
}

export function HeroTruckReveal({ children }: HeroTruckRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [framesReady, setFramesReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [inView, setInView] = useState(true)
  const reducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = (): void => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const animate = !isMobile && !reducedMotion

  useEffect(() => {
    if (!animate) return
    let cancelled = false
    let loaded = 0
    const images: HTMLImageElement[] = []
    const tick = (): void => {
      if (cancelled) return
      loaded += 1
      if (loaded === FRAME_COUNT) setFramesReady(true)
    }
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new window.Image()
      img.decoding = 'async'
      img.src = framePath(i)
      img.onload = tick
      img.onerror = tick
      images[i] = img
    }
    imagesRef.current = images
    return () => {
      cancelled = true
    }
  }, [animate])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting)
      },
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const frameIndex = useTransform(
    scrollYProgress,
    [0, 0.5],
    [0, FRAME_COUNT - 1],
    { clamp: true },
  )
  const canvasOpacity = useTransform(scrollYProgress, [0.5, 0.55], [1, 0], {
    clamp: true,
  })
  const doorOpacity = useTransform(
    scrollYProgress,
    [0.48, 0.52, 0.95, 1],
    [0, 1, 1, 0],
    { clamp: true },
  )
  const doorRotateLeft = useTransform(scrollYProgress, [0.55, 1], [0, -110], {
    clamp: true,
  })
  const doorRotateRight = useTransform(scrollYProgress, [0.55, 1], [0, 110], {
    clamp: true,
  })
  const contentOpacity = useTransform(scrollYProgress, [0.6, 0.95], [0, 1], {
    clamp: true,
  })
  const contentScale = useTransform(scrollYProgress, [0.6, 1], [0.96, 1], {
    clamp: true,
  })

  useEffect(() => {
    if (!animate) return
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      paintFrame(canvas, imagesRef.current[0])
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [animate])

  useMotionValueEvent(frameIndex, 'change', (latest) => {
    if (!animate || !framesReady || !inView) return
    const canvas = canvasRef.current
    if (!canvas) return
    const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(latest)))
    paintFrame(canvas, imagesRef.current[idx])
  })

  useEffect(() => {
    if (!animate || !framesReady) return
    const canvas = canvasRef.current
    if (!canvas) return
    paintFrame(canvas, imagesRef.current[0])
  }, [animate, framesReady])

  if (!animate) {
    return (
      <>
        <section className="relative isolate min-h-screen overflow-hidden bg-zinc-950">
          <Image
            src="/truck-front.jpg"
            alt="White logistics truck, front-left view"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Nordhaven Logistics
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-100 md:text-6xl">
              Moving cargo. Moving markets.
            </h1>
          </div>
        </section>
        {children}
      </>
    )
  }

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-zinc-950">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-zinc-950">
        <motion.div
          style={{ opacity: contentOpacity, scale: contentScale }}
          className="absolute inset-0 z-0"
        >
          {children}
        </motion.div>

        <motion.canvas
          ref={canvasRef}
          aria-hidden
          style={{ opacity: canvasOpacity }}
          className="absolute inset-0 z-10 h-full w-full"
        />

        <motion.div
          aria-hidden
          style={{ opacity: doorOpacity, perspective: '1500px' }}
          className="pointer-events-none absolute inset-0 z-20 grid grid-cols-2"
        >
          <motion.div
            style={{ rotateY: doorRotateLeft, transformOrigin: 'left center' }}
            className="h-full w-full bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-950 shadow-[inset_-12px_0_36px_rgba(0,0,0,0.7)]"
          />
          <motion.div
            style={{ rotateY: doorRotateRight, transformOrigin: 'right center' }}
            className="h-full w-full bg-gradient-to-l from-zinc-700 via-zinc-800 to-zinc-950 shadow-[inset_12px_0_36px_rgba(0,0,0,0.7)]"
          />
        </motion.div>

        {!framesReady && (
          <div className="absolute inset-0 z-30 bg-zinc-950">
            <Image
              src="/truck-front.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>
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

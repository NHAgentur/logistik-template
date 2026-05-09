'use client'

import { motion, type MotionValue } from 'motion/react'

interface MotionLayer {
  opacity: MotionValue<number>
  y: MotionValue<number>
}

export interface BrandBlockMotion {
  wordmark: MotionLayer
  headline: MotionLayer
  sub: MotionLayer
}

interface BrandBlockProps {
  /**
   * When provided, each layer animates from these motion values (driven by
   * scroll progress in the hero). When omitted, the block renders as plain
   * static flow content.
   */
  motionStyles?: BrandBlockMotion
  className?: string
}

const wordmarkClass =
  'mb-6 text-sm font-light uppercase tracking-[0.3em] text-zinc-100 md:text-base'

const headlineClass =
  'mb-6 text-balance text-5xl font-semibold tracking-tight text-zinc-50 md:text-7xl'

const subWrapperClass = 'flex flex-col items-center'

export function BrandBlock({ motionStyles, className }: BrandBlockProps) {
  return (
    <div
      className={[
        'mx-auto flex max-w-4xl flex-col items-center text-center',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <motion.p style={motionStyles?.wordmark} className={wordmarkClass}>
        NORDHAVEN
      </motion.p>
      <motion.h1 style={motionStyles?.headline} className={headlineClass}>
        Explore the fleet
      </motion.h1>
      <motion.div style={motionStyles?.sub} className={subWrapperClass}>
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-base leading-relaxed text-zinc-400 md:text-lg">
          Pan-European overnight freight, full-truck-load and last-mile delivery —
          operated from twelve hubs, monitored in real time, signed for at every door.
        </p>
        <a
          href="#fleet"
          className="inline-flex rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-100 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
        >
          Discover our trucks
        </a>
      </motion.div>
    </div>
  )
}

import { BrandBlock } from '@/components/brand-block'
import { HeroTruckReveal } from '@/components/hero-truck-reveal'

export default function Page() {
  return (
    <main>
      <a
        href="#after-hero"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-zinc-50 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900"
      >
        Skip animation
      </a>

      <HeroTruckReveal />

      {/* Static duplicate of the brand block — visible once the user scrolls
          past the sticky hero. Same content, no scroll-driven animation. */}
      <section
        id="after-hero"
        className="bg-zinc-950 px-6 py-24 text-zinc-100 md:py-32"
      >
        <BrandBlock />
      </section>
    </main>
  )
}

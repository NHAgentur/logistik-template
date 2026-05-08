import { CompanySection } from '@/components/company-section'
import { HeroTruckReveal } from '@/components/hero-truck-reveal'

export default function Page() {
  return (
    <main>
      <HeroTruckReveal>
        <CompanySection />
      </HeroTruckReveal>
    </main>
  )
}

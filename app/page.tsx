import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Footer } from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

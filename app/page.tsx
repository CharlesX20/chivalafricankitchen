import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/sections/Hero'
import { FeaturedItems } from '@/components/sections/FeaturedItems'
import { About } from '@/components/sections/About'
import { TestimonialsSlider } from '@/components/sections/TestimonialsSlider'
import { FAQ } from '@/components/sections/FAQ'

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <FeaturedItems />
        <About />
        <TestimonialsSlider />
        <FAQ />
      </main>
    </>
  )
}
import { Hero } from '@/components/sections/Hero'
import { FeaturedItems } from '@/components/sections/FeaturedItems'
import { About } from '@/components/sections/About'
import { TestimonialsSlider } from '@/components/sections/TestimonialsSlider'
import { FAQ } from '@/components/sections/FAQ'
import { ExploreMenu } from '@/components/sections/ExploreMenu'

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <FeaturedItems />
        <About />
        <TestimonialsSlider />
        <ExploreMenu />
        <FAQ />
      </main>
    </>
  )
}
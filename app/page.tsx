import { Hero } from '@/components/sections/Hero'
import { FeaturedItems } from '@/components/sections/FeaturedItems'
import { About } from '@/components/sections/About'
import { TestimonialsSlider } from '@/components/sections/TestimonialsSlider'
import { FAQ } from '@/components/sections/FAQ'
import { ExploreMenu } from '@/components/sections/ExploreMenu'
import Script from 'next/script'

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
      <Script
        src="https://pocketreply.tech/embed.js"
        data-agent-id="93dfe804-f398-48e1-8062-2349963eccec"
        data-base-url="https://pocketreply.tech"
        strategy="lazyOnload"
      />
    </>
  )
}
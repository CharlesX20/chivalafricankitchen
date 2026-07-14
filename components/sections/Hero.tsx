'use client'

import Link from 'next/link'
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 150)
            })
          }
        })
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/food_image_1.png" alt="CHIVAL" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
      </div>

      <div className="relative z-10 w-full container-custom py-20 md:py-28 lg:py-36">
        <div className="max-w-2xl lg:max-w-3xl">
          <div className="reveal inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-white/90 text-xs sm:text-sm font-medium tracking-wider">AUTHENTIC NIGERIAN CUISINE</span>
          </div>

          <h1 className="reveal text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-4">
            Taste the <span className="text-gold-gradient">Heart</span><br />
            <span className="text-white/90">of Africa</span>
          </h1>

          <p className="reveal delay-1 text-base sm:text-lg md:text-xl text-white/80 max-w-lg leading-relaxed mb-6">
            Experience premium Nigerian dining in Barrie. Authentic flavors, warm hospitality, and unforgettable meals crafted with love.
          </p>

          <div className="reveal delay-2 flex flex-wrap gap-3 sm:gap-4 mb-8">
            <Link href="/menu" className="group bg-gold-gradient hover:shadow-gold text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium flex items-center gap-2 transition-all hover:scale-105 text-sm sm:text-base">
              Explore Menu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#about" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium border border-white/20 transition-all text-sm sm:text-base">
              Our Story
            </Link>
          </div>

          <div className="reveal delay-3 flex flex-wrap gap-6 sm:gap-8 md:gap-12 pt-6 border-t border-white/20">
            {[
              { icon: Star, label: '340+ Reviews', value: '4.9' },
              { icon: Clock, label: 'Open Daily', value: '12 PM' },
              { icon: MapPin, label: 'Dunlop St E', value: '53' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{item.value}</p>
                    <p className="text-xs sm:text-sm text-white/60">{item.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
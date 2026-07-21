'use client'

import Link from 'next/link'
import { ArrowRight, UtensilsCrossed, Clock, Star, Users, Coffee } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function ExploreMenu() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('visible')
              }, i * 120)
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const highlights = [
    {
      icon: Star,
      label: 'Premium Quality',
      description: 'Fresh, authentic ingredients'
    },
    {
      icon: Clock,
      label: 'Ready on Time',
      description: 'Pickup in 30+ minutes'
    },
    {
      icon: Users,
      label: 'Family Favorites',
      description: 'Loved by 340+ customers'
    },
    {
      icon: Coffee,
      label: 'Drinks & More',
      description: 'Complete dining experience'
    },
  ]

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Left Side - Image */}
          <div className="relative order-2 lg:order-1 px-2 sm:px-0">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl max-w-lg mx-auto lg:max-w-none">
              <img
                src="/menu_image.png"
                alt="CHIVAL African Kitchen and Bar Menu"
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient for text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            
            {/* Floating Card - Hidden on very small screens */}
            <div className="hidden sm:block absolute -bottom-3 sm:-bottom-4 -right-2 sm:-right-4 bg-card rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-4 max-w-[160px] sm:max-w-[180px] border border-border">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-base sm:text-lg text-foreground">20+</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Authentic Dishes</p>
                </div>
              </div>
            </div>

            {/* Floating Card - Mobile version (inline) */}
            <div className="sm:hidden flex items-center justify-center gap-3 mt-4 bg-card rounded-xl shadow-md p-4 border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">20+</p>
                <p className="text-xs text-muted-foreground">Authentic Dishes</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full -z-10" />
            <div className="absolute -bottom-6 sm:-bottom-8 -left-6 sm:-left-8 w-36 h-36 sm:w-48 sm:h-48 bg-primary/5 rounded-full -z-10" />
          </div>

          {/* Right Side - Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            {/* Badge */}
            <div className="reveal inline-block bg-primary/10 text-primary px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-4 sm:mb-5">
              Explore Our Menu
            </div>

            <h2 className="reveal delay-100 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight px-2 sm:px-0">
              Discover the{' '}
              <br className="hidden sm:block" />
              <span className="text-gold-gradient">Flavors of Africa</span>
            </h2>

            <p className="reveal delay-200 text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mt-3 sm:mt-4 mb-5 sm:mb-6 max-w-xl mx-auto lg:mx-0 px-2 sm:px-0">
              From rich Jollof Rice to savory Egusi Soup, our menu brings 
              the authentic taste of Nigeria to Barrie. Each dish is crafted 
              with traditional recipes and premium ingredients.
            </p>

            {/* Highlights Grid */}
            <div className="reveal delay-300 grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8 px-1 sm:px-0">
              {highlights.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="bg-secondary rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-border/50 text-center lg:text-left">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1 sm:mb-1.5 mx-auto lg:mx-0" />
                    <p className="font-semibold text-xs sm:text-sm md:text-base text-foreground">{item.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{item.description}</p>
                  </div>
                )
              })}
            </div>

            {/* CTA Buttons */}
            <div className="reveal delay-400 flex justify-center lg:justify-start">
              <Link
                href="/menu"
                className="bg-gold-gradient hover:shadow-gold text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium flex items-center gap-2 transition-all text-sm sm:text-base"
              >
                View Full Menu
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
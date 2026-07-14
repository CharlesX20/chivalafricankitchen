'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, Award, Heart, Users } from 'lucide-react'

export function About() {
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

  const features = [
    { icon: Award, label: 'Authentic Nigerian Recipes' },
    { icon: Heart, label: 'Premium Quality Ingredients' },
    { icon: Users, label: 'Warm Family Atmosphere' },
    { icon: CheckCircle, label: 'Located in Barrie, ON' },
  ]

  return (
    <section ref={sectionRef} id="about" className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/baby_hero_image2.png"
                alt="CHIVAL African Nigerian Restaurant"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-4 sm:-bottom-6 -right-2 sm:-right-4 bg-card rounded-xl shadow-xl p-3 sm:p-4 max-w-[160px] sm:max-w-[200px] border border-border">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">⭐</span>
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base text-foreground">4.9</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">340+ Reviews</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -left-4 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full -z-10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 sm:w-48 sm:h-48 bg-primary/5 rounded-full -z-10" />
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <span className="inline-block text-primary font-medium text-xs sm:text-sm tracking-widest uppercase">
              About CHIVAL
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-2 leading-tight">
              Authentic Nigerian <br />
              <span className="text-gold-gradient">Cuisine in Barrie</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mt-3 sm:mt-4 mb-4 sm:mb-6">
              At CHIVAL, we bring the rich, diverse flavors of Nigeria to Barrie.
              Every dish tells a story of tradition, culture, and passion for food.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {feature.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex -space-x-2 sm:-space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Trusted by <span className="font-bold text-primary">340+</span> happy customers
              </span>
            </div>
          </div>
        </div>

        {/* Baby Image Banner */}
        <div className="relative mt-12 sm:mt-16 rounded-2xl overflow-hidden shadow-xl">
          <img
            src="/cta_image.jpeg"
            alt=""
            className="w-full h-36 sm:h-48 md:h-64 object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="px-5 sm:px-6 md:px-12">
              <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium max-w-md leading-tight">
                "Where every meal <br />feels like home"
              </p>
              <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-primary mt-2 sm:mt-3 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
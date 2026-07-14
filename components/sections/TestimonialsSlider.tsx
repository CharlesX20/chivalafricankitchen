'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const reviews = [
  { name: "Praissy D.", date: "April 2026", text: "Food is boommmbbbbbb! It's so good. Portion size is good for the price. I will definitely be ordering again." },
  { name: "Devan F.", date: "July 2024", text: "Delicious authentic food, loved every bite :)" },
  { name: "Ella", date: "November 2025", text: "The food taste so good, everything is perfect" },
  { name: "Kelly Lebouc", date: "October 2025", text: "My family and I came here for dinner tonight, and it was such a great choice." },
  { name: "Mary F.", date: "March 2026", text: "This place is a whole vibe and a half. The food is amazing." },
  { name: "Melissa Brunner-Nemes", date: "September 2025", text: "I absolutely love this restaurant and the food." },
  { name: "Active XP", date: "December 2025", text: "Great food, great music, great vibes. Very friendly owners." },
  { name: "Olaniyi Ola", date: "November 2025", text: "The meals are freshly made and topnotch. I will give them 10 of 10." },
  { name: "Leo Okonkwo", date: "October 2025", text: "Best African-Nigerian restaurant I have been to in Canada." },
  { name: "Sabo Iyaba", date: "September 2025", text: "Best Nigerian food in Barrie! The flavors are rich, fresh, and authentic." },
  { name: "eriamiatoe efe", date: "September 2025", text: "Great experience. Authentic Nigerian taste." },
  { name: "Sachana Tracey", date: "August 2025", text: "OMG! As a first time customer I am hooked. It is a must try." },
  { name: "evan ngandjon", date: "May 2026", text: "Best restaurant I've visited in Barrie. I highly recommend her." },
  { name: "Ayorinde Owode", date: "November 2025", text: "Best Nigerian-African restaurant in the whole of Canada." },
  { name: "Nizzy Koncepts", date: "August 2025", text: "Very delicious meals and excellent customer service." },
  { name: "Eze Adaeze", date: "September 2025", text: "Amazing Nigerian restaurant with authentic, flavorful dishes." },
  { name: "Sam Giuliano", date: "September 2025", text: "Best West African meal I have ever had." },
  { name: "Matilda Ajayi", date: "September 2025", text: "Amazing food and great service. The flavor is truly authentic." }
]

export function TestimonialsSlider() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Responsive visible cards
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisible(1)
      else if (window.innerWidth < 1024) setVisible(2)
      else setVisible(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Intersection Observer for reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100)
            })
          }
        })
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const maxIndex = Math.max(0, reviews.length - visible)

  const goToSlide = useCallback((newIndex: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setIndex(newIndex)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  const goNext = useCallback(() => {
    goToSlide(index >= maxIndex ? 0 : index + 1)
  }, [index, maxIndex, goToSlide])

  const goPrev = useCallback(() => {
    goToSlide(index <= 0 ? maxIndex : index - 1)
  }, [index, maxIndex, goToSlide])

  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused) {
      autoSlideRef.current = setInterval(goNext, 4000)
    }
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
    }
  }, [isPaused, goNext])

  // Touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goNext()
      } else {
        goPrev()
      }
    }
    
    // Resume auto-slide after 3 seconds of no interaction
    setTimeout(() => setIsPaused(false), 3000)
  }

  const visibleReviews = reviews.slice(index, index + visible)

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-secondary overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 reveal">
          <span className="inline-block text-primary font-medium text-xs sm:text-sm tracking-widest uppercase">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">
            What Our <span className="text-gold-gradient">Customers Say</span>
          </h2>
        </div>

        {/* Slider Container */}
        <div 
          className="relative reveal"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows - Now visible on ALL devices */}
          {reviews.length > visible && (
            <>
              <button 
                onClick={goPrev} 
                disabled={isAnimating}
                className="absolute -left-2 sm:-left-4 md:-left-5 top-1/2 -translate-y-1/2 z-10 bg-card hover:bg-gold-gradient border border-border hover:border-transparent rounded-full p-2 sm:p-2.5 md:p-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-white transition-colors" />
              </button>
              <button 
                onClick={goNext} 
                disabled={isAnimating}
                className="absolute -right-2 sm:-right-4 md:-right-5 top-1/2 -translate-y-1/2 z-10 bg-card hover:bg-gold-gradient border border-border hover:border-transparent rounded-full p-2 sm:p-2.5 md:p-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 group"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-white transition-colors" />
              </button>
            </>
          )}

          {/* Cards Container */}
          <div className="overflow-hidden px-2 sm:px-4 md:px-6">
            <div 
              className="grid gap-3 sm:gap-4 md:gap-6 transition-all duration-500 ease-in-out"
              style={{ 
                gridTemplateColumns: `repeat(${visible}, 1fr)`,
                transform: `translateX(0)`,
                opacity: isAnimating ? 0.8 : 1
              }}
            >
              {visibleReviews.map((review, i) => (
                <div 
                  key={`${index}-${i}`} 
                  className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 border border-border animate-in slide-in-from-right duration-500"
                >
                  {/* Quote Icon & User Info */}
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  
                  {/* Stars */}
                  <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${i <= 5 ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} 
                      />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-xs sm:text-sm md:text-base text-foreground/80 leading-relaxed line-clamp-4 sm:line-clamp-none">
                    &quot;{review.text}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        {reviews.length > visible && (
          <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 reveal">
            {/* Mobile: Show current position */}
            
            {/* Dots */}
            <div className="flex gap-1.5 sm:gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => goToSlide(i)} 
                  disabled={isAnimating}
                  className={`rounded-full transition-all duration-300 ${
                    i === index 
                      ? 'bg-primary w-5 sm:w-6 h-1.5 sm:h-2' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/60 w-1.5 sm:w-2 h-1.5 sm:h-2'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            
            {/* Pause/Play indicator */}
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 sm:ml-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isPaused ? 'Resume auto-slide' : 'Pause auto-slide'}
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
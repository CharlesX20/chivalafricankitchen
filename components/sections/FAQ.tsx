'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: "What type of cuisine does CHIVAL serve?",
    answer: "CHIVAL specializes in authentic Nigerian and African cuisine. We offer a wide range of traditional dishes including Jollof Rice, Egusi Soup, Fried Rice, various protein options, and traditional Nigerian drinks."
  },
  {
    question: "Where is CHIVAL located?",
    answer: "We are located at 53 Dunlop St E, Barrie, ON L4M 1A2. We have front parking available and additional parking at the back, free after 5 PM."
  },
  {
    question: "What are your operating hours?",
    answer: "We are open daily from 12:00 PM to 11:59 PM. Come enjoy authentic Nigerian cuisine at your convenience."
  },
  {
    question: "Do you offer takeout?",
    answer: "Yes! We offer takeout services. You can place your order online through our menu page and pick it up at your convenience."
  },
  {
    question: "Do you cater events?",
    answer: "Yes, we provide catering services for private events. Please contact us directly at 647-704-0171 for catering inquiries and custom orders."
  },
  {
    question: "What makes your Jollof Rice special?",
    answer: "Our Jollof Rice is made using authentic Nigerian party-style recipes, slow-cooked in a rich tomato and pepper sauce for a deep, smoky flavor that our customers love."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('visible')
              }, i * 100)
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

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-block text-primary font-medium text-xs sm:text-sm tracking-widest uppercase">
            Help Center
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-2">
            Frequently Asked <span className="text-gold-gradient">Questions</span>
          </h2>
          <p className="text-muted-foreground mt-2 sm:mt-3 max-w-md mx-auto text-sm sm:text-base">
            Everything you need to know about CHIVAL
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
              >
                <span className="font-medium text-sm sm:text-base text-foreground">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ml-4 ${
                    openIndex === index ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-0 sm:pt-1">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
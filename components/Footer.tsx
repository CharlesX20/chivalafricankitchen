'use client'

import Link from 'next/link'
import { Phone, MapPin, Clock, Heart } from 'lucide-react'
import { InstagramIcon } from './icons/InstagramIcon'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  const year = new Date().getFullYear()
  
  // Don't render on admin pages - MUST be after all hooks
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Improved grid with better responsive breakpoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Column - Takes more space on large screens */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/icon.png" 
                alt="CHIVAL" 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain" 
              />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gold-gradient">
                CHIVAL
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs sm:max-w-sm">
              Authentic Nigerian cuisine in the heart of Barrie. 
              Premium dining experience with unforgettable flavors.
            </p>
            {/* Social icons with consistent spacing */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/16477040171"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-background hover:bg-gold-gradient rounded-xl transition-all duration-300 border border-border hover:border-transparent group"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/chivalrestaurant"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-background hover:bg-gold-gradient rounded-xl transition-all duration-300 border border-border hover:border-transparent group"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground transition-colors" />
              </a>
              <a
                href="tel:16477040171"
                className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-background hover:bg-gold-gradient rounded-xl transition-all duration-300 border border-border hover:border-transparent group"
                aria-label="Phone"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-foreground transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links - Better responsive spacing */}
          <div className="lg:col-span-3">
            <h4 className="text-foreground font-semibold text-base md:text-lg mb-4 md:mb-6">
              Quick Links
            </h4>
            <ul className="space-y-2.5 md:space-y-3">
              {[
                { href: "/menu", text: "Menu" },
                { href: "/orders", text: "My Orders" },
                { href: "#about", text: "About Us" },
                { href: "#contact", text: "Contact" }
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 text-sm group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Better responsive spacing */}
          <div className="lg:col-span-4">
            <h4 className="text-foreground font-semibold text-base md:text-lg mb-4 md:mb-6">
              Contact
            </h4>
            <ul className="space-y-4 md:space-y-5">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <a 
                    href="tel:16477040171" 
                    className="text-foreground hover:text-primary transition-colors font-medium text-sm break-words"
                  >
                    647-704-0171
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p className="text-foreground font-medium text-sm">
                    53 Dunlop St E<br />
                    Barrie, ON L4M 1A2
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Hours</p>
                  <p className="text-foreground font-medium text-sm">
                    Open Daily • 12:00 PM – 11:59 PM
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Improved responsive alignment */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Copyright - Left aligned on desktop, centered on mobile */}
            <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
              © {year} CHIVAL African Nigerian Restaurant. All rights reserved.
            </p>
            
            {/* Links - Centered */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground order-1 sm:order-2">
              <Link 
                href="/privacy" 
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" aria-hidden="true" />
              <Link 
                href="/terms" 
                className="hover:text-primary transition-colors"
              >
                Terms
              </Link>
            </div>
            
            {/* Made with love - Right aligned on desktop, centered on mobile */}
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 order-3">
              Made with 
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary inline-block" /> 
              in Barrie
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
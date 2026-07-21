'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ShoppingBag, User, LogOut } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { AuthModal } from './auth/AuthModal'
import { getCurrentUser, signOut } from '@/lib/actions/auth'
import { isAdmin } from '@/lib/admin'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Check if we're on the homepage (where hero image exists)
  const isHomePage = pathname === '/'

  // Check if we're on admin pages
  const isAdminPage = pathname?.startsWith('/admin')

  // Only use transparent mode on homepage when not scrolled
  const isTransparent = isHomePage && !scrolled

  useEffect(() => {
    // Don't run effects on admin pages
    if (isAdminPage) return

    loadUser()
    updateCartCount()
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('cartUpdated', updateCartCount)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [isAdminPage])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  async function loadUser() {
    const u = await getCurrentUser()
    setUser(u)
    if (u) setIsAdminUser(isAdmin(u.email))
  }

  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.length)
    } catch { setCartCount(0) }
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setIsAdminUser(false)
    setIsOpen(false)
    router.push('/')
  }

  const closeMenu = () => setIsOpen(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/orders', label: 'Orders' },
  ]

  // Don't render anything on admin pages
  if (isAdminPage) {
    return null
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent
        ? 'bg-transparent'
        : 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border'
        }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 group select-none">
              {/* Logo Icon Container - Scales from 36px on mobile to 44px on desktop */}
              <div className="relative w-9 h-9 md:w-11 md:h-11 shrink-0">
                <img
                  src="/icon.png"
                  alt="CHIVAL"
                  className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Stacked Text Brand Container */}
              <div className="flex flex-col justify-center leading-none">
                {/* Headline: CHIVAL */}
                <span className={`text-lg md:text-xl font-black tracking-wider uppercase transition-colors duration-300 ${isTransparent
                    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
                    : 'text-gold-gradient'
                  }`}>
                  CHIVAL
                </span>

                {/* Subheadline: African Kitchen & Bar */}
                <span className={`text-[9px] md:text-[10px] font-bold tracking-[0.12em] uppercase whitespace-nowrap mt-0.5 transition-colors duration-300 ${isTransparent
                    ? 'text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                    : 'text-muted-foreground/90 dark:text-amber-500/80'
                  }`}>
                  African Kitchen & Bar
                </span>
              </div>
            </Link>


            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors relative py-1 group ${pathname === link.href
                  ? 'text-primary'
                  : isTransparent
                    ? 'text-white/90 hover:text-white'
                    : 'text-foreground hover:text-primary'
                  }`}>
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                </Link>
              ))}
              {isAdminUser && (
                <Link href="/admin/dashboard" className={`text-sm font-medium ${isTransparent ? 'text-white/90 hover:text-white' : 'text-primary hover:text-primary/80'
                  }`}>Admin</Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              {/* Cart */}
              <Link href="/cart" className="relative p-2 rounded-full transition-colors">
                <ShoppingBag className={`w-5 h-5 ${isTransparent ? 'text-white' : 'text-foreground'}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu - Desktop */}
              {user ? (
                <div className="relative group hidden sm:block">
                  <button className="p-2 rounded-full transition-colors">
                    <User className={`w-5 h-5 ${isTransparent ? 'text-white' : 'text-foreground'}`} />
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-2xl border border-border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-secondary transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsAuthOpen(true)} className={`hidden sm:block px-4 py-2 rounded-full text-sm font-medium transition-all ${isTransparent
                  ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                  : 'bg-gold-gradient text-white hover:shadow-gold'
                  }`}>Sign In</button>
              )}

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsOpen(true)}
                className={`md:hidden p-2 rounded-full transition-colors ${isTransparent ? 'text-white' : 'text-foreground'
                  }`}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Popup Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMenu}
          />

          {/* Popup Window */}
          <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-300">
            {/* Decorative top bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full mt-3" />

            {/* Close Button */}
            <button
              onClick={closeMenu}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors text-foreground z-10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo in Popup */}
            <div className="text-center pt-8 pb-4">
              <img src="/icon.png" alt="CHIVAL" className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xl font-bold text-gold-gradient">CHIVAL</span>
            </div>

            {/* Navigation Links */}
            <nav className="px-6 pb-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all ${pathname === link.href
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-foreground hover:bg-secondary'
                    }`}
                >
                  {/* Icon based on link */}
                  <span className="mr-3 text-lg">
                    {link.href === '/' ? '🏠' : link.href === '/menu' ? '🍽️' : '📋'}
                  </span>
                  {link.label}
                </Link>
              ))}

              {isAdminUser && (
                <Link
                  href="/admin/dashboard"
                  onClick={closeMenu}
                  className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-primary hover:bg-primary/10 transition-all"
                >
                  <span className="mr-3 text-lg">⚙️</span>
                  Admin Dashboard
                </Link>
              )}
            </nav>

            {/* User Section */}
            <div className="px-6 pb-6">
              <div className="border-t border-border pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-3 bg-secondary rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      closeMenu()
                      setIsAuthOpen(true)
                    }}
                    className="w-full px-4 py-3.5 rounded-xl text-base font-medium bg-gold-gradient text-white hover:shadow-gold transition-all"
                  >
                    Sign In to Your Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={loadUser}
      />
    </>
  )
}
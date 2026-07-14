'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isRestaurantOpen } from '@/lib/actions/settings'

interface ClosedBannerProps {
  children: React.ReactNode
}

export function RestaurantClosedBanner({ children }: ClosedBannerProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [nextOpenTime, setNextOpenTime] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    // Skip restaurant check on admin pages
    if (isAdminPage) {
      setLoading(false)
      return
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [isAdminPage])

  useEffect(() => {
    if (nextOpenTime) {
      const timer = setInterval(updateCountdown, 1000)
      return () => clearInterval(timer)
    }
  }, [nextOpenTime])

  async function checkStatus() {
    const result = await isRestaurantOpen()
    setIsOpen(result.open)
    setNextOpenTime(result.nextOpenTime || null)
    setLoading(false)
    if (result.nextOpenTime) {
      updateCountdown()
    }
  }

  function updateCountdown() {
    if (!nextOpenTime) return
    const now = new Date()
    const target = new Date(nextOpenTime)
    const diff = Math.max(0, target.getTime() - now.getTime())
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      setCountdown(`${hours}h ${minutes}m ${seconds}s`)
    } else if (minutes > 0) {
      setCountdown(`${minutes}m ${seconds}s`)
    } else {
      setCountdown(`${seconds}s`)
    }
  }

  // Don't show banner on admin pages or while loading
  if (isAdminPage || loading) {
    return <>{children}</>
  }

  // Show closed banner for everyone when restaurant is closed
  if (isOpen === false) {
    const targetDate = nextOpenTime ? new Date(nextOpenTime) : null
    const openTimeStr = targetDate 
      ? targetDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : ''

    return (
      <>
        {/* Closed Banner Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full mx-4 text-center">
            <img
              src="/baby_sleep_image1.png"
              alt="Restaurant Closed"
              className="w-full max-w-xs mx-auto mb-6 rounded-2xl shadow-2xl"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              We Are Closed
            </h1>
            {countdown && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
                <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Opens in</p>
                <p className="text-2xl font-bold text-white font-mono">{countdown}</p>
              </div>
            )}
            <p className="text-white/40 text-sm">
              We're resting and preparing delicious meals for you.
              <br />
              Please check back soon!
            </p>
          </div>
        </div>

        {/* Content behind overlay */}
        <div className="pointer-events-none opacity-50">{children}</div>
      </>
    )
  }

  // Restaurant is open, show normally
  return <>{children}</>
}
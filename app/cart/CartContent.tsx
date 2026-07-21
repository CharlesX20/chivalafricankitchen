'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { createOrderWithCheckout } from '@/lib/actions/order'
import { getCurrentUser } from '@/lib/actions/auth'
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Clock, Truck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { isRestaurantOpen } from '@/lib/actions/settings'
import { AuthModal } from '@/components/auth/AuthModal'

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
}

export default function CartContent() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [pickupTime, setPickupTime] = useState<string>('')
  const [minTime, setMinTime] = useState<string>('')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadCart()
    checkUser()
    setMinPickupTime()
  }, [])

  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    if (canceled === 'true') {
      const pendingOrderId = localStorage.getItem('pending_order_id')
      if (pendingOrderId) {
        fetch('/api/cancel-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: pendingOrderId }),
        })
          .then(() => {
            localStorage.removeItem('pending_order_id')
            toast.info('Your order has been cancelled')
          })
          .catch(() => {
            toast.error('Failed to cancel order')
          })
      }
    }
  }, [canceled])

  function loadCart() {
    try {
      const data = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(data)
    } catch {
      setCart([])
    }
  }

  async function checkUser() {
    const u = await getCurrentUser()
    setUser(u)
    setIsCheckingAuth(false)
  }

  function setMinPickupTime() {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`
    setMinTime(minDateTime)
    setPickupTime(minDateTime)
  }

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success('Item removed from cart')
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthOpen(true)
      return
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    const { open, nextOpenTime } = await isRestaurantOpen()
    if (!open) {
      const openTime = nextOpenTime
        ? new Date(nextOpenTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' })
        : 'opening time'
      toast.error(`We are currently closed. We'll reopen at ${openTime}.`)
      return
    }

    if (!pickupTime) {
      toast.error('Please select a pickup time')
      return
    }

    const selectedTime = new Date(pickupTime)
    const now = new Date()
    const diffMinutes = (selectedTime.getTime() - now.getTime()) / 60000
    if (diffMinutes < 30) {
      toast.error('Pickup time must be at least 30 minutes from now')
      return
    }

    const pickupTimeUTC = selectedTime.toISOString()

    setLoading(true)

    try {
      const result = await createOrderWithCheckout({
        customer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
        customer_email: user.email,
        customer_phone: user.user_metadata?.phone || '',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url || undefined,
        })),
        subtotal: subtotal,
        total: total,
        pickup_time: pickupTimeUTC,
      })

      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }

      if (result.url) {
        if (result.order && result.order.id) {
          localStorage.setItem('pending_order_id', result.order.id)
        }
        window.location.href = result.url
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <>
        <div className="min-h-screen pt-20 flex items-center justify-center bg-background">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Browse our menu and add your favorite dishes.</p>
            <Link href="/menu" className="bg-gold-gradient text-white px-6 py-3 rounded-full font-medium hover:shadow-gold transition-all inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Browse Menu
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <main className="pt-16 md:pt-20 min-h-screen mb-12 bg-background">
        <div className="container-custom py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 mt-12">
              <Link href="/menu" className="text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold">Your Cart</h1>
            </div>

            <a
              href="https://www.ubereats.com/ca/store/african-nigerian-restaurant/q_j7H7trQsidF5Jrk7Ictg?diningMode=DELIVERY&ps=1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors bg-secondary px-4 py-2 rounded-full"
            >
              <Truck className="w-4 h-4" />
              <span>Delivery via Uber Eats</span>
              <AlertCircle className="w-3 h-3" />
            </a>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 transition-all hover:shadow-md"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base text-foreground truncate">{item.name}</h3>
                    <p className="text-primary font-bold text-sm sm:text-base">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 sm:gap-2 bg-secondary rounded-full p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      </button>
                      <span className="text-sm sm:text-base font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 sm:p-2 rounded-full hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 sticky top-24">
                <h3 className="text-lg font-bold mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Fee</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1.5 text-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Pickup Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min={minTime}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 30 minutes from now
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full mt-4 bg-gold-gradient text-white py-3 rounded-xl font-medium hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  You will be redirected to secure payment
                </p>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    <span className="font-medium text-foreground">Pickup Location:</span><br />
                    53 Dunlop St E, Barrie, ON L4M 1A2
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={async () => {
          const u = await getCurrentUser()
          setUser(u)
        }}
      />
    </>
  )
}
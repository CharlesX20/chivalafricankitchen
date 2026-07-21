'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getOrderByStripeSessionId, getUserOrders } from '@/lib/actions/order'
import { getCurrentUser } from '@/lib/actions/auth'
import { Order } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Clock, MapPin, Package, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(5)
  const [cartCleared, setCartCleared] = useState(false)

  useEffect(() => {
    clearCart()
  }, [])

  function clearCart() {
    if (cartCleared) return
    try {
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cartUpdated'))
      setCartCleared(true)
    } catch (e) {
      console.error('Error clearing cart:', e)
    }
  }

  useEffect(() => {
    async function fetchOrder() {
      if (!sessionId) {
        setError('No session ID found')
        setLoading(false)
        return
      }

      try {
        let orderData = await getOrderByStripeSessionId(sessionId)
        
        if (orderData) {
          setOrder(orderData)
          setLoading(false)
          return
        }

        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            fetchOrder()
          }, 2000)
          return
        }

        const user = await getCurrentUser()
        if (user) {
          const orders = await getUserOrders()
          const pendingOrder = orders.find(o => o.status === 'pending')
          
          if (pendingOrder) {
            try {
              const confirmResponse = await fetch('/api/confirm-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: pendingOrder.id,
                  sessionId: sessionId,
                  customerPhone: user.phone || '',
                }),
              })
              const confirmResult = await confirmResponse.json()
              if (confirmResult.success && confirmResult.order) {
                setOrder(confirmResult.order)
                setLoading(false)
                return
              }
            } catch (confirmError) {
              console.error('Manual confirmation failed:', confirmError)
            }
          }
        }

        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            fetchOrder()
          }, 2000)
          return
        }

        if (user) {
          const orders = await getUserOrders()
          const recentOrder = orders.find(o => 
            o.status === 'pending' || o.status === 'confirmed'
          )
          if (recentOrder) {
            setOrder(recentOrder)
            setLoading(false)
            return
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Error fetching order:', err)
        setLoading(false)
      }
    }

    if (sessionId && retryCount <= maxRetries) {
      fetchOrder()
    } else if (sessionId && retryCount > maxRetries) {
      setLoading(false)
    }
  }, [sessionId, retryCount])

  const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500' },
    confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
    preparing: { label: 'Preparing', icon: Package, color: 'text-purple-500' },
    ready: { label: 'Ready for Pickup', icon: CheckCircle, color: 'text-green-500' },
    cancelled: { label: 'Cancelled', icon: Package, color: 'text-red-500' },
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Processing your order...</p>
            {retryCount > 0 && retryCount <= maxRetries && (
              <p className="text-xs text-muted-foreground mt-2">
                Confirming your order... ({retryCount}/{maxRetries})
              </p>
            )}
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (order) {
    const StatusIcon = statusConfig[order.status]?.icon || Package
    const statusColor = statusConfig[order.status]?.color || 'text-gray-500'
    const statusLabel = statusConfig[order.status]?.label || order.status

    return (
      <>
        <Navbar />
        <main className="pt-16 md:pt-20 min-h-screen bg-background">
          <div className="container-custom py-8 sm:py-12">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gold-gradient">
                  Order Confirmed! 🎉
                </h1>
                <p className="text-muted-foreground mt-2">
                  Your order has been received and is being prepared.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">Order #{order.order_number}</h2>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                    <span className={`text-sm font-medium capitalize ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Items</span>
                    <span>{order.items.length} items</span>
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 text-sm pl-4">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t border-border font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {order.pickup_time && (
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Pickup Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pickup Time</span>
                      <span className="font-medium">
                        {new Date(order.pickup_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">53 Dunlop St E, Barrie, ON</span>
                    </div>
                    {order.customer_phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{order.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/orders"
                  className="flex-1 bg-gold-gradient text-white py-3 rounded-xl font-medium hover:shadow-gold transition-all text-center"
                >
                  View My Orders
                </Link>
                <Link
                  href="/menu"
                  className="flex-1 border border-border py-3 rounded-xl font-medium hover:bg-secondary transition-all text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Processing</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'Your order is being processed. You will receive a confirmation email shortly.'}
          </p>
          <div className="space-y-3">
            <Link 
              href="/orders" 
              className="block w-full bg-gold-gradient text-white py-3 rounded-xl font-medium hover:shadow-gold transition-all text-center"
            >
              View My Orders
            </Link>
            <Link 
              href="/menu" 
              className="block w-full border border-border py-3 rounded-xl font-medium hover:bg-secondary transition-all text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
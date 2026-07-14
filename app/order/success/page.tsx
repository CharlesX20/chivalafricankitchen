'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getOrderByStripeSessionId } from '@/lib/actions/order'
import { getCurrentUser } from '@/lib/actions/auth'
import { Order } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Clock, MapPin, Package, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    async function fetchOrder() {
      if (!sessionId) {
        setError('No session ID found')
        setLoading(false)
        return
      }

      try {
        // First, check if we can find the order
        const orderData = await getOrderByStripeSessionId(sessionId)
        
        if (orderData) {
          setOrder(orderData)
          // Clear cart after successful order
          localStorage.removeItem('cart')
          window.dispatchEvent(new Event('cartUpdated'))
          setLoading(false)
          return
        }

        // If not found, wait and retry (webhook might still be processing)
        if (retryCount < 5) {
          setRetryCount(prev => prev + 1)
          // Wait 2 seconds before retrying
          setTimeout(() => {
            fetchOrder()
          }, 2000)
          return
        }

        // After 5 retries, try to get the user's recent orders
        const user = await getCurrentUser()
        if (user) {
          // User is logged in, try to find their most recent pending order
          const { getUserOrders } = await import('@/lib/actions/order')
          const orders = await getUserOrders()
          const recentOrder = orders.find(o => o.status === 'pending' || o.status === 'confirmed')
          if (recentOrder) {
            setOrder(recentOrder)
            localStorage.removeItem('cart')
            window.dispatchEvent(new Event('cartUpdated'))
            setLoading(false)
            return
          }
        }

        setError('Order not found. Please check your email for confirmation.')
        setLoading(false)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Failed to load order details')
        setLoading(false)
      }
    }

    fetchOrder()
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
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading your order...</p>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Waiting for payment confirmation... ({retryCount}/5)
              </p>
            )}
          </div>
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
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
      </>
    )
  }

  const StatusIcon = statusConfig[order.status]?.icon || Package
  const statusColor = statusConfig[order.status]?.color || 'text-gray-500'
  const statusLabel = statusConfig[order.status]?.label || order.status

  return (
    <>
      <main className="pt-16 md:pt-20 min-h-screen bg-background">
        <div className="container-custom py-8 sm:py-12">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
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

            {/* Order Details */}
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

            {/* Pickup Info */}
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
                </div>
              </div>
            )}

            {/* Actions */}
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
    </>
  )
}
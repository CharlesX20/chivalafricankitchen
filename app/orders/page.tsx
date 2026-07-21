'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getUserOrders } from '@/lib/actions/order'
import { getCurrentUser } from '@/lib/actions/auth'
import { Order } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils'
import { Clock, Package, CheckCircle, XCircle, ArrowLeft, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  preparing: { label: 'Preparing', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ready: { label: 'Ready for Pickup', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
}

// Helper function to format pickup time consistently
// Helper function to format pickup time - display in local timezone
function formatPickupTime(pickupTime: string): string {
  if (!pickupTime) return ''
  
  try {
    // Parse the UTC time and convert to local timezone
    const date = new Date(pickupTime)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return pickupTime
    }
    
    // Get the local time string
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const pickupDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    let dayStr = ''
    if (pickupDate.getTime() === today.getTime()) {
      dayStr = 'Today'
    } else if (pickupDate.getTime() === tomorrow.getTime()) {
      dayStr = 'Tomorrow'
    } else {
      dayStr = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
    
    // Display in local timezone (America/Toronto)
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Toronto'
    })
    
    return `${dayStr} at ${timeStr}`
  } catch (e) {
    return pickupTime
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    checkAuth()
    setupRealtime()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  async function checkAuth() {
    const userData = await getCurrentUser()
    if (!userData) {
      router.push('/')
      return
    }
    await loadOrders()
  }

  async function loadOrders() {
    const data = await getUserOrders()
    setOrders(data)
    setLoading(false)
  }

  function setupRealtime() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel('user-orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === payload.new.id ? payload.new as Order : order
            )
          )
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      </>
    )
  }

  return (
    <>
      <main className="pt-16 md:pt-20 mb-20 min-h-screen bg-background">
        <div className="container-custom py-8 sm:py-12">
          <div className="flex items-center gap-4 mb-6 mt-12">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
              <Link href="/menu" className="bg-gold-gradient text-white px-6 py-3 rounded-full font-medium hover:shadow-gold transition-all inline-flex items-center gap-2">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.status]?.icon || Package
                const statusColor = statusConfig[order.status]?.color || 'text-gray-500'
                const statusLabel = statusConfig[order.status]?.label || order.status
                const statusBg = statusConfig[order.status]?.bg || 'bg-secondary'

                return (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-2xl p-5 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="font-medium text-sm sm:text-base">Order #{order.order_number}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBg}`}>
                        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                        <span className={`text-sm font-medium capitalize ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="text-xs sm:text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>

                    {/* Pickup Time - Fixed Format */}
                    {order.pickup_time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          Pickup: <span className="font-medium text-foreground">
                            {formatPickupTime(order.pickup_time)}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>53 Dunlop St E, Barrie, ON</span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
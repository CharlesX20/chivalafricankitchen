'use client'

import { useEffect, useState, useRef } from 'react'
import { getAllOrders, updateOrderStatus } from '@/lib/actions/order'
import { Order } from '@/lib/types/order'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Clock, Package, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'cancelled'] as const
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  preparing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}
const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  cancelled: 'Cancelled',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    loadOrders()
    setupRealtime()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  async function loadOrders() {
    const data = await getAllOrders()
    setOrders(data)
    setLoading(false)
  }

  function setupRealtime() {
    // Remove existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Create new channel
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadOrders()
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    channelRef.current = channel
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId)
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      toast.success(`Order status updated to ${statusLabels[newStatus]}`)
      await loadOrders()
    } else {
      toast.error(result.error || 'Failed to update status')
    }
    setUpdating(null)
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="space-y-3 sm:space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Order Header - Click to expand */}
            <div
              className="p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              onClick={() => toggleExpand(order.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-medium text-sm sm:text-base">#{order.order_number}</p>
                  <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {order.customer_name} • {order.customer_phone}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                {expandedOrder === order.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedOrder === order.id && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Customer Details */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Customer Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm bg-secondary rounded-xl p-3">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{order.customer_name}</span>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium truncate">{order.customer_email}</span>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{order.customer_phone}</span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Items</h4>
                  <div className="space-y-1 bg-secondary rounded-xl p-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(order.id, status)}
                        disabled={updating === order.id || order.status === status}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm capitalize transition-all ${
                          order.status === status
                            ? 'bg-gold-gradient text-white shadow-gold'
                            : 'bg-secondary hover:bg-primary/10 text-foreground'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updating === order.id && order.status !== status ? '...' : statusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No orders yet</p>
        )}
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { getAllOrders } from '@/lib/actions/order'
import { getMenuItems } from '@/lib/actions/menu'
import { Order } from '@/lib/types/order'
import { MenuItem } from '@/lib/types/menu'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Package, UtensilsCrossed, Clock, CheckCircle, DollarSign } from 'lucide-react'

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    loadData()
    setupRealtime()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  async function loadData() {
    const [userData, ordersData, menuData] = await Promise.all([
      getCurrentUser(),
      getAllOrders(),
      getMenuItems(),
    ])
    setUser(userData)
    setOrders(ordersData)
    setMenuItems(menuData)
    setLoading(false)
  }

  function setupRealtime() {
    // Remove existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Create new channel
    const channel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadData()
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    channelRef.current = channel
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed')
  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const readyOrders = orders.filter(o => o.status === 'ready')
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-500' },
    { label: 'Not Ready', value: pendingOrders.length, icon: Clock, color: 'text-yellow-500' },
    { label: 'Preparing', value: preparingOrders.length, icon: Clock, color: 'text-purple-500' },
    { label: 'Ready for Pickup', value: readyOrders.length, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Menu Items', value: menuItems.length, icon: UtensilsCrossed, color: 'text-primary' },
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-emerald-500' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.email?.split('@')[0] || 'Admin'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-3 md:p-4">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] md:text-xs text-muted-foreground truncate">{stat.label}</span>
              </div>
              <p className="text-lg md:text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4 md:p-6">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex justify-between items-center py-2 border-b border-border last:border-0 cursor-pointer hover:bg-secondary px-2 rounded transition-colors"
              onClick={() => router.push('/admin/orders')}
            >
              <div>
                <p className="font-medium text-sm">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} items • {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                <span className={`text-[10px] capitalize px-2 py-0.5 rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'preparing' ? 'bg-purple-100 text-purple-700' :
                  order.status === 'ready' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No orders yet</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 md:p-6">
          <h2 className="font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-bold">{formatPrice(totalRevenue)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Average Order Value</span>
              <span className="font-bold">
                {orders.length > 0 ? formatPrice(totalRevenue / orders.length) : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Menu Categories</span>
              <span className="font-bold">
                {new Set(menuItems.map(i => i.category)).size}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Featured Items</span>
              <span className="font-bold">
                {menuItems.filter(i => i.is_featured).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
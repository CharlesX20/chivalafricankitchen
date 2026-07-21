'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { CreateOrderInput, Order } from '@/lib/types/order'
import { isUserAdmin, getCurrentUser } from '@/lib/actions/auth'
import { generateOrderNumber } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

// ============================================
// Get user's orders - Uses admin client to bypass RLS
// ============================================
export async function getUserOrders(): Promise<Order[]> {
  const user = await getCurrentUser()
  if (!user) {
    console.log('No user found in getUserOrders')
    return []
  }

  console.log('Getting orders for user:', user.id, user.email)

  // Use admin client to bypass RLS and get all orders for this user
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  console.log('Orders found:', data?.length || 0)
  return data || []
}

// ============================================
// Get single order by ID - Uses admin client
// ============================================
export async function getOrderById(orderId: string): Promise<Order | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
}

// ============================================
// Get order by Stripe session ID - Uses admin client
// ============================================
export async function getOrderByStripeSessionId(sessionId: string): Promise<Order | null> {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('orders')
      .select('*')
      .eq('stripe_payment_id', sessionId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching order by stripe session:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Error in getOrderByStripeSessionId:', error)
    return null
  }
}

// ============================================
// ADMIN: Get all orders
// ============================================
export async function getAllOrders(): Promise<Order[]> {
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return []
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all orders:', error)
    return []
  }

  return data || []
}

// ============================================
// ADMIN: Update order status
// ============================================
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const isAdmin = await isUserAdmin()
  if (!isAdmin) {
    return { error: 'Unauthorized: Admin access required' }
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    return { error: 'Failed to update order status' }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/orders')
  return { data, success: true }
}

// ============================================
// Create order with Stripe checkout
// ============================================
export async function createOrderWithCheckout(input: CreateOrderInput) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: 'You must be logged in to place an order' }
  }

  // Validate pickup time (at least 30 minutes from now)
  const pickupTime = new Date(input.pickup_time)
  const now = new Date()
  const diffMinutes = (pickupTime.getTime() - now.getTime()) / 60000
  if (diffMinutes < 30) {
    return { error: 'Pickup time must be at least 30 minutes from now' }
  }

  const adminClient = createAdminClient()
  const orderNumber = generateOrderNumber()

  console.log('Creating order for user:', user.id, user.email)
  console.log('Customer phone:', input.customer_phone)

  // Create order in database using admin client
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      user_id: user.id,
      order_number: orderNumber,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone || '',
      items: input.items,
      subtotal: input.subtotal,
      total: input.total,
      pickup_time: input.pickup_time,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    return { error: 'Failed to create order' }
  }

  console.log('Order created:', order.id, order.order_number)
  console.log('Order phone saved:', order.customer_phone)

  // Create Stripe checkout session
  const { createCheckoutSession } = await import('@/lib/stripe')
  
  const session = await createCheckoutSession({
    items: input.items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image_url,
    })),
    customerEmail: input.customer_email,
    customerName: input.customer_name,
    customerPhone: input.customer_phone || '',
    orderId: order.id,
  })

  return { 
    success: true, 
    sessionId: session.id,
    url: session.url,
    order: order
  }
}
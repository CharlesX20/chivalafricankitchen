'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { CreateOrderInput, Order } from '@/lib/types/order'
import { isUserAdmin, getCurrentUser } from '@/lib/actions/auth'  // <- Use OUR custom auth
import { generateOrderNumber } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

// ============================================
// Get user's orders - uses custom auth
// ============================================
export async function getUserOrders(): Promise<Order[]> {
  const user = await getCurrentUser()  // <- Our custom auth
  if (!user) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

// ============================================
// Get single order by ID - uses custom auth
// ============================================
export async function getOrderById(orderId: string): Promise<Order | null> {
  const user = await getCurrentUser()  // <- Our custom auth
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
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
// Get order by Stripe session ID
// ============================================
export async function getOrderByStripeSessionId(sessionId: string): Promise<Order | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_id', sessionId)
      .maybeSingle()  // Use maybeSingle() instead of single()

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
// Create order with Stripe checkout - FIXED
// ============================================
export async function createOrderWithCheckout(input: CreateOrderInput) {
  // Use OUR custom auth, NOT supabase.auth
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

  // Create order in database
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      user_id: user.id,  // user.id from OUR custom auth
      order_number: orderNumber,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone,
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
    customerPhone: input.customer_phone,
    orderId: order.id,
  })

  return { 
    success: true, 
    sessionId: session.id,
    url: session.url,
    order: order
  }
}
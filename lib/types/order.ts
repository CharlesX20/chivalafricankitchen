export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  items: OrderItem[]
  subtotal: number
  total: number
  pickup_time: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'cancelled'
  stripe_payment_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateOrderInput {
  customer_name: string
  customer_email: string
  customer_phone: string
  items: OrderItem[]
  subtotal: number
  total: number
  pickup_time: string
}
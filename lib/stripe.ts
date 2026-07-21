import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

export async function createCheckoutSession({
  items,
  customerEmail,
  customerName,
  customerPhone,
  orderId,
}: {
  items: Array<{
    name: string
    price: number
    quantity: number
    image?: string
  }>
  customerEmail: string
  customerName: string
  customerPhone: string
  orderId: string
}) {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'cad',
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=true`,
    customer_email: customerEmail,
    metadata: {
      orderId: orderId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
    },
  })

  return session
}
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    const orderId = session.metadata?.orderId

    if (!orderId) {
      console.error('No orderId in session metadata')
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('orders')
      .update({
        stripe_payment_id: session.id,
        status: 'confirmed',
      })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log(`Order ${orderId} confirmed with payment ${session.id}`)
  }

  return NextResponse.json({ received: true })
}
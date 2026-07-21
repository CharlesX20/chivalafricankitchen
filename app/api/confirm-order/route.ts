import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth'

export async function POST(req: NextRequest) {
  try {
    const { orderId, sessionId, customerPhone } = await req.json()

    if (!orderId || !sessionId) {
      return NextResponse.json(
        { error: 'Order ID and Session ID are required' },
        { status: 400 }
      )
    }

    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // First, check if order exists and belongs to user
    const { data: existingOrder } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order already has stripe_payment_id (already confirmed)
    if (existingOrder.stripe_payment_id) {
      return NextResponse.json({
        success: true,
        message: 'Order already confirmed',
        order: existingOrder
      })
    }

    // Update order with payment info
    const updateData: any = {
      stripe_payment_id: sessionId,
      status: 'confirmed',
    }

    // Update customer phone if provided and empty
    if (customerPhone && !existingOrder.customer_phone) {
      updateData.customer_phone = customerPhone
    }

    const { data: updatedOrder, error: updateError } = await adminClient
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('Order confirmed manually:', updatedOrder)

    return NextResponse.json({
      success: true,
      message: 'Order confirmed successfully',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Confirm order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
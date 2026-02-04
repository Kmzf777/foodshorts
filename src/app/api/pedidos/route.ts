import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { orderSchema } from '@/validations/order'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = orderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = createClient()

    // Buscar restaurante pelo slug
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, plan_status')
      .eq('slug', data.restaurantSlug)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurante nao encontrado' },
        { status: 404 }
      )
    }

    if (restaurant.plan_status !== 'active') {
      return NextResponse.json(
        { error: 'Restaurante nao esta ativo' },
        { status: 403 }
      )
    }

    // Calcular totais
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const deliveryFee = data.origin === 'delivery' ? 0 : 0 // Pode ser configurável
    const total = subtotal + deliveryFee

    // Criar pedido
    const orderData: Record<string, unknown> = {
      restaurant_id: restaurant.id,
      origin: data.origin,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      status: 'pending',
    }

    if (data.origin === 'table') {
      orderData.table_number = data.tableNumber
      orderData.customer_name = data.customerName
    } else {
      orderData.customer_id = data.customerId
      orderData.payment_method = data.paymentMethod
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, order_number')
      .single()

    if (orderError) {
      console.error('Order error:', orderError)
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Criar itens do pedido
    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      notes: item.notes,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Items error:', itemsError)
      // Rollback: deletar pedido
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Erro ao criar itens do pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

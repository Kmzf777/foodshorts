import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { orderSchema } from '@/validations/order'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = orderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = createClient()

    // Buscar restaurante pelo slug (incluindo cidade para validação)
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, plan_status, city')
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

    // Validar cidade de entrega para delivery
    if (data.origin === 'delivery' && restaurant.city) {
      const deliveryCity = data.deliveryAddress.city.toLowerCase().trim()
      const restaurantCity = restaurant.city.toLowerCase().trim()

      if (deliveryCity !== restaurantCity) {
        return NextResponse.json(
          { error: `Desculpe, não entregamos em ${data.deliveryAddress.city}. Atendemos apenas ${restaurant.city}.` },
          { status: 400 }
        )
      }
    }

    // Verificar se todos os produtos existem
    const productIds = data.items.map((item) => item.productId)
    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .in('id', productIds)

    if (productsError) {
      console.error('Products check error:', productsError)
      return NextResponse.json(
        { error: 'Erro ao verificar produtos' },
        { status: 500 }
      )
    }

    const existingIds = new Set(existingProducts?.map((p) => p.id) || [])
    const invalidProducts = productIds.filter((id) => !existingIds.has(id))

    if (invalidProducts.length > 0) {
      return NextResponse.json(
        { error: 'Alguns produtos do carrinho não estão mais disponíveis. Por favor, atualize seu pedido.' },
        { status: 400 }
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
      orderData.customer_phone = data.customerPhone
    } else {
      // Delivery
      orderData.customer_id = data.customerId
      orderData.payment_method = data.paymentMethod
      // Endereço de entrega
      orderData.delivery_address_street = data.deliveryAddress.street
      orderData.delivery_address_number = data.deliveryAddress.number
      orderData.delivery_address_complement = data.deliveryAddress.complement || null
      orderData.delivery_address_neighborhood = data.deliveryAddress.neighborhood
      orderData.delivery_address_city = data.deliveryAddress.city
      orderData.delivery_address_state = data.deliveryAddress.state
      orderData.delivery_address_zipcode = data.deliveryAddress.zipcode || null
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

    // Salvar endereço no perfil do cliente se solicitado
    if (data.origin === 'delivery' && data.saveAddress) {
      await supabase
        .from('customers')
        .update({
          address_street: data.deliveryAddress.street,
          address_number: data.deliveryAddress.number,
          address_complement: data.deliveryAddress.complement || null,
          address_neighborhood: data.deliveryAddress.neighborhood,
          address_city: data.deliveryAddress.city,
          address_state: data.deliveryAddress.state,
          address_zipcode: data.deliveryAddress.zipcode || null,
        })
        .eq('id', data.customerId)
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

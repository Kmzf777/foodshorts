'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, UtensilsCrossed, Bike, MapPin, Phone, User } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useRestaurant } from '@/hooks/useRestaurant'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Order, OrderItem, Customer, OrderStatus } from '@/types'

export default function DetalhePedidoPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const { restaurant } = useRestaurant()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (!restaurant) return

      const supabase = createClient()

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('restaurant_id', restaurant.id)
        .single()

      if (!orderData) {
        setIsLoading(false)
        return
      }

      const o = orderData as Order
      setOrder(o)

      // Fetch items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      setItems((itemsData as OrderItem[]) || [])

      // Fetch customer if delivery
      if (o.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', o.customer_id)
          .single()

        setCustomer(customerData as Customer)
      }

      setIsLoading(false)
    }

    if (restaurant) {
      fetchOrder()
    }
  }, [restaurant, orderId])

  async function updateStatus(newStatus: OrderStatus) {
    if (!order) return

    const supabase = createClient()

    const updateData: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    }
    if (newStatus === 'delivered') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    if (error) {
      toast.error('Erro ao atualizar pedido')
      return
    }

    setOrder({ ...order, status: newStatus })
    toast.success('Pedido atualizado')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Pedido nao encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pedido #{order.order_number}</h1>
          <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {order.origin === 'table' ? (
                <UtensilsCrossed className="h-5 w-5" />
              ) : (
                <Bike className="h-5 w-5" />
              )}
              {order.origin === 'table' ? 'Pedido na Mesa' : 'Delivery'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>

            {order.origin === 'table' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mesa</span>
                  <span className="font-medium">{order.table_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
              </>
            )}

            {order.payment_method && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pagamento</span>
                <span className="font-medium">
                  {PAYMENT_METHOD_LABELS[order.payment_method]}
                </span>
              </div>
            )}

            <div className="pt-4 border-t">
              <label className="text-sm text-muted-foreground">
                Atualizar Status
              </label>
              <Select value={order.status} onValueChange={updateStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info (Delivery) */}
        {customer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{customer.name}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.address_street && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>
                      {customer.address_street}, {customer.address_number}
                    </p>
                    {customer.address_complement && (
                      <p className="text-muted-foreground">
                        {customer.address_complement}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      {customer.address_neighborhood} - {customer.address_city}/
                      {customer.address_state}
                    </p>
                    <p className="text-muted-foreground">
                      CEP: {customer.address_zipcode}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {item.quantity}x {item.product_name}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  )}
                </div>
                <p className="font-medium">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa de Entrega</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

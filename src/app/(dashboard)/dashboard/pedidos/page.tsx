'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UtensilsCrossed, Bike, Clock } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useRestaurant } from '@/hooks/useRestaurant'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS } from '@/lib/constants'
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
import type { Order, OrderStatus } from '@/types'

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']

export default function PedidosPage() {
  const { restaurant } = useRestaurant()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      if (!restaurant) return

      const supabase = createClient()

      let query = supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data } = await query

      setOrders((data as Order[]) || [])
      setIsLoading(false)
    }

    if (restaurant) {
      fetchOrders()
    }
  }, [restaurant, filter])

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
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
      .eq('id', orderId)

    if (error) {
      toast.error('Erro ao atualizar pedido')
      return
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )

    toast.success('Pedido atualizado')
  }

  function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return null
    }
    return statusFlow[currentIndex + 1]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos do seu restaurante
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status)
            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-muted">
                        {order.origin === 'table' ? (
                          <UtensilsCrossed className="h-5 w-5" />
                        ) : (
                          <Bike className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            Pedido #{order.order_number}
                          </h3>
                          <Badge className={ORDER_STATUS_COLORS[order.status]}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.origin === 'table'
                            ? `Mesa ${order.table_number} - ${order.customer_name}`
                            : 'Delivery'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(order.total)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/pedidos/${order.id}`}>Ver Detalhes</Link>
                        </Button>
                        {nextStatus && order.status !== 'canceled' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(order.id, nextStatus)}
                          >
                            {ORDER_STATUS_LABELS[nextStatus]}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

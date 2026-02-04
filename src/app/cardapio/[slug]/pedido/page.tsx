'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PaymentMethod } from '@/types'

export default function PedidoPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const {
    items,
    origin,
    tableNumber,
    getTotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore()

  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [isLoading, setIsLoading] = useState(false)

  const total = getTotal()

  async function handleSubmit() {
    if (origin === 'table' && !customerName.trim()) {
      toast.error('Informe seu nome para chamarmos quando estiver pronto')
      return
    }

    if (items.length === 0) {
      toast.error('Adicione itens ao pedido')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantSlug: slug,
          origin,
          tableNumber,
          customerName: origin === 'table' ? customerName : undefined,
          paymentMethod: origin === 'delivery' ? paymentMethod : undefined,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pedido')
      }

      clearCart()
      toast.success(`Pedido #${data.orderNumber} enviado!`)

      // Redirecionar para página de confirmação ou voltar ao cardápio
      router.push(`/cardapio/${slug}`)
    } catch (error) {
      toast.error('Erro ao enviar pedido')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-muted-foreground mb-4">Seu pedido esta vazio</p>
          <Button onClick={() => router.push(`/cardapio/${slug}`)}>
            Ver Cardapio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-10">
        <div className="p-4 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">Seu Pedido</h1>
            {origin === 'table' && tableNumber && (
              <p className="text-sm text-muted-foreground">Mesa {tableNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-primary font-bold">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => removeItem(item.productId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {origin === 'table' && (
          <div className="space-y-2">
            <Label htmlFor="customerName">Seu nome (para chamarmos)</Label>
            <Input
              id="customerName"
              placeholder="Ex: Joao"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
        )}

        {origin === 'delivery' && (
          <div className="space-y-2">
            <Label>Forma de Pagamento (na entrega)</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-inset-bottom">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg">Total</span>
          <span className="text-2xl font-bold">{formatCurrency(total)}</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar Pedido
        </Button>
      </div>
    </div>
  )
}

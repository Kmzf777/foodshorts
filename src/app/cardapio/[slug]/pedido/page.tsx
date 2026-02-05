'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Trash2, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { useCartStore } from '@/stores/cartStore'
import { useCustomerAuthStore } from '@/stores/customerAuthStore'
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

// Máscara de telefone
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function PedidoPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const {
    items,
    origin: storeOrigin,
    tableNumber,
    getTotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore()

  const { customer, isAuthenticated, hasHydrated } = useCustomerAuthStore()

  // Garantir que origin tenha um valor válido (apenas 'table' ou 'delivery')
  const origin = storeOrigin === 'table' ? 'table' : 'delivery'

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [isLoading, setIsLoading] = useState(false)

  // Estado para popup de mesa
  const [showTablePopup, setShowTablePopup] = useState(false)
  const [tableCustomerName, setTableCustomerName] = useState('')
  const [tableCustomerPhone, setTableCustomerPhone] = useState('')

  const total = getTotal()

  // Verificar autenticação para delivery (apenas após hidratação da store)
  useEffect(() => {
    if (!hasHydrated) return // Aguardar hidratação

    if (origin === 'delivery' && !isAuthenticated && items.length > 0) {
      // Redirecionar para login se for delivery e não estiver autenticado
      router.push(`/cardapio/${slug}/login`)
    }
  }, [origin, isAuthenticated, hasHydrated, items.length, router, slug])

  async function handleConfirmOrder() {
    if (items.length === 0) {
      toast.error('Adicione itens ao pedido')
      return
    }

    // Se for mesa, abrir popup para preencher nome e telefone
    if (origin === 'table') {
      setShowTablePopup(true)
      return
    }

    // Se for delivery, verificar autenticação e redirecionar para página de confirmação
    if (origin === 'delivery') {
      if (!isAuthenticated) {
        router.push(`/cardapio/${slug}/login`)
        return
      }
      // Redirecionar para página de confirmação de endereço
      router.push(`/cardapio/${slug}/pedido/confirmar`)
    }
  }

  async function handleTableSubmit() {
    if (!tableCustomerName.trim()) {
      toast.error('Informe seu nome')
      return
    }

    if (!tableCustomerPhone.trim() || tableCustomerPhone.replace(/\D/g, '').length < 10) {
      toast.error('Informe um telefone válido')
      return
    }

    setShowTablePopup(false)
    await submitOrder()
  }

  async function submitOrder() {
    setIsLoading(true)

    try {
      // Verificar se tem customerId para delivery
      if (origin === 'delivery' && !customer?.id) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push(`/cardapio/${slug}/login`)
        return
      }

      // Montar payload baseado no tipo de origem
      const payload: Record<string, unknown> = {
        restaurantSlug: slug,
        origin,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes,
        })),
      }

      if (origin === 'table') {
        payload.tableNumber = tableNumber
        payload.customerName = tableCustomerName
        payload.customerPhone = tableCustomerPhone.replace(/\D/g, '')
      } else {
        // Delivery
        payload.customerId = customer!.id
        payload.paymentMethod = paymentMethod
      }

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      const message = error instanceof Error ? error.message : 'Erro ao enviar pedido'
      toast.error(message)
      console.error('Erro ao criar pedido:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Aguardar hidratação da store para delivery
  if (origin === 'delivery' && !hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
      {/* Popup para Mesa */}
      {showTablePopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowTablePopup(false)}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold mb-4">Confirmar Pedido</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Preencha seus dados para enviarmos o pedido
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">Seu nome</Label>
                <Input
                  id="tableName"
                  placeholder="Ex: João"
                  value={tableCustomerName}
                  onChange={(e) => setTableCustomerName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tablePhone">Telefone (DDD + número)</Label>
                <Input
                  id="tablePhone"
                  placeholder="(00) 00000-0000"
                  value={tableCustomerPhone}
                  onChange={(e) => setTableCustomerPhone(formatPhone(e.target.value))}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleTableSubmit}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

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
            {origin === 'delivery' && isAuthenticated && customer && (
              <p className="text-sm text-muted-foreground">Olá, {customer.name}</p>
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

      {/* Form - Apenas para delivery */}
      {origin === 'delivery' && isAuthenticated && (
        <div className="p-4 space-y-4">
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
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-inset-bottom">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg">Total</span>
          <span className="text-2xl font-bold">{formatCurrency(total)}</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={handleConfirmOrder}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar Pedido
        </Button>
      </div>
    </div>
  )
}

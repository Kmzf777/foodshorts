'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { CheckCircle2, Clock, MapPin, Home, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface OrderDetails {
  orderNumber: number
  prepTime: number
  deliveryTime: number
  totalTime: number
  address: {
    street: string
    number: string
    complement: string | null
    neighborhood: string
    city: string
    state: string
  }
  restaurantName: string
}

function PedidoSucessoContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const orderId = searchParams.get('pedido')

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        router.push(`/cardapio/${slug}`)
        return
      }

      try {
        const supabase = createClient()

        // Buscar pedido com dados do restaurante
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            order_number,
            delivery_address_street,
            delivery_address_number,
            delivery_address_complement,
            delivery_address_neighborhood,
            delivery_address_city,
            delivery_address_state,
            restaurant_id
          `)
          .eq('id', orderId)
          .single()

        if (orderError) {
          console.error('Erro ao buscar pedido:', orderError)
          setError('Pedido nao encontrado')
          setIsLoading(false)
          return
        }

        // Buscar restaurante separadamente
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('name, avg_prep_time')
          .eq('id', order.restaurant_id)
          .single()

        const prepTime = restaurant?.avg_prep_time || 30
        const deliveryTime = 15

        setOrderDetails({
          orderNumber: order.order_number,
          prepTime,
          deliveryTime,
          totalTime: prepTime + deliveryTime,
          address: {
            street: order.delivery_address_street || '',
            number: order.delivery_address_number || '',
            complement: order.delivery_address_complement,
            neighborhood: order.delivery_address_neighborhood || '',
            city: order.delivery_address_city || '',
            state: order.delivery_address_state || '',
          },
          restaurantName: restaurant?.name || '',
        })
      } catch (err) {
        console.error('Erro:', err)
        setError('Erro ao carregar pedido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, slug, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Se houve erro ou não encontrou o pedido, mostrar página de sucesso genérica
  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-green-500 text-white px-4 py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Pedido Enviado!</h1>
          <p className="text-green-100">
            Seu pedido foi recebido e esta sendo preparado
          </p>
        </div>

        <div className="flex-1 p-4 space-y-6">
          <div className="bg-muted rounded-xl p-6 text-center">
            <p className="text-muted-foreground">
              Acompanhe o status do seu pedido com o restaurante.
            </p>
          </div>
        </div>

        <div className="p-4 border-t safe-area-inset-bottom">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push(`/cardapio/${slug}`)}
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Cardapio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Success Header */}
      <div className="bg-green-500 text-white px-4 py-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-full p-3">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Pedido Confirmado!</h1>
        <p className="text-green-100">
          Seu pedido foi recebido e esta sendo preparado
        </p>
      </div>

      {/* Order Info */}
      <div className="flex-1 p-4 space-y-6">
        {/* Order Number */}
        <div className="bg-muted rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Numero do Pedido</p>
          <p className="text-4xl font-bold text-primary">#{orderDetails.orderNumber}</p>
        </div>

        {/* Estimated Time */}
        <div className="bg-muted rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 rounded-full p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Tempo Estimado de Entrega</p>
              <p className="text-sm text-muted-foreground">
                Previsao para chegar ate voce
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">
                {orderDetails.totalTime}
              </p>
              <p className="text-muted-foreground">minutos</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tempo de preparo</span>
              <span>~{orderDetails.prepTime} min</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tempo de entrega</span>
              <span>~{orderDetails.deliveryTime} min</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {orderDetails.address.street && (
          <div className="bg-muted rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 rounded-full p-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Endereco de Entrega</p>
                <p className="text-sm text-muted-foreground">
                  Seu pedido sera entregue em
                </p>
              </div>
            </div>

            <p className="text-sm">
              {orderDetails.address.street}, {orderDetails.address.number}
              {orderDetails.address.complement && ` - ${orderDetails.address.complement}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {orderDetails.address.neighborhood}, {orderDetails.address.city} - {orderDetails.address.state}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Voce recebera atualizacoes sobre o status do seu pedido.
          </p>
          <p className="mt-1">
            Em caso de duvidas, entre em contato com o restaurante.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t safe-area-inset-bottom">
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push(`/cardapio/${slug}`)}
        >
          <Home className="mr-2 h-4 w-4" />
          Voltar ao Cardapio
        </Button>
      </div>
    </div>
  )
}

export default function PedidoSucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PedidoSucessoContent />
    </Suspense>
  )
}

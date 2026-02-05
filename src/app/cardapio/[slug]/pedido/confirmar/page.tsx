'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, MapPin, AlertCircle } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'
import type { PaymentMethod, Restaurant } from '@/types'

// Máscara de CEP
function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8)
  return numbers.replace(/(\d{5})(\d)/, '$1-$2')
}

// Normaliza texto para comparação (remove acentos e converte para minúsculas)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

interface AddressForm {
  zipcode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export default function ConfirmarPedidoPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const { items, getTotal, clearCart } = useCartStore()
  const { customer, isAuthenticated, hasHydrated, updateCustomer } = useCustomerAuthStore()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true)
  const [saveAddress, setSaveAddress] = useState(true)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [cityError, setCityError] = useState<string | null>(null)
  const [orderCompleted, setOrderCompleted] = useState(false)

  const [address, setAddress] = useState<AddressForm>({
    zipcode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  const total = getTotal()

  // Buscar dados do restaurante
  useEffect(() => {
    async function fetchRestaurant() {
      const supabase = createClient()
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        setRestaurant(data as Restaurant)
      }
      setIsLoadingRestaurant(false)
    }

    fetchRestaurant()
  }, [slug])

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!hasHydrated) return
    if (orderCompleted) return // Não redirecionar se pedido foi finalizado

    if (!isAuthenticated) {
      router.push(`/cardapio/${slug}/login`)
      return
    }

    if (items.length === 0) {
      router.push(`/cardapio/${slug}/pedido`)
      return
    }

    // Preencher com endereço salvo do cliente
    if (customer?.address) {
      setAddress({
        zipcode: customer.address.zipcode || '',
        street: customer.address.street || '',
        number: customer.address.number || '',
        complement: customer.address.complement || '',
        neighborhood: customer.address.neighborhood || '',
        city: customer.address.city || '',
        state: customer.address.state || '',
      })
    }
  }, [hasHydrated, isAuthenticated, items.length, customer, router, slug, orderCompleted])

  // Validar se a cidade corresponde à cidade do restaurante
  function validateCity(city: string): boolean {
    if (!restaurant?.city) {
      // Se o restaurante não tem cidade configurada, aceitar qualquer cidade
      return true
    }

    const normalizedRestaurantCity = normalizeText(restaurant.city)
    const normalizedInputCity = normalizeText(city)

    return normalizedRestaurantCity === normalizedInputCity
  }

  // Buscar endereço por CEP
  async function handleCepBlur() {
    const cep = address.zipcode.replace(/\D/g, '')
    if (cep.length !== 8) return

    setCityError(null)
    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      const fetchedCity = data.localidade || ''
      const fetchedState = data.uf || ''

      // Validar se a cidade corresponde à do restaurante
      if (!validateCity(fetchedCity)) {
        setCityError(`Desculpe, não realizamos entregas em ${fetchedCity}. Atendemos apenas em ${restaurant?.city}.`)
      }

      setAddress((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: fetchedCity,
        state: fetchedState,
      }))
    } catch {
      toast.error('Erro ao buscar CEP')
    } finally {
      setIsLoadingCep(false)
    }
  }

  function handleAddressChange(field: keyof AddressForm, value: string) {
    if (field === 'zipcode') {
      value = formatCEP(value)
      // Limpar erro de cidade quando o CEP mudar
      setCityError(null)
    }
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    // Validar campos obrigatórios
    if (!address.zipcode.trim() || address.zipcode.replace(/\D/g, '').length !== 8) {
      toast.error('Informe um CEP válido')
      return
    }
    if (!address.street.trim()) {
      toast.error('Informe a rua')
      return
    }
    if (!address.number.trim()) {
      toast.error('Informe o número')
      return
    }
    if (!address.neighborhood.trim()) {
      toast.error('Informe o bairro')
      return
    }
    // Validar cidade
    if (cityError) {
      toast.error('Endereço fora da área de entrega')
      return
    }
    if (!address.city.trim()) {
      toast.error('Digite o CEP para identificar a cidade')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        restaurantSlug: slug,
        origin: 'delivery' as const,
        customerId: customer!.id,
        paymentMethod,
        deliveryAddress: {
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipcode: address.zipcode.replace(/\D/g, ''),
        },
        saveAddress,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes,
        })),
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

      // Atualizar endereço do cliente na store se marcou para salvar
      if (saveAddress) {
        updateCustomer({
          address: {
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode.replace(/\D/g, ''),
          },
        })
      }

      // Marcar como completo ANTES de limpar o carrinho
      // para evitar redirecionamento pelo useEffect
      setOrderCompleted(true)
      clearCart()
      toast.success(`Pedido #${data.orderNumber} enviado!`)

      // Usar window.location para garantir navegação
      window.location.href = `/cardapio/${slug}/pedido/sucesso?pedido=${data.orderId}`
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar pedido'
      toast.error(message)
      console.error('Erro ao criar pedido:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (!hasHydrated || isLoadingRestaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="font-bold text-lg">Endereço de Entrega</h1>
            {customer && (
              <p className="text-sm text-muted-foreground">Olá, {customer.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Alerta de cidade não atendida */}
        {cityError && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{cityError}</p>
          </div>
        )}

        {/* CEP */}
        <div className="space-y-2">
          <Label htmlFor="zipcode">CEP *</Label>
          <div className="relative">
            <Input
              id="zipcode"
              placeholder="00000-000"
              value={address.zipcode}
              onChange={(e) => handleAddressChange('zipcode', e.target.value)}
              onBlur={handleCepBlur}
              className={cityError ? 'border-destructive' : ''}
            />
            {isLoadingCep && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Digite o CEP para preencher automaticamente
          </p>
        </div>

        {/* Rua */}
        <div className="space-y-2">
          <Label htmlFor="street">Rua *</Label>
          <Input
            id="street"
            placeholder="Nome da rua"
            value={address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
          />
        </div>

        {/* Número e Complemento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              placeholder="123"
              value={address.number}
              onChange={(e) => handleAddressChange('number', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              placeholder="Apto, Bloco..."
              value={address.complement}
              onChange={(e) => handleAddressChange('complement', e.target.value)}
            />
          </div>
        </div>

        {/* Bairro */}
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input
            id="neighborhood"
            placeholder="Nome do bairro"
            value={address.neighborhood}
            onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
          />
        </div>

        {/* Salvar endereço */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
            className="rounded"
          />
          Salvar endereço para próximos pedidos
        </label>

        {/* Forma de pagamento */}
        <div className="space-y-2 pt-4 border-t">
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

        {/* Resumo do endereço */}
        <div className="pt-4 border-t space-y-2">
          <h3 className="font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Entregar em:
          </h3>
          {address.street && !cityError ? (
            <p className="text-sm text-muted-foreground">
              {address.street}, {address.number}
              {address.complement && ` - ${address.complement}`}
              <br />
              {address.neighborhood}
              {address.city && `, ${address.city}`}
              {address.state && ` - ${address.state}`}
              {address.zipcode && ` | CEP: ${address.zipcode}`}
            </p>
          ) : !cityError && (
            <p className="text-sm text-muted-foreground">
              Preencha o endereço acima
            </p>
          )}
        </div>
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
          disabled={isLoading || !!cityError}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar Pedido
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Loader2, Copy, ExternalLink, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { differenceInDays } from 'date-fns'

import { createClient } from '@/lib/supabase/client'
import { useRestaurant } from '@/hooks/useRestaurant'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Estados brasileiros
const ESTADOS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

// Máscara de CEP
function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8)
  return numbers.replace(/(\d{5})(\d)/, '$1-$2')
}

interface RestaurantForm {
  name: string
  tables_count: number
  delivery_enabled: boolean
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

export default function ContaPage() {
  const router = useRouter()
  const { restaurant, isLoading: restaurantLoading } = useRestaurant()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [avgPrepTime, setAvgPrepTime] = useState(30)

  const [address, setAddress] = useState<AddressForm>({
    zipcode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  const { register, handleSubmit, reset } = useForm<RestaurantForm>()

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name,
        tables_count: restaurant.tables_count,
        delivery_enabled: restaurant.delivery_enabled,
      })
      setAddress({
        zipcode: (restaurant as any).address_zipcode || '',
        street: (restaurant as any).address_street || '',
        number: (restaurant as any).address_number || '',
        complement: (restaurant as any).address_complement || '',
        neighborhood: (restaurant as any).address_neighborhood || '',
        city: (restaurant as any).city || '',
        state: (restaurant as any).state || '',
      })
      setAvgPrepTime((restaurant as any).avg_prep_time || 30)
    }
  }, [restaurant, reset])

  // Buscar endereço por CEP
  async function handleCepBlur() {
    const cep = address.zipcode.replace(/\D/g, '')
    if (cep.length !== 8) return

    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      setAddress((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
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
    }
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  async function onSubmit(data: RestaurantForm) {
    if (!restaurant) return

    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('restaurants')
      .update({
        name: data.name,
        tables_count: data.tables_count,
        delivery_enabled: data.delivery_enabled,
        address_zipcode: address.zipcode.replace(/\D/g, '') || null,
        address_street: address.street || null,
        address_number: address.number || null,
        address_complement: address.complement || null,
        address_neighborhood: address.neighborhood || null,
        city: address.city || null,
        state: address.state || null,
        avg_prep_time: avgPrepTime,
      })
      .eq('id', restaurant.id)

    if (error) {
      toast.error('Erro ao atualizar dados')
      setIsLoading(false)
      return
    }

    toast.success('Dados atualizados!')
    setIsLoading(false)
    router.refresh()
  }

  function copyMenuLink() {
    if (!restaurant) return
    const link = `${window.location.origin}/cardapio/${restaurant.slug}`
    navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  if (restaurantLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!restaurant) {
    return null
  }

  const daysRemaining = restaurant.plan_expires_at
    ? differenceInDays(new Date(restaurant.plan_expires_at), new Date())
    : 0

  const planInfo = restaurant.plan === 'annual'
    ? SUBSCRIPTION_PLANS.ANNUAL
    : SUBSCRIPTION_PLANS.MONTHLY

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Conta</h1>
        <p className="text-muted-foreground">
          Gerencie as configuracoes do seu restaurante
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Restaurante</CardTitle>
              <CardDescription>
                Informacoes basicas do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Restaurante</Label>
                <Input id="name" {...register('name')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tables_count">Numero de Mesas</Label>
                <Input
                  id="tables_count"
                  type="number"
                  min="0"
                  max="100"
                  {...register('tables_count', { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="delivery_enabled"
                  className="rounded border-input"
                  {...register('delivery_enabled')}
                />
                <Label htmlFor="delivery_enabled">Habilitar Delivery</Label>
              </div>

              {/* Tempo médio de preparo */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="avg_prep_time">Tempo Medio de Preparo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="avg_prep_time"
                    type="number"
                    min="5"
                    max="120"
                    value={avgPrepTime}
                    onChange={(e) => setAvgPrepTime(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">minutos</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo medio para preparar um pedido. Sera usado para calcular o tempo de entrega.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Endereco do Restaurante</CardTitle>
              <CardDescription>
                Endereco completo para calculo de entrega e validacao de area de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CEP */}
              <div className="space-y-2">
                <Label htmlFor="zipcode">CEP</Label>
                <div className="relative">
                  <Input
                    id="zipcode"
                    placeholder="00000-000"
                    value={address.zipcode}
                    onChange={(e) => handleAddressChange('zipcode', e.target.value)}
                    onBlur={handleCepBlur}
                  />
                  {isLoadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Rua */}
              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
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
                  <Label htmlFor="number">Numero</Label>
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
                    placeholder="Sala, Loja..."
                    value={address.complement}
                    onChange={(e) => handleAddressChange('complement', e.target.value)}
                  />
                </div>
              </div>

              {/* Bairro */}
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  placeholder="Nome do bairro"
                  value={address.neighborhood}
                  onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                />
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Nome da cidade"
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={address.state}
                    onValueChange={(value) => handleAddressChange('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                A cidade cadastrada sera usada para validar se o cliente esta na area de entrega.
              </p>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Assinatura</CardTitle>
              <CardDescription>Status do seu plano atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plano</span>
                <Badge variant={restaurant.plan_status === 'active' ? 'default' : 'destructive'}>
                  {planInfo.name}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">
                  {restaurant.plan_status === 'active' ? 'Ativo' : restaurant.plan_status}
                </span>
              </div>

              {restaurant.plan_expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expira em</span>
                  <span className="font-medium">
                    {daysRemaining > 0 ? `${daysRemaining} dias` : 'Expirado'}
                  </span>
                </div>
              )}

              {restaurant.plan_status !== 'active' && (
                <Button className="w-full" asChild>
                  <a href="/pricing">Renovar Assinatura</a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Menu Link */}
          <Card>
            <CardHeader>
              <CardTitle>Link do Cardapio</CardTitle>
              <CardDescription>
                Compartilhe este link para seus clientes acessarem o cardapio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/cardapio/${restaurant.slug}`}
                />
                <Button type="button" variant="outline" onClick={copyMenuLink}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" asChild>
                  <a
                    href={`/cardapio/${restaurant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Links com mesa:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {Array.from({ length: Math.min(restaurant.tables_count, 5) }, (_, i) => (
                    <p key={i}>
                      Mesa {i + 1}: /cardapio/{restaurant.slug}?mesa={i + 1}
                    </p>
                  ))}
                  {restaurant.tables_count > 5 && (
                    <p>... e mais {restaurant.tables_count - 5} mesas</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="md:col-span-2">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alteracoes
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

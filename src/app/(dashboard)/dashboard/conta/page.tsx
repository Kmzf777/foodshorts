'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Loader2, Copy, ExternalLink } from 'lucide-react'
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

interface RestaurantForm {
  name: string
  tables_count: number
  delivery_enabled: boolean
}

export default function ContaPage() {
  const router = useRouter()
  const { restaurant, isLoading: restaurantLoading } = useRestaurant()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, reset } = useForm<RestaurantForm>()

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name,
        tables_count: restaurant.tables_count,
        delivery_enabled: restaurant.delivery_enabled,
      })
    }
  }, [restaurant, reset])

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Restaurante</CardTitle>
            <CardDescription>
              Informacoes basicas do seu estabelecimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alteracoes
              </Button>
            </form>
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
        <Card className="md:col-span-2">
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
              <Button variant="outline" onClick={copyMenuLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" asChild>
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
      </div>
    </div>
  )
}

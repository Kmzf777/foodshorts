'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { cadastroSchema, type CadastroInput } from '@/validations/auth'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function CadastroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
  })

  async function onSubmit(data: CadastroInput) {
    try {
      setIsLoading(true)
      const supabase = createClient()

      // 1. Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      })

      if (authError) {
        toast.error('Erro ao criar conta', {
          description: authError.message,
        })
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        toast.error('Erro ao criar conta')
        setIsLoading(false)
        return
      }

      // 2. Criar restaurante
      const slug = slugify(data.restaurantName)
      const { error: restaurantError } = await supabase.from('restaurants').insert({
        owner_id: authData.user.id,
        name: data.restaurantName,
        slug: slug,
      } as any)

      if (restaurantError) {
        toast.error('Erro ao criar restaurante', {
          description: restaurantError.message,
        })
        setIsLoading(false)
        return
      }

      toast.success('Conta criada com sucesso!', {
        description: 'Verifique seu email para confirmar o cadastro.',
      })

      // Aguarda um momento para garantir que o cookie foi salvo
      await new Promise(resolve => setTimeout(resolve, 100))

      // Força um reload completo da página para garantir sincronização do cookie
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Erro detalhado no cadastro:', error)
      toast.error('Erro inesperado ao criar conta')
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Criar Conta
        </CardTitle>
        <CardDescription className="text-center">
          Cadastre seu restaurante no FoodShorts
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantName">Nome do Restaurante</Label>
            <Input
              id="restaurantName"
              placeholder="Pizzaria do Ze"
              {...register('restaurantName')}
            />
            {errors.restaurantName && (
              <p className="text-sm text-destructive">{errors.restaurantName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Ja tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

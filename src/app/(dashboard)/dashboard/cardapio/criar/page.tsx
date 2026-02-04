'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useRestaurant } from '@/hooks/useRestaurant'
import { productSchema, type ProductInput } from '@/validations/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VideoUploader } from '@/components/dashboard/VideoUploader'
import type { Category } from '@/types'

export default function CriarProdutoPage() {
  const router = useRouter()
  const { restaurant } = useRestaurant()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [videoData, setVideoData] = useState<{
    blob: Blob
    thumbnail: Blob
    duration: number
  } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      is_recommended: false,
    },
  })

  useEffect(() => {
    async function fetchCategories() {
      if (!restaurant) return

      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('sort_order')

      setCategories((data as Category[]) || [])
    }

    fetchCategories()
  }, [restaurant])

  async function onSubmit(data: ProductInput) {
    if (!restaurant) return
    if (!videoData) {
      toast.error('Selecione um video')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Upload video
      const videoFileName = `${restaurant.id}/${Date.now()}.mp4`
      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoData.blob, {
          contentType: 'video/mp4',
        })

      if (videoError) throw videoError

      // Upload thumbnail
      const thumbFileName = `${restaurant.id}/${Date.now()}_thumb.jpg`
      const { error: thumbError } = await supabase.storage
        .from('videos')
        .upload(thumbFileName, videoData.thumbnail, {
          contentType: 'image/jpeg',
        })

      if (thumbError) throw thumbError

      // Get public URLs
      const { data: videoUrl } = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName)

      const { data: thumbUrl } = supabase.storage
        .from('videos')
        .getPublicUrl(thumbFileName)

      // Create product
      const { error: productError } = await supabase.from('products').insert({
        restaurant_id: restaurant.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category_id: data.category_id || null,
        is_recommended: data.is_recommended,
        is_active: data.is_active,
        video_url: videoUrl.publicUrl,
        video_thumbnail_url: thumbUrl.publicUrl,
        video_duration: videoData.duration,
      })

      if (productError) throw productError

      toast.success('Produto criado com sucesso!')
      router.push('/dashboard/cardapio')
    } catch (error) {
      toast.error('Erro ao criar produto')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Novo Produto</h1>
        <p className="text-muted-foreground">
          Adicione um novo produto ao seu cardapio
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informacoes do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video do Produto *</Label>
              <VideoUploader
                onChange={(blob, thumbnail, duration) => {
                  setVideoData({ blob, thumbnail, duration })
                }}
                disabled={isLoading}
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Pizza Margherita"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                placeholder="Molho de tomate, mussarela, manjericao fresco..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Preco *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="29.90"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                onValueChange={(value) =>
                  setValue('category_id', value === 'none' ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-input"
                  {...register('is_recommended')}
                />
                <span className="text-sm">Recomendado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-input"
                  defaultChecked
                  {...register('is_active')}
                />
                <span className="text-sm">Ativo</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Produto
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

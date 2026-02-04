'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useRestaurant } from '@/hooks/useRestaurant'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Product } from '@/types'

export default function CardapioPage() {
  const { restaurant } = useRestaurant()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    async function fetchData() {
      if (!restaurant) return

      const supabase = createClient()

      const { data: productsData } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('restaurant_id', restaurant.id)
        .order('sort_order')

      setProducts((productsData as Product[]) || [])
      setIsLoading(false)
    }

    if (restaurant) {
      fetchData()
    }
  }, [restaurant])

  async function toggleActive(product: Product) {
    const supabase = createClient()

    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (error) {
      toast.error('Erro ao atualizar produto')
      return
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      )
    )

    toast.success(product.is_active ? 'Produto desativado' : 'Produto ativado')
  }

  async function deleteProduct() {
    if (!deleteDialog.product || confirmText !== 'CONFIRMAR') return

    const supabase = createClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteDialog.product.id)

    if (error) {
      toast.error('Erro ao deletar produto')
      return
    }

    setProducts((prev) => prev.filter((p) => p.id !== deleteDialog.product?.id))
    setDeleteDialog({ open: false, product: null })
    setConfirmText('')
    toast.success('Produto deletado')
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
          <h1 className="text-3xl font-bold">Cardapio</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos do seu cardapio
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/criar-categoria">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/cardapio/criar">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              Nenhum produto cadastrado
            </p>
            <Button asChild>
              <Link href="/dashboard/cardapio/criar">
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro produto
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-[9/16] relative bg-black max-h-48">
                {product.video_thumbnail_url ? (
                  <img
                    src={product.video_thumbnail_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={product.video_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                )}
                {!product.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Inativo</Badge>
                  </div>
                )}
                {product.is_recommended && (
                  <Badge className="absolute top-2 left-2">Recomendado</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.category?.name || 'Sem categoria'}
                    </p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(product)}
                    >
                      {product.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/cardapio/${product.id}/editar`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ open: true, product })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          setDeleteDialog({ open, product: open ? deleteDialog.product : null })
          setConfirmText('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Produto</DialogTitle>
            <DialogDescription>
              Esta acao nao pode ser desfeita. Digite CONFIRMAR para deletar o
              produto <strong>{deleteDialog.product?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Digite CONFIRMAR"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, product: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={deleteProduct}
              disabled={confirmText !== 'CONFIRMAR'}
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

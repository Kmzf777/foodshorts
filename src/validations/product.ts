import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  price: z.number().positive('Preço deve ser maior que zero'),
  category_id: z.string().uuid('Categoria inválida').optional().nullable(),
  is_recommended: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(50, 'Nome deve ter no máximo 50 caracteres'),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
})

export type ProductInput = z.input<typeof productSchema>
export type ProductOutput = z.output<typeof productSchema>
export type CategoryInput = z.input<typeof categorySchema>
export type CategoryOutput = z.output<typeof categorySchema>

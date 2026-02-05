import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().uuid('Produto inválido'),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
  notes: z.string().optional(),
})

export const tableOrderSchema = z.object({
  restaurantSlug: z.string(),
  origin: z.literal('table'),
  tableNumber: z.number().int().positive('Número da mesa inválido'),
  customerName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  customerPhone: z.string().min(10, 'Telefone inválido'),
  items: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item'),
})

export const deliveryAddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado inválido'),
  zipcode: z.string().optional(),
})

export const deliveryOrderSchema = z.object({
  restaurantSlug: z.string(),
  origin: z.literal('delivery'),
  customerId: z.string().uuid('Cliente inválido'),
  paymentMethod: z.enum(['cash', 'credit', 'debit', 'pix']),
  deliveryAddress: deliveryAddressSchema,
  saveAddress: z.boolean().optional(),
  items: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item'),
})

export const orderSchema = z.discriminatedUnion('origin', [
  tableOrderSchema,
  deliveryOrderSchema,
])

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'canceled']),
})

export type OrderItemInput = z.infer<typeof orderItemSchema>
export type TableOrderInput = z.infer<typeof tableOrderSchema>
export type DeliveryOrderInput = z.infer<typeof deliveryOrderSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

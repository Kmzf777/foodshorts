'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createClient } from '@/lib/supabase/client'
import { useRestaurant } from '@/hooks/useRestaurant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formSchema = z.object({
    name: z.string().min(1, 'O nome da categoria é obrigatório'),
})

export default function CreateCategoryPage() {
    const router = useRouter()
    const { restaurant } = useRestaurant()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!restaurant) return

        try {
            setIsLoading(true)
            const supabase = createClient()

            const { error } = await supabase.from('categories').insert({
                restaurant_id: restaurant.id,
                name: values.name,
                sort_order: 0, // Default sort order, can be improved later
                is_active: true,
            })

            if (error) {
                throw error
            }

            toast.success('Categoria criada com sucesso!')
            router.push('/dashboard/cardapio')
            router.refresh()
        } catch (error) {
            console.error('Error creating category:', error)
            toast.error('Erro ao criar categoria')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/cardapio">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Nova Categoria</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Dados da Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Categoria</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Bebidas, Lanches..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        'Salvando...'
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Salvar Categoria
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

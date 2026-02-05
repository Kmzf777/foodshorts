import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { customerLoginSchema } from '@/validations/customer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = customerLoginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { cpf, password } = validation.data
    const supabase = createClient()

    // Limpar CPF (remover formatação)
    const cleanCpf = cpf.replace(/\D/g, '')

    // Verificar credenciais usando função do banco
    const { data: result, error } = await supabase.rpc('verify_customer_password', {
      p_cpf: cleanCpf,
      p_password: password,
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        { error: 'Erro ao fazer login' },
        { status: 500 }
      )
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'CPF ou senha incorretos' },
        { status: 401 }
      )
    }

    const customer = result[0]

    // Buscar dados completos do cliente incluindo endereço
    const { data: fullCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customer.customer_id)
      .single()

    if (fetchError || !fullCustomer) {
      return NextResponse.json(
        { error: 'Erro ao buscar dados do cliente' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      customer: {
        id: fullCustomer.id,
        name: fullCustomer.name,
        cpf: fullCustomer.cpf,
        phone: fullCustomer.phone,
        whatsapp: fullCustomer.whatsapp,
        email: fullCustomer.email,
        address: fullCustomer.address_street ? {
          street: fullCustomer.address_street,
          number: fullCustomer.address_number,
          complement: fullCustomer.address_complement,
          neighborhood: fullCustomer.address_neighborhood,
          city: fullCustomer.address_city,
          state: fullCustomer.address_state,
          zipcode: fullCustomer.address_zipcode,
        } : undefined,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

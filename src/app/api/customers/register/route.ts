import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { customerRegisterSchema } from '@/validations/customer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = customerRegisterSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, cpf, phone, whatsapp, password } = validation.data
    const supabase = createClient()

    // Limpar CPF (remover formatação)
    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')
    const cleanWhatsapp = whatsapp.replace(/\D/g, '')

    // Verificar se CPF já existe
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('cpf', cleanCpf)
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 400 }
      )
    }

    // Registrar cliente usando função do banco
    const { data: result, error } = await supabase.rpc('register_customer', {
      p_name: name,
      p_cpf: cleanCpf,
      p_phone: cleanPhone,
      p_whatsapp: cleanWhatsapp,
      p_password: password,
    })

    if (error) {
      console.error('Register error:', error)
      return NextResponse.json(
        { error: error.message || 'Erro ao cadastrar' },
        { status: 500 }
      )
    }

    // Buscar dados completos do cliente
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('id, name, cpf, phone, whatsapp, email')
      .eq('cpf', cleanCpf)
      .single()

    if (fetchError || !customer) {
      return NextResponse.json(
        { error: 'Erro ao buscar dados do cliente' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        cpf: customer.cpf,
        phone: customer.phone,
        whatsapp: customer.whatsapp,
        email: customer.email,
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

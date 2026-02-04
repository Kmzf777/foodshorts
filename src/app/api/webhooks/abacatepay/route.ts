import { NextRequest, NextResponse } from 'next/server'
import { abacatepay } from '@/lib/abacatepay'
import { createClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('x-abacatepay-signature') || ''

  if (!abacatepay.verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(payload)
  const supabase = createClient()

  switch (event.event) {
    case 'billing.paid': {
      const billingId = event.data.billing.id
      const customerId = event.data.billing.customer.id

      // Buscar restaurante pelo customer_id
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, plan')
        .eq('abacatepay_customer_id', customerId)
        .single()

      if (restaurant) {
        // Calcular nova data de expiracao
        const expiresAt = new Date()
        if (restaurant.plan === 'annual') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1)
        }

        // Atualizar status da assinatura
        await supabase
          .from('restaurants')
          .update({
            plan_status: 'active',
            plan_expires_at: expiresAt.toISOString(),
            abacatepay_subscription_id: billingId,
          })
          .eq('id', restaurant.id)

        // Registrar pagamento
        await supabase.from('payments').insert({
          restaurant_id: restaurant.id,
          abacatepay_payment_id: event.data.payment?.id || billingId,
          amount: event.data.billing.amount / 100,
          status: 'paid',
          metadata: event.data,
        })
      }
      break
    }

    case 'billing.expired':
    case 'subscription.canceled': {
      const customerId =
        event.data.billing?.customer?.id || event.data.subscription?.customer?.id

      if (customerId) {
        await supabase
          .from('restaurants')
          .update({ plan_status: 'expired' })
          .eq('abacatepay_customer_id', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

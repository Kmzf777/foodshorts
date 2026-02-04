const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1'

interface CreateCustomerParams {
  name: string
  email: string
  cellphone?: string
  taxId?: string // CPF/CNPJ
}

interface CreateBillingParams {
  customerId: string
  products: Array<{
    externalId: string
    name: string
    quantity: number
    price: number // em centavos
  }>
  frequency: 'ONE_TIME' | 'MONTHLY' | 'YEARLY'
  returnUrl: string
  completionUrl: string
}

interface AbacatePayCustomer {
  id: string
  metadata: {
    name: string
    email: string
    cellphone?: string
    taxId?: string
  }
}

interface AbacatePayBilling {
  id: string
  url: string
  status: string
  amount: number
}

class AbacatePayClient {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.ABACATEPAY_API_KEY || ''
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${ABACATEPAY_API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `AbacatePay error: ${response.status}`)
    }

    return response.json()
  }

  async createCustomer(
    params: CreateCustomerParams
  ): Promise<AbacatePayCustomer> {
    const response = await this.request<{ data: AbacatePayCustomer }>(
      '/customers',
      {
        method: 'POST',
        body: JSON.stringify({
          metadata: params,
        }),
      }
    )
    return response.data
  }

  async createBilling(params: CreateBillingParams): Promise<AbacatePayBilling> {
    const response = await this.request<{ data: AbacatePayBilling }>(
      '/billing/create',
      {
        method: 'POST',
        body: JSON.stringify({
          customer: { id: params.customerId },
          products: params.products,
          frequency: params.frequency,
          methods: ['PIX'],
          returnUrl: params.returnUrl,
          completionUrl: params.completionUrl,
        }),
      }
    )
    return response.data
  }

  async getBilling(billingId: string): Promise<AbacatePayBilling> {
    const response = await this.request<{ data: AbacatePayBilling }>(
      `/billing/${billingId}`
    )
    return response.data
  }

  // Verificar assinatura webhook
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ABACATEPAY_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex')
    return signature === expectedSignature
  }
}

export const abacatepay = new AbacatePayClient()

export type { CreateCustomerParams, CreateBillingParams, AbacatePayCustomer, AbacatePayBilling }

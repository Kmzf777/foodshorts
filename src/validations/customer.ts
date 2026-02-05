import { z } from 'zod'

// Validação de CPF
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(10))) return false

  return true
}

// Validação de telefone brasileiro
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

export const customerRegisterSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z
    .string()
    .min(11, 'CPF inválido')
    .refine((val) => isValidCPF(val), { message: 'CPF inválido' }),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .refine((val) => isValidPhone(val), { message: 'Telefone inválido' }),
  whatsapp: z
    .string()
    .min(10, 'WhatsApp inválido')
    .refine((val) => isValidPhone(val), { message: 'WhatsApp inválido' }),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export const customerLoginSchema = z.object({
  cpf: z
    .string()
    .min(11, 'CPF inválido')
    .refine((val) => isValidCPF(val), { message: 'CPF inválido' }),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>

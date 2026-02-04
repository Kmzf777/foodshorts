# FoodShorts 🍕📱

Cardápio digital interativo com vídeos curtos verticais (9:16), estilo TikTok/Reels.

## Sobre o Projeto

FoodShorts é um SaaS B2B que transforma a experiência de pedidos em restaurantes através de vídeos curtos e imersivos dos pratos. Com uma interface intuitiva estilo redes sociais, os clientes navegam pelo cardápio com scroll vertical, visualizam os pratos em vídeo e fazem pedidos de forma rápida e envolvente.

### Principais Funcionalidades

- **VideoFeed**: Experiência imersiva estilo TikTok para visualização do cardápio
- **QR Code por Mesa**: Cada mesa tem seu QR Code único para rastreamento de pedidos
- **Modo Delivery**: Suporte para pedidos delivery com autenticação de clientes
- **Dashboard Completo**: Painel de gerenciamento com métricas em tempo real
- **VideoUploader**: Upload de vídeos com processamento automático (crop 9:16, até 15s)
- **Integração de Pagamento**: AbacatePay para assinaturas via PIX

## Stack Tecnológica

- **Frontend**: Next.js 14.2+ (App Router) + TypeScript 5.6+
- **Estilização**: Tailwind CSS 3.4+ + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand 4.5+
- **Vídeo Processing**: FFmpeg.wasm 0.12+
- **Pagamentos**: AbacatePay API v1
- **Forms**: React Hook Form + Zod

## Estrutura do Projeto

\`\`\`
src/
├── app/
│   ├── (auth)/              # Login e cadastro
│   ├── (marketing)/         # Landing page e pricing
│   ├── (dashboard)/         # Painel administrativo
│   ├── cardapio/[slug]/    # Cardápio público
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Componentes base (Radix UI)
│   ├── cardapio/           # VideoFeed, ProductCard, etc.
│   ├── dashboard/          # Componentes admin
│   └── shared/             # Componentes compartilhados
├── lib/                     # Utilitários e configs
├── hooks/                   # Custom hooks
├── stores/                  # Zustand stores
├── types/                   # TypeScript types
└── validations/            # Schemas Zod
\`\`\`

## Setup do Projeto

### 1. Pré-requisitos

- Node.js 20+ e npm
- Conta no Supabase (https://supabase.com)
- Conta no AbacatePay (https://abacatepay.com)

### 2. Instalação

\`\`\`bash
# Clone o repositório
git clone <url>
cd FOODSHORTS

# Instale as dependências
npm install
\`\`\`

### 3. Configuração do Supabase

1. Crie um novo projeto no Supabase Dashboard
2. Execute o schema SQL (ver seção "Schema SQL" abaixo)
3. Configure os buckets de storage:
   - Nome: \`videos\` (público)
   - Nome: \`logos\` (público)

### 4. Variáveis de Ambiente

Crie um arquivo \`.env.local\`:

\`\`\`env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ABACATEPAY
ABACATEPAY_API_KEY=your_api_key
ABACATEPAY_WEBHOOK_SECRET=your_webhook_secret

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FoodShorts

# PRICING (em centavos)
MONTHLY_PRICE_CENTS=4990
ANNUAL_PRICE_CENTS=35880
\`\`\`

### 5. Executar o Projeto

\`\`\`bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
\`\`\`

## Schema SQL

Execute o SQL abaixo no Supabase SQL Editor:

Ver arquivo \`supabase-schema.sql\` na raiz do projeto.

## Fluxos Principais

### Fluxo Restaurante
1. Cadastro → Escolha de plano → Pagamento (AbacatePay)
2. Configuração do restaurante (nome, logo, número de mesas)
3. Criação de categorias e produtos com vídeos
4. Compartilhamento do link do cardápio

### Fluxo Cliente (Mesa)
1. Acesso via QR Code: \`/cardapio/[slug]?mesa=N\`
2. Navegação por vídeos (scroll vertical)
3. Adição de produtos ao carrinho
4. Confirmação com nome para chamar
5. Pedido enviado ao dashboard do restaurante

### Fluxo Cliente (Delivery)
1. Acesso: \`/cardapio/[slug]\`
2. Navegação por vídeos
3. Login/cadastro (se delivery ativado)
4. Preenchimento de endereço
5. Seleção de forma de pagamento
6. Confirmação do pedido

## Deploy

### Vercel (Recomendado)

\`\`\`bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel
\`\`\`

Configure as variáveis de ambiente no dashboard da Vercel.

### Webhooks do AbacatePay

Configure a URL do webhook no dashboard do AbacatePay:
\`https://seu-dominio.com/api/webhooks/abacatepay\`

## Licença

Todos os direitos reservados © 2024 FoodShorts

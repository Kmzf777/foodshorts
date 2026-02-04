# 🍔 FoodShorts - Plano de Implementação Técnica (PRD)

## Resumo

**FoodShorts** é um SaaS B2B de cardápio digital interativo baseado em vídeos curtos verticais (9:16), inspirado na experiência de consumo do TikTok e Instagram Reels. A plataforma permite que restaurantes criem cardápios visuais imersivos com vídeos de até 15 segundos por produto, oferecendo dois modos de operação: **Mesa** (via QR Code com rastreamento de mesa) e **Delivery** (com autenticação de cliente e endereço).

O diferencial técnico está no sistema de rastreamento de origem do pedido via URL dinâmica, na experiência mobile-first de scroll infinito de vídeos e no painel administrativo completo para gestão de produtos, pedidos e métricas.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| **Framework** | Next.js (App Router) | 14.2+ |
| **Linguagem** | TypeScript | 5.6+ |
| **Estilização** | Tailwind CSS | 3.4+ |
| **UI Components** | Radix UI + Lucide Icons | Latest |
| **Banco de Dados** | Supabase (PostgreSQL) | Latest |
| **Autenticação** | Supabase Auth | Built-in |
| **Storage** | Supabase Storage | Built-in |
| **Pagamentos** | AbacatePay API | v1 |
| **Video Processing** | FFmpeg.wasm (crop client-side) | 0.12+ |
| **State Management** | Zustand | 4.5+ |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |

---

## Estrutura de Pastas

```
foodshorts/
├── public/
│   ├── fonts/
│   └── images/
│       └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── cadastro/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                    # Landing Page
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                # Home Dashboard
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx                # Lista de Pedidos
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx            # Detalhe do Pedido
│   │   │   ├── cardapio/
│   │   │   │   ├── page.tsx                # Lista de Produtos
│   │   │   │   ├── criar/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── editar/
│   │   │   │           └── page.tsx
│   │   │   ├── conta/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── cardapio/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx                # Cardápio Público (Reels)
│   │   │       ├── pedido/
│   │   │       │   └── page.tsx            # Carrinho/Finalização
│   │   │       └── layout.tsx
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── abacatepay/
│   │   │   │       └── route.ts
│   │   │   ├── pedidos/
│   │   │   │   └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                             # Componentes base (Button, Input, etc)
│   │   ├── cardapio/
│   │   │   ├── VideoFeed.tsx               # Scroll vertical de vídeos
│   │   │   ├── ProductCard.tsx             # Overlay do produto
│   │   │   ├── CategoryTabs.tsx            # Recomendados | Categorias | Pedido
│   │   │   └── CartBadge.tsx
│   │   ├── dashboard/
│   │   │   ├── MetricsCards.tsx
│   │   │   ├── OrdersTable.tsx
│   │   │   ├── ProductList.tsx
│   │   │   └── VideoUploader.tsx
│   │   ├── checkout/
│   │   │   └── PaymentForm.tsx
│   │   └── shared/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       └── ConfirmDialog.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   # Browser client
│   │   │   ├── server.ts                   # Server client
│   │   │   └── admin.ts                    # Service role client
│   │   ├── abacatepay.ts                   # SDK AbacatePay
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useRestaurant.ts
│   │   └── useOrders.ts
│   ├── stores/
│   │   └── cartStore.ts                    # Zustand store
│   ├── types/
│   │   ├── database.types.ts               # Supabase generated types
│   │   └── index.ts
│   └── validations/
│       ├── product.ts
│       ├── order.ts
│       └── auth.ts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Dependências Principais

```json
{
  "name": "foodshorts",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "supabase gen types typescript --project-id $PROJECT_ID > src/types/database.types.ts"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@supabase/supabase-js": "2.45.4",
    "@supabase/ssr": "0.5.1",
    "zustand": "4.5.5",
    "react-hook-form": "7.53.0",
    "@hookform/resolvers": "3.9.0",
    "zod": "3.23.8",
    "@radix-ui/react-dialog": "1.1.1",
    "@radix-ui/react-tabs": "1.1.0",
    "@radix-ui/react-avatar": "1.1.0",
    "@radix-ui/react-dropdown-menu": "2.1.1",
    "lucide-react": "0.446.0",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.2",
    "@ffmpeg/ffmpeg": "0.12.10",
    "@ffmpeg/util": "0.12.1",
    "date-fns": "3.6.0",
    "recharts": "2.12.7",
    "sonner": "1.5.0"
  },
  "devDependencies": {
    "typescript": "5.6.2",
    "@types/node": "22.5.5",
    "@types/react": "18.3.8",
    "@types/react-dom": "18.3.0",
    "tailwindcss": "3.4.12",
    "postcss": "8.4.47",
    "autoprefixer": "10.4.20",
    "eslint": "8.57.1",
    "eslint-config-next": "14.2.15",
    "supabase": "1.200.3"
  }
}
```

---

## Schema SQL (Supabase)

```sql
-- ============================================
-- FOODSHORTS - DATABASE SCHEMA
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE subscription_plan AS ENUM ('monthly', 'annual');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'pending');
CREATE TYPE order_origin AS ENUM ('table', 'delivery');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'canceled');
CREATE TYPE payment_method AS ENUM ('cash', 'credit', 'debit', 'pix');

-- ============================================
-- RESTAURANTS (Tenants)
-- ============================================

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identidade
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    
    -- Configurações
    tables_count INTEGER DEFAULT 10 CHECK (tables_count >= 0 AND tables_count <= 100),
    delivery_enabled BOOLEAN DEFAULT true,
    
    -- Assinatura
    plan subscription_plan NOT NULL DEFAULT 'monthly',
    plan_status subscription_status NOT NULL DEFAULT 'pending',
    plan_expires_at TIMESTAMPTZ,
    abacatepay_customer_id VARCHAR(100),
    abacatepay_subscription_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);

-- ============================================
-- CATEGORIES
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    name VARCHAR(50) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(restaurant_id, name)
);

CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);

-- ============================================
-- PRODUCTS
-- ============================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Conteúdo
    name VARCHAR(100) NOT NULL,
    description TEXT CHECK (char_length(description) <= 500),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    
    -- Mídia
    video_url TEXT NOT NULL,
    video_thumbnail_url TEXT,
    video_duration INTEGER CHECK (video_duration > 0 AND video_duration <= 15),
    
    -- Flags
    is_recommended BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_recommended ON products(restaurant_id, is_recommended) WHERE is_active = true;

-- ============================================
-- CUSTOMERS (Usuários Delivery)
-- ============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Dados pessoais
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Endereço
    address_street VARCHAR(200),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state CHAR(2),
    address_zipcode VARCHAR(10),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_user ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Identificação
    order_number SERIAL,
    
    -- Origem
    origin order_origin NOT NULL,
    table_number INTEGER CHECK (
        (origin = 'table' AND table_number IS NOT NULL) OR
        (origin = 'delivery' AND table_number IS NULL)
    ),
    customer_name VARCHAR(100), -- Nome para chamar (mesa)
    
    -- Valores
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee DECIMAL(10, 2) DEFAULT 0 CHECK (delivery_fee >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    
    -- Status
    status order_status NOT NULL DEFAULT 'pending',
    payment_method payment_method,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_created ON orders(restaurant_id, created_at DESC);
CREATE INDEX idx_orders_origin ON orders(restaurant_id, origin);

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Snapshot do produto no momento do pedido
    product_name VARCHAR(100) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    notes TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- PAYMENTS (Histórico AbacatePay)
-- ============================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    abacatepay_payment_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_restaurant ON payments(restaurant_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    new_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
    new_slug := trim(both '-' from new_slug);
    
    WHILE EXISTS (SELECT 1 FROM restaurants WHERE slug = new_slug) LOOP
        counter := counter + 1;
        new_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || counter;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Restaurants: Owner pode CRUD
CREATE POLICY "Owners can manage their restaurant"
    ON restaurants FOR ALL
    USING (owner_id = auth.uid());

-- Products: Owner pode CRUD, público pode ler ativos
CREATE POLICY "Owners can manage products"
    ON products FOR ALL
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Public can view active products"
    ON products FOR SELECT
    USING (is_active = true);

-- Categories: Owner pode CRUD, público pode ler
CREATE POLICY "Owners can manage categories"
    ON categories FOR ALL
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Public can view categories"
    ON categories FOR SELECT
    USING (is_active = true);

-- Orders: Owner pode ler/atualizar, clientes podem criar
CREATE POLICY "Owners can view their orders"
    ON orders FOR SELECT
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can update order status"
    ON orders FOR UPDATE
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Anyone can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Order Items: Segue política do pedido pai
CREATE POLICY "Order items follow order policy"
    ON order_items FOR ALL
    USING (order_id IN (
        SELECT id FROM orders WHERE restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
    ));

CREATE POLICY "Anyone can create order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Executar no Supabase Dashboard ou via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Storage Policies (via Dashboard):
-- videos: Authenticated users can upload, public can read
-- logos: Authenticated users can upload to their folder, public can read
```

---

## Fluxo de Dados Principal

### Fluxo 1: Cliente acessando Cardápio (Mesa)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUXO: PEDIDO VIA MESA (QR CODE)                     │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   CLIENTE   │
    │ Escaneia QR │
    └──────┬──────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │ URL: /cardapio/pizzaria-do-ze?mesa=5     │
    │                                          │
    │  Query Params:                           │
    │  - mesa: número da mesa (obrigatório)    │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │         NEXT.JS SERVER COMPONENT         │
    │                                          │
    │  1. Extrai slug e mesa do URL            │
    │  2. Valida se restaurante existe         │
    │  3. Valida se mesa é válida              │
    │  4. Busca produtos ativos                │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │              SUPABASE                    │
    │                                          │
    │  SELECT * FROM products                  │
    │  WHERE restaurant_id = $1                │
    │  AND is_active = true                    │
    │  ORDER BY sort_order                     │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │         VIDEO FEED COMPONENT             │
    │                                          │
    │  - Renderiza vídeos em scroll vertical   │
    │  - Lazy load de vídeos                   │
    │  - Overlay com dados do produto          │
    │  - Botão "Adicionar ao Pedido"           │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │          ZUSTAND CART STORE              │
    │                                          │
    │  {                                       │
    │    items: [...],                         │
    │    origin: 'table',                      │
    │    tableNumber: 5,                       │
    │    restaurantSlug: 'pizzaria-do-ze'      │
    │  }                                       │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │       FINALIZAÇÃO DO PEDIDO              │
    │                                          │
    │  1. Cliente informa nome (chamar)        │
    │  2. Revisa itens                         │
    │  3. Confirma pedido                      │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │           API ROUTE /api/pedidos         │
    │                                          │
    │  POST {                                  │
    │    restaurantSlug,                       │
    │    origin: 'table',                      │
    │    tableNumber: 5,                       │
    │    customerName: 'João',                 │
    │    items: [...]                          │
    │  }                                       │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │              SUPABASE                    │
    │                                          │
    │  INSERT INTO orders (...)                │
    │  INSERT INTO order_items (...)           │
    │                                          │
    │  RETURN order_id, order_number           │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │         TELA DE CONFIRMAÇÃO              │
    │                                          │
    │  "Pedido #47 enviado!"                   │
    │  "Aguarde ser chamado: João"             │
    └──────────────────────────────────────────┘
```

### Fluxo 2: Delivery

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FLUXO: PEDIDO DELIVERY                             │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   CLIENTE   │
    │ Acessa link │
    └──────┬──────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │ URL: /cardapio/pizzaria-do-ze            │
    │                                          │
    │  Sem query param 'mesa' = DELIVERY MODE  │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │         NAVEGA E ADICIONA ITENS          │
    │                                          │
    │  Cart Store: origin = 'delivery'         │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │       CLICA EM "VER PEDIDO"              │
    │                                          │
    │  Verifica se está autenticado            │
    │  - SIM: vai para checkout                │
    │  - NÃO: abre modal login/cadastro        │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │          SUPABASE AUTH                   │
    │                                          │
    │  signUp / signIn                         │
    │  Cria/atualiza registro em 'customers'   │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │       CHECKOUT (DELIVERY)                │
    │                                          │
    │  1. Confirma/edita endereço              │
    │  2. Escolhe forma de pagamento           │
    │     (na entrega: dinheiro/cartão/pix)    │
    │  3. Confirma pedido                      │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │           API ROUTE /api/pedidos         │
    │                                          │
    │  POST {                                  │
    │    restaurantSlug,                       │
    │    origin: 'delivery',                   │
    │    customerId: 'uuid',                   │
    │    paymentMethod: 'pix',                 │
    │    items: [...]                          │
    │  }                                       │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │              SUPABASE                    │
    │                                          │
    │  INSERT INTO orders (...)                │
    │  INSERT INTO order_items (...)           │
    └──────────────────┬───────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │         TELA DE CONFIRMAÇÃO              │
    │                                          │
    │  "Pedido #48 recebido!"                  │
    │  "Previsão: 40-50 min"                   │
    └──────────────────────────────────────────┘
```

---

## Lógica Crítica / Algoritmos Específicos

### 1. Video Feed com Scroll Snap (Estilo TikTok)

```typescript
// src/components/cardapio/VideoFeed.tsx

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface VideoFeedProps {
  products: Product[];
  initialIndex?: number;
}

export function VideoFeed({ products, initialIndex = 0 }: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Intersection Observer para detectar vídeo visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const productId = video.dataset.productId;
          
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            // Vídeo está 70%+ visível - play
            video.play().catch(() => {});
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) setActiveIndex(index);
          } else {
            // Vídeo saiu da view - pause e reset
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0.7],
      }
    );

    videoRefs.current.forEach((video) => observer.observe(video));

    return () => observer.disconnect();
  }, [products]);

  const registerVideoRef = useCallback((productId: string, el: HTMLVideoElement | null) => {
    if (el) {
      videoRefs.current.set(productId, el);
    } else {
      videoRefs.current.delete(productId);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className="h-[100dvh] w-full snap-start snap-always relative"
        >
          {/* Video Background */}
          <video
            ref={(el) => registerVideoRef(product.id, el)}
            data-product-id={product.id}
            src={product.video_url}
            poster={product.video_thumbnail_url || undefined}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted
            playsInline
            preload={Math.abs(index - activeIndex) <= 1 ? 'auto' : 'none'}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {/* Product Info Overlay */}
          <ProductCard
            product={product}
            isExpanded={isDescriptionExpanded && activeIndex === index}
            onToggleExpand={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          />
        </div>
      ))}
    </div>
  );
}
```

### 2. Cart Store com Persistência e Rastreamento de Origem

```typescript
// src/stores/cartStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type OrderOrigin = 'table' | 'delivery';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartState {
  // Contexto
  restaurantSlug: string | null;
  origin: OrderOrigin | null;
  tableNumber: number | null;
  
  // Itens
  items: CartItem[];
  
  // Actions
  initializeCart: (slug: string, origin: OrderOrigin, tableNumber?: number) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantSlug: null,
      origin: null,
      tableNumber: null,
      items: [],

      initializeCart: (slug, origin, tableNumber) => {
        const current = get();
        // Se mudar de restaurante, limpa o carrinho
        if (current.restaurantSlug && current.restaurantSlug !== slug) {
          set({ items: [] });
        }
        set({
          restaurantSlug: slug,
          origin,
          tableNumber: origin === 'table' ? tableNumber : null,
        });
      },

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(i => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(i => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], tableNumber: null });
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'foodshorts-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        restaurantSlug: state.restaurantSlug,
        origin: state.origin,
        tableNumber: state.tableNumber,
        items: state.items,
      }),
    }
  )
);
```

### 3. Video Crop com FFmpeg.wasm (Client-Side)

```typescript
// src/lib/video-processor.ts

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

interface ProcessVideoOptions {
  file: File;
  startTime: number;  // em segundos
  duration: number;   // max 15 segundos
  onProgress?: (progress: number) => void;
}

interface ProcessedVideo {
  blob: Blob;
  thumbnail: Blob;
  duration: number;
}

export async function processVideo({
  file,
  startTime,
  duration,
  onProgress,
}: ProcessVideoOptions): Promise<ProcessedVideo> {
  const ff = await getFFmpeg();

  // Validações
  if (duration > 15) {
    throw new Error('Duração máxima é 15 segundos');
  }

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  const thumbnailName = 'thumbnail.jpg';

  // Progress handler
  ff.on('progress', ({ progress }) => {
    onProgress?.(Math.round(progress * 100));
  });

  // Carregar arquivo
  await ff.writeFile(inputName, await fetchFile(file));

  // Cortar vídeo mantendo aspect ratio 9:16
  // -ss: start time, -t: duration
  // scale + crop para garantir 9:16
  await ff.exec([
    '-ss', startTime.toString(),
    '-i', inputName,
    '-t', duration.toString(),
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputName,
  ]);

  // Gerar thumbnail do primeiro frame
  await ff.exec([
    '-i', outputName,
    '-vframes', '1',
    '-vf', 'scale=540:960',
    '-q:v', '2',
    thumbnailName,
  ]);

  // Ler arquivos processados
  const videoData = await ff.readFile(outputName);
  const thumbnailData = await ff.readFile(thumbnailName);

  // Limpar
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);
  await ff.deleteFile(thumbnailName);

  return {
    blob: new Blob([videoData], { type: 'video/mp4' }),
    thumbnail: new Blob([thumbnailData], { type: 'image/jpeg' }),
    duration,
  };
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Erro ao carregar vídeo'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}
```

---

## Integração AbacatePay

```typescript
// src/lib/abacatepay.ts

const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';
const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY!;

interface CreateCustomerParams {
  name: string;
  email: string;
  cellphone?: string;
  taxId?: string; // CPF/CNPJ
}

interface CreateBillingParams {
  customerId: string;
  products: Array<{
    externalId: string;
    name: string;
    quantity: number;
    price: number; // em centavos
  }>;
  frequency: 'ONE_TIME' | 'MONTHLY' | 'YEARLY';
  returnUrl: string;
  completionUrl: string;
}

interface AbacatePayCustomer {
  id: string;
  metadata: {
    name: string;
    email: string;
    cellphone?: string;
    taxId?: string;
  };
}

interface AbacatePayBilling {
  id: string;
  url: string;
  status: string;
  amount: number;
}

class AbacatePayClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${ABACATEPAY_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `AbacatePay error: ${response.status}`);
    }

    return response.json();
  }

  async createCustomer(params: CreateCustomerParams): Promise<AbacatePayCustomer> {
    const response = await this.request<{ data: AbacatePayCustomer }>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        metadata: params,
      }),
    });
    return response.data;
  }

  async createBilling(params: CreateBillingParams): Promise<AbacatePayBilling> {
    const response = await this.request<{ data: AbacatePayBilling }>('/billing/create', {
      method: 'POST',
      body: JSON.stringify({
        customer: { id: params.customerId },
        products: params.products,
        frequency: params.frequency,
        methods: ['PIX'],
        returnUrl: params.returnUrl,
        completionUrl: params.completionUrl,
      }),
    });
    return response.data;
  }

  async getBilling(billingId: string): Promise<AbacatePayBilling> {
    const response = await this.request<{ data: AbacatePayBilling }>(
      `/billing/${billingId}`
    );
    return response.data;
  }

  // Verificar assinatura webhook
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ABACATEPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');
    return signature === expectedSignature;
  }
}

export const abacatepay = new AbacatePayClient();

// Webhook handler
// src/app/api/webhooks/abacatepay/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { abacatepay } from '@/lib/abacatepay';
import { createClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-abacatepay-signature') || '';

  if (!abacatepay.verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(payload);
  const supabase = createClient();

  switch (event.event) {
    case 'billing.paid': {
      const billingId = event.data.billing.id;
      const customerId = event.data.billing.customer.id;

      // Buscar restaurante pelo customer_id
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, plan')
        .eq('abacatepay_customer_id', customerId)
        .single();

      if (restaurant) {
        // Calcular nova data de expiração
        const expiresAt = new Date();
        if (restaurant.plan === 'annual') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Atualizar status da assinatura
        await supabase
          .from('restaurants')
          .update({
            plan_status: 'active',
            plan_expires_at: expiresAt.toISOString(),
            abacatepay_subscription_id: billingId,
          })
          .eq('id', restaurant.id);

        // Registrar pagamento
        await supabase.from('payments').insert({
          restaurant_id: restaurant.id,
          abacatepay_payment_id: event.data.payment?.id || billingId,
          amount: event.data.billing.amount / 100,
          status: 'paid',
          metadata: event.data,
        });
      }
      break;
    }

    case 'billing.expired':
    case 'subscription.canceled': {
      const customerId = event.data.billing?.customer?.id || event.data.subscription?.customer?.id;

      if (customerId) {
        await supabase
          .from('restaurants')
          .update({ plan_status: 'expired' })
          .eq('abacatepay_customer_id', customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## Endpoints da API

### API Routes (Next.js App Router)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/signup` | Cadastro de restaurante |
| `POST` | `/api/auth/customer-signup` | Cadastro de cliente delivery |
| `GET` | `/api/restaurants/[slug]` | Dados públicos do restaurante |
| `GET` | `/api/restaurants/[slug]/products` | Produtos do cardápio |
| `GET` | `/api/restaurants/[slug]/categories` | Categorias do cardápio |
| `POST` | `/api/pedidos` | Criar novo pedido |
| `GET` | `/api/dashboard/orders` | Listar pedidos (auth) |
| `GET` | `/api/dashboard/orders/[id]` | Detalhe do pedido (auth) |
| `PATCH` | `/api/dashboard/orders/[id]/status` | Atualizar status (auth) |
| `GET` | `/api/dashboard/products` | Listar produtos (auth) |
| `POST` | `/api/dashboard/products` | Criar produto (auth) |
| `PATCH` | `/api/dashboard/products/[id]` | Editar produto (auth) |
| `DELETE` | `/api/dashboard/products/[id]` | Deletar produto (auth) |
| `GET` | `/api/dashboard/metrics` | Métricas do dashboard (auth) |
| `POST` | `/api/upload/video` | Upload de vídeo (auth) |
| `POST` | `/api/checkout/create-billing` | Criar cobrança AbacatePay |
| `POST` | `/api/webhooks/abacatepay` | Webhook AbacatePay |

---

## Variáveis de Ambiente (.env.local)

```bash
# ===========================================
# SUPABASE
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# ABACATEPAY
# ===========================================
ABACATEPAY_API_KEY=abc_live_xxxxxxxxxxxxxxxx
ABACATEPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# ===========================================
# APP CONFIG
# ===========================================
NEXT_PUBLIC_APP_URL=https://foodshorts.com.br
NEXT_PUBLIC_APP_NAME=FoodShorts

# ===========================================
# PRICING (em centavos para AbacatePay)
# ===========================================
MONTHLY_PRICE_CENTS=4990
ANNUAL_PRICE_CENTS=35880
```

---

## Ordem de Implementação

### Fase 1: Fundação (Dias 1-3)
1. Setup do projeto Next.js com TypeScript e Tailwind
2. Configuração do Supabase (projeto, buckets, schema SQL)
3. Implementação do Supabase Auth (login/cadastro restaurante)
4. Criação dos componentes UI base (Button, Input, Dialog, etc.)
5. Layout do dashboard com sidebar

### Fase 2: CRUD de Produtos (Dias 4-6)
6. Página `/dashboard/cardapio` - listagem de produtos
7. Componente VideoUploader com FFmpeg.wasm
8. Página `/dashboard/cardapio/criar` - criação de produto
9. Página `/dashboard/cardapio/[id]/editar` - edição
10. Funcionalidade de deletar com confirmação "CONFIRMAR"

### Fase 3: Cardápio Público (Dias 7-10)
11. Página `/cardapio/[slug]` - server component
12. Componente VideoFeed com scroll snap vertical
13. Componente ProductCard com overlay
14. Componente CategoryTabs (Recomendados | Categorias | Pedido)
15. Implementação do CartStore (Zustand)
16. Sistema de rastreamento mesa/delivery via URL

### Fase 4: Sistema de Pedidos (Dias 11-13)
17. Página de finalização de pedido (mesa)
18. Modal de login/cadastro para delivery
19. Página de finalização de pedido (delivery)
20. API Route `/api/pedidos` - criar pedido
21. Página `/dashboard/pedidos` - listagem
22. Página `/dashboard/pedidos/[id]` - detalhe

### Fase 5: Dashboard & Métricas (Dias 14-15)
23. Componente MetricsCards (pedidos dia/semana/mês)
24. Componente OrdersTable com últimos pedidos
25. API Route `/api/dashboard/metrics`
26. Atualização de status de pedido

### Fase 6: Conta & Assinatura (Dias 16-18)
27. Página `/dashboard/conta` - dados do restaurante
28. Integração AbacatePay - criar billing
29. Página `/checkout` - finalização do pagamento
30. Webhook AbacatePay - atualizar status
31. Exibição de plano e cronômetro de expiração
32. Funcionalidade de cancelamento

### Fase 7: Landing Page & Marketing (Dias 19-21)
33. Landing page com copy de conversão
34. Página `/pricing` com planos
35. SEO e meta tags
36. Animações e polish

### Fase 8: Testes & Deploy (Dias 22-25)
37. Testes E2E do fluxo de pedido
38. Testes do webhook de pagamento
39. Otimização de performance (lazy load, caching)
40. Deploy na Vercel
41. Configuração de domínio customizado
42. Monitoramento e analytics

---

## Verificação Final (Checklist E2E)

### 1. Fluxo Restaurante
```
□ Acessar foodshorts.com.br
□ Clicar em "Começar Agora"
□ Criar conta com email/senha
□ Ser redirecionado para checkout
□ Pagar via PIX (AbacatePay)
□ Ser redirecionado para dashboard
□ Criar categoria "Pizzas"
□ Criar produto com vídeo de 15s
□ Ver produto na listagem
□ Copiar link do cardápio
```

### 2. Fluxo Cliente Mesa
```
□ Acessar /cardapio/[slug]?mesa=5
□ Ver vídeos em scroll vertical
□ Tocar em produto para expandir descrição
□ Adicionar 2 itens ao carrinho
□ Ver badge com "2" no header
□ Clicar em "Pedido"
□ Informar nome "João"
□ Confirmar pedido
□ Ver tela de confirmação com número do pedido
```

### 3. Fluxo Cliente Delivery
```
□ Acessar /cardapio/[slug] (sem mesa)
□ Adicionar itens ao carrinho
□ Clicar em "Pedido"
□ Ver modal de login/cadastro
□ Criar conta com email
□ Preencher endereço
□ Escolher pagamento na entrega (PIX)
□ Confirmar pedido
□ Ver tela de confirmação
```

### 4. Fluxo Dashboard - Pedidos
```
□ Acessar /dashboard/pedidos
□ Ver pedido da mesa 5 com ícone de mesa
□ Ver pedido delivery com ícone de moto
□ Clicar no pedido mesa - ver nome "João" e mesa 5
□ Clicar no pedido delivery - ver dados do cliente
□ Atualizar status para "Preparando"
□ Atualizar status para "Pronto"
```

### 5. Métricas
```
□ Acessar /dashboard
□ Ver total de pedidos do dia
□ Ver total de pedidos da semana
□ Ver total de pedidos do mês
□ Ver lista dos últimos pedidos
□ Verificar se origem está correta (mesa/delivery)
```

### 6. Conta e Assinatura
```
□ Acessar /dashboard/conta
□ Ver nome e logo do restaurante
□ Ver plano ativo (mensal ou anual)
□ Ver cronômetro de expiração
□ Testar cancelamento de assinatura
```

---

Pronto para começar a implementação? Posso detalhar qualquer seção específica ou começar a criar os arquivos de código.
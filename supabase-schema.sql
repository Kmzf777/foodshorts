-- ============================================
-- FOODSHORTS - DATABASE SCHEMA
-- Execute este arquivo no Supabase SQL Editor
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
    customer_name VARCHAR(100),

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

-- Customers: Usuários podem gerenciar seus próprios dados
CREATE POLICY "Users can manage own customer data"
    ON customers FOR ALL
    USING (user_id = auth.uid());

-- Payments: Apenas owner do restaurante
CREATE POLICY "Owners can view payments"
    ON payments FOR SELECT
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

-- ============================================
-- CONCLUÍDO!
-- ============================================
-- Execute este arquivo completo no Supabase SQL Editor.
-- Depois crie os buckets de storage no Dashboard:
-- 1. Bucket 'videos' (público)
-- 2. Bucket 'logos' (público)

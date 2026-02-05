-- ============================================
-- FOODSHORTS - MIGRATION: Endereco Completo do Restaurante
-- Execute este arquivo no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ATUALIZAR TABELA RESTAURANTS
-- Adicionar endereco completo e tempo de preparo
-- ============================================

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS address_zipcode VARCHAR(10),
ADD COLUMN IF NOT EXISTS address_street VARCHAR(200),
ADD COLUMN IF NOT EXISTS address_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS address_complement VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_neighborhood VARCHAR(100),
ADD COLUMN IF NOT EXISTS avg_prep_time INTEGER DEFAULT 30;

-- Comentarios para documentacao
COMMENT ON COLUMN restaurants.address_zipcode IS 'CEP do restaurante';
COMMENT ON COLUMN restaurants.address_street IS 'Rua do restaurante';
COMMENT ON COLUMN restaurants.address_number IS 'Numero do endereco';
COMMENT ON COLUMN restaurants.address_complement IS 'Complemento do endereco';
COMMENT ON COLUMN restaurants.address_neighborhood IS 'Bairro do restaurante';
COMMENT ON COLUMN restaurants.avg_prep_time IS 'Tempo medio de preparo em minutos';

-- ============================================
-- CONCLUIDO!
-- ============================================

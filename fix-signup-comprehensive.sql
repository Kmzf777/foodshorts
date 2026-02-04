-- =================================================================
-- FIX SIGNUP ERROR (COMPREHENSIVE)
-- =================================================================
-- Este script vai ajudar a identificar e remover o trigger problemático.

-- 1. PRIMEIRO: Execute esta parte para ver quais triggers existem na tabela auth.users
x

-- =================================================================
-- 2. SEGUNDO: Baseado no resultado acima, remova o trigger que não deveria estar lá.
-- Abaixo estão comandos genéricos que tentam remover TODOS os triggers comuns.
-- Execute todos eles se não tiver certeza.
-- =================================================================

-- Tenta remover 'handle_new_user' (nome muito comum)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Tenta remover 'on_signup' (outro nome comum)
DROP TRIGGER IF EXISTS on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.handle_signup();

-- Tenta remover 'create_profile_on_signup' (outro nome comum)
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- =================================================================
-- 3. TERCEIRO: Verifique se existe alguma função RPC sendo chamada incorretamente.
-- Se o erro persistir, pode ser uma configuração de SMTP inválida no Supabase
-- (Authentication -> Email Settings). O Supabase tenta enviar email de confirmação
-- e se falhar (ex: rate limit ou config errada), pode retornar 500.
-- =================================================================

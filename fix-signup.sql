-- =================================================================
-- FIX SIGNUP ERROR
-- =================================================================
-- O erro "Database error saving new user" geralmente ocorre quando
-- existe um TRIGGER na tabela auth.users que está falhando.
--
-- Como seu código (page.tsx) faz a criação do restaurante manualmente
-- após o cadastro, não precisamos de triggers automáticos aqui.
-- =================================================================

-- 1. Remover trigger comum de "handle_new_user" se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Remover a função associada se existir
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Remover outros possíveis nomes de triggers/funções comuns
DROP TRIGGER IF EXISTS on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.handle_signup();

-- =================================================================
-- Como verificar se resolveu:
-- Tente criar uma conta novamente na página /cadastro.
-- =================================================================

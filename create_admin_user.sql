-- Script para criar usuário administrador
-- Execute este script no SQL Editor do Dashboard do Supabase

-- 1. Primeiro, crie um usuário através da interface de autenticação do Supabase
-- 2. Depois execute este script substituindo 'SEU_USER_ID_AQUI' pelo ID do usuário criado

-- Atualizar o perfil do usuário para ADMINISTRADOR
UPDATE profiles 
SET role = 'ADMINISTRADOR'
WHERE id = 'SEU_USER_ID_AQUI';

-- Verificar se a atualização foi bem-sucedida
SELECT id, email, nome_completo, role, created_at 
FROM profiles 
WHERE role = 'ADMINISTRADOR';

-- Exemplo de como criar um usuário administrador completo:
-- (substitua os valores pelos dados reais)
/*
INSERT INTO profiles (id, email, nome_completo, role)
VALUES (
  'uuid-do-usuario-aqui',
  'admin@exemplo.com',
  'Administrador do Sistema',
  'ADMINISTRADOR'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'ADMINISTRADOR',
  updated_at = NOW();
*/
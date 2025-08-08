-- Script para definir Igor como administrador
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar se a tabela profiles existe e criar se necessário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'USUARIO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para permitir que administradores vejam todos os perfis
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Política para permitir que administradores atualizem perfis
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Política para permitir inserção de novos perfis
CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para buscar o ID do usuário Igor pelo email
DO $$
DECLARE
    igor_user_id UUID;
BEGIN
    -- Buscar o ID do usuário Igor
    SELECT id INTO igor_user_id 
    FROM auth.users 
    WHERE email = 'igor.gregio44@gmail.com'
    LIMIT 1;
    
    -- Se o usuário foi encontrado, criar/atualizar o perfil
    IF igor_user_id IS NOT NULL THEN
        -- Inserir ou atualizar o perfil do Igor como administrador
        INSERT INTO profiles (id, role)
        VALUES (igor_user_id, 'ADMINISTRADOR')
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'ADMINISTRADOR',
            updated_at = NOW();
        
        RAISE NOTICE 'Igor definido como ADMINISTRADOR com sucesso! ID: %', igor_user_id;
    ELSE
        RAISE NOTICE 'Usuário igor.gregio44@gmail.com não encontrado. Certifique-se de que o usuário foi criado.';
    END IF;
END $$;

-- Verificar o resultado
SELECT 
    u.email,
    p.role,
    p.created_at,
    p.updated_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'igor.gregio44@gmail.com';
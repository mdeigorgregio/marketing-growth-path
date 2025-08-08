-- Implementar sistema CRM com autenticação e permissões

-- 1. Atualizar enum de roles para incluir os três níveis
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('ADMINISTRADOR', 'EDITOR', 'USUARIO');

-- 2. Atualizar tabela user_roles para usar os novos roles
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'USUARIO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Atualizar tabela profiles
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  nome_completo TEXT,
  role app_role DEFAULT 'USUARIO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Renomear tabela projects para clientes
ALTER TABLE IF EXISTS public.projects RENAME TO clientes;

-- 5. Adicionar user_id à tabela clientes se não existir
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 6. Atualizar referências nas tabelas notes e appointments
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_project_id_fkey;
ALTER TABLE public.notes RENAME COLUMN project_id TO cliente_id;
ALTER TABLE public.notes ADD CONSTRAINT notes_cliente_id_fkey 
  FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_project_id_fkey;
ALTER TABLE public.appointments RENAME COLUMN project_id TO cliente_id;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_cliente_id_fkey 
  FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;

-- 7. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 8. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own projects" ON public.clientes;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.clientes;
DROP POLICY IF EXISTS "Users can update own projects" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.clientes;

DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;

DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON public.appointments;

-- 9. Criar função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- 10. Criar função para verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION public.has_permission(required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN public.get_user_role(auth.uid()) = 'ADMINISTRADOR' THEN true
    WHEN public.get_user_role(auth.uid()) = 'EDITOR' AND required_role IN ('EDITOR', 'USUARIO') THEN true
    WHEN public.get_user_role(auth.uid()) = 'USUARIO' AND required_role = 'USUARIO' THEN true
    ELSE false
  END;
$$;

-- 11. Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 12. Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 13. Políticas RLS para clientes baseadas em role
CREATE POLICY "Users can view clients based on role" ON public.clientes
  FOR SELECT USING (
    CASE 
      WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
      ELSE user_id = auth.uid()
    END
  );

CREATE POLICY "Users can insert their own clients" ON public.clientes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update based on role" ON public.clientes
  FOR UPDATE USING (
    CASE 
      WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
      ELSE user_id = auth.uid()
    END
  );

CREATE POLICY "Users can delete based on role" ON public.clientes
  FOR DELETE USING (
    CASE 
      WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
      ELSE user_id = auth.uid()
    END
  );

-- 14. Políticas RLS para notes
CREATE POLICY "Users can view notes based on client access" ON public.notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = notes.cliente_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE c.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can insert notes for accessible clients" ON public.notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = notes.cliente_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE c.user_id = auth.uid()
        END
      )
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update notes based on client access" ON public.notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = notes.cliente_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE c.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can delete notes based on client access" ON public.notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = notes.cliente_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE c.user_id = auth.uid()
        END
      )
    )
  );

-- 15. Políticas RLS para appointments (similar às notes)
CREATE POLICY "Users can view appointments based on client access" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = appointments.cliente_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE c.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can insert appointments for accessible clients" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = appointments.cliente_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE c.user_id = auth.uid()
        END
      )
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update appointments based on client access" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = appointments.cliente_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE c.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can delete appointments based on client access" ON public.appointments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clientes c 
      WHERE c.id = appointments.cliente_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE c.user_id = auth.uid()
        END
      )
    )
  );

-- 16. Trigger para profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Função para criar perfil e role quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Inserir perfil
  INSERT INTO public.profiles (id, email, nome_completo, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
    'USUARIO'
  );
  
  -- Inserir role padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'USUARIO');
  
  RETURN NEW;
END;
$$;

-- 18. Trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 19. Criar usuário administrador padrão
-- Nota: Este INSERT será feito via código da aplicação pois requer hash da senha

-- 20. Função para promover usuário a admin (para uso via código)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', user_email;
  END IF;
  
  -- Atualizar role no profiles
  UPDATE public.profiles
  SET role = 'ADMINISTRADOR'
  WHERE id = target_user_id;
  
  -- Atualizar role no user_roles
  UPDATE public.user_roles
  SET role = 'ADMINISTRADOR'
  WHERE user_id = target_user_id;
  
  -- Se não existir entrada em user_roles, criar
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'ADMINISTRADOR')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
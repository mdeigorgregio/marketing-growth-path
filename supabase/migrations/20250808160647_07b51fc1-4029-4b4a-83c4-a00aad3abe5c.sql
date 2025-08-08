-- Limpar dados existentes para evitar conflitos
DELETE FROM public.appointments;
DELETE FROM public.notes;

-- Adicionar campos financeiros na tabela projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS valor_plano numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_contrato date,
ADD COLUMN IF NOT EXISTS data_vencimento date,
ADD COLUMN IF NOT EXISTS status_pagamento text CHECK (status_pagamento IN ('Adimplente', 'Inadimplente', 'Pendente')) DEFAULT 'Adimplente',
ADD COLUMN IF NOT EXISTS dias_atraso integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_em_atraso numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS observacoes text;

-- Recriar tabela appointments com cliente_id
DROP TABLE IF EXISTS public.appointments;
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Recriar tabela notes com cliente_id
DROP TABLE IF EXISTS public.notes;
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para appointments
CREATE POLICY "Users can view own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" 
ON public.appointments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para notes
CREATE POLICY "Users can view own notes" 
ON public.notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" 
ON public.notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" 
ON public.notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
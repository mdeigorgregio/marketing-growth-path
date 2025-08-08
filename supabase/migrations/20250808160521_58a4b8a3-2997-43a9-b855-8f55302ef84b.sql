-- Adicionar campos financeiros na tabela projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS valor_plano numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_contrato date,
ADD COLUMN IF NOT EXISTS data_vencimento date,
ADD COLUMN IF NOT EXISTS status_pagamento text CHECK (status_pagamento IN ('Adimplente', 'Inadimplente', 'Pendente')) DEFAULT 'Adimplente',
ADD COLUMN IF NOT EXISTS dias_atraso integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_em_atraso numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS observacoes text;

-- Corrigir tabela appointments para usar cliente_id
ALTER TABLE public.appointments 
DROP COLUMN IF EXISTS project_id,
ADD COLUMN IF NOT EXISTS cliente_id uuid NOT NULL;

-- Corrigir tabela notes para usar cliente_id  
ALTER TABLE public.notes
DROP COLUMN IF EXISTS project_id,
ADD COLUMN IF NOT EXISTS cliente_id uuid NOT NULL;

-- Criar tabela de histórico WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  telefone text NOT NULL,
  mensagem text NOT NULL,
  tipo_mensagem text CHECK (tipo_mensagem IN ('saudacao', 'cobranca', 'followup', 'lembrete')),
  enviado_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS para whatsapp_history
ALTER TABLE public.whatsapp_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para whatsapp_history
CREATE POLICY "Users can view own whatsapp history" 
ON public.whatsapp_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whatsapp history" 
ON public.whatsapp_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar tabela de automações
CREATE TABLE IF NOT EXISTS public.automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  trigger_type text NOT NULL,
  trigger_conditions jsonb DEFAULT '{}',
  actions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS para automations
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para automations
CREATE POLICY "Users can manage own automations" 
ON public.automations 
FOR ALL 
USING (auth.uid() = user_id);

-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cliente_id uuid,
  title text NOT NULL,
  description text,
  type text CHECK (type IN ('geral', 'cobranca', 'followup', 'ligacao', 'email')),
  priority text CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  status text CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')) DEFAULT 'pendente',
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS para tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tasks
CREATE POLICY "Users can manage own tasks" 
ON public.tasks 
FOR ALL 
USING (auth.uid() = user_id);

-- Função para atualizar status de pagamento automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_status_pagamento()
RETURNS void AS $$
BEGIN
  UPDATE public.projects 
  SET 
    dias_atraso = CASE 
      WHEN data_vencimento < CURRENT_DATE THEN CURRENT_DATE - data_vencimento
      ELSE 0
    END,
    valor_em_atraso = CASE
      WHEN data_vencimento < CURRENT_DATE THEN valor_plano
      ELSE 0
    END,
    status_pagamento = CASE
      WHEN data_vencimento < CURRENT_DATE THEN 'Inadimplente'
      WHEN data_vencimento <= CURRENT_DATE + INTERVAL '3 days' THEN 'Pendente'
      ELSE 'Adimplente'
    END
  WHERE data_vencimento IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_automations_updated_at
BEFORE UPDATE ON public.automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
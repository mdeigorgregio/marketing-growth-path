-- Adicionar campos de controle financeiro à tabela clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS valor_plano numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_contrato date,
ADD COLUMN IF NOT EXISTS data_vencimento date,
ADD COLUMN IF NOT EXISTS status_pagamento text CHECK (status_pagamento IN ('Adimplente', 'Inadimplente', 'Pendente')) DEFAULT 'Adimplente',
ADD COLUMN IF NOT EXISTS dias_atraso integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_em_atraso numeric DEFAULT 0;

-- Criar tabela para histórico de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  telefone text NOT NULL,
  mensagem text NOT NULL,
  template_usado text,
  data_envio timestamp with time zone DEFAULT now(),
  status text DEFAULT 'enviado',
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para agendamentos/calendário
CREATE TABLE IF NOT EXISTS agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text CHECK (tipo IN ('Reunião', 'Ligação', 'Follow-up', 'Visita', 'Demo')) DEFAULT 'Reunião',
  data_inicio timestamp with time zone NOT NULL,
  data_fim timestamp with time zone NOT NULL,
  local_link text,
  participantes text[],
  descricao text,
  lembrete_minutos integer DEFAULT 15,
  status text CHECK (status IN ('Agendado', 'Realizado', 'Cancelado', 'Reagendado')) DEFAULT 'Agendado',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para automações
CREATE TABLE IF NOT EXISTS automacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean DEFAULT true,
  trigger_tipo text NOT NULL, -- 'cliente_criado', 'status_mudou', 'sem_contato', 'vencimento_proximo', etc.
  trigger_config jsonb DEFAULT '{}',
  condicoes jsonb DEFAULT '[]',
  acoes jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para execuções de automação
CREATE TABLE IF NOT EXISTS automacao_execucoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automacao_id uuid REFERENCES automacoes(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pendente', 'executando', 'concluida', 'erro')) DEFAULT 'pendente',
  resultado jsonb DEFAULT '{}',
  erro text,
  executado_em timestamp with time zone DEFAULT now()
);

-- Criar tabela para templates de email
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL, -- 'cobranca', 'welcome', 'follow_up', 'newsletter'
  assunto text NOT NULL,
  corpo text NOT NULL,
  variaveis text[] DEFAULT '{}',
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para histórico de emails
CREATE TABLE IF NOT EXISTS email_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  email_para text NOT NULL,
  assunto text NOT NULL,
  corpo text NOT NULL,
  status text CHECK (status IN ('enviado', 'entregue', 'aberto', 'clicado', 'erro')) DEFAULT 'enviado',
  data_envio timestamp with time zone DEFAULT now(),
  data_abertura timestamp with time zone,
  erro text
);

-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  tipo text CHECK (tipo IN ('ligacao', 'email', 'reuniao', 'follow_up', 'cobrar_pagamento', 'negociar_parcelamento', 'verificar_pagamento', 'seguir_whatsapp', 'renovar_contrato')) DEFAULT 'ligacao',
  prioridade text CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  status text CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')) DEFAULT 'pendente',
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  usuario_responsavel text,
  data_vencimento timestamp with time zone,
  data_conclusao timestamp with time zone,
  observacoes text,
  valor_relacionado numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN (
    'vencimento_hoje', 'cliente_inadimplente', 'atraso_30_dias', 
    'pagamento_regularizado', 'alto_valor_atraso', 'vencimento_proximo',
    'novo_cliente', 'tarefa_vencida', 'meta_atingida', 'sistema'
  )),
  titulo text NOT NULL,
  mensagem text NOT NULL,
  prioridade text CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  lida boolean DEFAULT false,
  acao_url text,
  acao_texto text,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  usuario_id text,
  valor_relacionado numeric,
  data_vencimento date,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de configurações de notificação
CREATE TABLE IF NOT EXISTS configuracoes_notificacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id text,
  tipo_notificacao text NOT NULL,
  ativa boolean DEFAULT true,
  email boolean DEFAULT true,
  push boolean DEFAULT true,
  sms boolean DEFAULT false,
  antecedencia_dias integer DEFAULT 0,
  horario_envio time DEFAULT '09:00:00',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(usuario_id, tipo_notificacao)
);

-- Criar função para atualizar status de pagamento automaticamente
CREATE OR REPLACE FUNCTION atualizar_status_pagamento()
RETURNS void AS $$
BEGIN
  -- Atualizar dias de atraso e status
  UPDATE clientes 
  SET 
    dias_atraso = CASE 
      WHEN data_vencimento < CURRENT_DATE THEN CURRENT_DATE - data_vencimento
      ELSE 0
    END,
    status_pagamento = CASE
      WHEN data_vencimento IS NULL THEN 'Adimplente'
      WHEN data_vencimento >= CURRENT_DATE THEN 'Adimplente'
      WHEN data_vencimento < CURRENT_DATE AND data_vencimento >= CURRENT_DATE - INTERVAL '3 days' THEN 'Pendente'
      ELSE 'Inadimplente'
    END,
    valor_em_atraso = CASE
      WHEN data_vencimento < CURRENT_DATE THEN valor_plano
      ELSE 0
    END
  WHERE data_vencimento IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_status_pagamento ON clientes(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_clientes_data_vencimento ON clientes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_clientes_dias_atraso ON clientes(dias_atraso);
CREATE INDEX IF NOT EXISTS idx_whatsapp_history_cliente_id ON whatsapp_history(cliente_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_history_data_envio ON whatsapp_history(data_envio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_inicio ON agendamentos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_automacoes_ativa ON automacoes(ativo);
CREATE INDEX IF NOT EXISTS idx_automacao_execucoes_automacao_id ON automacao_execucoes(automacao_id);
CREATE INDEX IF NOT EXISTS idx_email_history_cliente_id ON email_history(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_usuario_responsavel ON tarefas(usuario_responsavel);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_prioridade ON notificacoes(prioridade);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_configuracoes_notificacao_usuario_tipo ON configuracoes_notificacao(usuario_id, tipo_notificacao);

-- Função para trigger de atualização automática
CREATE OR REPLACE FUNCTION trigger_atualizar_status_pagamento()
RETURNS trigger AS $$
BEGIN
  NEW.dias_atraso = CASE
    WHEN NEW.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - NEW.data_vencimento
    ELSE 0
  END;
  
  NEW.status_pagamento = CASE
    WHEN NEW.data_vencimento < CURRENT_DATE THEN 'Inadimplente'
    WHEN NEW.data_vencimento <= CURRENT_DATE + INTERVAL '3 days' THEN 'Pendente'
    ELSE 'Adimplente'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status automaticamente
CREATE TRIGGER trigger_clientes_status_pagamento
  BEFORE INSERT OR UPDATE OF data_vencimento ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_status_pagamento();

-- Habilitar RLS nas novas tabelas
ALTER TABLE whatsapp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE automacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE automacao_execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_notificacao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir tudo para usuários autenticados)
CREATE POLICY "Usuários podem ver histórico WhatsApp" ON whatsapp_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem gerenciar agendamentos" ON agendamentos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem gerenciar automações" ON automacoes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem ver execuções" ON automacao_execucoes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem gerenciar templates" ON email_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem ver histórico email" ON email_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem gerenciar tarefas" ON tarefas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem gerenciar notificações" ON notificacoes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem gerenciar configurações" ON configuracoes_notificacao FOR ALL USING (auth.role() = 'authenticated');
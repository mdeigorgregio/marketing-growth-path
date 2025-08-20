-- Fix critical security vulnerability: Replace overly broad RLS policies with proper user-based access controls
-- This migration removes the dangerous "any authenticated user" policies and implements secure user-based restrictions

-- 1. Fix agendamentos table
DROP POLICY IF EXISTS "Usuários podem gerenciar agendamentos" ON agendamentos;

CREATE POLICY "Users can view own appointments" ON agendamentos
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create own appointments" ON agendamentos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own appointments" ON agendamentos
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own appointments" ON agendamentos
    FOR DELETE USING (auth.uid() = usuario_id);

-- 2. Fix automacoes table - add user_id column if needed
ALTER TABLE automacoes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Set existing automations to first admin user
UPDATE automacoes SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar automações" ON automacoes;

CREATE POLICY "Users can manage own automations" ON automacoes
    FOR ALL USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 3. Fix automacao_execucoes table
ALTER TABLE automacao_execucoes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

UPDATE automacao_execucoes SET user_id = (
    SELECT a.user_id FROM automacoes a WHERE a.id = automacao_execucoes.automacao_id
) WHERE user_id IS NULL AND automacao_id IS NOT NULL;

DROP POLICY IF EXISTS "Usuários podem ver execuções" ON automacao_execucoes;

CREATE POLICY "Users can view own executions" ON automacao_execucoes
    FOR ALL USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 4. Fix email_templates table
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

UPDATE email_templates SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar templates" ON email_templates;

CREATE POLICY "Users can manage own templates" ON email_templates
    FOR ALL USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 5. Fix email_history table
ALTER TABLE email_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

UPDATE email_history SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem ver histórico email" ON email_history;

CREATE POLICY "Users can view own email history" ON email_history
    FOR ALL USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 6. Fix whatsapp_history table
ALTER TABLE whatsapp_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

UPDATE whatsapp_history SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem ver histórico WhatsApp" ON whatsapp_history;

CREATE POLICY "Users can view own whatsapp history" ON whatsapp_history
    FOR ALL USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 7. Fix tarefas table
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

UPDATE tarefas SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar tarefas" ON tarefas;

CREATE POLICY "Users can manage own tasks" ON tarefas
    FOR ALL USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 8. Fix notificacoes table - use new column to avoid conflicts
ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

UPDATE notificacoes SET owner_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE owner_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar notificações" ON notificacoes;

CREATE POLICY "Users can view own notifications" ON notificacoes
    FOR SELECT USING (auth.uid() = owner_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create notifications" ON notificacoes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own notifications" ON notificacoes
    FOR UPDATE USING (auth.uid() = owner_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can delete own notifications" ON notificacoes
    FOR DELETE USING (auth.uid() = owner_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 9. Fix configuracoes_notificacao table - use new column to avoid conflicts
ALTER TABLE configuracoes_notificacao ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

UPDATE configuracoes_notificacao SET owner_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE owner_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar configurações" ON configuracoes_notificacao;

CREATE POLICY "Users can manage own configs" ON configuracoes_notificacao
    FOR ALL USING (auth.uid() = owner_id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_automacoes_user_id ON automacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_automacao_execucoes_user_id ON automacao_execucoes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_history_user_id ON email_history(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_history_user_id ON whatsapp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_user_id ON tarefas(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_owner_id ON notificacoes(owner_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_owner_id ON configuracoes_notificacao(owner_id);
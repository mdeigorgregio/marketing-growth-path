-- Fix critical security vulnerability: overly broad RLS policies
-- This migration implements proper user-based access controls

-- 1. Fix agendamentos table - restrict to user who created the appointment
DROP POLICY IF EXISTS "Usuários podem gerenciar agendamentos" ON agendamentos;

CREATE POLICY "Users can view their own appointments" ON agendamentos
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Users can create their own appointments" ON agendamentos
    FOR INSERT WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "Users can update their own appointments" ON agendamentos
    FOR UPDATE USING (auth.uid()::text = usuario_id);

CREATE POLICY "Users can delete their own appointments" ON agendamentos
    FOR DELETE USING (auth.uid()::text = usuario_id);

-- 2. Fix automacoes table - add user_id column and restrict access
ALTER TABLE automacoes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing automations to belong to first admin user if any exists
UPDATE automacoes SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar automações" ON automacoes;

CREATE POLICY "Users can view their own automations" ON automacoes
    FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create their own automations" ON automacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automations" ON automacoes
    FOR UPDATE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can delete their own automations" ON automacoes
    FOR DELETE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 3. Fix automacao_execucoes table - add user_id and restrict access
ALTER TABLE automacao_execucoes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing executions to belong to automation owner
UPDATE automacao_execucoes SET user_id = (
    SELECT a.user_id FROM automacoes a WHERE a.id = automacao_execucoes.automacao_id
) WHERE user_id IS NULL AND automacao_id IS NOT NULL;

DROP POLICY IF EXISTS "Usuários podem ver execuções" ON automacao_execucoes;

CREATE POLICY "Users can view their own automation executions" ON automacao_execucoes
    FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create automation executions" ON automacao_execucoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Fix email_templates table - make them user-specific
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing templates to belong to first admin user if any exists
UPDATE email_templates SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar templates" ON email_templates;

CREATE POLICY "Users can view their own email templates" ON email_templates
    FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create their own email templates" ON email_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates" ON email_templates
    FOR UPDATE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can delete their own email templates" ON email_templates
    FOR DELETE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 5. Fix email_history table - add user_id and restrict access
ALTER TABLE email_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing email history to belong to first admin user if any exists
UPDATE email_history SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem ver histórico email" ON email_history;

CREATE POLICY "Users can view their own email history" ON email_history
    FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create email history" ON email_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Fix whatsapp_history table - add user_id and restrict access
ALTER TABLE whatsapp_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing WhatsApp history to belong to first admin user if any exists
UPDATE whatsapp_history SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem ver histórico WhatsApp" ON whatsapp_history;

CREATE POLICY "Users can view their own WhatsApp history" ON whatsapp_history
    FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create WhatsApp history" ON whatsapp_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Fix tarefas table - convert usuario_responsavel to proper user_id
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing tasks to belong to first admin user if any exists
UPDATE tarefas SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar tarefas" ON tarefas;

CREATE POLICY "Users can view their own tasks" ON tarefas
    FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create their own tasks" ON tarefas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tarefas
    FOR UPDATE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can delete their own tasks" ON tarefas
    FOR DELETE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 8. Fix notificacoes table - convert usuario_id to proper UUID
ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Try to map existing text usuario_id to actual user IDs
UPDATE notificacoes SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar notificações" ON notificacoes;

CREATE POLICY "Users can view their own notifications" ON notificacoes
    FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create notifications for themselves" ON notificacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notificacoes
    FOR UPDATE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can delete their own notifications" ON notificacoes
    FOR DELETE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 9. Fix configuracoes_notificacao table - convert usuario_id to proper UUID
ALTER TABLE configuracoes_notificacao ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing notification configs to belong to first admin user if any exists
UPDATE configuracoes_notificacao SET user_id = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar configurações" ON configuracoes_notificacao;

CREATE POLICY "Users can view their own notification configs" ON configuracoes_notificacao
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification configs" ON configuracoes_notificacao
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification configs" ON configuracoes_notificacao
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification configs" ON configuracoes_notificacao
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance on the new user_id columns
CREATE INDEX IF NOT EXISTS idx_automacoes_user_id ON automacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_automacao_execucoes_user_id ON automacao_execucoes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_history_user_id ON email_history(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_history_user_id ON whatsapp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_user_id ON tarefas(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_notificacao_user_id ON configuracoes_notificacao(user_id);
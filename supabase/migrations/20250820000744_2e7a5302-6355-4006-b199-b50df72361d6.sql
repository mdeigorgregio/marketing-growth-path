-- Fix critical security vulnerability: overly broad RLS policies
-- This migration implements proper user-based access controls with correct type handling

-- 1. Fix agendamentos table - restrict to user who created the appointment
DROP POLICY IF EXISTS "Usuários podem gerenciar agendamentos" ON agendamentos;

-- Check if usuario_id is text or uuid and handle accordingly
DO $$
BEGIN
  -- Create policies based on the actual data type of usuario_id
  CREATE POLICY "Users can view their own appointments" ON agendamentos
      FOR SELECT USING (
        CASE 
          WHEN pg_typeof(usuario_id) = 'uuid'::regtype THEN auth.uid() = usuario_id
          ELSE auth.uid()::text = usuario_id
        END
      );

  CREATE POLICY "Users can create their own appointments" ON agendamentos
      FOR INSERT WITH CHECK (
        CASE 
          WHEN pg_typeof(usuario_id) = 'uuid'::regtype THEN auth.uid() = usuario_id
          ELSE auth.uid()::text = usuario_id
        END
      );

  CREATE POLICY "Users can update their own appointments" ON agendamentos
      FOR UPDATE USING (
        CASE 
          WHEN pg_typeof(usuario_id) = 'uuid'::regtype THEN auth.uid() = usuario_id
          ELSE auth.uid()::text = usuario_id
        END
      );

  CREATE POLICY "Users can delete their own appointments" ON agendamentos
      FOR DELETE USING (
        CASE 
          WHEN pg_typeof(usuario_id) = 'uuid'::regtype THEN auth.uid() = usuario_id
          ELSE auth.uid()::text = usuario_id
        END
      );
END $$;

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

-- 7. Fix tarefas table - add proper user_id
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

-- 8. Fix notificacoes table - add proper user_id
ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS user_id_new UUID REFERENCES auth.users(id);

-- Update existing notifications to belong to first admin user if any exists
UPDATE notificacoes SET user_id_new = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id_new IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar notificações" ON notificacoes;

CREATE POLICY "Users can view their own notifications" ON notificacoes
    FOR SELECT USING (auth.uid() = user_id_new OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can create notifications for themselves" ON notificacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id_new);

CREATE POLICY "Users can update their own notifications" ON notificacoes
    FOR UPDATE USING (auth.uid() = user_id_new OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

CREATE POLICY "Users can delete their own notifications" ON notificacoes
    FOR DELETE USING (auth.uid() = user_id_new OR get_user_role(auth.uid()) = 'ADMINISTRADOR');

-- 9. Fix configuracoes_notificacao table - add proper user_id
ALTER TABLE configuracoes_notificacao ADD COLUMN IF NOT EXISTS user_id_new UUID REFERENCES auth.users(id);

-- Update existing notification configs to belong to first admin user if any exists
UPDATE configuracoes_notificacao SET user_id_new = (
    SELECT id FROM profiles WHERE role = 'ADMINISTRADOR' LIMIT 1
) WHERE user_id_new IS NULL;

DROP POLICY IF EXISTS "Usuários podem gerenciar configurações" ON configuracoes_notificacao;

CREATE POLICY "Users can view their own notification configs" ON configuracoes_notificacao
    FOR SELECT USING (auth.uid() = user_id_new);

CREATE POLICY "Users can create their own notification configs" ON configuracoes_notificacao
    FOR INSERT WITH CHECK (auth.uid() = user_id_new);

CREATE POLICY "Users can update their own notification configs" ON configuracoes_notificacao
    FOR UPDATE USING (auth.uid() = user_id_new);

CREATE POLICY "Users can delete their own notification configs" ON configuracoes_notificacao
    FOR DELETE USING (auth.uid() = user_id_new);
-- Reverter renomeação de cliente_id para project_id na tabela notes
ALTER TABLE public.notes RENAME COLUMN cliente_id TO project_id;

-- Reverter renomeação de cliente_id para project_id na tabela appointments
ALTER TABLE public.appointments RENAME COLUMN cliente_id TO project_id;

-- Recriar foreign key constraints
ALTER TABLE public.notes ADD CONSTRAINT notes_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.appointments ADD CONSTRAINT appointments_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Atualizar políticas RLS para notes
DROP POLICY IF EXISTS "Users can view notes based on client access" ON public.notes;
DROP POLICY IF EXISTS "Users can create notes based on client access" ON public.notes;
DROP POLICY IF EXISTS "Users can update notes based on client access" ON public.notes;
DROP POLICY IF EXISTS "Users can delete notes based on client access" ON public.notes;

-- Recriar políticas RLS para notes usando project_id
CREATE POLICY "Users can view notes based on project access" ON public.notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = notes.project_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE p.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can create notes based on project access" ON public.notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = notes.project_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE p.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can update notes based on project access" ON public.notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = notes.project_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE p.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can delete notes based on project access" ON public.notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = notes.project_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE p.user_id = auth.uid()
        END
      )
    )
  );

-- Atualizar políticas RLS para appointments
DROP POLICY IF EXISTS "Users can view appointments based on client access" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments based on client access" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments based on client access" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete appointments based on client access" ON public.appointments;

-- Recriar políticas RLS para appointments usando project_id
CREATE POLICY "Users can view appointments based on project access" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = appointments.project_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE p.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can create appointments based on project access" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = appointments.project_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE p.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can update appointments based on project access" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = appointments.project_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE p.user_id = auth.uid()
        END
      )
    )
  );

CREATE POLICY "Users can delete appointments based on project access" ON public.appointments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = appointments.project_id 
      AND (
        CASE 
          WHEN public.get_user_role(auth.uid()) IN ('ADMINISTRADOR', 'EDITOR') THEN true
          ELSE p.user_id = auth.uid()
        END
      )
    )
  );
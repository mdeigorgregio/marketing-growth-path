import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  user_id: string;
  cliente_id?: string;
  title: string;
  description?: string;
  type: 'geral' | 'cobranca' | 'followup' | 'ligacao' | 'email';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData extends Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'> {}

export const useTasks = (clienteId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tasks', clienteId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
};

export const useCreateTask = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateTaskData> }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const updateData = {
        ...updates,
        ...(updates.status === 'concluida' && !updates.completed_at ? { completed_at: new Date().toISOString() } : {})
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
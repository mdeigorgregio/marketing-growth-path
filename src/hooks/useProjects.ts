import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './useAuth';
import { mockProjects, shouldUseMockData } from '@/data/mockData';

export type ClienteStatus = 'LEAD' | 'Assinante' | 'Inadimplente' | 'Cancelado';
export type ClienteOrigin = 'Tráfego Pago' | 'LA Educação' | 'Orgânico' | 'Indicação';

export interface Cliente {
  id: string;
  user_id: string;
  empresa: string;
  responsavel: string;
  telefone?: string;
  email?: string;
  site?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  status: ClienteStatus;
  plano_escolhido?: string;
  servicos_avulsos?: any[];
  origem?: ClienteOrigin;
  created_at: string;
  updated_at: string;
}

export interface CreateClienteData extends Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}

// Manter compatibilidade com código existente
export type ProjectStatus = ClienteStatus;
export type ProjectOrigin = ClienteOrigin;
export type Project = Cliente;
export type CreateProjectData = CreateClienteData;

export const useProjects = () => {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      // Se deve usar dados mockados ou não há usuário autenticado
      if (shouldUseMockData() || !user) {
        return mockProjects;
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Cliente[];
    },
    enabled: !!user,
  });
};

// Manter compatibilidade
export const useClientes = useProjects;

export const useProject = (projectId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['project', projectId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Cliente;
    },
    enabled: !!user && !!projectId,
  });
};

// Manter compatibilidade
export const useCliente = useProject;

export const useCreateProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clienteData: CreateClienteData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...clienteData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Cliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Manter compatibilidade
export const useCreateCliente = useCreateProject;

export const useUpdateProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateClienteData> }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Cliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Manter compatibilidade
export const useUpdateCliente = useUpdateProject;

export const useDeleteProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clienteId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', clienteId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Manter compatibilidade
export const useDeleteCliente = useDeleteProject;
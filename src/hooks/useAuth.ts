import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'ADMINISTRADOR' | 'EDITOR' | 'USUARIO';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  nome_completo?: string;
  role: 'ADMINISTRADOR' | 'EDITOR' | 'USUARIO';
  created_at: string;
  updated_at: string;
}

export const useUserRole = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return { role: data.role } as { role: 'ADMINISTRADOR' | 'EDITOR' | 'USUARIO' };
    },
    enabled: !!user,
  });
};

export const useUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user,
  });
};

export const useAllUsers = () => {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!user || userRole?.role !== 'ADMINISTRADOR') {
        throw new Error('Acesso negado: apenas administradores podem ver todos os usuários');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      return data;
    },
    enabled: !!user && userRole?.role === 'ADMINISTRADOR',
  });
};

// Hook para atualizar role de usuário (apenas para admins)
export const useUpdateUserRole = () => {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'ADMINISTRADOR' | 'EDITOR' | 'USUARIO' }) => {
      if (!user || userRole?.role !== 'ADMINISTRADOR') {
        throw new Error('Acesso negado: apenas administradores podem alterar roles');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
    },
  });
};
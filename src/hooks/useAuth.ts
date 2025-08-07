import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  email?: string;
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
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as UserRole;
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
        .eq('user_id', user.id)
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
      if (!user || userRole?.role !== 'admin') {
        throw new Error('Acesso negado: apenas administradores podem ver todos os usuários');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `);

      if (error) throw error;
      return data;
    },
    enabled: !!user && userRole?.role === 'admin',
  });
};
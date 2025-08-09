import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments, shouldUseMockData } from '@/data/mockData';

export interface Appointment {
  id: string;
  cliente_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData extends Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}

// Manter compatibilidade
export interface AppointmentCompat {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export const useAppointments = (clienteId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments', clienteId, user?.id],
    queryFn: async () => {
      // Se deve usar dados mockados ou não há usuário autenticado
      if (shouldUseMockData() || !user) {
        let filteredAppointments = mockAppointments;
        if (clienteId) {
          filteredAppointments = mockAppointments.filter(appointment => appointment.project_id === clienteId);
        }
        // Converter para o formato esperado
        return filteredAppointments.map(appointment => ({
          id: appointment.id,
          cliente_id: appointment.project_id,
          user_id: appointment.user_id,
          title: appointment.title,
          description: appointment.description,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at
        })) as Appointment[];
      }
      
      let query = supabase
        .from('appointments')
        .select('*');

      if (clienteId) {
        query = query.eq('project_id', clienteId);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });
};

// Manter compatibilidade
export const useProjectAppointments = (projectId?: string) => useAppointments(projectId);

export const useCreateAppointment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData: CreateAppointmentData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...appointmentData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', data.project_id] });
    },
  });
};

export const useUpdateAppointment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateAppointmentData> }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', data.project_id] });
    },
  });
};

export const useDeleteAppointment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
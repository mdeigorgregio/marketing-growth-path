import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockNotes, shouldUseMockData } from '@/data/mockData';

export interface Note {
  id: string;
  cliente_id: string;
  user_id: string;
  title: string;
  content?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData extends Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}

// Manter compatibilidade
export interface NoteCompat {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  content?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useNotes = (clienteId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notes', clienteId, user?.id],
    queryFn: async () => {
      // Se deve usar dados mockados ou não há usuário autenticado
      if (shouldUseMockData() || !user) {
        let filteredNotes = mockNotes;
        if (clienteId) {
          filteredNotes = mockNotes.filter(note => note.project_id === clienteId);
        }
        // Converter para o formato esperado
        return filteredNotes.map(note => ({
          id: note.id,
          cliente_id: note.project_id,
          user_id: note.user_id,
          title: note.titulo,
          content: note.conteudo,
          tags: [note.tipo],
          created_at: note.created_at,
          updated_at: note.updated_at
        })) as Note[];
      }
      
      let query = supabase
        .from('notes')
        .select('*');

      if (clienteId) {
        query = query.eq('project_id', clienteId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });
};

// Manter compatibilidade
export const useProjectNotes = (projectId?: string) => useNotes(projectId);

export const useCreateNote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', data.project_id] });
    },
  });
};

export const useUpdateNote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateNoteData> }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', data.project_id] });
    },
  });
};

export const useDeleteNote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      // Se estamos usando dados mockados, simular a exclusão
      if (shouldUseMockData() || !user) {
        // Simular delay da operação
        await new Promise(resolve => setTimeout(resolve, 500));
        return { cliente_id: 'mock-project' };
      }

      // Primeiro buscar a nota para obter o project_id
      const { data: noteData, error: fetchError } = await supabase
        .from('notes')
        .select('project_id')
        .eq('id', noteId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
      return noteData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (data?.project_id) {
        queryClient.invalidateQueries({ queryKey: ['notes', data.project_id] });
      }
    },
  });
};
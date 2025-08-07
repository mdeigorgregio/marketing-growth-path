import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search, Tag } from 'lucide-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NotesSectionProps {
  projectId: string;
}

export const NotesSection = ({ projectId }: NotesSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] as string[] });
  const [editingNote, setEditingNote] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTag, setNewTag] = useState('');

  const { data: notes, isLoading } = useNotes(projectId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { toast } = useToast();

  const filteredNotes = notes?.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) {
      toast({
        title: "Erro",
        description: "O título da nota é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await createNote.mutateAsync({
        project_id: projectId,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
      });
      
      setNewNote({ title: '', content: '', tags: [] });
      setIsCreating(false);
      toast({
        title: "Sucesso",
        description: "Nota criada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar nota",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote?.title.trim()) {
      toast({
        title: "Erro",
        description: "O título da nota é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateNote.mutateAsync({
        id: editingNote.id,
        updates: {
          title: editingNote.title,
          content: editingNote.content,
          tags: editingNote.tags,
        },
      });
      
      setEditingNote(null);
      toast({
        title: "Sucesso",
        description: "Nota atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar nota",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast({
        title: "Sucesso",
        description: "Nota excluída com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir nota",
        variant: "destructive",
      });
    }
  };

  const addTag = (tags: string[], setTags: (tags: string[]) => void) => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string, tags: string[], setTags: (tags: string[]) => void) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando notas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Notas do Projeto</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Nota
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Nota</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título da nota"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                <Textarea
                  placeholder="Conteúdo da nota"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                />
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(newNote.tags, (tags) => setNewNote({ ...newNote, tags }));
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag(newNote.tags, (tags) => setNewNote({ ...newNote, tags }))}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newNote.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer"
                        onClick={() => removeTag(tag, newNote.tags, (tags) => setNewNote({ ...newNote, tags }))}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateNote} disabled={createNote.isPending}>
                    {createNote.isPending ? 'Criando...' : 'Criar Nota'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium line-clamp-2">{note.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {note.content && (
                <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
              )}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingNote(note)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Editar Nota</DialogTitle>
                      </DialogHeader>
                      {editingNote && (
                        <div className="space-y-4">
                          <Input
                            placeholder="Título da nota"
                            value={editingNote.title}
                            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                          />
                          <Textarea
                            placeholder="Conteúdo da nota"
                            value={editingNote.content || ''}
                            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                            rows={4}
                          />
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Adicionar tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag(editingNote.tags, (tags) => setEditingNote({ ...editingNote, tags }));
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addTag(editingNote.tags, (tags) => setEditingNote({ ...editingNote, tags }))}
                              >
                                <Tag className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {editingNote.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="cursor-pointer"
                                  onClick={() => removeTag(tag, editingNote.tags, (tags) => setEditingNote({ ...editingNote, tags }))}>
                                  {tag} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setEditingNote(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdateNote} disabled={updateNote.isPending}>
                              {updateNote.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={deleteNote.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nenhuma nota encontrada' : 'Nenhuma nota adicionada ainda'}
        </div>
      )}
    </div>
  );
};
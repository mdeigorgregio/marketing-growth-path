import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentsSectionProps {
  projectId: string;
}

export const AppointmentsSection = ({ projectId }: AppointmentsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: appointments, isLoading } = useAppointments(projectId);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const { toast } = useToast();

  const filteredAppointments = appointments?.filter(appointment =>
    appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateAppointment = async () => {
    if (!newAppointment.title.trim() || !newAppointment.start_time || !newAppointment.end_time) {
      toast({
        title: "Erro",
        description: "Título, data de início e fim são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (new Date(newAppointment.start_time) >= new Date(newAppointment.end_time)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAppointment.mutateAsync({
        cliente_id: projectId,
        title: newAppointment.title,
        description: newAppointment.description,
        start_time: newAppointment.start_time,
        end_time: newAppointment.end_time,
      });
      
      setNewAppointment({ title: '', description: '', start_time: '', end_time: '' });
      setIsCreating(false);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment?.title.trim() || !editingAppointment.start_time || !editingAppointment.end_time) {
      toast({
        title: "Erro",
        description: "Título, data de início e fim são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (new Date(editingAppointment.start_time) >= new Date(editingAppointment.end_time)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAppointment.mutateAsync({
        id: editingAppointment.id,
        updates: {
          title: editingAppointment.title,
          description: editingAppointment.description,
          start_time: editingAppointment.start_time,
          end_time: editingAppointment.end_time,
        },
      });
      
      setEditingAppointment(null);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment.mutateAsync(appointmentId);
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTimeInput = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando agendamentos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar agendamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título do agendamento"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                />
                <Textarea
                  placeholder="Descrição do agendamento"
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data e Hora de Início</label>
                    <Input
                      type="datetime-local"
                      value={newAppointment.start_time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data e Hora de Fim</label>
                    <Input
                      type="datetime-local"
                      value={newAppointment.end_time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAppointment} disabled={createAppointment.isPending}>
                    {createAppointment.isPending ? 'Criando...' : 'Criar Agendamento'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium line-clamp-2">{appointment.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointment.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">{appointment.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Início: {formatDateTime(appointment.start_time)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Fim: {formatDateTime(appointment.end_time)}</span>
                </div>
              </div>
              <div className="flex justify-end gap-1 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditingAppointment({
                      ...appointment,
                      start_time: formatDateTimeInput(appointment.start_time),
                      end_time: formatDateTimeInput(appointment.end_time),
                    });
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAppointment(appointment.id)}
                  disabled={deleteAppointment.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento adicionado ainda'}
        </div>
      )}

      {/* Dialog de Edição */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <div className="space-y-4">
              <Input
                placeholder="Título do agendamento"
                value={editingAppointment.title}
                onChange={(e) => setEditingAppointment({ ...editingAppointment, title: e.target.value })}
              />
              <Textarea
                placeholder="Descrição do agendamento"
                value={editingAppointment.description || ''}
                onChange={(e) => setEditingAppointment({ ...editingAppointment, description: e.target.value })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data e Hora de Início</label>
                  <Input
                    type="datetime-local"
                    value={editingAppointment.start_time}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data e Hora de Fim</label>
                  <Input
                    type="datetime-local"
                    value={editingAppointment.end_time}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setEditingAppointment(null);
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateAppointment} disabled={updateAppointment.isPending}>
                  {updateAppointment.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
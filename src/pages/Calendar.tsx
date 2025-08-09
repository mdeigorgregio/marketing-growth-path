import { useState } from 'react';
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus, Clock, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const eventTypes = [
  { value: 'reuniao', label: 'Reunião', color: 'bg-blue-500' },
  { value: 'ligacao', label: 'Ligação', color: 'bg-green-500' },
  { value: 'followup', label: 'Follow-up', color: 'bg-yellow-500' },
  { value: 'visita', label: 'Visita', color: 'bg-purple-500' },
  { value: 'demo', label: 'Demo', color: 'bg-red-500' }
];

export default function Calendar() {
  const { data: appointments = [], isLoading } = useAppointments();
  const { data: projects = [] } = useProjects();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    cliente_id: '',
    start_time: '',
    end_time: '',
    type: 'reuniao'
  });

  const resetForm = () => {
    setNewAppointment({
      title: '',
      description: '',
      cliente_id: '',
      start_time: '',
      end_time: '',
      type: 'reuniao'
    });
    setEditingAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.title.trim() || !newAppointment.cliente_id || !newAppointment.start_time || !newAppointment.end_time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingAppointment) {
        await updateAppointment.mutateAsync({
          id: editingAppointment.id,
          updates: {
            title: newAppointment.title,
            description: newAppointment.description,
            cliente_id: newAppointment.cliente_id,
            start_time: newAppointment.start_time,
            end_time: newAppointment.end_time
          }
        });
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await createAppointment.mutateAsync({
          title: newAppointment.title,
          description: newAppointment.description,
          cliente_id: newAppointment.cliente_id,
          start_time: newAppointment.start_time,
          end_time: newAppointment.end_time
        });
        toast.success('Agendamento criado com sucesso!');
      }
      
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar agendamento');
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setNewAppointment({
      title: appointment.title,
      description: appointment.description || '',
      cliente_id: appointment.cliente_id,
      start_time: appointment.start_time.slice(0, 16), // Remove timezone for input
      end_time: appointment.end_time.slice(0, 16),
      type: 'reuniao'
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (appointmentId: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await deleteAppointment.mutateAsync(appointmentId);
        toast.success('Agendamento excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir agendamento');
      }
    }
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(appointment => 
      appointment.start_time.startsWith(date)
    );
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getClienteName = (clienteId: string) => {
    const client = projects.find(p => p.id === clienteId);
    return client ? client.empresa : 'Cliente não encontrado';
  };

  if (isLoading) {
    return <div>Carregando calendário...</div>;
  }

  const todayAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Calendário</h1>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Editar Agendamento' : 'Criar Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do agendamento"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Cliente *</label>
                <Select 
                  value={newAppointment.cliente_id}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, cliente_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do agendamento"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data/Hora Início *</label>
                  <Input
                    type="datetime-local"
                    value={newAppointment.start_time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Data/Hora Fim *</label>
                  <Input
                    type="datetime-local"
                    value={newAppointment.end_time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAppointment.isPending || updateAppointment.isPending}
                >
                  {editingAppointment ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seletor de Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total de agendamentos:</span>
                <span className="font-semibold">{appointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Agendamentos hoje:</span>
                <span className="font-semibold">{todayAppointments.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Agendamentos para {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento para esta data.
            </p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{appointment.title}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {getClienteName(appointment.cliente_id)}
                    </p>
                    {appointment.description && (
                      <p className="text-sm text-muted-foreground">
                        {appointment.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(appointment)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
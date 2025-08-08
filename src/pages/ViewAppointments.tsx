import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { useProject } from '@/hooks/useProjects';

interface Appointment {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

const ViewAppointments = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: ''
  });

  const { data: project } = useProject(id!);
  const { data: appointments, isLoading } = useAppointments(id!);
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  const filteredAppointments = appointments?.filter(appointment =>
    appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.location && appointment.location.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateAppointment = async () => {
    if (!newAppointment.title.trim()) {
      toast({
        title: "Erro",
        description: "O título do agendamento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!newAppointment.start_time || !newAppointment.end_time) {
      toast({
        title: "Erro",
        description: "Data e hora de início e fim são obrigatórias.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(newAppointment.start_time) >= new Date(newAppointment.end_time)) {
      toast({
        title: "Erro",
        description: "A data de fim deve ser posterior à data de início.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAppointmentMutation.mutateAsync({
        project_id: id!,
        title: newAppointment.title,
        description: newAppointment.description,
        start_time: newAppointment.start_time,
        end_time: newAppointment.end_time,
        location: newAppointment.location
      });
      
      setNewAppointment({ title: '', description: '', start_time: '', end_time: '', location: '' });
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment || !editingAppointment.title.trim()) {
      toast({
        title: "Erro",
        description: "O título do agendamento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!editingAppointment.start_time || !editingAppointment.end_time) {
      toast({
        title: "Erro",
        description: "Data e hora de início e fim são obrigatórias.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(editingAppointment.start_time) >= new Date(editingAppointment.end_time)) {
      toast({
        title: "Erro",
        description: "A data de fim deve ser posterior à data de início.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAppointmentMutation.mutateAsync({
        id: editingAppointment.id,
        title: editingAppointment.title,
        description: editingAppointment.description,
        start_time: editingAppointment.start_time,
        end_time: editingAppointment.end_time,
        location: editingAppointment.location
      });
      
      setEditingAppointment(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      await deleteAppointmentMutation.mutateAsync(appointmentId);
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusBadge = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Agendado</Badge>;
    } else if (now >= start && now <= end) {
      return <Badge variant="default" className="bg-green-600">Em andamento</Badge>;
    } else {
      return <Badge variant="secondary">Concluído</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-blue-600" />
                Agendamentos
              </h1>
              {project && (
                <p className="text-gray-600 mt-1">
                  Projeto: {project.nome_empresa || project.nome_pessoa}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar agendamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                    placeholder="Digite o título do agendamento..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newAppointment.description}
                    onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                    placeholder="Digite a descrição do agendamento..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Data e Hora de Início</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={newAppointment.start_time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">Data e Hora de Fim</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={newAppointment.end_time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Local (opcional)</Label>
                  <Input
                    id="location"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                    placeholder="Digite o local do agendamento..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAppointment} disabled={createAppointmentMutation.isPending}>
                    {createAppointmentMutation.isPending ? 'Criando...' : 'Criar Agendamento'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments Grid */}
        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => {
              const startDateTime = formatDateTime(appointment.start_time);
              const endDateTime = formatDateTime(appointment.end_time);
              
              return (
                <Card key={appointment.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {appointment.title}
                      </CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAppointment(appointment);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(appointment.start_time, appointment.end_time)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {appointment.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {appointment.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{startDateTime.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{startDateTime.time} - {endDateTime.time}</span>
                      </div>
                      {appointment.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{appointment.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento criado'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca.' 
                  : 'Comece criando seu primeiro agendamento para este projeto.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Agendamento
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Agendamento</DialogTitle>
            </DialogHeader>
            {editingAppointment && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Título</Label>
                  <Input
                    id="edit-title"
                    value={editingAppointment.title}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, title: e.target.value })}
                    placeholder="Digite o título do agendamento..."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editingAppointment.description}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, description: e.target.value })}
                    placeholder="Digite a descrição do agendamento..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-start_time">Data e Hora de Início</Label>
                    <Input
                      id="edit-start_time"
                      type="datetime-local"
                      value={editingAppointment.start_time}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-end_time">Data e Hora de Fim</Label>
                    <Input
                      id="edit-end_time"
                      type="datetime-local"
                      value={editingAppointment.end_time}
                      onChange={(e) => setEditingAppointment({ ...editingAppointment, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-location">Local (opcional)</Label>
                  <Input
                    id="edit-location"
                    value={editingAppointment.location || ''}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, location: e.target.value })}
                    placeholder="Digite o local do agendamento..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateAppointment} disabled={updateAppointmentMutation.isPending}>
                    {updateAppointmentMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ViewAppointments;
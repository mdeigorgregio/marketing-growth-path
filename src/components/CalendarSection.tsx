import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Agendamento {
  id: string;
  titulo: string;
  cliente_id: string;
  usuario_id: string;
  tipo: 'Reunião' | 'Ligação' | 'Follow-up' | 'Visita' | 'Demo';
  data_inicio: string;
  data_fim: string;
  local_link?: string;
  participantes?: string[];
  descricao?: string;
  lembrete_minutos: number;
  status: 'Agendado' | 'Realizado' | 'Cancelado' | 'Reagendado';
  cliente?: {
    nome_empresa: string;
    responsavel: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Agendamento;
}

const tiposEvento = [
  { value: 'Reunião', label: 'Reunião', color: 'bg-blue-500' },
  { value: 'Ligação', label: 'Ligação', color: 'bg-green-500' },
  { value: 'Follow-up', label: 'Follow-up', color: 'bg-yellow-500' },
  { value: 'Visita', label: 'Visita', color: 'bg-purple-500' },
  { value: 'Demo', label: 'Demo', color: 'bg-red-500' },
];

const lembreteOptions = [
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 dia antes' },
];

export function CalendarSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Agendamento | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [date, setDate] = useState(new Date());
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  
  const [formData, setFormData] = useState({
    titulo: '',
    cliente_id: '',
    tipo: 'Reunião' as const,
    data_inicio: '',
    hora_inicio: '',
    data_fim: '',
    hora_fim: '',
    local_link: '',
    participantes: '',
    descricao: '',
    lembrete_minutos: 15,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar agendamentos
  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(nome_empresa, responsavel)
        `)
        .order('data_inicio', { ascending: true });
      
      if (error) throw error;
      return data as Agendamento[];
    },
  });

  // Buscar clientes para o dropdown
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_empresa, responsavel')
        .order('nome_empresa');
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation para criar/atualizar agendamento
  const agendamentoMutation = useMutation({
    mutationFn: async (data: any) => {
      const agendamentoData = {
        titulo: data.titulo,
        cliente_id: data.cliente_id,
        tipo: data.tipo,
        data_inicio: `${data.data_inicio}T${data.hora_inicio}:00`,
        data_fim: `${data.data_fim}T${data.hora_fim}:00`,
        local_link: data.local_link,
        participantes: data.participantes ? data.participantes.split(',').map((p: string) => p.trim()) : [],
        descricao: data.descricao,
        lembrete_minutos: data.lembrete_minutos,
      };

      if (isEditing && selectedEvent) {
        const { error } = await supabase
          .from('agendamentos')
          .update(agendamentoData)
          .eq('id', selectedEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('agendamentos')
          .insert(agendamentoData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: `Agendamento ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar agendamento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar agendamento
  const deleteAgendamentoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      setIsDialogOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Agendamento excluído com sucesso!',
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir agendamento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      cliente_id: '',
      tipo: 'Reunião',
      data_inicio: '',
      hora_inicio: '',
      data_fim: '',
      hora_fim: '',
      local_link: '',
      participantes: '',
      descricao: '',
      lembrete_minutos: 15,
    });
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const openCreateDialog = (slotInfo?: any) => {
    resetForm();
    if (slotInfo) {
      const startDate = format(slotInfo.start, 'yyyy-MM-dd');
      const startTime = format(slotInfo.start, 'HH:mm');
      const endDate = format(slotInfo.end, 'yyyy-MM-dd');
      const endTime = format(slotInfo.end, 'HH:mm');
      
      setFormData(prev => ({
        ...prev,
        data_inicio: startDate,
        hora_inicio: startTime,
        data_fim: endDate,
        hora_fim: endTime,
      }));
    }
    setIsDialogOpen(true);
  };

  const openEditDialog = (agendamento: Agendamento) => {
    const dataInicio = new Date(agendamento.data_inicio);
    const dataFim = new Date(agendamento.data_fim);
    
    setFormData({
      titulo: agendamento.titulo,
      cliente_id: agendamento.cliente_id,
      tipo: agendamento.tipo,
      data_inicio: format(dataInicio, 'yyyy-MM-dd'),
      hora_inicio: format(dataInicio, 'HH:mm'),
      data_fim: format(dataFim, 'yyyy-MM-dd'),
      hora_fim: format(dataFim, 'HH:mm'),
      local_link: agendamento.local_link || '',
      participantes: agendamento.participantes?.join(', ') || '',
      descricao: agendamento.descricao || '',
      lembrete_minutos: agendamento.lembrete_minutos,
    });
    setSelectedEvent(agendamento);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    agendamentoMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (selectedEvent) {
      deleteAgendamentoMutation.mutate(selectedEvent.id);
    }
  };

  // Filtrar e converter agendamentos para eventos do calendário
  const events: CalendarEvent[] = agendamentos
    .filter(agendamento => {
      if (filtroTipo !== 'todos' && agendamento.tipo !== filtroTipo) return false;
      if (filtroStatus !== 'todos' && agendamento.status !== filtroStatus) return false;
      return true;
    })
    .map(agendamento => ({
      id: agendamento.id,
      title: `${agendamento.titulo} - ${agendamento.cliente?.nome_empresa || 'Cliente'}`,
      start: new Date(agendamento.data_inicio),
      end: new Date(agendamento.data_fim),
      resource: agendamento,
    }));

  const eventStyleGetter = (event: CalendarEvent) => {
    const tipo = event.resource.tipo;
    const tipoConfig = tiposEvento.find(t => t.value === tipo);
    const status = event.resource.status;
    
    let backgroundColor = tipoConfig?.color.replace('bg-', '') || 'blue-500';
    backgroundColor = backgroundColor.replace('-500', '');
    
    const colorMap: { [key: string]: string } = {
      'blue': '#3b82f6',
      'green': '#10b981',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'red': '#ef4444',
    };
    
    let style: any = {
      backgroundColor: colorMap[backgroundColor] || '#3b82f6',
      borderRadius: '4px',
      opacity: status === 'Cancelado' ? 0.5 : 1,
      color: 'white',
      border: 'none',
      textDecoration: status === 'Realizado' ? 'line-through' : 'none',
    };
    
    return { style };
  };

  const getProximosAgendamentos = () => {
    const hoje = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(hoje.getDate() + 7);
    
    return agendamentos
      .filter(agendamento => {
        const dataAgendamento = new Date(agendamento.data_inicio);
        return dataAgendamento >= hoje && dataAgendamento <= proximosDias && agendamento.status === 'Agendado';
      })
      .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendário de Agendamentos</h2>
        <Button onClick={() => openCreateDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tiposEvento.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Realizado">Realizado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
                <SelectItem value="Reagendado">Reagendado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendário */}
          <div className="bg-white p-4 rounded-lg border" style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={(event) => openEditDialog(event.resource)}
              onSelectSlot={openCreateDialog}
              selectable
              popup
              eventPropGetter={eventStyleGetter}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              culture="pt-BR"
              messages={{
                next: 'Próximo',
                previous: 'Anterior',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Não há eventos neste período.',
                showMore: (total) => `+ Ver mais (${total})`,
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {agendamentos.map(agendamento => {
              const tipoConfig = tiposEvento.find(t => t.value === agendamento.tipo);
              return (
                <Card key={agendamento.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openEditDialog(agendamento)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{agendamento.titulo}</h3>
                          <Badge className={tipoConfig?.color}>{agendamento.tipo}</Badge>
                          <Badge variant={agendamento.status === 'Agendado' ? 'default' : 'secondary'}>
                            {agendamento.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {agendamento.cliente?.nome_empresa} - {agendamento.cliente?.responsavel}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(agendamento.data_inicio), 'dd/MM/yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(agendamento.data_inicio), 'HH:mm')} - 
                            {format(new Date(agendamento.data_fim), 'HH:mm')}
                          </span>
                          {agendamento.local_link && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {agendamento.local_link}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Próximos Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Próximos Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getProximosAgendamentos().map(agendamento => (
                    <div key={agendamento.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{agendamento.titulo}</p>
                        <p className="text-xs text-gray-600">{agendamento.cliente?.nome_empresa}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{format(new Date(agendamento.data_inicio), 'dd/MM')}</p>
                        <p className="text-xs text-gray-600">{format(new Date(agendamento.data_inicio), 'HH:mm')}</p>
                      </div>
                    </div>
                  ))}
                  {getProximosAgendamentos().length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum agendamento próximo</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tiposEvento.map(tipo => {
                    const count = agendamentos.filter(a => a.tipo === tipo.value).length;
                    return (
                      <div key={tipo.value} className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${tipo.color}`}></div>
                          {tipo.label}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar/editar agendamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do agendamento' : 'Preencha os dados para criar um novo agendamento'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Reunião de apresentação"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome_empresa} - {cliente.responsavel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lembrete_minutos">Lembrete</Label>
                <Select 
                  value={formData.lembrete_minutos.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, lembrete_minutos: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lembreteOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="data_inicio">Data Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="hora_inicio">Hora Início *</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_fim">Data Fim *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="hora_fim">Hora Fim *</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={formData.hora_fim}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora_fim: e.target.value }))}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="local_link">Local/Link</Label>
                <Input
                  id="local_link"
                  value={formData.local_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, local_link: e.target.value }))}
                  placeholder="Ex: Sala de reuniões ou https://meet.google.com/..."
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="participantes">Participantes</Label>
                <Input
                  id="participantes"
                  value={formData.participantes}
                  onChange={(e) => setFormData(prev => ({ ...prev, participantes: e.target.value }))}
                  placeholder="Ex: João Silva, Maria Santos (separados por vírgula)"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição/Observações</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Detalhes adicionais sobre o agendamento..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteAgendamentoMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={agendamentoMutation.isPending}>
                  {agendamentoMutation.isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
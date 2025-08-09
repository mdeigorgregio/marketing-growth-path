import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  CheckSquare, 
  Edit, 
  Trash2, 
  Clock,
  User,
  Calendar,
  AlertTriangle,
  DollarSign,
  Phone,
  MessageSquare,
  FileText,
  Target,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TarefaData {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  prioridade: string;
  status: string;
  data_vencimento: string;
  cliente_id?: string;
  usuario_responsavel?: string;
  valor_relacionado?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  cliente?: {
    nome_empresa: string;
    responsavel: string;
    telefone?: string;
    email?: string;
    status_pagamento?: string;
    valor_plano?: number;
    dias_atraso?: number;
  };
}

const tiposTarefa = [
  { value: 'cobrar_pagamento', label: 'Cobrar Pagamento', icon: '💰', color: 'bg-red-500' },
  { value: 'negociar_parcelamento', label: 'Negociar Parcelamento', icon: '🤝', color: 'bg-orange-500' },
  { value: 'verificar_pagamento', label: 'Verificar Pagamento', icon: '🔍', color: 'bg-blue-500' },
  { value: 'seguir_whatsapp', label: 'Seguir no WhatsApp', icon: '📱', color: 'bg-green-500' },
  { value: 'renovar_contrato', label: 'Renovar Contrato', icon: '📄', color: 'bg-purple-500' },
  { value: 'ligar_cliente', label: 'Ligar para Cliente', icon: '📞', color: 'bg-indigo-500' },
  { value: 'enviar_email', label: 'Enviar E-mail', icon: '📧', color: 'bg-cyan-500' },
  { value: 'agendar_reuniao', label: 'Agendar Reunião', icon: '📅', color: 'bg-yellow-500' },
  { value: 'follow_up', label: 'Follow-up', icon: '🔄', color: 'bg-gray-500' },
  { value: 'proposta_comercial', label: 'Proposta Comercial', icon: '💼', color: 'bg-teal-500' },
];

const prioridades = [
  { value: 'baixa', label: 'Baixa', color: 'bg-gray-500' },
  { value: 'media', label: 'Média', color: 'bg-yellow-500' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-500' },
];

const statusTarefa = [
  { value: 'pendente', label: 'Pendente', color: 'bg-gray-500' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-500' },
  { value: 'concluida', label: 'Concluída', color: 'bg-green-500' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-500' },
];

export function TasksSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTarefa, setSelectedTarefa] = useState<TarefaData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'lista' | 'kanban' | 'dashboard'>('lista');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'cobrar_pagamento',
    prioridade: 'media',
    status: 'pendente',
    data_vencimento: format(new Date(), 'yyyy-MM-dd'),
    cliente_id: '',
    usuario_responsavel: '',
    valor_relacionado: 0,
    observacoes: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar tarefas
  const { data: tarefas = [], isLoading } = useQuery({
    queryKey: ['tarefas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tarefas')
        .select(`
          *,
          cliente:clientes(
            nome_empresa,
            responsavel,
            telefone,
            email,
            status_pagamento,
            valor_plano,
            dias_atraso
          )
        `)
        .order('data_vencimento', { ascending: true });
      
      if (error) throw error;
      return data as TarefaData[];
    },
  });

  // Buscar clientes para dropdown
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-tarefas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_empresa, responsavel, status_pagamento, valor_plano')
        .order('nome_empresa');
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation para criar/atualizar tarefa
  const tarefaMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing && selectedTarefa) {
        const { error } = await supabase
          .from('tarefas')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', selectedTarefa.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tarefas')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: `Tarefa ${isEditing ? 'atualizada' : 'criada'} com sucesso!`,
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar tarefa. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar tarefa
  const deleteTarefaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      setIsDialogOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Tarefa excluída com sucesso!',
      });
    },
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('tarefas')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      toast({
        title: 'Sucesso',
        description: 'Status atualizado com sucesso!',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'cobrar_pagamento',
      prioridade: 'media',
      status: 'pendente',
      data_vencimento: format(new Date(), 'yyyy-MM-dd'),
      cliente_id: '',
      usuario_responsavel: '',
      valor_relacionado: 0,
      observacoes: '',
    });
    setSelectedTarefa(null);
    setIsEditing(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (tarefa: TarefaData) => {
    setFormData({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || '',
      tipo: tarefa.tipo,
      prioridade: tarefa.prioridade,
      status: tarefa.status,
      data_vencimento: format(new Date(tarefa.data_vencimento), 'yyyy-MM-dd'),
      cliente_id: tarefa.cliente_id || '',
      usuario_responsavel: tarefa.usuario_responsavel || '',
      valor_relacionado: tarefa.valor_relacionado || 0,
      observacoes: tarefa.observacoes || '',
    });
    setSelectedTarefa(tarefa);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    tarefaMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (selectedTarefa) {
      deleteTarefaMutation.mutate(selectedTarefa.id);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Filtrar tarefas
  const tarefasFiltradas = tarefas.filter(tarefa => {
    const matchSearch = tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       tarefa.cliente?.nome_empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || tarefa.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || tarefa.status === filtroStatus;
    const matchPrioridade = filtroPrioridade === 'todos' || tarefa.prioridade === filtroPrioridade;
    
    return matchSearch && matchTipo && matchStatus && matchPrioridade;
  });

  // Agrupar tarefas por status para kanban
  const tarefasPorStatus = {
    pendente: tarefasFiltradas.filter(t => t.status === 'pendente'),
    em_andamento: tarefasFiltradas.filter(t => t.status === 'em_andamento'),
    concluida: tarefasFiltradas.filter(t => t.status === 'concluida'),
    cancelada: tarefasFiltradas.filter(t => t.status === 'cancelada'),
  };

  // Estatísticas para dashboard
  const stats = {
    total: tarefas.length,
    pendentes: tarefas.filter(t => t.status === 'pendente').length,
    vencidas: tarefas.filter(t => t.status === 'pendente' && isPast(new Date(t.data_vencimento))).length,
    hoje: tarefas.filter(t => isToday(new Date(t.data_vencimento))).length,
    amanha: tarefas.filter(t => isTomorrow(new Date(t.data_vencimento))).length,
    cobranca: tarefas.filter(t => ['cobrar_pagamento', 'negociar_parcelamento', 'verificar_pagamento'].includes(t.tipo)).length,
    valorTotal: tarefas.reduce((sum, t) => sum + (t.valor_relacionado || 0), 0),
  };

  const getTipoConfig = (tipo: string) => {
    return tiposTarefa.find(t => t.value === tipo) || tiposTarefa[0];
  };

  const getPrioridadeConfig = (prioridade: string) => {
    return prioridades.find(p => p.value === prioridade) || prioridades[1];
  };

  const getStatusConfig = (status: string) => {
    return statusTarefa.find(s => s.value === status) || statusTarefa[0];
  };

  const getDataLabel = (data: string) => {
    const date = new Date(data);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isPast(date)) return 'Vencida';
    return format(date, 'dd/MM', { locale: ptBR });
  };

  const createTaskFromTemplate = (tipo: string, clienteId?: string) => {
    const tipoConfig = getTipoConfig(tipo);
    setFormData({
      titulo: `${tipoConfig.label}${clienteId ? ` - Cliente` : ''}`,
      descricao: '',
      tipo,
      prioridade: tipo === 'cobrar_pagamento' ? 'alta' : 'media',
      status: 'pendente',
      data_vencimento: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      cliente_id: clienteId || '',
      usuario_responsavel: '',
      valor_relacionado: 0,
      observacoes: '',
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Tarefas</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode('lista')}>
            Lista
          </Button>
          <Button variant="outline" onClick={() => setViewMode('kanban')}>
            Kanban
          </Button>
          <Button variant="outline" onClick={() => setViewMode('dashboard')}>
            Dashboard
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {viewMode === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600">
                {stats.pendentes} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.vencidas}</div>
              <p className="text-xs text-gray-600">
                Precisam de atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Para Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.hoje}</div>
              <p className="text-xs text-gray-600">
                {stats.amanha} para amanhã
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.cobranca}</div>
              <p className="text-xs text-gray-600">
                R$ {stats.valorTotal.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Templates Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {tiposTarefa.slice(0, 5).map(tipo => (
              <Button
                key={tipo.value}
                variant="outline"
                size="sm"
                onClick={() => createTaskFromTemplate(tipo.value)}
                className="justify-start"
              >
                <span className="mr-2">{tipo.icon}</span>
                {tipo.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {tiposTarefa.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.icon} {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {statusTarefa.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {prioridades.map(prioridade => (
              <SelectItem key={prioridade.value} value={prioridade.value}>
                {prioridade.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo baseado no modo de visualização */}
      {viewMode === 'lista' && (
        <div className="space-y-4">
          {tarefasFiltradas.map(tarefa => {
            const tipoConfig = getTipoConfig(tarefa.tipo);
            const prioridadeConfig = getPrioridadeConfig(tarefa.prioridade);
            const statusConfig = getStatusConfig(tarefa.status);
            const isVencida = isPast(new Date(tarefa.data_vencimento)) && tarefa.status === 'pendente';
            
            return (
              <Card key={tarefa.id} className={`hover:shadow-md transition-shadow ${
                isVencida ? 'border-red-200 bg-red-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={tarefa.status === 'concluida'}
                        onCheckedChange={(checked) => {
                          handleStatusChange(tarefa.id, checked ? 'concluida' : 'pendente');
                        }}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{tipoConfig.icon}</span>
                          <h3 className={`font-semibold ${
                            tarefa.status === 'concluida' ? 'line-through text-gray-500' : ''
                          }`}>
                            {tarefa.titulo}
                          </h3>
                          {isVencida && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {tarefa.cliente && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {tarefa.cliente.nome_empresa}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {getDataLabel(tarefa.data_vencimento)}
                          </span>
                          
                          {tarefa.valor_relacionado && tarefa.valor_relacionado > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R$ {tarefa.valor_relacionado.toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-white ${prioridadeConfig.color}`}
                      >
                        {prioridadeConfig.label}
                      </Badge>
                      
                      <Badge 
                        variant="secondary" 
                        className={`text-white ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(tarefa)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {tarefasFiltradas.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-gray-500 mb-4">Crie sua primeira tarefa ou ajuste os filtros.</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(tarefasPorStatus).map(([status, tarefasStatus]) => {
            const statusConfig = getStatusConfig(status);
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{statusConfig.label}</h3>
                  <Badge variant="secondary">{tarefasStatus.length}</Badge>
                </div>
                
                <div className="space-y-3">
                  {tarefasStatus.map(tarefa => {
                    const tipoConfig = getTipoConfig(tarefa.tipo);
                    const prioridadeConfig = getPrioridadeConfig(tarefa.prioridade);
                    
                    return (
                      <Card key={tarefa.id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => openEditDialog(tarefa)}>
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{tipoConfig.icon}</span>
                              <h4 className="font-medium text-sm">{tarefa.titulo}</h4>
                            </div>
                            
                            {tarefa.cliente && (
                              <p className="text-xs text-gray-600">
                                {tarefa.cliente.nome_empresa}
                              </p>
                            )}
                            
                            <div className="flex justify-between items-center">
                              <Badge 
                                variant="secondary" 
                                className={`text-white text-xs ${prioridadeConfig.color}`}
                              >
                                {prioridadeConfig.label}
                              </Badge>
                              
                              <span className="text-xs text-gray-500">
                                {getDataLabel(tarefa.data_vencimento)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog para criar/editar tarefa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações da tarefa' : 'Crie uma nova tarefa para sua equipe'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Cobrar pagamento do cliente X"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposTarefa.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.icon} {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva os detalhes da tarefa..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Select value={formData.prioridade} onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map(prioridade => (
                      <SelectItem key={prioridade.value} value={prioridade.value}>
                        {prioridade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusTarefa.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="data_vencimento">Vencimento *</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente_id">Cliente</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum cliente</SelectItem>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome_empresa} - {cliente.responsavel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor_relacionado">Valor Relacionado</Label>
                <Input
                  id="valor_relacionado"
                  type="number"
                  step="0.01"
                  value={formData.valor_relacionado}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_relacionado: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={2}
              />
            </div>

            <div className="flex justify-between pt-4">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteTarefaMutation.isPending}
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
                <Button type="submit" disabled={tarefaMutation.isPending}>
                  {tarefaMutation.isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
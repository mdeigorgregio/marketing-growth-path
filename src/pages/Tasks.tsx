import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const taskTypes = [
  { value: 'geral', label: 'Geral' },
  { value: 'cobranca', label: 'Cobrança' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'ligacao', label: 'Ligação' },
  { value: 'email', label: 'E-mail' }
];

const priorities = [
  { value: 'baixa', label: 'Baixa', color: 'bg-gray-500' },
  { value: 'media', label: 'Média', color: 'bg-blue-500' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-500' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-500' }
];

const statuses = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' }
];

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    cliente_id: '',
    type: 'geral' as const,
    priority: 'media' as const,
    due_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      await createTask.mutateAsync({
        title: newTask.title,
        description: newTask.description,
        cliente_id: newTask.cliente_id || undefined,
        type: newTask.type,
        priority: newTask.priority,
        status: 'pendente',
        due_date: newTask.due_date || undefined
      });
      
      setNewTask({
        title: '',
        description: '',
        cliente_id: '',
        type: 'geral',
        priority: 'media',
        due_date: ''
      });
      setIsDialogOpen(false);
      toast.success('Tarefa criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        updates: { status: newStatus as any }
      });
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await deleteTask.mutateAsync(taskId);
        toast.success('Tarefa excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir tarefa');
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterType !== 'all' && task.type !== filterType) return false;
    return true;
  });

  const getClienteName = (clienteId?: string) => {
    if (!clienteId) return 'Geral';
    const client = projects.find(p => p.id === clienteId);
    return client ? client.empresa : 'Cliente não encontrado';
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorities.find(p => p.value === priority);
    return (
      <Badge variant="secondary" className={`text-white ${config?.color}`}>
        {config?.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = taskTypes.find(t => t.value === type);
    return <Badge variant="outline">{config?.label}</Badge>;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return <div>Carregando tarefas...</div>;
  }

  const pendingTasks = tasks.filter(t => t.status === 'pendente').length;
  const overdueTasks = tasks.filter(t => t.status === 'pendente' && isOverdue(t.due_date)).length;
  const completedTasks = tasks.filter(t => t.status === 'concluida').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da tarefa"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da tarefa"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Select 
                  value={newTask.cliente_id}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, cliente_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Geral (sem cliente)</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Select 
                    value={newTask.type}
                    onValueChange={(value: any) => setNewTask(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select 
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Data de Vencimento</label>
                <Input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTask.isPending}>
                  {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            {taskTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma tarefa encontrada.
          </p>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className={isOverdue(task.due_date) && task.status === 'pendente' ? 'border-red-500' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{task.title}</h4>
                      {isOverdue(task.due_date) && task.status === 'pendente' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityBadge(task.priority)}
                      {getTypeBadge(task.type)}
                      <Badge variant={task.status === 'concluida' ? 'default' : 'secondary'}>
                        {statuses.find(s => s.value === task.status)?.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      Cliente: {getClienteName(task.cliente_id)}
                    </p>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                    )}
                    
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Vencimento: {new Date(task.due_date).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
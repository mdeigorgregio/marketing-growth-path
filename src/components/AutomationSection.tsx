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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Zap, 
  Clock, 
  Mail, 
  CheckSquare, 
  Tag,
  Bell,
  Calendar,
  ArrowRight,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Automacao {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  trigger_tipo: string;
  trigger_config: any;
  condicoes: any[];
  acoes: any[];
  created_at: string;
  execucoes_count?: number;
}

interface AutomacaoExecucao {
  id: string;
  automacao_id: string;
  status: 'sucesso' | 'erro' | 'pendente';
  dados_entrada: any;
  resultado: any;
  erro_mensagem?: string;
  executed_at: string;
}

const triggerTypes = [
  { value: 'cliente_criado', label: 'Cliente criado', icon: '👤' },
  { value: 'status_mudou', label: 'Status mudou', icon: '🔄' },
  { value: 'sem_contato', label: 'Sem contato há X dias', icon: '⏰' },
  { value: 'vencimento_proximo', label: 'Vencimento próximo', icon: '📅' },
  { value: 'ficou_inadimplente', label: 'Ficou inadimplente', icon: '💰' },
  { value: 'agendamento_criado', label: 'Agendamento criado', icon: '📆' },
  { value: 'pagamento_regularizado', label: 'Pagamento regularizado', icon: '✅' },
];

const condicaoTypes = [
  { value: 'origem', label: 'Origem', options: ['Tráfego Pago', 'Orgânico', 'Indicação', 'Cold Email'] },
  { value: 'valor_plano', label: 'Valor do plano', type: 'number' },
  { value: 'estado', label: 'Estado', type: 'text' },
  { value: 'status', label: 'Status', options: ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado', 'Perdido'] },
  { value: 'status_pagamento', label: 'Status de pagamento', options: ['Adimplente', 'Inadimplente', 'Pendente'] },
  { value: 'dias_sem_contato', label: 'Dias sem contato', type: 'number' },
];

const acaoTypes = [
  { value: 'enviar_email', label: 'Enviar email template', icon: '📧' },
  { value: 'criar_tarefa', label: 'Criar tarefa', icon: '✅' },
  { value: 'mudar_status', label: 'Mudar status', icon: '🔄' },
  { value: 'agendar_followup', label: 'Agendar follow-up', icon: '📅' },
  { value: 'adicionar_tag', label: 'Adicionar tag', icon: '🏷️' },
  { value: 'enviar_notificacao', label: 'Enviar notificação', icon: '🔔' },
  { value: 'criar_lembrete_cobranca', label: 'Criar lembrete de cobrança', icon: '💰' },
];

const templatesAutomacao = [
  {
    nome: 'Welcome Series',
    descricao: 'Sequência de 3 emails após cliente virar Lead',
    trigger_tipo: 'status_mudou',
    trigger_config: { status_anterior: 'Prospect', status_novo: 'Lead' },
    condicoes: [],
    acoes: [
      { tipo: 'enviar_email', config: { template_id: 'welcome_1', delay_horas: 0 } },
      { tipo: 'enviar_email', config: { template_id: 'welcome_2', delay_horas: 24 } },
      { tipo: 'enviar_email', config: { template_id: 'welcome_3', delay_horas: 72 } },
    ]
  },
  {
    nome: 'Follow-up Lead Perdido',
    descricao: 'Lembrete se Lead sem contato há 7 dias',
    trigger_tipo: 'sem_contato',
    trigger_config: { dias: 7 },
    condicoes: [{ campo: 'status', operador: 'igual', valor: 'Lead' }],
    acoes: [
      { tipo: 'criar_tarefa', config: { titulo: 'Follow-up Lead sem contato', tipo: 'Ligação' } },
      { tipo: 'enviar_notificacao', config: { mensagem: 'Lead sem contato há 7 dias' } },
    ]
  },
  {
    nome: 'Cobrança Pré-Vencimento',
    descricao: 'Email 7 dias antes do vencimento',
    trigger_tipo: 'vencimento_proximo',
    trigger_config: { dias_antecedencia: 7 },
    condicoes: [{ campo: 'status_pagamento', operador: 'igual', valor: 'Adimplente' }],
    acoes: [
      { tipo: 'enviar_email', config: { template_id: 'pre_vencimento' } },
      { tipo: 'adicionar_tag', config: { tag: 'Vencimento Próximo' } },
    ]
  },
  {
    nome: 'Cobrança Suave',
    descricao: '1º email no dia do vencimento',
    trigger_tipo: 'ficou_inadimplente',
    trigger_config: { dias_atraso: 0 },
    condicoes: [],
    acoes: [
      { tipo: 'enviar_email', config: { template_id: 'cobranca_suave' } },
      { tipo: 'criar_tarefa', config: { titulo: 'Acompanhar pagamento em atraso', tipo: 'Cobrar pagamento' } },
      { tipo: 'adicionar_tag', config: { tag: 'Em Atraso' } },
    ]
  },
  {
    nome: 'Cobrança Firme',
    descricao: '2º email após 3 dias de atraso',
    trigger_tipo: 'ficou_inadimplente',
    trigger_config: { dias_atraso: 3 },
    condicoes: [{ campo: 'status_pagamento', operador: 'igual', valor: 'Inadimplente' }],
    acoes: [
      { tipo: 'enviar_email', config: { template_id: 'cobranca_firme' } },
      { tipo: 'criar_tarefa', config: { titulo: 'Negociar parcelamento', tipo: 'Negociar parcelamento' } },
      { tipo: 'enviar_notificacao', config: { mensagem: 'Cliente com 3 dias de atraso' } },
    ]
  },
  {
    nome: 'Cobrança Final',
    descricao: '3º email após 7 dias de atraso',
    trigger_tipo: 'ficou_inadimplente',
    trigger_config: { dias_atraso: 7 },
    condicoes: [{ campo: 'status_pagamento', operador: 'igual', valor: 'Inadimplente' }],
    acoes: [
      { tipo: 'enviar_email', config: { template_id: 'cobranca_final' } },
      { tipo: 'criar_tarefa', config: { titulo: 'Avaliar cancelamento', tipo: 'Verificar status do pagamento' } },
      { tipo: 'adicionar_tag', config: { tag: 'Risco Cancelamento' } },
    ]
  },
];

export function AutomationSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAutomacao, setSelectedAutomacao] = useState<Automacao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true,
    trigger_tipo: '',
    trigger_config: {},
    condicoes: [] as any[],
    acoes: [] as any[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar automações
  const { data: automacoes = [], isLoading } = useQuery({
    queryKey: ['automacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automacoes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Automacao[];
    },
  });

  // Buscar execuções recentes
  const { data: execucoes = [] } = useQuery({
    queryKey: ['automacao-execucoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automacao_execucoes')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AutomacaoExecucao[];
    },
  });

  // Mutation para criar/atualizar automação
  const automacaoMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing && selectedAutomacao) {
        const { error } = await supabase
          .from('automacoes')
          .update(data)
          .eq('id', selectedAutomacao.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('automacoes')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: `Automação ${isEditing ? 'atualizada' : 'criada'} com sucesso!`,
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar automação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar automação. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar automação
  const deleteAutomacaoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automacoes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes'] });
      setIsDialogOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Automação excluída com sucesso!',
      });
    },
  });

  // Mutation para ativar/desativar automação
  const toggleAutomacaoMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('automacoes')
        .update({ ativo })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automacoes'] });
      toast({
        title: 'Sucesso',
        description: 'Status da automação atualizado!',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      ativo: true,
      trigger_tipo: '',
      trigger_config: {},
      condicoes: [],
      acoes: [],
    });
    setSelectedAutomacao(null);
    setIsEditing(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (automacao: Automacao) => {
    setFormData({
      nome: automacao.nome,
      descricao: automacao.descricao || '',
      ativo: automacao.ativo,
      trigger_tipo: automacao.trigger_tipo,
      trigger_config: automacao.trigger_config || {},
      condicoes: automacao.condicoes || [],
      acoes: automacao.acoes || [],
    });
    setSelectedAutomacao(automacao);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const createFromTemplate = (template: any) => {
    setFormData({
      nome: template.nome,
      descricao: template.descricao,
      ativo: true,
      trigger_tipo: template.trigger_tipo,
      trigger_config: template.trigger_config,
      condicoes: template.condicoes,
      acoes: template.acoes,
    });
    setShowTemplates(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    automacaoMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (selectedAutomacao) {
      deleteAutomacaoMutation.mutate(selectedAutomacao.id);
    }
  };

  const toggleAutomacao = (id: string, ativo: boolean) => {
    toggleAutomacaoMutation.mutate({ id, ativo });
  };

  const addCondicao = () => {
    setFormData(prev => ({
      ...prev,
      condicoes: [...prev.condicoes, { campo: '', operador: 'igual', valor: '' }]
    }));
  };

  const removeCondicao = (index: number) => {
    setFormData(prev => ({
      ...prev,
      condicoes: prev.condicoes.filter((_, i) => i !== index)
    }));
  };

  const updateCondicao = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      condicoes: prev.condicoes.map((cond, i) => 
        i === index ? { ...cond, [field]: value } : cond
      )
    }));
  };

  const addAcao = () => {
    setFormData(prev => ({
      ...prev,
      acoes: [...prev.acoes, { tipo: '', config: {} }]
    }));
  };

  const removeAcao = (index: number) => {
    setFormData(prev => ({
      ...prev,
      acoes: prev.acoes.filter((_, i) => i !== index)
    }));
  };

  const updateAcao = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      acoes: prev.acoes.map((acao, i) => 
        i === index ? { ...acao, [field]: value } : acao
      )
    }));
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
      'sucesso': 'default',
      'erro': 'destructive',
      'pendente': 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTriggerIcon = (tipo: string) => {
    const trigger = triggerTypes.find(t => t.value === tipo);
    return trigger?.icon || '⚡';
  };

  const getAcaoIcon = (tipo: string) => {
    const acao = acaoTypes.find(a => a.value === tipo);
    return acao?.icon || '⚙️';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sistema de Automações</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Automação
          </Button>
        </div>
      </div>

      <Tabs defaultValue="automacoes" className="w-full">
        <TabsList>
          <TabsTrigger value="automacoes">Automações</TabsTrigger>
          <TabsTrigger value="execucoes">Execuções</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="automacoes" className="space-y-4">
          <div className="grid gap-4">
            {automacoes.map(automacao => {
              const trigger = triggerTypes.find(t => t.value === automacao.trigger_tipo);
              return (
                <Card key={automacao.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getTriggerIcon(automacao.trigger_tipo)}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{automacao.nome}</h3>
                            <p className="text-sm text-gray-600">{automacao.descricao}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {trigger?.label || automacao.trigger_tipo}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-4 w-4" />
                            {automacao.condicoes?.length || 0} condições
                          </span>
                          <span className="flex items-center gap-1">
                            <Settings className="h-4 w-4" />
                            {automacao.acoes?.length || 0} ações
                          </span>
                          {automacao.execucoes_count && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {automacao.execucoes_count} execuções
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={automacao.ativo ? 'default' : 'secondary'}>
                            {automacao.ativo ? 'Ativa' : 'Inativa'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Criada em {new Date(automacao.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={automacao.ativo}
                          onCheckedChange={(checked) => toggleAutomacao(automacao.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(automacao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {automacoes.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma automação criada</h3>
                  <p className="text-gray-500 mb-4">Crie sua primeira automação para começar a automatizar processos.</p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Automação
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="execucoes" className="space-y-4">
          <div className="space-y-4">
            {execucoes.map(execucao => {
              const automacao = automacoes.find(a => a.id === execucao.automacao_id);
              return (
                <Card key={execucao.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{automacao?.nome || 'Automação removida'}</h4>
                          {getStatusBadge(execucao.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Executada em {new Date(execucao.executed_at).toLocaleString('pt-BR')}
                        </p>
                        {execucao.erro_mensagem && (
                          <p className="text-sm text-red-600">{execucao.erro_mensagem}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {execucoes.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhuma execução registrada ainda.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total de Automações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{automacoes.length}</div>
                <p className="text-sm text-gray-600">
                  {automacoes.filter(a => a.ativo).length} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Execuções Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {execucoes.filter(e => {
                    const hoje = new Date().toDateString();
                    const execucaoData = new Date(e.executed_at).toDateString();
                    return hoje === execucaoData;
                  }).length}
                </div>
                <p className="text-sm text-gray-600">execuções</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {execucoes.length > 0 
                    ? Math.round((execucoes.filter(e => e.status === 'sucesso').length / execucoes.length) * 100)
                    : 0
                  }%
                </div>
                <p className="text-sm text-gray-600">das execuções</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Templates */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates de Automação</DialogTitle>
            <DialogDescription>
              Escolha um template pré-configurado para começar rapidamente
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesAutomacao.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => createFromTemplate(template)}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{template.nome}</h3>
                    <p className="text-sm text-gray-600">{template.descricao}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{template.condicoes.length} condições</span>
                      <span>•</span>
                      <span>{template.acoes.length} ações</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar/editar automação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Automação' : 'Nova Automação'}
            </DialogTitle>
            <DialogDescription>
              Configure quando, se e então para criar uma automação inteligente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Automação *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Cobrança automática"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva o que esta automação faz..."
                  rows={2}
                />
              </div>
            </div>

            {/* QUANDO - Trigger */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">QUANDO</span>
                Trigger
              </h3>
              
              <div>
                <Label>Evento que dispara a automação *</Label>
                <Select value={formData.trigger_tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map(trigger => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <span className="flex items-center gap-2">
                          <span>{trigger.icon}</span>
                          {trigger.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SE - Condições */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">SE</span>
                  Condições
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addCondicao}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Condição
                </Button>
              </div>

              {formData.condicoes.map((condicao, index) => (
                <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <Label>Campo</Label>
                    <Select value={condicao.campo} onValueChange={(value) => updateCondicao(index, 'campo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {condicaoTypes.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label>Operador</Label>
                    <Select value={condicao.operador} onValueChange={(value) => updateCondicao(index, 'operador', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="igual">Igual a</SelectItem>
                        <SelectItem value="diferente">Diferente de</SelectItem>
                        <SelectItem value="maior">Maior que</SelectItem>
                        <SelectItem value="menor">Menor que</SelectItem>
                        <SelectItem value="contem">Contém</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label>Valor</Label>
                    <Input
                      value={condicao.valor}
                      onChange={(e) => updateCondicao(index, 'valor', e.target.value)}
                      placeholder="Valor da condição"
                    />
                  </div>

                  <Button type="button" variant="outline" size="sm" onClick={() => removeCondicao(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {formData.condicoes.length === 0 && (
                <p className="text-sm text-gray-500 italic">Nenhuma condição adicionada. A automação será executada sempre que o trigger ocorrer.</p>
              )}
            </div>

            {/* ENTÃO - Ações */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">ENTÃO</span>
                  Ações
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addAcao}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Ação
                </Button>
              </div>

              {formData.acoes.map((acao, index) => (
                <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <Label>Tipo de Ação</Label>
                    <Select value={acao.tipo} onValueChange={(value) => updateAcao(index, 'tipo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma ação" />
                      </SelectTrigger>
                      <SelectContent>
                        {acaoTypes.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <span className="flex items-center gap-2">
                              <span>{tipo.icon}</span>
                              {tipo.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label>Configuração</Label>
                    <Input
                      value={JSON.stringify(acao.config || {})}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          updateAcao(index, 'config', config);
                        } catch {
                          // Ignore invalid JSON
                        }
                      }}
                      placeholder='{"template_id": "welcome"}'
                    />
                  </div>

                  <Button type="button" variant="outline" size="sm" onClick={() => removeAcao(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {formData.acoes.length === 0 && (
                <p className="text-sm text-gray-500 italic">Nenhuma ação adicionada. Adicione pelo menos uma ação para a automação funcionar.</p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteAutomacaoMutation.isPending}
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
                <Button type="submit" disabled={automacaoMutation.isPending}>
                  {automacaoMutation.isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
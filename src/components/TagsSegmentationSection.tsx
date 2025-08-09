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
  Tag, 
  Edit, 
  Trash2, 
  Users,
  Filter,
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TagData {
  id: string;
  nome: string;
  cor: string;
  descricao?: string;
  automatica: boolean;
  regra_automatica?: any;
  ativa: boolean;
  created_at: string;
  clientes_count?: number;
}

interface ClienteTag {
  id: string;
  cliente_id: string;
  tag_id: string;
  adicionada_automaticamente: boolean;
  created_at: string;
  cliente?: {
    nome_empresa: string;
    responsavel: string;
    email: string;
    status: string;
    status_pagamento?: string;
  };
  tag?: {
    nome: string;
    cor: string;
  };
}

interface Segmento {
  id: string;
  nome: string;
  descricao?: string;
  filtros: any;
  clientes_count: number;
  created_at: string;
}

const coresDisponiveis = [
  { value: 'bg-red-500', label: 'Vermelho', preview: '#ef4444' },
  { value: 'bg-orange-500', label: 'Laranja', preview: '#f97316' },
  { value: 'bg-yellow-500', label: 'Amarelo', preview: '#eab308' },
  { value: 'bg-green-500', label: 'Verde', preview: '#22c55e' },
  { value: 'bg-blue-500', label: 'Azul', preview: '#3b82f6' },
  { value: 'bg-indigo-500', label: 'Índigo', preview: '#6366f1' },
  { value: 'bg-purple-500', label: 'Roxo', preview: '#a855f7' },
  { value: 'bg-pink-500', label: 'Rosa', preview: '#ec4899' },
  { value: 'bg-gray-500', label: 'Cinza', preview: '#6b7280' },
];

const tagsAutomaticas = [
  {
    nome: 'Em Atraso',
    cor: 'bg-red-500',
    descricao: 'Clientes com pagamento em atraso',
    regra: { campo: 'status_pagamento', operador: 'igual', valor: 'Inadimplente' },
    icon: '💰'
  },
  {
    nome: 'Vencimento Próximo',
    cor: 'bg-yellow-500',
    descricao: 'Clientes com vencimento em até 7 dias',
    regra: { campo: 'dias_para_vencimento', operador: 'menor_igual', valor: 7 },
    icon: '⏰'
  },
  {
    nome: 'Alto Valor',
    cor: 'bg-purple-500',
    descricao: 'Clientes com plano acima de R$ 500',
    regra: { campo: 'valor_plano', operador: 'maior', valor: 500 },
    icon: '💎'
  },
  {
    nome: 'Risco Churn',
    cor: 'bg-orange-500',
    descricao: 'Clientes sem contato há mais de 30 dias',
    regra: { campo: 'dias_sem_contato', operador: 'maior', valor: 30 },
    icon: '⚠️'
  },
  {
    nome: 'WhatsApp Ativo',
    cor: 'bg-green-500',
    descricao: 'Clientes que receberam WhatsApp nos últimos 7 dias',
    regra: { campo: 'ultimo_whatsapp', operador: 'menor_igual', valor: 7 },
    icon: '📱'
  },
  {
    nome: 'Lead Quente',
    cor: 'bg-red-500',
    descricao: 'Leads criados nos últimos 3 dias',
    regra: { campo: 'created_at', operador: 'menor_igual', valor: 3, status: 'Lead' },
    icon: '🔥'
  },
  {
    nome: 'Cliente Fiel',
    cor: 'bg-blue-500',
    descricao: 'Clientes há mais de 12 meses',
    regra: { campo: 'data_contrato', operador: 'maior', valor: 365 },
    icon: '⭐'
  },
  {
    nome: 'Tráfego Pago',
    cor: 'bg-indigo-500',
    descricao: 'Clientes vindos de tráfego pago',
    regra: { campo: 'origem', operador: 'igual', valor: 'Tráfego Pago' },
    icon: '🎯'
  },
];

const segmentosPreDefinidos = [
  {
    nome: 'Clientes Inadimplentes',
    descricao: 'Todos os clientes com pagamento em atraso',
    filtros: {
      status_pagamento: 'Inadimplente',
      tags: ['Em Atraso']
    }
  },
  {
    nome: 'Leads Qualificados',
    descricao: 'Leads com alto potencial de conversão',
    filtros: {
      status: 'Lead',
      origem: 'Tráfego Pago',
      valor_plano_min: 200
    }
  },
  {
    nome: 'Clientes Premium',
    descricao: 'Clientes com planos de alto valor',
    filtros: {
      valor_plano_min: 500,
      status_pagamento: 'Adimplente',
      tags: ['Alto Valor']
    }
  },
  {
    nome: 'Risco de Cancelamento',
    descricao: 'Clientes com sinais de churn',
    filtros: {
      tags: ['Risco Churn', 'Em Atraso'],
      dias_sem_contato_min: 15
    }
  },
];

export function TagsSegmentationSection() {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segmento | null>(null);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [isEditingSegment, setIsEditingSegment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  
  const [tagFormData, setTagFormData] = useState({
    nome: '',
    cor: 'bg-blue-500',
    descricao: '',
    automatica: false,
    regra_automatica: {},
    ativa: true,
  });

  const [segmentFormData, setSegmentFormData] = useState({
    nome: '',
    descricao: '',
    filtros: {},
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar tags
  const { data: tags = [], isLoading: loadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TagData[];
    },
  });

  // Buscar relações cliente-tag
  const { data: clienteTags = [] } = useQuery({
    queryKey: ['cliente-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cliente_tags')
        .select(`
          *,
          cliente:clientes(nome_empresa, responsavel, email, status, status_pagamento),
          tag:tags(nome, cor)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClienteTag[];
    },
  });

  // Buscar segmentos
  const { data: segmentos = [] } = useQuery({
    queryKey: ['segmentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('segmentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Segmento[];
    },
  });

  // Buscar clientes para aplicar tags
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_empresa, responsavel, email, status, status_pagamento, valor_plano')
        .order('nome_empresa');
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation para criar/atualizar tag
  const tagMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditingTag && selectedTag) {
        const { error } = await supabase
          .from('tags')
          .update(data)
          .eq('id', selectedTag.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tags')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsTagDialogOpen(false);
      resetTagForm();
      toast({
        title: 'Sucesso',
        description: `Tag ${isEditingTag ? 'atualizada' : 'criada'} com sucesso!`,
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar tag:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar tag. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar tag
  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsTagDialogOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Tag excluída com sucesso!',
      });
    },
  });

  // Mutation para aplicar tag a cliente
  const applyTagMutation = useMutation({
    mutationFn: async ({ tagId, clienteIds }: { tagId: string; clienteIds: string[] }) => {
      const inserts = clienteIds.map(clienteId => ({
        tag_id: tagId,
        cliente_id: clienteId,
        adicionada_automaticamente: false,
      }));
      
      const { error } = await supabase
        .from('cliente_tags')
        .insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-tags'] });
      toast({
        title: 'Sucesso',
        description: 'Tags aplicadas com sucesso!',
      });
    },
  });

  const resetTagForm = () => {
    setTagFormData({
      nome: '',
      cor: 'bg-blue-500',
      descricao: '',
      automatica: false,
      regra_automatica: {},
      ativa: true,
    });
    setSelectedTag(null);
    setIsEditingTag(false);
  };

  const resetSegmentForm = () => {
    setSegmentFormData({
      nome: '',
      descricao: '',
      filtros: {},
    });
    setSelectedSegment(null);
    setIsEditingSegment(false);
  };

  const openCreateTagDialog = () => {
    resetTagForm();
    setIsTagDialogOpen(true);
  };

  const openEditTagDialog = (tag: TagData) => {
    setTagFormData({
      nome: tag.nome,
      cor: tag.cor,
      descricao: tag.descricao || '',
      automatica: tag.automatica,
      regra_automatica: tag.regra_automatica || {},
      ativa: tag.ativa,
    });
    setSelectedTag(tag);
    setIsEditingTag(true);
    setIsTagDialogOpen(true);
  };

  const createFromPreset = (preset: any) => {
    setTagFormData({
      nome: preset.nome,
      cor: preset.cor,
      descricao: preset.descricao,
      automatica: true,
      regra_automatica: preset.regra,
      ativa: true,
    });
    setIsTagDialogOpen(true);
  };

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    tagMutation.mutate(tagFormData);
  };

  const handleDeleteTag = () => {
    if (selectedTag) {
      deleteTagMutation.mutate(selectedTag.id);
    }
  };

  // Filtrar tags
  const tagsFiltradas = tags.filter(tag => {
    const matchSearch = tag.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === 'todas' || 
                     (filtroTipo === 'automaticas' && tag.automatica) ||
                     (filtroTipo === 'manuais' && !tag.automatica);
    return matchSearch && matchTipo;
  });

  // Calcular estatísticas
  const getTagStats = (tagId: string) => {
    return clienteTags.filter(ct => ct.tag_id === tagId).length;
  };

  const getClientesByTag = (tagId: string) => {
    return clienteTags.filter(ct => ct.tag_id === tagId);
  };

  const getCorPreview = (cor: string) => {
    const corConfig = coresDisponiveis.find(c => c.value === cor);
    return corConfig?.preview || '#3b82f6';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tags e Segmentação</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsSegmentDialogOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Novo Segmento
          </Button>
          <Button onClick={openCreateTagDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tag
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tags" className="w-full">
        <TabsList>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="segmentos">Segmentos</TabsTrigger>
          <TabsTrigger value="presets">Tags Automáticas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as tags</SelectItem>
                <SelectItem value="automaticas">Automáticas</SelectItem>
                <SelectItem value="manuais">Manuais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tagsFiltradas.map(tag => {
              const clientesCount = getTagStats(tag.id);
              return (
                <Card key={tag.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getCorPreview(tag.cor) }}
                          />
                          <h3 className="font-semibold">{tag.nome}</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditTagDialog(tag)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {tag.descricao && (
                        <p className="text-sm text-gray-600">{tag.descricao}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={tag.automatica ? 'default' : 'secondary'}>
                            {tag.automatica ? 'Automática' : 'Manual'}
                          </Badge>
                          <Badge variant={tag.ativa ? 'default' : 'secondary'}>
                            {tag.ativa ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {clientesCount} clientes
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {tagsFiltradas.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tag encontrada</h3>
                    <p className="text-gray-500 mb-4">Crie sua primeira tag ou ajuste os filtros.</p>
                    <Button onClick={openCreateTagDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Tag
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="segmentos" className="space-y-4">
          <div className="grid gap-4">
            {segmentos.map(segmento => (
              <Card key={segmento.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-semibold text-lg">{segmento.nome}</h3>
                          <p className="text-sm text-gray-600">{segmento.descricao}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {segmento.clientes_count} clientes
                        </span>
                        <span>Criado em {new Date(segmento.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {segmentos.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum segmento criado</h3>
                  <p className="text-gray-500 mb-4">Crie segmentos para organizar seus clientes.</p>
                  <Button onClick={() => setIsSegmentDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Segmento
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tagsAutomaticas.map((preset, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => createFromPreset(preset)}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{preset.icon}</span>
                      <h3 className="font-semibold">{preset.nome}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{preset.descricao}</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCorPreview(preset.cor) }}
                      />
                      <Badge variant="outline">Automática</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total de Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tags.length}</div>
                <p className="text-sm text-gray-600">
                  {tags.filter(t => t.automatica).length} automáticas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags Aplicadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clienteTags.length}</div>
                <p className="text-sm text-gray-600">total de aplicações</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clientes Taggeados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {new Set(clienteTags.map(ct => ct.cliente_id)).size}
                </div>
                <p className="text-sm text-gray-600">clientes únicos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segmentos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{segmentos.length}</div>
                <p className="text-sm text-gray-600">segmentos criados</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags Mais Utilizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tags
                  .map(tag => ({ ...tag, count: getTagStats(tag.id) }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map(tag => (
                    <div key={tag.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCorPreview(tag.cor) }}
                        />
                        <span>{tag.nome}</span>
                      </div>
                      <span className="font-medium">{tag.count} clientes</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar/editar tag */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingTag ? 'Editar Tag' : 'Nova Tag'}
            </DialogTitle>
            <DialogDescription>
              {isEditingTag ? 'Atualize as informações da tag' : 'Crie uma nova tag para organizar seus clientes'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTagSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome da Tag *</Label>
                <Input
                  id="nome"
                  value={tagFormData.nome}
                  onChange={(e) => setTagFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Cliente VIP"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cor">Cor *</Label>
                <Select value={tagFormData.cor} onValueChange={(value) => setTagFormData(prev => ({ ...prev, cor: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coresDisponiveis.map(cor => (
                      <SelectItem key={cor.value} value={cor.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: cor.preview }}
                          />
                          {cor.label}
                        </div>
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
                value={tagFormData.descricao}
                onChange={(e) => setTagFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva quando esta tag deve ser aplicada..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="automatica"
                checked={tagFormData.automatica}
                onCheckedChange={(checked) => setTagFormData(prev => ({ ...prev, automatica: checked }))}
              />
              <Label htmlFor="automatica">Tag automática</Label>
            </div>

            {tagFormData.automatica && (
              <div className="p-4 bg-gray-50 rounded">
                <Label>Regra Automática</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Configure as condições para aplicar esta tag automaticamente
                </p>
                <Textarea
                  value={JSON.stringify(tagFormData.regra_automatica, null, 2)}
                  onChange={(e) => {
                    try {
                      const regra = JSON.parse(e.target.value);
                      setTagFormData(prev => ({ ...prev, regra_automatica: regra }));
                    } catch {
                      // Ignore invalid JSON
                    }
                  }}
                  placeholder='{"campo": "status_pagamento", "operador": "igual", "valor": "Inadimplente"}'
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <div>
                {isEditingTag && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteTag}
                    disabled={deleteTagMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={tagMutation.isPending}>
                  {tagMutation.isPending ? 'Salvando...' : (isEditingTag ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar segmento */}
      <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Segmento</DialogTitle>
            <DialogDescription>
              Crie um segmento para agrupar clientes com características similares
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="segment-nome">Nome do Segmento *</Label>
              <Input
                id="segment-nome"
                value={segmentFormData.nome}
                onChange={(e) => setSegmentFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Clientes Premium"
              />
            </div>

            <div>
              <Label htmlFor="segment-descricao">Descrição</Label>
              <Textarea
                id="segment-descricao"
                value={segmentFormData.descricao}
                onChange={(e) => setSegmentFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva este segmento..."
                rows={2}
              />
            </div>

            <div>
              <Label>Filtros</Label>
              <p className="text-sm text-gray-600 mb-2">
                Configure os critérios para este segmento
              </p>
              <Textarea
                value={JSON.stringify(segmentFormData.filtros, null, 2)}
                onChange={(e) => {
                  try {
                    const filtros = JSON.parse(e.target.value);
                    setSegmentFormData(prev => ({ ...prev, filtros }));
                  } catch {
                    // Ignore invalid JSON
                  }
                }}
                placeholder='{"status": "Lead", "valor_plano_min": 500}'
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSegmentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button">
                Criar Segmento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  BellRing,
  Check,
  X,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Calendar,
  User,
  Mail,
  MessageSquare,
  Settings,
  Filter,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  lida: boolean;
  acao_url?: string;
  acao_texto?: string;
  cliente_id?: string;
  valor_relacionado?: number;
  data_vencimento?: string;
  created_at: string;
  cliente?: {
    nome_empresa: string;
    responsavel: string;
    status_pagamento: string;
  };
}

interface ConfiguracaoNotificacao {
  id: string;
  tipo_notificacao: string;
  ativa: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  antecedencia_dias?: number;
  horario_envio?: string;
}

const tiposNotificacao = [
  {
    tipo: 'vencimento_hoje',
    titulo: 'Vencimento Hoje',
    descricao: 'Cliente com pagamento vencendo hoje',
    icon: '📅',
    cor: 'orange',
    prioridade: 'alta'
  },
  {
    tipo: 'cliente_inadimplente',
    titulo: 'Cliente Inadimplente',
    descricao: 'Cliente ficou inadimplente',
    icon: '🚨',
    cor: 'red',
    prioridade: 'urgente'
  },
  {
    tipo: 'atraso_30_dias',
    titulo: '30 Dias de Atraso',
    descricao: 'Cliente com 30 dias de atraso (risco cancelamento)',
    icon: '⚠️',
    cor: 'red',
    prioridade: 'urgente'
  },
  {
    tipo: 'pagamento_regularizado',
    titulo: 'Pagamento Regularizado',
    descricao: 'Cliente regularizou o pagamento',
    icon: '✅',
    cor: 'green',
    prioridade: 'media'
  },
  {
    tipo: 'alto_valor_atraso',
    titulo: 'Alto Valor em Atraso',
    descricao: 'Cliente com valor alto em atraso (>R$ 1000)',
    icon: '💰',
    cor: 'red',
    prioridade: 'alta'
  },
  {
    tipo: 'vencimento_proximo',
    titulo: 'Vencimento Próximo',
    descricao: 'Cliente com vencimento em 3 dias',
    icon: '⏰',
    cor: 'yellow',
    prioridade: 'media'
  },
  {
    tipo: 'novo_cliente',
    titulo: 'Novo Cliente',
    descricao: 'Novo cliente cadastrado',
    icon: '👋',
    cor: 'blue',
    prioridade: 'baixa'
  },
  {
    tipo: 'tarefa_vencida',
    titulo: 'Tarefa Vencida',
    descricao: 'Tarefa de cobrança vencida',
    icon: '📋',
    cor: 'orange',
    prioridade: 'alta'
  },
  {
    tipo: 'meta_atingida',
    titulo: 'Meta Atingida',
    descricao: 'Meta de cobrança atingida',
    icon: '🎯',
    cor: 'green',
    prioridade: 'baixa'
  },
  {
    tipo: 'sistema',
    titulo: 'Sistema',
    descricao: 'Notificações do sistema',
    icon: '⚙️',
    cor: 'gray',
    prioridade: 'baixa'
  }
];

const prioridadeCores = {
  baixa: 'bg-gray-500',
  media: 'bg-yellow-500',
  alta: 'bg-orange-500',
  urgente: 'bg-red-500',
};

const tipoCores = {
  red: 'bg-red-100 border-red-200 text-red-800',
  orange: 'bg-orange-100 border-orange-200 text-orange-800',
  yellow: 'bg-yellow-100 border-yellow-200 text-yellow-800',
  green: 'bg-green-100 border-green-200 text-green-800',
  blue: 'bg-blue-100 border-blue-200 text-blue-800',
  gray: 'bg-gray-100 border-gray-200 text-gray-800',
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [filtroLida, setFiltroLida] = useState<string>('todas');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todas');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar notificações
  const { data: notificacoes = [], isLoading } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select(`
          *,
          cliente:clientes(nome_empresa, responsavel, status_pagamento)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as Notificacao[];
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Buscar configurações de notificação
  const { data: configuracoes = [] } = useQuery({
    queryKey: ['configuracoes-notificacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes_notificacao')
        .select('*');
      
      if (error) throw error;
      return data as ConfiguracaoNotificacao[];
    },
  });

  // Mutation para marcar como lida
  const marcarLidaMutation = useMutation({
    mutationFn: async ({ id, lida }: { id: string; lida: boolean }) => {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });

  // Mutation para deletar notificação
  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      toast({
        title: 'Sucesso',
        description: 'Notificação excluída com sucesso!',
      });
    },
  });

  // Mutation para atualizar configurações
  const atualizarConfigMutation = useMutation({
    mutationFn: async (config: Partial<ConfiguracaoNotificacao>) => {
      const { error } = await supabase
        .from('configuracoes_notificacao')
        .upsert(config);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-notificacao'] });
      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso!',
      });
    },
  });

  // Filtrar notificações
  const notificacoesFiltradas = notificacoes.filter(notif => {
    const matchTipo = filtroTipo === 'todas' || notif.tipo === filtroTipo;
    const matchLida = filtroLida === 'todas' || 
                     (filtroLida === 'lidas' && notif.lida) ||
                     (filtroLida === 'nao_lidas' && !notif.lida);
    const matchPrioridade = filtroPrioridade === 'todas' || notif.prioridade === filtroPrioridade;
    
    return matchTipo && matchLida && matchPrioridade;
  });

  // Contar notificações não lidas
  const naoLidas = notificacoes.filter(n => !n.lida).length;
  const urgentes = notificacoes.filter(n => !n.lida && n.prioridade === 'urgente').length;

  const getTipoConfig = (tipo: string) => {
    return tiposNotificacao.find(t => t.tipo === tipo) || tiposNotificacao[tiposNotificacao.length - 1];
  };

  const getTempoRelativo = (data: string) => {
    return formatDistanceToNow(new Date(data), { addSuffix: true, locale: ptBR });
  };

  const marcarComoLida = (id: string, lida: boolean) => {
    marcarLidaMutation.mutate({ id, lida });
  };

  const marcarTodasLidas = () => {
    const naoLidasIds = notificacoes.filter(n => !n.lida).map(n => n.id);
    naoLidasIds.forEach(id => {
      marcarLidaMutation.mutate({ id, lida: true });
    });
  };

  const deletarNotificacao = (id: string) => {
    deletarMutation.mutate(id);
  };

  const executarAcao = (notificacao: Notificacao) => {
    if (notificacao.acao_url) {
      // Navegar para a URL da ação
      window.location.href = notificacao.acao_url;
    }
    
    // Marcar como lida
    if (!notificacao.lida) {
      marcarComoLida(notificacao.id, true);
    }
  };

  const atualizarConfiguracao = (tipo: string, campo: string, valor: any) => {
    const configExistente = configuracoes.find(c => c.tipo_notificacao === tipo);
    
    if (configExistente) {
      atualizarConfigMutation.mutate({
        ...configExistente,
        [campo]: valor,
      });
    } else {
      atualizarConfigMutation.mutate({
        tipo_notificacao: tipo,
        ativa: true,
        email: true,
        push: true,
        sms: false,
        [campo]: valor,
      });
    }
  };

  const getConfiguracao = (tipo: string) => {
    return configuracoes.find(c => c.tipo_notificacao === tipo) || {
      ativa: true,
      email: true,
      push: true,
      sms: false,
    };
  };

  // Simular notificação de teste
  const criarNotificacaoTeste = () => {
    const tipos = ['vencimento_hoje', 'cliente_inadimplente', 'pagamento_regularizado'];
    const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
    const tipoConfig = getTipoConfig(tipoAleatorio);
    
    const notificacaoTeste = {
      tipo: tipoAleatorio,
      titulo: tipoConfig.titulo,
      mensagem: `Esta é uma notificação de teste para ${tipoConfig.descricao.toLowerCase()}`,
      prioridade: tipoConfig.prioridade as 'baixa' | 'media' | 'alta' | 'urgente',
      lida: false,
    };
    
    // Simular inserção no banco
    toast({
      title: 'Notificação de Teste',
      description: notificacaoTeste.mensagem,
    });
  };

  // Efeito para tocar som em notificações urgentes
  useEffect(() => {
    if (soundEnabled && urgentes > 0) {
      // Aqui você pode adicionar um som de notificação
      console.log('🔔 Notificação urgente!');
    }
  }, [urgentes, soundEnabled]);

  return (
    <>
      {/* Botão de Notificações */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {naoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {naoLidas > 99 ? '99+' : naoLidas}
            </Badge>
          )}
        </Button>
      </div>

      {/* Dialog Principal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  Central de Notificações
                  {naoLidas > 0 && (
                    <Badge variant="destructive">{naoLidas} não lidas</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Acompanhe alertas de pagamento e atualizações do sistema
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={criarNotificacaoTeste}>
                  Teste
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsConfigOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
                {naoLidas > 0 && (
                  <Button variant="outline" size="sm" onClick={marcarTodasLidas}>
                    <Check className="h-4 w-4 mr-1" />
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="todas" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="todas">Todas ({notificacoes.length})</TabsTrigger>
                <TabsTrigger value="nao_lidas">Não Lidas ({naoLidas})</TabsTrigger>
                <TabsTrigger value="urgentes">Urgentes ({urgentes})</TabsTrigger>
                <TabsTrigger value="hoje">Hoje</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todos os tipos</SelectItem>
                    {tiposNotificacao.map(tipo => (
                      <SelectItem key={tipo.tipo} value={tipo.tipo}>
                        {tipo.icon} {tipo.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="todas" className="space-y-3 max-h-96 overflow-y-auto">
              {notificacoesFiltradas.map(notificacao => {
                const tipoConfig = getTipoConfig(notificacao.tipo);
                return (
                  <NotificationCard
                    key={notificacao.id}
                    notificacao={notificacao}
                    tipoConfig={tipoConfig}
                    onMarcarLida={marcarComoLida}
                    onDeletar={deletarNotificacao}
                    onExecutarAcao={executarAcao}
                  />
                );
              })}

              {notificacoesFiltradas.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
                  <p className="text-gray-500">Você está em dia com tudo!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nao_lidas" className="space-y-3 max-h-96 overflow-y-auto">
              {notificacoesFiltradas.filter(n => !n.lida).map(notificacao => {
                const tipoConfig = getTipoConfig(notificacao.tipo);
                return (
                  <NotificationCard
                    key={notificacao.id}
                    notificacao={notificacao}
                    tipoConfig={tipoConfig}
                    onMarcarLida={marcarComoLida}
                    onDeletar={deletarNotificacao}
                    onExecutarAcao={executarAcao}
                  />
                );
              })}
            </TabsContent>

            <TabsContent value="urgentes" className="space-y-3 max-h-96 overflow-y-auto">
              {notificacoesFiltradas.filter(n => n.prioridade === 'urgente').map(notificacao => {
                const tipoConfig = getTipoConfig(notificacao.tipo);
                return (
                  <NotificationCard
                    key={notificacao.id}
                    notificacao={notificacao}
                    tipoConfig={tipoConfig}
                    onMarcarLida={marcarComoLida}
                    onDeletar={deletarNotificacao}
                    onExecutarAcao={executarAcao}
                  />
                );
              })}
            </TabsContent>

            <TabsContent value="hoje" className="space-y-3 max-h-96 overflow-y-auto">
              {notificacoesFiltradas.filter(n => isToday(new Date(n.created_at))).map(notificacao => {
                const tipoConfig = getTipoConfig(notificacao.tipo);
                return (
                  <NotificationCard
                    key={notificacao.id}
                    notificacao={notificacao}
                    tipoConfig={tipoConfig}
                    onMarcarLida={marcarComoLida}
                    onDeletar={deletarNotificacao}
                    onExecutarAcao={executarAcao}
                  />
                );
              })}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configurações */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configurações de Notificação</DialogTitle>
            <DialogDescription>
              Configure como e quando você deseja receber notificações
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Configurações Gerais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurações Gerais</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Som de Notificação</Label>
                  <p className="text-sm text-gray-600">Tocar som para notificações urgentes</p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-gray-600">Receber notificações no navegador</p>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>
            </div>

            {/* Configurações por Tipo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tipos de Notificação</h3>
              
              <div className="space-y-3">
                {tiposNotificacao.map(tipo => {
                  const config = getConfiguracao(tipo.tipo);
                  return (
                    <Card key={tipo.tipo}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{tipo.icon}</span>
                            <div>
                              <h4 className="font-medium">{tipo.titulo}</h4>
                              <p className="text-sm text-gray-600">{tipo.descricao}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Ativa</Label>
                              <Switch 
                                checked={config.ativa} 
                                onCheckedChange={(checked) => 
                                  atualizarConfiguracao(tipo.tipo, 'ativa', checked)
                                }
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Email</Label>
                              <Switch 
                                checked={config.email} 
                                onCheckedChange={(checked) => 
                                  atualizarConfiguracao(tipo.tipo, 'email', checked)
                                }
                                disabled={!config.ativa}
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Push</Label>
                              <Switch 
                                checked={config.push} 
                                onCheckedChange={(checked) => 
                                  atualizarConfiguracao(tipo.tipo, 'push', checked)
                                }
                                disabled={!config.ativa}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsConfigOpen(false)}>
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente para cada card de notificação
interface NotificationCardProps {
  notificacao: Notificacao;
  tipoConfig: any;
  onMarcarLida: (id: string, lida: boolean) => void;
  onDeletar: (id: string) => void;
  onExecutarAcao: (notificacao: Notificacao) => void;
}

function NotificationCard({ 
  notificacao, 
  tipoConfig, 
  onMarcarLida, 
  onDeletar, 
  onExecutarAcao 
}: NotificationCardProps) {
  const corCard = tipoCores[tipoConfig.cor as keyof typeof tipoCores] || tipoCores.gray;
  
  return (
    <Card className={`transition-all hover:shadow-md ${
      !notificacao.lida ? 'border-l-4 border-l-blue-500' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${corCard}`}>
              <span className="text-lg">{tipoConfig.icon}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${
                  !notificacao.lida ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {notificacao.titulo}
                </h4>
                
                <Badge 
                  variant="secondary" 
                  className={`text-white text-xs ${prioridadeCores[notificacao.prioridade]}`}
                >
                  {notificacao.prioridade}
                </Badge>
                
                {!notificacao.lida && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <p className={`text-sm mb-2 ${
                !notificacao.lida ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {notificacao.mensagem}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{getTempoRelativo(notificacao.created_at)}</span>
                
                {notificacao.cliente && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {notificacao.cliente.nome_empresa}
                  </span>
                )}
                
                {notificacao.valor_relacionado && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    R$ {notificacao.valor_relacionado.toLocaleString('pt-BR')}
                  </span>
                )}
                
                {notificacao.data_vencimento && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(notificacao.data_vencimento), 'dd/MM/yyyy')}
                  </span>
                )}
              </div>
              
              {notificacao.acao_texto && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => onExecutarAcao(notificacao)}
                >
                  {notificacao.acao_texto}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarcarLida(notificacao.id, !notificacao.lida)}
              title={notificacao.lida ? 'Marcar como não lida' : 'Marcar como lida'}
            >
              {notificacao.lida ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeletar(notificacao.id)}
              title="Excluir notificação"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook para usar o centro de notificações
export function useNotificationCenter() {
  const { data: notificacoes = [] } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('lida', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const naoLidas = notificacoes.length;
  const urgentes = notificacoes.filter(n => n.prioridade === 'urgente').length;

  return {
    notificacoes,
    naoLidas,
    urgentes,
  };
}

function getTempoRelativo(data: string): string {
  return formatDistanceToNow(new Date(data), { addSuffix: true, locale: ptBR });
}
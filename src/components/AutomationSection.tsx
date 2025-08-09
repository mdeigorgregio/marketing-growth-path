import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Zap, 
  Clock, 
  CheckSquare, 
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Automacao {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  trigger_tipo: string;
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
  executed_at: string;
}

export function AutomationSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data since the real tables don't exist yet
  const automacoes: Automacao[] = [
    {
      id: '1',
      nome: 'Email de Boas-vindas',
      descricao: 'Envia email automático quando um novo cliente é criado',
      ativo: true,
      trigger_tipo: 'novo_cliente',
      condicoes: [],
      acoes: [{ tipo: 'enviar_email', config: { template_id: 'welcome' } }],
      created_at: new Date().toISOString(),
      execucoes_count: 15
    },
    {
      id: '2',
      nome: 'Cobrança Automática',
      descricao: 'Envia email de cobrança quando cliente fica inadimplente',
      ativo: true,
      trigger_tipo: 'ficou_inadimplente',
      condicoes: [{ campo: 'dias_atraso', operador: 'maior', valor: 1 }],
      acoes: [
        { tipo: 'enviar_email', config: { template_id: 'cobranca' } },
        { tipo: 'criar_tarefa', config: { titulo: 'Entrar em contato' } }
      ],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      execucoes_count: 8
    },
    {
      id: '3',
      nome: 'Follow-up Lead',
      descricao: 'Cria tarefa para follow-up quando lead não tem contato há 7 dias',
      ativo: false,
      trigger_tipo: 'sem_contato',
      condicoes: [{ campo: 'status', operador: 'igual', valor: 'Lead' }],
      acoes: [{ tipo: 'criar_tarefa', config: { titulo: 'Follow-up necessário' } }],
      created_at: new Date(Date.now() - 172800000).toISOString(),
      execucoes_count: 3
    }
  ];

  const execucoes: AutomacaoExecucao[] = [
    {
      id: '1',
      automacao_id: '1',
      status: 'sucesso',
      dados_entrada: { cliente_id: 'proj_123' },
      resultado: { status: 'enviado' },
      executed_at: new Date().toISOString()
    },
    {
      id: '2',
      automacao_id: '2',
      status: 'sucesso',
      dados_entrada: { cliente_id: 'proj_456' },
      resultado: { status: 'enviado' },
      executed_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      automacao_id: '1',
      status: 'erro',
      dados_entrada: { cliente_id: 'proj_789' },
      resultado: { erro: 'Template não encontrado' },
      executed_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const toggleAutomacao = (id: string, ativo: boolean) => {
    toast({
      title: 'Sucesso',
      description: `Automação ${ativo ? 'ativada' : 'desativada'} com sucesso!`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
      'sucesso': 'default',
      'erro': 'destructive',
      'pendente': 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const triggerTypes: { [key: string]: string } = {
    'novo_cliente': '👤 Cliente criado',
    'ficou_inadimplente': '💰 Ficou inadimplente',
    'sem_contato': '⏰ Sem contato há X dias',
    'vencimento_proximo': '📅 Vencimento próximo'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sistema de Automações</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      <Tabs defaultValue="automacoes" className="w-full">
        <TabsList>
          <TabsTrigger value="automacoes">Automações</TabsTrigger>
          <TabsTrigger value="execucoes">Execuções</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="automacoes" className="space-y-4">
          <div className="grid gap-4">
            {automacoes.map(automacao => (
              <Card key={automacao.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h3 className="font-semibold text-lg">{automacao.nome}</h3>
                          <p className="text-sm text-gray-600">{automacao.descricao}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {triggerTypes[automacao.trigger_tipo] || automacao.trigger_tipo}
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
                        onClick={() => toast({ title: 'Em Desenvolvimento', description: 'Funcionalidade em breve!' })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                        {execucao.resultado?.erro && (
                          <p className="text-sm text-red-600">{execucao.resultado.erro}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

      {/* Placeholder message for development */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsDialogOpen(false)}>
          <Card className="max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
              <p className="text-gray-600 mb-4">
                O editor de automações estará disponível em breve. 
                Por enquanto, você pode ver as automações existentes.
              </p>
              <Button onClick={() => setIsDialogOpen(false)}>
                Entendi
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
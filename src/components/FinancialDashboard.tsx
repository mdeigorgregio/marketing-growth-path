import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  Download,
  Filter,
  RefreshCw,
  Target,
  CreditCard,
  Banknote,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClienteFinanceiro {
  id: string;
  nome_empresa: string;
  responsavel: string;
  telefone?: string;
  email?: string;
  status: string;
  status_pagamento: string;
  valor_plano: number;
  data_contrato?: string;
  data_vencimento?: string;
  dias_atraso: number;
  valor_em_atraso: number;
  origem?: string;
  created_at: string;
}

interface TarefaCobranca {
  id: string;
  titulo: string;
  tipo: string;
  status: string;
  data_vencimento: string;
  cliente_id: string;
  valor_relacionado?: number;
  cliente?: {
    nome_empresa: string;
    status_pagamento: string;
    valor_plano: number;
  };
}

interface MetricasFinanceiras {
  totalClientes: number;
  clientesAdimplentes: number;
  clientesInadimplentes: number;
  clientesPendentes: number;
  valorTotalMensal: number;
  valorEmAtraso: number;
  valorRecuperado: number;
  taxaInadimplencia: number;
  tempoMedioRegularizacao: number;
  previsaoRecebimento: number;
}

const CORES_GRAFICOS = {
  adimplente: '#22c55e',
  inadimplente: '#ef4444',
  pendente: '#f59e0b',
  recuperado: '#3b82f6',
  meta: '#8b5cf6',
};

export function FinancialDashboard() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Buscar clientes com dados financeiros
  const { data: clientes = [], isLoading: loadingClientes, refetch: refetchClientes } = useQuery({
    queryKey: ['clientes-financeiro', periodoSelecionado],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClienteFinanceiro[];
    },
  });

  // Buscar tarefas de cobrança
  const { data: tarefasCobranca = [] } = useQuery({
    queryKey: ['tarefas-cobranca'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tarefas')
        .select(`
          *,
          cliente:clientes(nome_empresa, status_pagamento, valor_plano)
        `)
        .in('tipo', ['cobrar_pagamento', 'negociar_parcelamento', 'verificar_pagamento'])
        .order('data_vencimento', { ascending: true });
      
      if (error) throw error;
      return data as TarefaCobranca[];
    },
  });

  // Calcular métricas financeiras
  const calcularMetricas = (): MetricasFinanceiras => {
    const totalClientes = clientes.length;
    const clientesAdimplentes = clientes.filter(c => c.status_pagamento === 'Adimplente').length;
    const clientesInadimplentes = clientes.filter(c => c.status_pagamento === 'Inadimplente').length;
    const clientesPendentes = clientes.filter(c => c.status_pagamento === 'Pendente').length;
    
    const valorTotalMensal = clientes.reduce((sum, c) => sum + (c.valor_plano || 0), 0);
    const valorEmAtraso = clientes
      .filter(c => c.status_pagamento === 'Inadimplente')
      .reduce((sum, c) => sum + (c.valor_em_atraso || c.valor_plano || 0), 0);
    
    const taxaInadimplencia = totalClientes > 0 ? (clientesInadimplentes / totalClientes) * 100 : 0;
    
    // Simulação de dados históricos
    const valorRecuperado = valorEmAtraso * 0.3; // 30% do valor em atraso foi recuperado
    const tempoMedioRegularizacao = 15; // 15 dias em média
    const previsaoRecebimento = valorTotalMensal * 0.95; // 95% de previsão
    
    return {
      totalClientes,
      clientesAdimplentes,
      clientesInadimplentes,
      clientesPendentes,
      valorTotalMensal,
      valorEmAtraso,
      valorRecuperado,
      taxaInadimplencia,
      tempoMedioRegularizacao,
      previsaoRecebimento,
    };
  };

  const metricas = calcularMetricas();

  // Dados para gráficos
  const dadosStatusPagamento = [
    { name: 'Adimplentes', value: metricas.clientesAdimplentes, color: CORES_GRAFICOS.adimplente },
    { name: 'Inadimplentes', value: metricas.clientesInadimplentes, color: CORES_GRAFICOS.inadimplente },
    { name: 'Pendentes', value: metricas.clientesPendentes, color: CORES_GRAFICOS.pendente },
  ];

  // Simular dados históricos para gráfico de evolução
  const gerarDadosEvolucao = () => {
    const dados = [];
    const hoje = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const data = subDays(hoje, i);
      const valorBase = metricas.valorTotalMensal;
      const variacao = (Math.random() - 0.5) * 0.1; // Variação de ±5%
      
      dados.push({
        data: format(data, 'dd/MM'),
        recebido: Math.round(valorBase * (0.8 + variacao)),
        previsto: valorBase,
        atraso: Math.round(valorBase * (0.15 + variacao * 0.5)),
      });
    }
    
    return dados;
  };

  const dadosEvolucao = gerarDadosEvolucao();

  // Filtrar clientes inadimplentes
  const clientesInadimplentes = clientes.filter(c => c.status_pagamento === 'Inadimplente');
  const clientesVencimentoProximo = clientes.filter(c => {
    if (!c.data_vencimento) return false;
    const vencimento = new Date(c.data_vencimento);
    const hoje = new Date();
    const diasParaVencimento = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasParaVencimento <= 7 && diasParaVencimento >= 0;
  });

  // Tarefas de cobrança pendentes
  const tarefasPendentes = tarefasCobranca.filter(t => t.status === 'pendente');
  const tarefasVencidas = tarefasPendentes.filter(t => {
    const vencimento = new Date(t.data_vencimento);
    return vencimento < new Date();
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchClientes();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const exportarRelatorio = () => {
    const dados = {
      metricas,
      clientes: clientes.map(c => ({
        empresa: c.nome_empresa,
        responsavel: c.responsavel,
        status: c.status_pagamento,
        valor_plano: c.valor_plano,
        dias_atraso: c.dias_atraso,
        valor_atraso: c.valor_em_atraso,
      })),
      data_exportacao: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
        <div className="flex gap-2">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metricas.valorTotalMensal.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% vs mês anterior
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Atraso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {metricas.valorEmAtraso.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {metricas.clientesInadimplentes} clientes inadimplentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Inadimplência</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricas.taxaInadimplencia.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -2.1% vs mês anterior
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Recuperado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metricas.valorRecuperado.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {metricas.tempoMedioRegularizacao} dias tempo médio
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="previsoes">Previsões</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Status de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={dadosStatusPagamento}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dadosStatusPagamento.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolução Financeira */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Últimos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="recebido" 
                      stroke={CORES_GRAFICOS.adimplente} 
                      name="Recebido"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previsto" 
                      stroke={CORES_GRAFICOS.meta} 
                      name="Previsto"
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="atraso" 
                      stroke={CORES_GRAFICOS.inadimplente} 
                      name="Em Atraso"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Clientes Adimplentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metricas.clientesAdimplentes}</div>
                <p className="text-sm text-gray-600">
                  {((metricas.clientesAdimplentes / metricas.totalClientes) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Clientes Inadimplentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metricas.clientesInadimplentes}</div>
                <p className="text-sm text-gray-600">
                  R$ {metricas.valorEmAtraso.toLocaleString('pt-BR')} em atraso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Vencimento Próximo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clientesVencimentoProximo.length}</div>
                <p className="text-sm text-gray-600">
                  Vencem nos próximos 7 dias
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cobranca" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Inadimplentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Clientes Inadimplentes ({clientesInadimplentes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clientesInadimplentes.slice(0, 10).map(cliente => (
                    <div key={cliente.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{cliente.nome_empresa}</h4>
                        <p className="text-sm text-gray-600">{cliente.responsavel}</p>
                        <p className="text-xs text-red-600">
                          {cliente.dias_atraso} dias de atraso
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          R$ {(cliente.valor_em_atraso || cliente.valor_plano || 0).toLocaleString('pt-BR')}
                        </p>
                        <div className="flex gap-1 mt-1">
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tarefas de Cobrança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Tarefas de Cobrança ({tarefasPendentes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tarefasPendentes.slice(0, 10).map(tarefa => {
                    const isVencida = new Date(tarefa.data_vencimento) < new Date();
                    return (
                      <div key={tarefa.id} className={`p-3 rounded-lg ${
                        isVencida ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{tarefa.titulo}</h4>
                            <p className="text-sm text-gray-600">
                              {tarefa.cliente?.nome_empresa}
                            </p>
                            <p className="text-xs text-gray-500">
                              Vence: {format(new Date(tarefa.data_vencimento), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            {isVencida && (
                              <Badge variant="destructive" className="mb-1">
                                Vencida
                              </Badge>
                            )}
                            {tarefa.valor_relacionado && (
                              <p className="text-sm font-medium">
                                R$ {tarefa.valor_relacionado.toLocaleString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas de Cobrança */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas de Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col">
                  <Phone className="h-6 w-6 mb-2" />
                  Ligar para Inadimplentes
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  WhatsApp em Massa
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Mail className="h-6 w-6 mb-2" />
                  E-mail de Cobrança
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Calendar className="h-6 w-6 mb-2" />
                  Agendar Negociação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análise por Origem */}
            <Card>
              <CardHeader>
                <CardTitle>Inadimplência por Origem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Tráfego Pago', 'Orgânico', 'Indicação', 'Cold Email'].map(origem => {
                    const clientesOrigem = clientes.filter(c => c.origem === origem);
                    const inadimplentesOrigem = clientesOrigem.filter(c => c.status_pagamento === 'Inadimplente');
                    const taxa = clientesOrigem.length > 0 ? (inadimplentesOrigem.length / clientesOrigem.length) * 100 : 0;
                    
                    return (
                      <div key={origem} className="flex justify-between items-center">
                        <span>{origem}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {inadimplentesOrigem.length}/{clientesOrigem.length}
                          </span>
                          <Badge variant={taxa > 20 ? 'destructive' : taxa > 10 ? 'secondary' : 'default'}>
                            {taxa.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Análise por Valor do Plano */}
            <Card>
              <CardHeader>
                <CardTitle>Inadimplência por Faixa de Valor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Até R$ 100', min: 0, max: 100 },
                    { label: 'R$ 101 - R$ 300', min: 101, max: 300 },
                    { label: 'R$ 301 - R$ 500', min: 301, max: 500 },
                    { label: 'Acima de R$ 500', min: 501, max: Infinity },
                  ].map(faixa => {
                    const clientesFaixa = clientes.filter(c => 
                      (c.valor_plano || 0) >= faixa.min && (c.valor_plano || 0) <= faixa.max
                    );
                    const inadimplementesFaixa = clientesFaixa.filter(c => c.status_pagamento === 'Inadimplente');
                    const taxa = clientesFaixa.length > 0 ? (inadimplementesFaixa.length / clientesFaixa.length) * 100 : 0;
                    
                    return (
                      <div key={faixa.label} className="flex justify-between items-center">
                        <span>{faixa.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {inadimplementesFaixa.length}/{clientesFaixa.length}
                          </span>
                          <Badge variant={taxa > 20 ? 'destructive' : taxa > 10 ? 'secondary' : 'default'}>
                            {taxa.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Avançadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Regularização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metricas.tempoMedioRegularizacao} dias</div>
                <p className="text-sm text-gray-600">Meta: 10 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Recuperação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">75%</div>
                <p className="text-sm text-gray-600">Dos valores em atraso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiência de Cobrança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">85%</div>
                <p className="text-sm text-gray-600">Tarefas concluídas no prazo</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="previsoes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Previsão de Recebimento */}
            <Card>
              <CardHeader>
                <CardTitle>Previsão de Recebimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span>Este mês</span>
                    <span className="font-bold text-green-600">
                      R$ {metricas.previsaoRecebimento.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span>Próximo mês</span>
                    <span className="font-bold text-blue-600">
                      R$ {(metricas.previsaoRecebimento * 1.05).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span>Próximos 3 meses</span>
                    <span className="font-bold text-purple-600">
                      R$ {(metricas.previsaoRecebimento * 3.2).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metas e Objetivos */}
            <Card>
              <CardHeader>
                <CardTitle>Metas e Objetivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Taxa de Inadimplência</span>
                      <span className="text-sm">{metricas.taxaInadimplencia.toFixed(1)}% / 5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((metricas.taxaInadimplencia / 5) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Valor Recuperado</span>
                      <span className="text-sm">
                        R$ {metricas.valorRecuperado.toLocaleString('pt-BR')} / R$ {metricas.valorEmAtraso.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${metricas.valorEmAtraso > 0 ? (metricas.valorRecuperado / metricas.valorEmAtraso) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Receita Mensal</span>
                      <span className="text-sm">
                        R$ {metricas.valorTotalMensal.toLocaleString('pt-BR')} / R$ {(metricas.valorTotalMensal * 1.2).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(metricas.valorTotalMensal / (metricas.valorTotalMensal * 1.2)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas e Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas e Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metricas.taxaInadimplencia > 15 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium text-red-800">Taxa de inadimplência alta</h4>
                      <p className="text-sm text-red-600">
                        Considere revisar o processo de cobrança e implementar ações preventivas.
                      </p>
                    </div>
                  </div>
                )}
                
                {tarefasVencidas.length > 5 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <h4 className="font-medium text-orange-800">Tarefas de cobrança vencidas</h4>
                      <p className="text-sm text-orange-600">
                        {tarefasVencidas.length} tarefas estão vencidas. Priorize a execução.
                      </p>
                    </div>
                  </div>
                )}
                
                {clientesVencimentoProximo.length > 10 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Muitos vencimentos próximos</h4>
                      <p className="text-sm text-yellow-600">
                        {clientesVencimentoProximo.length} clientes vencem nos próximos 7 dias. Envie lembretes.
                      </p>
                    </div>
                  </div>
                )}
                
                {metricas.valorRecuperado > metricas.valorEmAtraso * 0.5 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium text-green-800">Boa performance de recuperação</h4>
                      <p className="text-sm text-green-600">
                        Sua equipe está recuperando bem os valores em atraso. Continue assim!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
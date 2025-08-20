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
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie } from 'recharts';

interface ClienteFinanceiro {
  id: string;
  empresa: string;
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
    empresa: string;
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
        .select('*')
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
        empresa: c.empresa,
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
                        <h4 className="font-medium">{cliente.empresa}</h4>
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
                  <Clock className="h-5 w-5 text-orange-500" />
                  Tarefas de Cobrança ({tarefasPendentes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tarefasPendentes.slice(0, 10).map(tarefa => (
                    <div key={tarefa.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{tarefa.titulo}</h4>
                          <p className="text-sm text-gray-600 capitalize">{tarefa.tipo?.replace('_', ' ')}</p>
                          <p className="text-xs text-orange-600">
                            Vence: {format(new Date(tarefa.data_vencimento), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <Badge 
                          variant={tarefa.status === 'pendente' ? 'destructive' : 'secondary'}
                          className="ml-2"
                        >
                          {tarefa.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Analytics Avançado</h3>
              <p className="text-muted-foreground mb-4">
                Relatórios detalhados e análises preditivas em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="previsoes" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Previsões Financeiras</h3>
              <p className="text-muted-foreground mb-4">
                Módulo de previsões e projeções financeiras em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
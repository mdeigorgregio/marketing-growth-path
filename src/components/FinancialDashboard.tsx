import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Users,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

export function FinancialDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: clientes = [], isLoading: loadingClientes } = useProjects();

  // Calcular métricas básicas
  const calcularMetricas = () => {
    const totalClientes = clientes.length;
    const clientesAdimplentes = clientes.filter(c => c.status_pagamento === 'Adimplente').length;
    const clientesInadimplentes = clientes.filter(c => c.status_pagamento === 'Inadimplente').length;
    const clientesPendentes = clientes.filter(c => c.status_pagamento === 'Pendente').length;
    
    const valorTotalMensal = clientes.reduce((sum, c) => sum + (c.valor_plano || 0), 0);
    const valorEmAtraso = clientes
      .filter(c => c.status_pagamento === 'Inadimplente')
      .reduce((sum, c) => sum + (c.valor_em_atraso || c.valor_plano || 0), 0);
    
    const taxaInadimplencia = totalClientes > 0 ? (clientesInadimplentes / totalClientes) * 100 : 0;
    const valorRecuperado = valorEmAtraso * 0.3; // 30% simulado
    
    return {
      totalClientes,
      clientesAdimplentes,
      clientesInadimplentes,
      clientesPendentes,
      valorTotalMensal,
      valorEmAtraso,
      valorRecuperado,
      taxaInadimplencia,
    };
  };

  const metricas = calcularMetricas();

  const handleRefresh = () => {
    setIsRefreshing(true);
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
    a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadingClientes) {
    return <div className="text-center py-8">Carregando dados financeiros...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
        <div className="flex gap-2">
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
              15 dias tempo médio
            </p>
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
            <p className="text-sm text-muted-foreground">
              {metricas.totalClientes > 0 ? ((metricas.clientesAdimplentes / metricas.totalClientes) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Clientes Inadimplentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricas.clientesInadimplentes}</div>
            <p className="text-sm text-muted-foreground">
              R$ {metricas.valorEmAtraso.toLocaleString('pt-BR')} em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600">Clientes Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricas.clientesPendentes}</div>
            <p className="text-sm text-muted-foreground">
              Pagamentos em análise
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resumo de Clientes ({metricas.totalClientes})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {clientes.slice(0, 10).map(cliente => (
              <div key={cliente.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{cliente.empresa}</h4>
                  <p className="text-sm text-muted-foreground">{cliente.responsavel}</p>
                  <Badge 
                    variant={cliente.status_pagamento === 'Adimplente' ? 'default' : 
                            cliente.status_pagamento === 'Inadimplente' ? 'destructive' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {cliente.status_pagamento}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    R$ {(cliente.valor_plano || 0).toLocaleString('pt-BR')}
                  </p>
                  {cliente.status_pagamento === 'Inadimplente' && (
                    <p className="text-xs text-red-600">
                      {cliente.dias_atraso || 0} dias atraso
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {clientes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente cadastrado ainda
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
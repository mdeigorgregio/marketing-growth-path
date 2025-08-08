import { useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, Target, AlertTriangle, Calendar } from 'lucide-react';
import {
  calculateKPIs,
  calculateStateDistribution,
  calculateOriginPerformance,
  calculateGrowthTimeline
} from '@/utils/calculations/chartCalculations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Analytics = () => {
  const { data: projects, isLoading } = useProjects();

  const analyticsData = useMemo(() => {
    if (!projects) return null;

    return {
      kpis: calculateKPIs(projects),
      stateDistribution: calculateStateDistribution(projects),
      originPerformance: calculateOriginPerformance(projects),
      growthTimeline: calculateGrowthTimeline(projects)
    };
  }, [projects]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-card">
                <CardHeader>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { kpis, stateDistribution, originPerformance, growthTimeline } = analyticsData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Análise detalhada de performance e métricas do CRM
          </p>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total Estimada</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(kpis.totalRevenue)}
              </div>
              <CardDescription>
                Soma de todos os planos ativos
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(kpis.averageTicket)}
              </div>
              <CardDescription>
                Valor médio por cliente ativo
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(kpis.conversionRate)}
              </div>
              <CardDescription>
                Leads que viraram assinantes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatPercentage(kpis.churnRate)}
              </div>
              <CardDescription>
                Assinantes que cancelaram
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                kpis.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpis.monthlyGrowth >= 0 ? '+' : ''}{formatPercentage(kpis.monthlyGrowth)}
              </div>
              <CardDescription>
                Variação do último mês
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects?.length || 0}
              </div>
              <CardDescription>
                Todos os registros no sistema
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Timeline */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Crescimento nos Últimos 6 Meses</CardTitle>
              <CardDescription>
                Evolução do número total de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthTimeline}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        value,
                        name === 'totalClients' ? 'Total de Clientes' : 'Novos Clientes'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalClients" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      name="totalClients"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="newClients" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                      name="newClients"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* State Distribution */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Top 10 Estados</CardTitle>
              <CardDescription>
                Distribuição de clientes por estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="state" 
                      className="text-xs" 
                      tick={{ fontSize: 12 }}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value) => [value, 'Clientes']}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#06b6d4" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Origin Performance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Performance por Origem</CardTitle>
            <CardDescription>
              Análise de leads vs conversões por origem de tráfego
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={originPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="origin" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'conversionRate') {
                        return [`${value.toFixed(1)}%`, 'Taxa de Conversão'];
                      }
                      return [value, name === 'leads' ? 'Leads' : 'Conversões'];
                    }}
                  />
                  <Bar dataKey="leads" fill="#f59e0b" name="leads" />
                  <Bar dataKey="conversions" fill="#10b981" name="conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
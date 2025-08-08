import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useUserRole } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Phone, 
  Mail, 
  Calendar,
  MoreVertical,
  User,
  Settings,
  LogOut,
  BookOpen,
  FileText,
  Kanban,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import type { ProjectStatus } from '@/hooks/useProjects';
import { AdminPanel } from '@/components/AdminPanel';
import { ServicesSection } from '@/components/ServicesSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesFunnelChart from '@/components/charts/SalesFunnelChart';
import RevenuePieChart from '@/components/charts/RevenuePieChart';
import TrafficSourceChart from '@/components/charts/TrafficSourceChart';
import GrowthTimelineChart from '@/components/charts/GrowthTimelineChart';
import ExportData from '@/components/exports/ExportData';
import {
  calculateSalesFunnelData,
  calculateRevenueByPlan,
  calculateTrafficSourceData,
  calculateGrowthTimeline
} from '@/utils/calculations/chartCalculations';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const { data: userRole } = useUserRole();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  
  const isAdmin = userRole?.role === 'ADMINISTRADOR';

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Logout realizado',
        description: 'Voce foi desconectado com sucesso.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro no logout',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'LEAD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Assinante':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inadimplente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProjectStats = () => {
    if (!projects) return { total: 0, leads: 0, assinantes: 0, inadimplentes: 0 };
    
    return {
      total: projects.length,
      leads: projects.filter(p => p.status === 'LEAD').length,
      assinantes: projects.filter(p => p.status === 'Assinante').length,
      inadimplentes: projects.filter(p => p.status === 'Inadimplente').length,
    };
  };

  // Dados para os graficos
  const chartData = useMemo(() => {
    if (!projects) return {
      salesFunnel: [],
      revenue: { data: [], total: 0 },
      trafficSource: { data: [], total: 0 },
      growth: []
    };

    return {
      salesFunnel: calculateSalesFunnelData(projects),
      revenue: calculateRevenueByPlan(projects),
      trafficSource: calculateTrafficSourceData(projects),
      growth: calculateGrowthTimeline(projects)
    };
  }, [projects]);

  const stats = getProjectStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Sistema MDE</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/dashboard/projects/new')} className="shadow-elegant">
              <Plus className="h-4 w-4 mr-2" />
              Novo Negocio
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuracoes</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-5'}`}>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="admin">Gerenciar Usuarios</TabsTrigger>
                <TabsTrigger value="settings">Configuracoes</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="projects" className="space-y-8">
            {/* Charts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SalesFunnelChart 
                data={chartData.salesFunnel} 
                isLoading={isLoading}
              />
              
              <RevenuePieChart 
                data={chartData.revenue.data}
                total={chartData.revenue.total}
                isLoading={isLoading}
              />
              
              <TrafficSourceChart 
                data={chartData.trafficSource.data}
                total={chartData.trafficSource.total}
                isLoading={isLoading}
              />
              
              <GrowthTimelineChart 
                data={chartData.growth}
                isLoading={isLoading}
              />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa ou responsavel..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar por Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('LEAD')}>
                      LEAD
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('Assinante')}>
                      Assinante
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('Inadimplente')}>
                      Inadimplente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('Cancelado')}>
                      Cancelado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <ExportData />
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects?.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Comece criando seu primeiro projeto.'}
                  </p>
                  <Button onClick={() => navigate('/dashboard/projects/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                </div>
              ) : (
                filteredProjects?.map((project) => (
                  <Card 
                    key={project.id} 
                    className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.empresa}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <User className="h-4 w-4 mr-1" />
                            {project.responsavel}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/projects/${project.id}/edit`);
                              }}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/projects/${project.id}/notes`);
                              }}>
                                Ver Notas
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/projects/${project.id}/appointments`);
                              }}>
                                Ver Agendamentos
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {project.telefone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 mr-2" />
                            {project.telefone}
                          </div>
                        )}
                        {project.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            {project.email}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {project.plano_escolhido && (
                          <div className="mt-2">
                            <Badge variant="outline">
                              {project.plano_escolhido}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Avancado
                </CardTitle>
                <CardDescription>
                  Analise detalhada de performance, KPIs e metricas de crescimento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Acesse a pagina de Analytics para visualizar relatorios detalhados e insights avancados.
                  </p>
                  <Button onClick={() => navigate('/dashboard/analytics')} className="shadow-elegant">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ir para Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pipeline" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Kanban className="h-5 w-5" />
                  Pipeline de Vendas
                </CardTitle>
                <CardDescription>
                  Visualizacao em Kanban do funil de vendas com drag & drop.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Gerencie seu pipeline de vendas com uma interface visual intuitiva.
                  </p>
                  <Button onClick={() => navigate('/dashboard/pipeline')} className="shadow-elegant">
                    <Kanban className="h-4 w-4 mr-2" />
                    Ir para Pipeline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Todas as Notas</h2>
                <p className="text-muted-foreground">
                  Visualize e gerencie todas as suas notas em um so lugar
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard/notes')} className="shadow-elegant">
                <FileText className="h-4 w-4 mr-2" />
                Ver Todas as Notas
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    Distribuidas em {stats.total} projetos
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notas Recentes</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Criadas nos ultimos 7 dias
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos com Notas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    De {stats.total} projetos totais
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Notas Recentes</CardTitle>
                <CardDescription>
                  Suas ultimas anotacoes em todos os projetos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Reuniao inicial com cliente</h4>
                      <p className="text-sm text-muted-foreground">Tech Solutions - Ha 2 dias</p>
                      <p className="text-sm mt-1">Discussao sobre requisitos do projeto e cronograma inicial...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Analise de concorrencia</h4>
                      <p className="text-sm text-muted-foreground">Joao Silva - Ha 3 dias</p>
                      <p className="text-sm mt-1">Pesquisa detalhada sobre concorrentes diretos e indiretos...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Feedback do prototipo</h4>
                      <p className="text-sm text-muted-foreground">Tech Solutions - Ha 4 dias</p>
                      <p className="text-sm mt-1">Cliente aprovou o design geral, mas solicitou ajustes...</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={() => navigate('/dashboard/notes')}>
                    Ver Todas as Notas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services">
            <ServicesSection />
          </TabsContent>
          
          {isAdmin && (
            <>
              <TabsContent value="admin">
                <AdminPanel />
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuracoes do Sistema</CardTitle>
                    <CardDescription>
                      Configuracoes gerais do sistema disponiveis apenas para administradores.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Funcionalidades de configuracao serao implementadas em breve.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
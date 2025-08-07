import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
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
  BookOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import type { ProjectStatus } from '@/hooks/useProjects';
import { useUserRole } from '@/hooks/useAuth';
import { AdminPanel } from '@/components/AdminPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const navigate = useNavigate();
  const { data: userRole } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

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
        description: 'Você foi desconectado com sucesso.',
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
              Novo Negócio
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
                  <span>Configurações</span>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            {userRole?.role === 'admin' && (
              <TabsTrigger value="admin">Administração</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="projects" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads</CardTitle>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {stats.leads}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.leads}</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assinantes</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {stats.assinantes}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.assinantes}</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inadimplentes</CardTitle>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {stats.inadimplentes}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.inadimplentes}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa ou responsável..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
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
          
          {userRole?.role === 'admin' && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
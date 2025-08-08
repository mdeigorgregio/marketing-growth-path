import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, Users, TrendingUp } from 'lucide-react';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import type { Project } from '@/hooks/useProjects';

const Pipeline = () => {
  const { data: projects, isLoading } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  // Filtrar projetos
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(project => {
      const matchesSearch = 
        project.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesOrigin = originFilter === 'all' || project.origem === originFilter;
      
      const matchesUser = userFilter === 'all' || project.user_id === userFilter;
      
      return matchesSearch && matchesOrigin && matchesUser;
    });
  }, [projects, searchTerm, originFilter, userFilter]);

  // Estatísticas do pipeline
  const pipelineStats = useMemo(() => {
    if (!filteredProjects) return {
      total: 0,
      leads: 0,
      negociacao: 0,
      proposta: 0,
      assinantes: 0,
      conversaoRate: 0
    };

    const total = filteredProjects.length;
    const leads = filteredProjects.filter(p => p.status === 'Lead').length;
    const negociacao = filteredProjects.filter(p => p.status === 'Em Negociação').length;
    const proposta = filteredProjects.filter(p => p.status === 'Proposta Enviada').length;
    const assinantes = filteredProjects.filter(p => p.status === 'Assinante').length;
    const conversaoRate = leads > 0 ? (assinantes / leads) * 100 : 0;

    return {
      total,
      leads,
      negociacao,
      proposta,
      assinantes,
      conversaoRate
    };
  }, [filteredProjects]);

  // Extrair valores únicos para filtros
  const uniqueOrigins = useMemo(() => {
    if (!projects) return [];
    return [...new Set(projects.map(p => p.origem).filter(Boolean))];
  }, [projects]);

  const uniqueUsers = useMemo(() => {
    if (!projects) return [];
    return [...new Set(projects.map(p => p.user_id).filter(Boolean))];
  }, [projects]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">
            Gerencie seus leads e oportunidades com visão Kanban
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total no Pipeline</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelineStats.total}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
              <div className="h-3 w-3 bg-yellow-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pipelineStats.leads}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Negociação</CardTitle>
              <div className="h-3 w-3 bg-blue-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{pipelineStats.negociacao}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proposta Enviada</CardTitle>
              <div className="h-3 w-3 bg-purple-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{pipelineStats.proposta}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {pipelineStats.conversaoRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa ou responsável..."
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
                  Origem
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setOriginFilter('all')}>
                  Todas as Origens
                </DropdownMenuItem>
                {uniqueOrigins.map(origin => (
                  <DropdownMenuItem 
                    key={origin} 
                    onClick={() => setOriginFilter(origin)}
                  >
                    {origin}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Usuário
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setUserFilter('all')}>
                  Todos os Usuários
                </DropdownMenuItem>
                {uniqueUsers.map(userId => (
                  <DropdownMenuItem 
                    key={userId} 
                    onClick={() => setUserFilter(userId)}
                  >
                    {userId}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard projects={filteredProjects} />
      </div>
    </div>
  );
};

export default Pipeline;
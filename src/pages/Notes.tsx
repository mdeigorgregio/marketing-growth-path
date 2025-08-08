import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Calendar, ExternalLink, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  project_id: string;
  project?: {
    id: string;
    nome_empresa?: string;
    nome_pessoa?: string;
  };
}

const Notes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  
  const { data: projects, isLoading: projectsLoading } = useProjects();

  // Mock data - em um cenário real, você teria um hook useAllNotes
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Reunião inicial com cliente',
      content: 'Discussão sobre requisitos do projeto e cronograma inicial. Cliente demonstrou interesse em funcionalidades avançadas.',
      tags: ['reunião', 'requisitos'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      project_id: 'proj1',
      project: { id: 'proj1', nome_empresa: 'Tech Solutions' }
    },
    {
      id: '2',
      title: 'Análise de concorrência',
      content: 'Pesquisa detalhada sobre concorrentes diretos e indiretos. Identificadas oportunidades de diferenciação.',
      tags: ['pesquisa', 'concorrência'],
      created_at: '2024-01-14T14:30:00Z',
      updated_at: '2024-01-14T14:30:00Z',
      project_id: 'proj2',
      project: { id: 'proj2', nome_pessoa: 'João Silva' }
    },
    {
      id: '3',
      title: 'Feedback do protótipo',
      content: 'Cliente aprovou o design geral, mas solicitou ajustes na navegação e cores da interface.',
      tags: ['feedback', 'design'],
      created_at: '2024-01-13T16:45:00Z',
      updated_at: '2024-01-13T16:45:00Z',
      project_id: 'proj1',
      project: { id: 'proj1', nome_empresa: 'Tech Solutions' }
    }
  ];

  const filteredNotes = mockNotes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (note.project?.nome_empresa && note.project.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (note.project?.nome_pessoa && note.project.nome_pessoa.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProject = selectedProject === 'all' || note.project_id === selectedProject;
    
    return matchesSearch && matchesProject;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getProjectName = (note: Note) => {
    return note.project?.nome_empresa || note.project?.nome_pessoa || 'Projeto sem nome';
  };

  if (projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-blue-600" />
              Todas as Notas
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize e gerencie todas as suas notas em um só lugar
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar notas, projetos ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.nome_empresa || project.nome_pessoa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigas</SelectItem>
              <SelectItem value="title">Título (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Notas</p>
                  <p className="text-2xl font-bold text-gray-900">{mockNotes.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projetos com Notas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(mockNotes.map(note => note.project_id)).size}
                  </p>
                </div>
                <Filter className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Notas Filtradas</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredNotes.length}</p>
                </div>
                <Search className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/projects/${note.project_id}/notes`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {note.title}
                    </CardTitle>
                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{getProjectName(note)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {note.content || 'Sem conteúdo'}
                  </p>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(note.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/projects/${note.project_id}/notes`);
                      }}
                    >
                      Ver projeto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || selectedProject !== 'all' 
                  ? 'Nenhuma nota encontrada' 
                  : 'Nenhuma nota criada'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedProject !== 'all'
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Comece criando notas em seus projetos.'}
              </p>
              {!searchTerm && selectedProject === 'all' && (
                <Button onClick={() => navigate('/dashboard')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ir para Projetos
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notes;
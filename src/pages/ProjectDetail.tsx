import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject, type CreateProjectData, type ProjectStatus, type ProjectOrigin } from '@/hooks/useProjects';
import { useNotes } from '@/hooks/useNotes';
import { useAppointments } from '@/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Building2,
  User,
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id!);
  const { data: notes } = useNotes(id);
  const { data: appointments } = useAppointments(id);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(id!);
      toast({
        title: 'Projeto excluído',
        description: 'O projeto foi excluído com sucesso.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir projeto',
        description: error.message || 'Tente novamente.',
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Projeto não encontrado</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.empresa}</h1>
              <p className="text-muted-foreground flex items-center mt-1">
                <User className="h-4 w-4 mr-1" />
                {project.responsavel}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/dashboard/projects/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                    Confirmar exclusão
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o projeto "{project.empresa}"? 
                    Esta ação não pode ser desfeita e irá excluir também todas as notas e agendamentos relacionados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.telefone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{project.telefone}</span>
                  </div>
                )}
                {project.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${project.email}`} className="text-primary hover:underline">
                      {project.email}
                    </a>
                  </div>
                )}
                {project.site && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={project.site} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {project.site}
                    </a>
                  </div>
                )}
                
                {(project.rua || project.cidade || project.estado) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Endereço
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {project.rua && <div>{project.rua}, {project.numero}</div>}
                        {project.bairro && <div>{project.bairro}</div>}
                        {project.cidade && project.estado && (
                          <div>{project.cidade} - {project.estado}</div>
                        )}
                        {project.cep && <div>CEP: {project.cep}</div>}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informações Comerciais */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Informações Comerciais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Status</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  {project.origem && (
                    <div>
                      <h4 className="font-semibold mb-2">Origem</h4>
                      <Badge variant="outline">{project.origem}</Badge>
                    </div>
                  )}
                </div>
                
                {project.plano_escolhido && (
                  <div>
                    <h4 className="font-semibold mb-2">Plano Escolhido</h4>
                    <p className="text-muted-foreground">{project.plano_escolhido}</p>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p>Criado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}</p>
                  <p>Atualizado em: {new Date(project.updated_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notas */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Notas
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/dashboard/projects/${id}/notes`)}
                  >
                    Ver todas
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notes && notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.slice(0, 3).map((note) => (
                      <div key={note.id} className="p-3 border rounded-lg">
                        <h5 className="font-semibold text-sm">{note.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                    {notes.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{notes.length - 3} notas adicionais
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma nota encontrada
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Agendamentos */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Agendamentos
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/dashboard/projects/${id}/appointments`)}
                  >
                    Ver todos
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="p-3 border rounded-lg">
                        <h5 className="font-semibold text-sm">{appointment.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(appointment.start_time).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    ))}
                    {appointments.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{appointments.length - 3} agendamentos adicionais
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum agendamento encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
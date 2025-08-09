import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: project, isLoading } = useProject(id!);
  const updateProject = useUpdateProject();

  const [formData, setFormData] = useState({
    empresa: '',
    responsavel: '',
    telefone: '',
    email: '',
    site: '',
    status: 'LEAD' as 'LEAD' | 'Assinante' | 'Inadimplente' | 'Cancelado',
    plano_escolhido: '',
    origem: 'Orgânico' as 'Tráfego Pago' | 'LA Educação' | 'Orgânico' | 'Indicação',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        empresa: project.empresa || '',
        responsavel: project.responsavel || '',
        telefone: project.telefone || '',
        email: project.email || '',
        site: project.site || '',
        status: project.status || 'LEAD',
        plano_escolhido: project.plano_escolhido || '',
        origem: project.origem || 'Orgânico',
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.empresa.trim() || !formData.responsavel.trim()) {
      toast({
        title: "Erro",
        description: "Nome da empresa e responsável são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: id!,
        updates: {
          empresa: formData.empresa,
          responsavel: formData.responsavel,
          telefone: formData.telefone,
          email: formData.email,
          site: formData.site,
          status: formData.status,
          plano_escolhido: formData.plano_escolhido,
          origem: formData.origem,
        },
      });
      
      toast({
        title: "Sucesso",
        description: "Projeto atualizado com sucesso",
      });
      
      navigate(`/dashboard/projects/${id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar projeto",
        variant: "destructive",
      });
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
          <h2 className="text-2xl font-bold mb-4">Projeto não encontrado</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/dashboard/projects/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Projeto</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Empresa *</label>
                  <Input
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    placeholder="Digite o nome da empresa"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsável *</label>
                  <Input
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Digite o nome do responsável"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="Digite o telefone"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Digite o email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Site</label>
                  <Input
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="Digite o site"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value: 'LEAD' | 'Assinante' | 'Inadimplente' | 'Cancelado') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="Assinante">Assinante</SelectItem>
                      <SelectItem value="Inadimplente">Inadimplente</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Plano Escolhido</label>
                  <Input
                    value={formData.plano_escolhido}
                    onChange={(e) => setFormData({ ...formData, plano_escolhido: e.target.value })}
                    placeholder="Digite o plano escolhido"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Origem</label>
                  <Select value={formData.origem} onValueChange={(value: 'Tráfego Pago' | 'LA Educação' | 'Orgânico' | 'Indicação') => setFormData({ ...formData, origem: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tráfego Pago">Tráfego Pago</SelectItem>
                      <SelectItem value="LA Educação">LA Educação</SelectItem>
                      <SelectItem value="Orgânico">Orgânico</SelectItem>
                      <SelectItem value="Indicação">Indicação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>



              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/dashboard/projects/${id}`)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProject.isPending}
                  className="flex-1 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateProject.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProject;
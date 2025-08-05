import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject, type CreateProjectData, type ProjectStatus, type ProjectOrigin } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateProjectData>({
    empresa: '',
    responsavel: '',
    telefone: '',
    email: '',
    site: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    status: 'LEAD',
    plano_escolhido: '',
    servicos_avulsos: [],
    origem: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.empresa || !formData.responsavel) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome da empresa e responsável são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await createProject.mutateAsync(formData);
      toast({
        title: 'Projeto criado!',
        description: 'O projeto foi criado com sucesso.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar projeto',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Projeto</h1>
            <p className="text-muted-foreground">Cadastre as informações do novo cliente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="dados-basicos" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dados-basicos">Dados Básicos</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="comercial">Comercial</TabsTrigger>
              </TabsList>

              <TabsContent value="dados-basicos" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Informações da Empresa</CardTitle>
                    <CardDescription>Dados principais do cliente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresa">Nome da Empresa *</Label>
                        <Input
                          id="empresa"
                          value={formData.empresa}
                          onChange={(e) => updateFormData('empresa', e.target.value)}
                          placeholder="Ex: Escola ABC"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responsavel">Responsável *</Label>
                        <Input
                          id="responsavel"
                          value={formData.responsavel}
                          onChange={(e) => updateFormData('responsavel', e.target.value)}
                          placeholder="Ex: João Silva"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => updateFormData('telefone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          placeholder="contato@empresa.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="site">Site</Label>
                      <Input
                        id="site"
                        value={formData.site}
                        onChange={(e) => updateFormData('site', e.target.value)}
                        placeholder="https://www.empresa.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="endereco" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                    <CardDescription>Localização da empresa</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="rua">Rua</Label>
                        <Input
                          id="rua"
                          value={formData.rua}
                          onChange={(e) => updateFormData('rua', e.target.value)}
                          placeholder="Rua das Flores"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => updateFormData('numero', e.target.value)}
                          placeholder="123"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          value={formData.bairro}
                          onChange={(e) => updateFormData('bairro', e.target.value)}
                          placeholder="Centro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          value={formData.cidade}
                          onChange={(e) => updateFormData('cidade', e.target.value)}
                          placeholder="São Paulo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          value={formData.estado}
                          onChange={(e) => updateFormData('estado', e.target.value)}
                          placeholder="SP"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => updateFormData('cep', e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comercial" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Informações Comerciais</CardTitle>
                    <CardDescription>Status e detalhes comerciais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value: ProjectStatus) => updateFormData('status', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEAD">LEAD</SelectItem>
                            <SelectItem value="Assinante">Assinante</SelectItem>
                            <SelectItem value="Inadimplente">Inadimplente</SelectItem>
                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="origem">Origem</Label>
                        <Select value={formData.origem} onValueChange={(value: ProjectOrigin) => updateFormData('origem', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="plano_escolhido">Plano Escolhido</Label>
                      <Input
                        id="plano_escolhido"
                        value={formData.plano_escolhido}
                        onChange={(e) => updateFormData('plano_escolhido', e.target.value)}
                        placeholder="Ex: Plano Premium"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Projeto'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
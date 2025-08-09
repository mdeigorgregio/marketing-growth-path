import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Mail, 
  Send, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Users,
  Calendar,
  BarChart3,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EmailTemplate {
  id: string;
  nome: string;
  assunto: string;
  conteudo_html: string;
  conteudo_texto: string;
  tipo: 'cobranca' | 'marketing' | 'transacional' | 'follow_up';
  ativo: boolean;
  variaveis: string[];
  created_at: string;
  updated_at: string;
}

interface EmailHistory {
  id: string;
  template_id: string;
  cliente_id: string;
  assunto: string;
  conteudo: string;
  status: 'enviado' | 'erro' | 'pendente';
  erro_mensagem?: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  cliente?: {
    nome_empresa: string;
    responsavel: string;
    email: string;
  };
  template?: {
    nome: string;
  };
}

const tiposTemplate = [
  { value: 'cobranca', label: 'Cobrança', color: 'bg-red-500', icon: '💰' },
  { value: 'marketing', label: 'Marketing', color: 'bg-blue-500', icon: '📢' },
  { value: 'transacional', label: 'Transacional', color: 'bg-green-500', icon: '📋' },
  { value: 'follow_up', label: 'Follow-up', color: 'bg-yellow-500', icon: '🔄' },
];

const variaveisDisponiveis = [
  '{{nome_empresa}}',
  '{{responsavel}}',
  '{{email}}',
  '{{telefone}}',
  '{{plano_escolhido}}',
  '{{valor_plano}}',
  '{{data_vencimento}}',
  '{{dias_atraso}}',
  '{{valor_em_atraso}}',
  '{{status}}',
  '{{origem}}',
  '{{data_contrato}}',
  '{{observacoes}}',
];

const templatesPreConfigurados = [
  {
    nome: 'Lembrete de Vencimento',
    assunto: 'Lembrete: Seu pagamento vence em breve - {{nome_empresa}}',
    tipo: 'cobranca',
    conteudo_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Olá, {{responsavel}}!</h2>
        
        <p>Esperamos que esteja tudo bem com a <strong>{{nome_empresa}}</strong>.</p>
        
        <p>Este é um lembrete amigável de que o pagamento do seu plano <strong>{{plano_escolhido}}</strong> vence em breve.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #495057;">Detalhes do Pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor:</strong> R$ {{valor_plano}}</p>
          <p style="margin: 5px 0;"><strong>Vencimento:</strong> {{data_vencimento}}</p>
        </div>
        
        <p>Para manter seu serviço ativo, não esqueça de realizar o pagamento até a data de vencimento.</p>
        
        <p>Se você já realizou o pagamento, pode desconsiderar este e-mail.</p>
        
        <p>Qualquer dúvida, estamos à disposição!</p>
        
        <p>Atenciosamente,<br>Equipe de Atendimento</p>
      </div>
    `,
    conteudo_texto: `Olá, {{responsavel}}!\n\nEste é um lembrete de que o pagamento do seu plano {{plano_escolhido}} vence em breve.\n\nValor: R$ {{valor_plano}}\nVencimento: {{data_vencimento}}\n\nPara manter seu serviço ativo, não esqueça de realizar o pagamento.\n\nAtenciosamente,\nEquipe de Atendimento`
  },
  {
    nome: 'Cobrança Amigável',
    assunto: 'Pagamento em atraso - {{nome_empresa}}',
    tipo: 'cobranca',
    conteudo_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Pagamento em Atraso</h2>
        
        <p>Olá, {{responsavel}}!</p>
        
        <p>Identificamos que o pagamento do plano <strong>{{plano_escolhido}}</strong> da <strong>{{nome_empresa}}</strong> está em atraso.</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #856404;">Informações do Pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor:</strong> R$ {{valor_plano}}</p>
          <p style="margin: 5px 0;"><strong>Vencimento:</strong> {{data_vencimento}}</p>
          <p style="margin: 5px 0;"><strong>Dias em atraso:</strong> {{dias_atraso}}</p>
        </div>
        
        <p>Para regularizar sua situação e evitar a suspensão do serviço, entre em contato conosco o quanto antes.</p>
        
        <p>Estamos aqui para ajudar e encontrar a melhor solução para você!</p>
        
        <p>Atenciosamente,<br>Equipe Financeira</p>
      </div>
    `,
    conteudo_texto: `Pagamento em Atraso\n\nOlá, {{responsavel}}!\n\nO pagamento do plano {{plano_escolhido}} está em atraso há {{dias_atraso}} dias.\n\nValor: R$ {{valor_plano}}\nVencimento: {{data_vencimento}}\n\nEntre em contato para regularizar.\n\nEquipe Financeira`
  },
  {
    nome: 'Welcome Email',
    assunto: 'Bem-vindo(a) à nossa empresa! - {{nome_empresa}}',
    tipo: 'marketing',
    conteudo_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745; text-align: center;">Bem-vindo(a)!</h1>
        
        <p>Olá, {{responsavel}}!</p>
        
        <p>É com grande satisfação que damos as boas-vindas à <strong>{{nome_empresa}}</strong> em nossa família de clientes!</p>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #155724;">Próximos Passos:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Nossa equipe entrará em contato em breve</li>
            <li>Prepare suas dúvidas e objetivos</li>
            <li>Acompanhe nossos canais de comunicação</li>
          </ul>
        </div>
        
        <p>Estamos ansiosos para trabalhar juntos e ajudar sua empresa a crescer!</p>
        
        <p>Qualquer dúvida, não hesite em nos contatar.</p>
        
        <p>Mais uma vez, seja bem-vindo(a)!</p>
        
        <p>Atenciosamente,<br>Equipe Comercial</p>
      </div>
    `,
    conteudo_texto: `Bem-vindo(a)!\n\nOlá, {{responsavel}}!\n\nDamos as boas-vindas à {{nome_empresa}} em nossa família de clientes!\n\nNossa equipe entrará em contato em breve.\n\nSeja bem-vindo(a)!\n\nEquipe Comercial`
  },
  {
    nome: 'Follow-up Pós Reunião',
    assunto: 'Obrigado pela reunião - {{nome_empresa}}',
    tipo: 'follow_up',
    conteudo_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Obrigado pela reunião!</h2>
        
        <p>Olá, {{responsavel}}!</p>
        
        <p>Foi um prazer conversar com você sobre as necessidades da <strong>{{nome_empresa}}</strong>.</p>
        
        <p>Conforme conversamos, vou preparar uma proposta personalizada que atenda aos seus objetivos.</p>
        
        <div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1565c0;">Próximos Passos:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Análise detalhada das suas necessidades</li>
            <li>Preparação da proposta comercial</li>
            <li>Agendamento de nova reunião para apresentação</li>
          </ul>
        </div>
        
        <p>Caso tenha alguma dúvida ou informação adicional, fique à vontade para entrar em contato.</p>
        
        <p>Aguardo nosso próximo encontro!</p>
        
        <p>Atenciosamente,<br>Equipe Comercial</p>
      </div>
    `,
    conteudo_texto: `Obrigado pela reunião!\n\nOlá, {{responsavel}}!\n\nFoi um prazer conversar sobre as necessidades da {{nome_empresa}}.\n\nVou preparar uma proposta personalizada.\n\nAguardo nosso próximo encontro!\n\nEquipe Comercial`
  },
];

export function EmailMarketingSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    assunto: '',
    conteudo_html: '',
    conteudo_texto: '',
    tipo: 'marketing' as const,
    ativo: true,
    variaveis: [] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  // Buscar histórico de emails
  const { data: emailHistory = [] } = useQuery({
    queryKey: ['email-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_history')
        .select(`
          *,
          cliente:clientes(nome_empresa, responsavel, email),
          template:email_templates(nome)
        `)
        .order('sent_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as EmailHistory[];
    },
  });

  // Buscar clientes para envio
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-email'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_empresa, responsavel, email')
        .not('email', 'is', null)
        .order('nome_empresa');
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation para criar/atualizar template
  const templateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing && selectedTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(data)
          .eq('id', selectedTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: `Template ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar template:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar template. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar template
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsDialogOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Template excluído com sucesso!',
      });
    },
  });

  // Mutation para enviar email
  const sendEmailMutation = useMutation({
    mutationFn: async ({ templateId, clienteIds }: { templateId: string; clienteIds: string[] }) => {
      // Simular envio de email (aqui você integraria com um serviço real)
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template não encontrado');

      for (const clienteId of clienteIds) {
        const { error } = await supabase
          .from('email_history')
          .insert({
            template_id: templateId,
            cliente_id: clienteId,
            assunto: template.assunto,
            conteudo: template.conteudo_html,
            status: 'enviado',
            sent_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-history'] });
      toast({
        title: 'Sucesso',
        description: 'Emails enviados com sucesso!',
      });
    },
    onError: (error) => {
      console.error('Erro ao enviar emails:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar emails. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      assunto: '',
      conteudo_html: '',
      conteudo_texto: '',
      tipo: 'marketing',
      ativo: true,
      variaveis: [],
    });
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setFormData({
      nome: template.nome,
      assunto: template.assunto,
      conteudo_html: template.conteudo_html,
      conteudo_texto: template.conteudo_texto,
      tipo: template.tipo,
      ativo: template.ativo,
      variaveis: template.variaveis || [],
    });
    setSelectedTemplate(template);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const createFromPreset = (preset: any) => {
    setFormData({
      nome: preset.nome,
      assunto: preset.assunto,
      conteudo_html: preset.conteudo_html,
      conteudo_texto: preset.conteudo_texto,
      tipo: preset.tipo,
      ativo: true,
      variaveis: variaveisDisponiveis.filter(v => 
        preset.conteudo_html.includes(v) || preset.assunto.includes(v)
      ),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    templateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (selectedTemplate) {
      deleteTemplateMutation.mutate(selectedTemplate.id);
    }
  };

  const handlePreview = (content: string) => {
    // Substituir variáveis por valores de exemplo
    let previewHtml = content;
    const exemploVariaveis: { [key: string]: string } = {
      '{{nome_empresa}}': 'Empresa Exemplo Ltda',
      '{{responsavel}}': 'João Silva',
      '{{email}}': 'joao@exemplo.com',
      '{{telefone}}': '(11) 99999-9999',
      '{{plano_escolhido}}': 'Plano Premium',
      '{{valor_plano}}': '299,90',
      '{{data_vencimento}}': '15/02/2024',
      '{{dias_atraso}}': '3',
      '{{valor_em_atraso}}': '299,90',
      '{{status}}': 'Lead',
      '{{origem}}': 'Tráfego Pago',
      '{{data_contrato}}': '15/01/2024',
      '{{observacoes}}': 'Cliente interessado em expansão',
    };

    Object.entries(exemploVariaveis).forEach(([variavel, valor]) => {
      previewHtml = previewHtml.replace(new RegExp(variavel, 'g'), valor);
    });

    setPreviewContent(previewHtml);
    setShowPreview(true);
  };

  const insertVariable = (variavel: string) => {
    const textarea = document.getElementById('conteudo_html') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + variavel + text.substring(end);
      setFormData(prev => ({ ...prev, conteudo_html: newText }));
      
      // Atualizar lista de variáveis
      if (!formData.variaveis.includes(variavel)) {
        setFormData(prev => ({ ...prev, variaveis: [...prev.variaveis, variavel] }));
      }
    }
  };

  // Filtrar templates
  const templatesFiltrados = templates.filter(template => {
    const matchTipo = filtroTipo === 'todos' || template.tipo === filtroTipo;
    const matchSearch = template.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       template.assunto.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTipo && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
      'enviado': 'default',
      'erro': 'destructive',
      'pendente': 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTipoConfig = (tipo: string) => {
    return tiposTemplate.find(t => t.value === tipo) || tiposTemplate[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Marketing</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="presets">Templates Prontos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tiposTemplate.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    <span className="flex items-center gap-2">
                      <span>{tipo.icon}</span>
                      {tipo.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Templates */}
          <div className="grid gap-4">
            {templatesFiltrados.map(template => {
              const tipoConfig = getTipoConfig(template.tipo);
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tipoConfig.icon}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{template.nome}</h3>
                            <p className="text-sm text-gray-600">{template.assunto}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <Badge className={tipoConfig.color}>{tipoConfig.label}</Badge>
                          <Badge variant={template.ativo ? 'default' : 'secondary'}>
                            {template.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <span>{template.variaveis?.length || 0} variáveis</span>
                          <span>Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(template.conteudo_html)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {templatesFiltrados.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
                  <p className="text-gray-500 mb-4">Crie seu primeiro template de email ou ajuste os filtros.</p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {emailHistory.map(email => (
              <Card key={email.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{email.assunto}</h4>
                        {getStatusBadge(email.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Para: {email.cliente?.nome_empresa} ({email.cliente?.responsavel})
                      </p>
                      <p className="text-sm text-gray-600">
                        Template: {email.template?.nome || 'Template removido'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Enviado em {new Date(email.sent_at).toLocaleString('pt-BR')}</span>
                        {email.opened_at && (
                          <span>Aberto em {new Date(email.opened_at).toLocaleString('pt-BR')}</span>
                        )}
                        {email.clicked_at && (
                          <span>Clicado em {new Date(email.clicked_at).toLocaleString('pt-BR')}</span>
                        )}
                      </div>
                      {email.erro_mensagem && (
                        <p className="text-sm text-red-600">{email.erro_mensagem}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {emailHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum email enviado ainda.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesPreConfigurados.map((preset, index) => {
              const tipoConfig = getTipoConfig(preset.tipo);
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => createFromPreset(preset)}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tipoConfig.icon}</span>
                        <h3 className="font-semibold">{preset.nome}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{preset.assunto}</p>
                      <Badge className={tipoConfig.color}>{tipoConfig.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total de Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{templates.length}</div>
                <p className="text-sm text-gray-600">
                  {templates.filter(t => t.ativo).length} ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emails Enviados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{emailHistory.length}</div>
                <p className="text-sm text-gray-600">total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {emailHistory.length > 0 
                    ? Math.round((emailHistory.filter(e => e.status === 'enviado').length / emailHistory.length) * 100)
                    : 0
                  }%
                </div>
                <p className="text-sm text-gray-600">dos emails</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Abertura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {emailHistory.length > 0 
                    ? Math.round((emailHistory.filter(e => e.opened_at).length / emailHistory.length) * 100)
                    : 0
                  }%
                </div>
                <p className="text-sm text-gray-600">dos emails</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Email</DialogTitle>
            <DialogDescription>
              Visualização com dados de exemplo
            </DialogDescription>
          </DialogHeader>
          <div 
            className="border rounded p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para criar/editar template */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do template' : 'Crie um novo template de email'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Template *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Cobrança amigável"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposTemplate.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <span className="flex items-center gap-2">
                          <span>{tipo.icon}</span>
                          {tipo.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="assunto">Assunto *</Label>
              <Input
                id="assunto"
                value={formData.assunto}
                onChange={(e) => setFormData(prev => ({ ...prev, assunto: e.target.value }))}
                placeholder="Ex: Lembrete de pagamento - {{nome_empresa}}"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="conteudo_html">Conteúdo HTML *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(formData.conteudo_html)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
                <Textarea
                  id="conteudo_html"
                  value={formData.conteudo_html}
                  onChange={(e) => setFormData(prev => ({ ...prev, conteudo_html: e.target.value }))}
                  placeholder="Conteúdo HTML do email..."
                  rows={15}
                  required
                />
              </div>

              <div>
                <Label>Variáveis Disponíveis</Label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {variaveisDisponiveis.map(variavel => (
                    <Button
                      key={variavel}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => insertVariable(variavel)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {variavel}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="conteudo_texto">Conteúdo Texto (fallback)</Label>
              <Textarea
                id="conteudo_texto"
                value={formData.conteudo_texto}
                onChange={(e) => setFormData(prev => ({ ...prev, conteudo_texto: e.target.value }))}
                placeholder="Versão em texto simples do email..."
                rows={5}
              />
            </div>

            <div className="flex justify-between pt-4">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteTemplateMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={templateMutation.isPending}>
                  {templateMutation.isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
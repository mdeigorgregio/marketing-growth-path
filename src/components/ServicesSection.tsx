import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: string;
  categoria: string;
  destaque: boolean;
}

const servicosIniciais: Service[] = [
  {
    id: '1',
    nome: 'Consultoria SEO',
    descricao: 'Análise completa do site e estratégias para melhorar o posicionamento nos buscadores',
    preco: 1500,
    duracao: '2-3 semanas',
    categoria: 'SEO',
    destaque: true
  },
  {
    id: '2',
    nome: 'Gestão de Redes Sociais',
    descricao: 'Criação de conteúdo e gerenciamento completo das redes sociais da empresa',
    preco: 2500,
    duracao: 'Mensal',
    categoria: 'Social Media',
    destaque: true
  },
  {
    id: '3',
    nome: 'Criação de Site',
    descricao: 'Desenvolvimento de site responsivo e otimizado para conversões',
    preco: 3500,
    duracao: '4-6 semanas',
    categoria: 'Desenvolvimento',
    destaque: false
  },
  {
    id: '4',
    nome: 'Campanha Google Ads',
    descricao: 'Criação e otimização de campanhas pagas no Google Ads',
    preco: 1200,
    duracao: 'Setup + Gestão',
    categoria: 'Tráfego Pago',
    destaque: true
  },
  {
    id: '5',
    nome: 'Email Marketing',
    descricao: 'Criação de campanhas de email marketing e automações',
    preco: 800,
    duracao: '1-2 semanas',
    categoria: 'Email Marketing',
    destaque: false
  },
  {
    id: '6',
    nome: 'Identidade Visual',
    descricao: 'Criação de logotipo e manual de identidade visual completo',
    preco: 2000,
    duracao: '3-4 semanas',
    categoria: 'Design',
    destaque: false
  },
  {
    id: '7',
    nome: 'Auditoria Digital',
    descricao: 'Análise completa da presença digital da empresa com relatório detalhado',
    preco: 900,
    duracao: '1 semana',
    categoria: 'Consultoria',
    destaque: false
  },
  {
    id: '8',
    nome: 'Copywriting',
    descricao: 'Criação de textos persuasivos para site, anúncios e materiais de marketing',
    preco: 600,
    duracao: '1-2 semanas',
    categoria: 'Conteúdo',
    destaque: false
  }
];

const categorias = ['Todos', 'SEO', 'Social Media', 'Desenvolvimento', 'Tráfego Pago', 'Email Marketing', 'Design', 'Consultoria', 'Conteúdo'];

export const ServicesSection = () => {
  const [servicos, setServicos] = useState<Service[]>(servicosIniciais);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [novoServico, setNovoServico] = useState<Omit<Service, 'id'>>({ 
    nome: '', 
    descricao: '', 
    preco: 0, 
    duracao: '', 
    categoria: '', 
    destaque: false 
  });
  const [editandoServico, setEditandoServico] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const servicosFiltrados = servicos.filter(servico => 
    categoriaFiltro === 'Todos' || servico.categoria === categoriaFiltro
  );

  const handleCreateService = () => {
    if (!novoServico.nome.trim() || !novoServico.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const id = Date.now().toString();
    setServicos([...servicos, { ...novoServico, id }]);
    setNovoServico({ nome: '', descricao: '', preco: 0, duracao: '', categoria: '', destaque: false });
    setIsCreating(false);
    toast({
      title: "Sucesso",
      description: "Serviço criado com sucesso",
    });
  };

  const handleUpdateService = () => {
    if (!editandoServico?.nome.trim() || !editandoServico?.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setServicos(servicos.map(s => s.id === editandoServico.id ? editandoServico : s));
    setEditandoServico(null);
    setIsEditing(false);
    toast({
      title: "Sucesso",
      description: "Serviço atualizado com sucesso",
    });
  };

  const handleDeleteService = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id));
    toast({
      title: "Sucesso",
      description: "Serviço excluído com sucesso",
    });
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'SEO': 'bg-green-100 text-green-800',
      'Social Media': 'bg-blue-100 text-blue-800',
      'Desenvolvimento': 'bg-purple-100 text-purple-800',
      'Tráfego Pago': 'bg-red-100 text-red-800',
      'Email Marketing': 'bg-yellow-100 text-yellow-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Consultoria': 'bg-indigo-100 text-indigo-800',
      'Conteúdo': 'bg-orange-100 text-orange-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Serviços Avulsos</h2>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos pela agência</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome do serviço"
                value={novoServico.nome}
                onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
              />
              <Textarea
                placeholder="Descrição do serviço"
                value={novoServico.descricao}
                onChange={(e) => setNovoServico({ ...novoServico, descricao: e.target.value })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Preço (R$)"
                  value={novoServico.preco || ''}
                  onChange={(e) => setNovoServico({ ...novoServico, preco: Number(e.target.value) })}
                />
                <Input
                  placeholder="Duração"
                  value={novoServico.duracao}
                  onChange={(e) => setNovoServico({ ...novoServico, duracao: e.target.value })}
                />
              </div>
              <select
                className="w-full p-2 border rounded-md"
                value={novoServico.categoria}
                onChange={(e) => setNovoServico({ ...novoServico, categoria: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={novoServico.destaque}
                  onChange={(e) => setNovoServico({ ...novoServico, destaque: e.target.checked })}
                />
                <span>Serviço em destaque</span>
              </label>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateService}>
                  Criar Serviço
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {categorias.map(categoria => (
          <Button
            key={categoria}
            variant={categoriaFiltro === categoria ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoriaFiltro(categoria)}
          >
            {categoria}
          </Button>
        ))}
      </div>

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicosFiltrados.map((servico) => (
          <Card key={servico.id} className={`hover:shadow-lg transition-shadow ${
            servico.destaque ? 'ring-2 ring-primary/20 bg-primary/5' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {servico.nome}
                    {servico.destaque && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </CardTitle>
                  <Badge className={`mt-2 ${getCategoriaColor(servico.categoria)}`}>
                    {servico.categoria}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditandoServico(servico);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(servico.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{servico.descricao}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">R$ {servico.preco.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{servico.duracao}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {servicosFiltrados.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum serviço encontrado para esta categoria
        </div>
      )}

      {/* Dialog de Edição */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          {editandoServico && (
            <div className="space-y-4">
              <Input
                placeholder="Nome do serviço"
                value={editandoServico.nome}
                onChange={(e) => setEditandoServico({ ...editandoServico, nome: e.target.value })}
              />
              <Textarea
                placeholder="Descrição do serviço"
                value={editandoServico.descricao}
                onChange={(e) => setEditandoServico({ ...editandoServico, descricao: e.target.value })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Preço (R$)"
                  value={editandoServico.preco || ''}
                  onChange={(e) => setEditandoServico({ ...editandoServico, preco: Number(e.target.value) })}
                />
                <Input
                  placeholder="Duração"
                  value={editandoServico.duracao}
                  onChange={(e) => setEditandoServico({ ...editandoServico, duracao: e.target.value })}
                />
              </div>
              <select
                className="w-full p-2 border rounded-md"
                value={editandoServico.categoria}
                onChange={(e) => setEditandoServico({ ...editandoServico, categoria: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editandoServico.destaque}
                  onChange={(e) => setEditandoServico({ ...editandoServico, destaque: e.target.checked })}
                />
                <span>Serviço em destaque</span>
              </label>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setEditandoServico(null);
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateService}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Project } from '@/hooks/useProjects';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'Lead', label: 'Lead' },
  { value: 'Em Negociação', label: 'Em Negociação' },
  { value: 'Proposta Enviada', label: 'Proposta Enviada' },
  { value: 'Assinante', label: 'Assinante' },
  { value: 'Inadimplente', label: 'Inadimplente' },
  { value: 'Cancelado', label: 'Cancelado' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'Em Dia', label: 'Em Dia' },
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Vencido', label: 'Vencido' }
];

const ProjectDetailsModal = ({ project, isOpen, onClose }: ProjectDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedPaymentStatus, setEditedPaymentStatus] = useState('');

  if (!project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Em Negociação':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Proposta Enviada':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Assinante':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inadimplente':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOriginColor = (origem: string | null) => {
    switch (origem) {
      case 'Tráfego Pago':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LA Educação':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Orgânico':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Indicação':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedStatus(project.status);
    setEditedPaymentStatus(project.status_pagamento || 'Em Dia');
  };

  const handleSave = async () => {
    try {
      // TODO: Implementar atualização real via API
      console.log('Salvando alterações:', {
        id: project.id,
        status: editedStatus,
        status_pagamento: editedPaymentStatus
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStatus(project.status);
    setEditedPaymentStatus(project.status_pagamento || 'Em Dia');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {project.empresa}
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Status e Origem */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                {!isEditing ? (
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                ) : (
                  <Select value={editedStatus} onValueChange={setEditedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {project.origem && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Origem</label>
                  <Badge variant="outline" className={getOriginColor(project.origem)}>
                    {project.origem}
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Informações de Contato */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Informações de Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Responsável:</span>
                    <span>{project.responsavel}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{project.email}</span>
                  </div>
                  
                  {project.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Telefone:</span>
                      <span>{project.telefone}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {project.estado && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Estado:</span>
                      <span>{project.estado}</span>
                    </div>
                  )}
                  
                  {project.cidade && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Cidade:</span>
                      <span>{project.cidade}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações Comerciais */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Informações Comerciais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {project.plano_escolhido && (
                    <div className="text-sm">
                      <span className="font-medium">Plano:</span> {project.plano_escolhido}
                    </div>
                  )}
                  
                  {project.valor_plano && project.valor_plano > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Valor:</span> {formatCurrency(project.valor_plano)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {project.status === 'Assinante' && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Status Pagamento</label>
                      {!isEditing ? (
                        <Badge 
                          variant="outline" 
                          className={`${
                            project.status_pagamento === 'Adimplente' 
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : project.status_pagamento === 'Pendente'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {project.status_pagamento || 'Em Dia'}
                        </Badge>
                      ) : (
                        <Select value={editedPaymentStatus} onValueChange={setEditedPaymentStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_STATUS_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Datas */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Datas Importantes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Cadastro:</span>{' '}
                    {format(new Date(project.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  
                  {project.data_contrato && (
                    <div className="text-sm">
                      <span className="font-medium">Contrato:</span>{' '}
                      {format(new Date(project.data_contrato), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {project.data_vencimento && (
                    <div className="text-sm">
                      <span className="font-medium">Vencimento:</span>{' '}
                      {format(new Date(project.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Observações */}
            {project.observacoes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {project.observacoes}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;
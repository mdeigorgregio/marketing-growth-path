import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Mail, Phone, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Project } from '@/hooks/useProjects';

interface KanbanCardProps {
  project: Project;
  onDragStart: () => void;
  onClick: () => void;
  isDragging: boolean;
}

const KanbanCard = ({ project, onDragStart, onClick, isDragging }: KanbanCardProps) => {
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

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:scale-[1.02]'
      }`}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header com empresa e origem */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-medium text-sm truncate">
                {project.empresa}
              </h3>
            </div>
          </div>
          
          {project.origem && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getOriginColor(project.origem)}`}
            >
              {project.origem}
            </Badge>
          )}
        </div>

        {/* Informações do responsável */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{project.responsavel}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{project.email}</span>
          </div>
          
          {project.telefone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{project.telefone}</span>
            </div>
          )}
        </div>

        {/* Informações comerciais */}
        <div className="space-y-1">
          {project.plano_escolhido && (
            <div className="text-xs">
              <span className="font-medium">Plano:</span> {project.plano_escolhido}
            </div>
          )}
          
          {project.valor_plano && project.valor_plano > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(project.valor_plano)}
            </div>
          )}
        </div>

        {/* Footer com data */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Cadastro: {format(new Date(project.created_at), 'dd/MM/yy', { locale: ptBR })}
          </div>
          
          {project.data_contrato && (
            <div className="text-xs text-muted-foreground">
              Contrato: {format(new Date(project.data_contrato), 'dd/MM/yy', { locale: ptBR })}
            </div>
          )}
        </div>

        {/* Status do pagamento (se aplicável) */}
        {project.status_pagamento && project.status === 'Assinante' && (
          <div className="pt-1">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                project.status_pagamento === 'Adimplente' 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : project.status_pagamento === 'Pendente'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              {project.status_pagamento}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
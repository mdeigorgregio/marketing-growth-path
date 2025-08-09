import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Cliente } from '@/hooks/useProjects';

interface PaymentStatusBadgeProps {
  cliente: Cliente;
  showIcon?: boolean;
  showDays?: boolean;
}

export const PaymentStatusBadge = ({ cliente, showIcon = true, showDays = true }: PaymentStatusBadgeProps) => {
  const statusPagamento = cliente.status_pagamento || 'Adimplente';
  const diasAtraso = cliente.dias_atraso || 0;

  const getStatusConfig = () => {
    switch (statusPagamento) {
      case 'Inadimplente':
        return {
          variant: 'destructive' as const,
          label: showDays && diasAtraso > 0 ? `Atraso ${diasAtraso}d` : 'Inadimplente',
          icon: <AlertTriangle className="w-3 h-3" />
        };
      case 'Pendente':
        return {
          variant: 'outline' as const,
          label: 'Vence em breve',
          icon: <Clock className="w-3 h-3" />
        };
      default:
        return {
          variant: 'default' as const,
          label: 'Em dia',
          icon: <CheckCircle className="w-3 h-3" />
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};
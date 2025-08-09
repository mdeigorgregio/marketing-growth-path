import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialStatusProps {
  statusPagamento: 'Adimplente' | 'Inadimplente' | 'Pendente' | null;
  diasAtraso?: number;
  valorPlano?: number;
  dataVencimento?: string;
  className?: string;
  showDetails?: boolean;
}

export function FinancialStatus({
  statusPagamento,
  diasAtraso = 0,
  valorPlano,
  dataVencimento,
  className,
  showDetails = false
}: FinancialStatusProps) {
  if (!statusPagamento) {
    return null;
  }

  const getStatusConfig = () => {
    switch (statusPagamento) {
      case 'Adimplente':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          label: 'Adimplente',
          description: 'Pagamento em dia'
        };
      case 'Pendente':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          label: 'Vencimento Próximo',
          description: 'Vence em breve'
        };
      case 'Inadimplente':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          label: 'Inadimplente',
          description: `${diasAtraso} dia(s) em atraso`
        };
      default:
        return {
          variant: 'outline' as const,
          icon: DollarSign,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          label: 'Não definido',
          description: 'Status não definido'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (showDetails) {
    return (
      <div className={cn('p-3 rounded-lg border', config.bgColor, className)}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn('h-4 w-4', config.color)} />
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <p>{config.description}</p>
          
          {valorPlano && (
            <p className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>Valor: {formatCurrency(valorPlano)}</span>
            </p>
          )}
          
          {dataVencimento && (
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Vencimento: {formatDate(dataVencimento)}</span>
            </p>
          )}
          
          {statusPagamento === 'Inadimplente' && diasAtraso > 0 && (
            <p className="flex items-center gap-1 text-red-600 font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>{diasAtraso} dia(s) em atraso</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn('h-4 w-4', config.color)} />
      <Badge variant={config.variant} className="text-xs">
        {config.label}
        {statusPagamento === 'Inadimplente' && diasAtraso > 0 && (
          <span className="ml-1">({diasAtraso}d)</span>
        )}
      </Badge>
    </div>
  );
}

// Componente para mostrar resumo financeiro
interface FinancialSummaryProps {
  totalAdimplentes: number;
  totalInadimplentes: number;
  totalPendentes: number;
  valorTotalAtraso: number;
  className?: string;
}

export function FinancialSummary({
  totalAdimplentes,
  totalInadimplentes,
  totalPendentes,
  valorTotalAtraso,
  className
}: FinancialSummaryProps) {
  const total = totalAdimplentes + totalInadimplentes + totalPendentes;
  const taxaInadimplencia = total > 0 ? (totalInadimplentes / total) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">Adimplentes</span>
        </div>
        <p className="text-2xl font-bold text-green-600">{totalAdimplentes}</p>
      </div>

      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-800">Inadimplentes</span>
        </div>
        <p className="text-2xl font-bold text-red-600">{totalInadimplentes}</p>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Venc. Próximo</span>
        </div>
        <p className="text-2xl font-bold text-yellow-600">{totalPendentes}</p>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Em Atraso</span>
        </div>
        <p className="text-lg font-bold text-gray-600">{formatCurrency(valorTotalAtraso)}</p>
        <p className="text-xs text-gray-500 mt-1">
          Taxa: {taxaInadimplencia.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
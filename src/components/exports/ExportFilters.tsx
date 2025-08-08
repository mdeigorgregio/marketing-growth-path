import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Project } from '@/hooks/useProjects';

interface ExportFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  status: string[];
  states: string[];
  plans: string[];
}

interface ExportFiltersProps {
  filters: ExportFilters;
  onFiltersChange: (filters: ExportFilters) => void;
  projects: Project[];
}

const ExportFilters = ({ filters, onFiltersChange, projects }: ExportFiltersProps) => {
  const [isFromCalendarOpen, setIsFromCalendarOpen] = useState(false);
  const [isToCalendarOpen, setIsToCalendarOpen] = useState(false);

  // Extrair valores únicos dos projetos
  const uniqueStatuses = [...new Set(projects.map(p => p.status))].filter(Boolean);
  const uniqueStates = [...new Set(projects.map(p => p.estado))].filter(Boolean);
  const uniquePlans = [...new Set(projects.map(p => p.plano_escolhido))].filter(Boolean);

  const updateFilters = (key: keyof ExportFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: 'status' | 'states' | 'plans', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { from: null, to: null },
      status: [],
      states: [],
      plans: []
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.status.length > 0 ||
      filters.states.length > 0 ||
      filters.plans.length > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filtros de Exportação</h3>
        {hasActiveFilters() && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Filtro por Data */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Período de Cadastro</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Data Inicial</Label>
            <Popover open={isFromCalendarOpen} onOpenChange={setIsFromCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span>Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from || undefined}
                  onSelect={(date) => {
                    updateFilters('dateRange', {
                      ...filters.dateRange,
                      from: date || null
                    });
                    setIsFromCalendarOpen(false);
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Data Final</Label>
            <Popover open={isToCalendarOpen} onOpenChange={setIsToCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span>Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to || undefined}
                  onSelect={(date) => {
                    updateFilters('dateRange', {
                      ...filters.dateRange,
                      to: date || null
                    });
                    setIsToCalendarOpen(false);
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Filtro por Status */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status</Label>
        <div className="grid grid-cols-2 gap-2">
          {uniqueStatuses.map(status => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.status.includes(status)}
                onCheckedChange={() => toggleArrayFilter('status', status)}
              />
              <Label 
                htmlFor={`status-${status}`} 
                className="text-sm font-normal cursor-pointer"
              >
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Filtro por Estado */}
      {uniqueStates.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Estados</Label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {uniqueStates.map(state => (
              <div key={state} className="flex items-center space-x-2">
                <Checkbox
                  id={`state-${state}`}
                  checked={filters.states.includes(state)}
                  onCheckedChange={() => toggleArrayFilter('states', state)}
                />
                <Label 
                  htmlFor={`state-${state}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {state}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtro por Plano */}
      {uniquePlans.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Planos</Label>
          <div className="grid grid-cols-2 gap-2">
            {uniquePlans.map(plan => (
              <div key={plan} className="flex items-center space-x-2">
                <Checkbox
                  id={`plan-${plan}`}
                  checked={filters.plans.includes(plan)}
                  onCheckedChange={() => toggleArrayFilter('plans', plan)}
                />
                <Label 
                  htmlFor={`plan-${plan}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {plan}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportFilters;
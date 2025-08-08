import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText, File, Database } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { exportToExcel, exportToCSV, exportToPDF, exportToJSON } from '@/utils/exports/exportUtils';
import { useToast } from '@/hooks/use-toast';
import ExportFilters from './ExportFilters';
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

const ExportData = () => {
  const { data: projects } = useProjects();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    dateRange: { from: null, to: null },
    status: [],
    states: [],
    plans: []
  });

  const applyFilters = (projects: Project[]): Project[] => {
    return projects.filter(project => {
      // Filtro por data
      if (filters.dateRange.from || filters.dateRange.to) {
        const projectDate = new Date(project.created_at);
        if (filters.dateRange.from && projectDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && projectDate > filters.dateRange.to) return false;
      }

      // Filtro por status
      if (filters.status.length > 0 && !filters.status.includes(project.status)) {
        return false;
      }

      // Filtro por estado
      if (filters.states.length > 0 && !filters.states.includes(project.estado || '')) {
        return false;
      }

      // Filtro por plano
      if (filters.plans.length > 0 && !filters.plans.includes(project.plano_escolhido || '')) {
        return false;
      }

      return true;
    });
  };

  const handleExport = async (type: 'excel' | 'csv' | 'pdf' | 'json', useFilters = false) => {
    if (!projects) {
      toast({
        title: 'Erro',
        description: 'Nenhum dado disponível para exportação.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      const dataToExport = useFilters ? applyFilters(projects) : projects;
      
      if (dataToExport.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhum registro encontrado com os filtros aplicados.',
          variant: 'destructive',
        });
        setIsExporting(false);
        return;
      }

      let filename = '';
      const timestamp = new Date().toISOString().split('T')[0];

      switch (type) {
        case 'excel':
          filename = `clientes_${timestamp}.xlsx`;
          await exportToExcel(dataToExport, filename);
          break;
        case 'csv':
          filename = `clientes_${timestamp}.csv`;
          await exportToCSV(dataToExport, filename);
          break;
        case 'pdf':
          filename = `relatorio_clientes_${timestamp}.pdf`;
          await exportToPDF(dataToExport, filename);
          break;
        case 'json':
          filename = `backup_clientes_${timestamp}.json`;
          await exportToJSON(dataToExport, filename);
          break;
      }

      toast({
        title: 'Exportação concluída',
        description: `Arquivo ${filename} baixado com sucesso!`,
      });

      if (useFilters) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao exportar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFilteredCount = () => {
    if (!projects) return 0;
    return applyFilters(projects).length;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Dados
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Tudo (Excel)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar Tudo (CSV)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <File className="h-4 w-4 mr-2" />
            Relatório PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <Database className="h-4 w-4 mr-2" />
            Backup JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exportação Personalizada
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exportação Personalizada</DialogTitle>
            <DialogDescription>
              Configure os filtros e escolha o formato de exportação
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <ExportFilters 
              filters={filters}
              onFiltersChange={setFilters}
              projects={projects || []}
            />
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {getFilteredCount()} registros serão exportados
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleExport('excel', true)}
                  disabled={isExporting}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
                
                <Button 
                  onClick={() => handleExport('csv', true)}
                  disabled={isExporting}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  CSV
                </Button>
                
                <Button 
                  onClick={() => handleExport('pdf', true)}
                  disabled={isExporting}
                  variant="outline"
                  className="gap-2"
                >
                  <File className="h-4 w-4" />
                  PDF
                </Button>
                
                <Button 
                  onClick={() => handleExport('json', true)}
                  disabled={isExporting}
                  variant="outline"
                  className="gap-2"
                >
                  <Database className="h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportData;
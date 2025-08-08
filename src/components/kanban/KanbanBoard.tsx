import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import KanbanCard from './KanbanCard';
import ProjectDetailsModal from './ProjectDetailsModal';
import type { Project } from '@/hooks/useProjects';

interface KanbanBoardProps {
  projects: Project[];
}

const COLUMNS = [
  {
    id: 'Lead',
    title: 'Novos Leads',
    color: 'bg-yellow-100 border-yellow-200',
    badgeColor: 'bg-yellow-500'
  },
  {
    id: 'Em Negociação',
    title: 'Em Negociação',
    color: 'bg-blue-100 border-blue-200',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'Proposta Enviada',
    title: 'Proposta Enviada',
    color: 'bg-purple-100 border-purple-200',
    badgeColor: 'bg-purple-500'
  },
  {
    id: 'Assinante',
    title: 'Assinantes',
    color: 'bg-green-100 border-green-200',
    badgeColor: 'bg-green-500'
  },
  {
    id: 'Cancelado',
    title: 'Cancelados',
    color: 'bg-red-100 border-red-200',
    badgeColor: 'bg-red-500'
  }
];

const KanbanBoard = ({ projects }: KanbanBoardProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);

  // Organizar projetos por coluna
  const projectsByColumn = useMemo(() => {
    const columns: { [key: string]: Project[] } = {};
    
    COLUMNS.forEach(column => {
      columns[column.id] = projects.filter(project => project.status === column.id);
    });
    
    return columns;
  }, [projects]);

  // Calcular valor total por coluna
  const getColumnValue = (columnId: string) => {
    const columnProjects = projectsByColumn[columnId] || [];
    return columnProjects.reduce((total, project) => {
      return total + (project.valor_plano || 0);
    }, 0);
  };

  // Handlers para drag and drop
  const handleDragStart = (project: Project) => {
    setDraggedProject(project);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedProject || draggedProject.status === newStatus) {
      setDraggedProject(null);
      return;
    }

    try {
      // Aqui você implementaria a atualização do status no banco
      // Por enquanto, vamos apenas simular
      console.log(`Movendo projeto ${draggedProject.id} para ${newStatus}`);
      
      // TODO: Implementar atualização real via API
      // await updateProjectStatus(draggedProject.id, newStatus);
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setDraggedProject(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[600px]">
        {COLUMNS.map(column => {
          const columnProjects = projectsByColumn[column.id] || [];
          const columnValue = getColumnValue(column.id);
          
          return (
            <Card 
              key={column.id} 
              className={`${column.color} shadow-card`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {column.title}
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`${column.badgeColor} text-white`}
                  >
                    {columnProjects.length}
                  </Badge>
                </div>
                {columnValue > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(columnValue)}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[480px] px-3 pb-3">
                  <div className="space-y-3">
                    {columnProjects.map(project => (
                      <KanbanCard
                        key={project.id}
                        project={project}
                        onDragStart={() => handleDragStart(project)}
                        onClick={() => setSelectedProject(project)}
                        isDragging={draggedProject?.id === project.id}
                      />
                    ))}
                    
                    {columnProjects.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Nenhum projeto nesta etapa
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de detalhes */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
};

export default KanbanBoard;
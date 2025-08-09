import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
  type: 'meeting' | 'call' | 'task' | 'other';
  cliente_nome?: string;
}

export function CalendarSection() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { toast } = useToast();

  // Mock events data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Reunião com Cliente ABC',
      description: 'Apresentação da proposta final',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      location: 'Escritório',
      attendees: ['João Silva'],
      type: 'meeting',
      cliente_nome: 'Empresa ABC Ltda'
    },
    {
      id: '2',
      title: 'Call de Follow-up',
      description: 'Acompanhar status do projeto',
      start_time: new Date(Date.now() + 86400000).toISOString(),
      end_time: new Date(Date.now() + 86400000 + 1800000).toISOString(),
      type: 'call',
      cliente_nome: 'Tech Solutions'
    },
    {
      id: '3',
      title: 'Entrega do Material',
      description: 'Finalizar entregáveis do mês',
      start_time: new Date(Date.now() + 172800000).toISOString(),
      end_time: new Date(Date.now() + 172800000 + 3600000).toISOString(),
      type: 'task'
    }
  ];

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getTodayEvents = () => {
    return getEventsForDate(new Date());
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => new Date(event.start_time) > today)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 5);
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-500',
      call: 'bg-green-500',
      task: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getEventTypeBadge = (type: string) => {
    const variants = {
      meeting: 'default',
      call: 'secondary',
      task: 'outline',
      other: 'secondary'
    };
    return variants[type as keyof typeof variants] || variants.other;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendário e Agendamentos</h2>
        <Button onClick={() => toast({ title: 'Em Desenvolvimento', description: 'Funcionalidade em breve!' })}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Eventos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getEventTypeColor(event.type)}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant={getEventTypeBadge(event.type) as any}>
                          {event.type === 'meeting' ? 'Reunião' :
                           event.type === 'call' ? 'Ligação' :
                           event.type === 'task' ? 'Tarefa' : 'Outro'}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                        {event.cliente_nome && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.cliente_nome}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum evento agendado para esta data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Events & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTodayEvents().length > 0 ? (
                getTodayEvents().map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded border-l-4" 
                       style={{ borderLeftColor: getEventTypeColor(event.type).replace('bg-', '#') + '66' }}>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                      </p>
                    </div>
                    <Badge variant={getEventTypeBadge(event.type) as any} className="text-xs">
                      {event.type === 'meeting' ? 'Reunião' :
                       event.type === 'call' ? 'Ligação' :
                       event.type === 'task' ? 'Tarefa' : 'Outro'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">Nenhum evento hoje</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingEvents().length > 0 ? (
                getUpcomingEvents().map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                    <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`} />
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_time), "dd/MM 'às' HH:mm")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">Nenhum evento próximo</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
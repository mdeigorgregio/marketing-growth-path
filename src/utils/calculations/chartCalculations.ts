import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Project } from '@/hooks/useProjects';

export interface SalesFunnelData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RevenueData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface TrafficSourceData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface GrowthData {
  month: string;
  clients: number;
  newClients: number;
  totalClients: number;
}

// Cores do tema
const COLORS = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899'
};

export const calculateSalesFunnelData = (projects: Project[]): SalesFunnelData[] => {
  const stages = {
    'Lead': { count: 0, color: COLORS.warning },
    'Em Negociação': { count: 0, color: COLORS.info },
    'Proposta Enviada': { count: 0, color: COLORS.secondary },
    'Assinante': { count: 0, color: COLORS.success },
    'Cancelado': { count: 0, color: COLORS.danger }
  };

  projects.forEach(project => {
    if (stages[project.status as keyof typeof stages]) {
      stages[project.status as keyof typeof stages].count++;
    }
  });

  const total = projects.length;
  
  return Object.entries(stages).map(([stage, data]) => ({
    stage,
    count: data.count,
    percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
    color: data.color
  }));
};

export const calculateRevenueByPlan = (projects: Project[]): { data: RevenueData[], total: number } => {
  const planRevenue: { [key: string]: number } = {};
  
  projects
    .filter(p => p.status === 'Assinante' && p.valor_plano)
    .forEach(project => {
      const plan = project.plano_escolhido || 'Não especificado';
      planRevenue[plan] = (planRevenue[plan] || 0) + (project.valor_plano || 0);
    });

  const total = Object.values(planRevenue).reduce((sum, value) => sum + value, 0);
  
  const colors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.info, COLORS.purple, COLORS.pink];
  
  const data = Object.entries(planRevenue).map(([plan, revenue], index) => ({
    name: plan,
    value: revenue,
    color: colors[index % colors.length],
    percentage: total > 0 ? Math.round((revenue / total) * 100) : 0
  }));

  return { data, total };
};

export const calculateTrafficSourceData = (projects: Project[]): { data: TrafficSourceData[], total: number } => {
  const sourceCount: { [key: string]: number } = {};
  
  projects.forEach(project => {
    const source = project.origem || 'Não especificado';
    sourceCount[source] = (sourceCount[source] || 0) + 1;
  });

  const total = projects.length;
  
  const colors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.info, COLORS.purple, COLORS.pink];
  
  const data = Object.entries(sourceCount).map(([source, count], index) => ({
    name: source,
    value: count,
    color: colors[index % colors.length],
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));

  return { data, total };
};

export const calculateGrowthTimeline = (projects: Project[]): GrowthData[] => {
  const now = new Date();
  const months: GrowthData[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    // Clientes criados até o final deste mês
    const totalClients = projects.filter(p => 
      new Date(p.created_at) <= monthEnd
    ).length;
    
    // Novos clientes neste mês
    const newClients = projects.filter(p => {
      const createdAt = new Date(p.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    }).length;
    
    months.push({
      month: format(monthDate, 'MMM/yy', { locale: ptBR }),
      clients: newClients,
      newClients,
      totalClients
    });
  }
  
  return months;
};

// Cálculos para Analytics
export const calculateKPIs = (projects: Project[]) => {
  const activeProjects = projects.filter(p => p.status === 'Assinante');
  const totalRevenue = activeProjects.reduce((sum, p) => sum + (p.valor_plano || 0), 0);
  const averageTicket = activeProjects.length > 0 ? totalRevenue / activeProjects.length : 0;
  
  const leads = projects.filter(p => p.status === 'LEAD').length;
  const subscribers = projects.filter(p => p.status === 'Assinante').length;
  const conversionRate = leads > 0 ? (subscribers / leads) * 100 : 0;
  
  const cancelled = projects.filter(p => p.status === 'Cancelado').length;
  const churnRate = (subscribers + cancelled) > 0 ? (cancelled / (subscribers + cancelled)) * 100 : 0;
  
  // Crescimento mensal (últimos 2 meses)
  const now = new Date();
  const lastMonth = subMonths(now, 1);
  const twoMonthsAgo = subMonths(now, 2);
  
  const lastMonthClients = projects.filter(p => 
    new Date(p.created_at) <= endOfMonth(lastMonth)
  ).length;
  
  const twoMonthsAgoClients = projects.filter(p => 
    new Date(p.created_at) <= endOfMonth(twoMonthsAgo)
  ).length;
  
  const monthlyGrowth = twoMonthsAgoClients > 0 ? 
    ((lastMonthClients - twoMonthsAgoClients) / twoMonthsAgoClients) * 100 : 0;
  
  return {
    totalRevenue,
    averageTicket,
    conversionRate,
    churnRate,
    monthlyGrowth
  };
};

export const calculateStateDistribution = (projects: Project[]) => {
  const stateCount: { [key: string]: number } = {};
  
  projects.forEach(project => {
    const state = project.estado || 'Não informado';
    stateCount[state] = (stateCount[state] || 0) + 1;
  });
  
  return Object.entries(stateCount)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 estados
};

export const calculateOriginPerformance = (projects: Project[]) => {
  const originStats: { [key: string]: { leads: number; conversions: number } } = {};
  
  projects.forEach(project => {
    const origin = project.origem || 'Não especificado';
    if (!originStats[origin]) {
      originStats[origin] = { leads: 0, conversions: 0 };
    }
    
    originStats[origin].leads++;
    if (project.status === 'Assinante') {
      originStats[origin].conversions++;
    }
  });
  
  return Object.entries(originStats).map(([origin, stats]) => ({
    origin,
    leads: stats.leads,
    conversions: stats.conversions,
    conversionRate: stats.leads > 0 ? (stats.conversions / stats.leads) * 100 : 0
  }));
};
// Dados de exemplo para demonstração do sistema
export const mockProjects = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    empresa: 'Tech Solutions Ltda',
    responsavel: 'João Silva',
    telefone: '(11) 99999-1234',
    email: 'joao@techsolutions.com.br',
    site: 'https://techsolutions.com.br',
    rua: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    status: 'Assinante' as const,
    plano_escolhido: 'Plano Premium',
    origem: 'Tráfego Pago' as const,
    servicos_avulsos: ['Consultoria SEO', 'Gestão de Redes Sociais'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'mock-2',
    user_id: 'mock-user',
    empresa: 'Inovação Digital',
    responsavel: 'Maria Santos',
    telefone: '(21) 98888-5678',
    email: 'maria@inovacaodigital.com',
    site: 'https://inovacaodigital.com',
    rua: 'Av. Paulista',
    numero: '456',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    status: 'LEAD' as const,
    plano_escolhido: 'Plano Básico',
    origem: 'LA Educação' as const,
    servicos_avulsos: ['Criação de Site'],
    created_at: '2024-01-16T14:30:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 'mock-3',
    user_id: 'mock-user',
    empresa: 'Consultoria Empresarial ABC',
    responsavel: 'Carlos Oliveira',
    telefone: '(31) 97777-9012',
    email: 'carlos@consultoriaabc.com.br',
    site: 'https://consultoriaabc.com.br',
    rua: 'Rua dos Negócios',
    numero: '789',
    bairro: 'Savassi',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    cep: '30112-000',
    status: 'Assinante' as const,
    plano_escolhido: 'Plano Empresarial',
    origem: 'Indicação' as const,
    servicos_avulsos: ['Auditoria Digital', 'Treinamento'],
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  },
  {
    id: 'mock-4',
    user_id: 'mock-user',
    empresa: 'StartUp Inovadora',
    responsavel: 'Ana Costa',
    telefone: '(41) 96666-3456',
    email: 'ana@startupinovadora.com',
    site: 'https://startupinovadora.com',
    rua: 'Rua da Inovação',
    numero: '321',
    bairro: 'Batel',
    cidade: 'Curitiba',
    estado: 'PR',
    cep: '80420-090',
    status: 'Inadimplente' as const,
    plano_escolhido: 'Plano Básico',
    origem: 'Orgânico' as const,
    servicos_avulsos: ['Consultoria de Marketing'],
    created_at: '2024-01-18T16:45:00Z',
    updated_at: '2024-01-18T16:45:00Z'
  },
  {
    id: 'mock-5',
    user_id: 'mock-user',
    empresa: 'E-commerce Plus',
    responsavel: 'Pedro Almeida',
    telefone: '(51) 95555-7890',
    email: 'pedro@ecommerceplus.com.br',
    site: 'https://ecommerceplus.com.br',
    rua: 'Av. dos Estados',
    numero: '654',
    bairro: 'Moinhos de Vento',
    cidade: 'Porto Alegre',
    estado: 'RS',
    cep: '90570-000',
    status: 'LEAD' as const,
    plano_escolhido: 'Plano Premium',
    origem: 'Tráfego Pago' as const,
    servicos_avulsos: ['Integração de Sistemas'],
    created_at: '2024-01-19T11:20:00Z',
    updated_at: '2024-01-19T11:20:00Z'
  },
  {
    id: 'mock-6',
    user_id: 'mock-user',
    empresa: 'Agência Criativa 360',
    responsavel: 'Lucia Ferreira',
    telefone: '(85) 94444-2468',
    email: 'lucia@criativa360.com',
    site: 'https://criativa360.com',
    rua: 'Rua da Criatividade',
    numero: '987',
    bairro: 'Aldeota',
    cidade: 'Fortaleza',
    estado: 'CE',
    cep: '60150-160',
    status: 'Assinante' as const,
    plano_escolhido: 'Plano Premium',
    origem: 'LA Educação' as const,
    servicos_avulsos: ['Design Gráfico', 'Produção de Conteúdo'],
    created_at: '2024-01-20T13:10:00Z',
    updated_at: '2024-01-20T13:10:00Z'
  },
  {
    id: 'mock-7',
    user_id: 'mock-user',
    empresa: 'Logística Inteligente',
    responsavel: 'Roberto Lima',
    telefone: '(62) 93333-1357',
    email: 'roberto@logisticainteligente.com.br',
    site: 'https://logisticainteligente.com.br',
    rua: 'Av. T-4',
    numero: '159',
    bairro: 'Setor Bueno',
    cidade: 'Goiânia',
    estado: 'GO',
    cep: '74210-010',
    status: 'Cancelado' as const,
    plano_escolhido: 'Plano Básico',
    origem: 'Indicação' as const,
    servicos_avulsos: [],
    created_at: '2024-01-21T08:30:00Z',
    updated_at: '2024-01-21T08:30:00Z'
  },
  {
    id: 'mock-8',
    user_id: 'mock-user',
    empresa: 'Saúde Digital',
    responsavel: 'Dra. Fernanda Rocha',
    telefone: '(71) 92222-8024',
    email: 'fernanda@saudedigital.med.br',
    site: 'https://saudedigital.med.br',
    rua: 'Rua da Saúde',
    numero: '753',
    bairro: 'Pituba',
    cidade: 'Salvador',
    estado: 'BA',
    cep: '41810-011',
    status: 'Assinante' as const,
    plano_escolhido: 'Plano Empresarial',
    origem: 'Orgânico' as const,
    servicos_avulsos: ['Telemedicina', 'Prontuário Eletrônico'],
    created_at: '2024-01-22T15:45:00Z',
    updated_at: '2024-01-22T15:45:00Z'
  }
];

export const mockNotes = [
  {
    id: 'note-1',
    user_id: 'mock-user',
    project_id: 'mock-1',
    titulo: 'Reunião inicial com cliente',
    conteudo: 'Discussão sobre requisitos do projeto e cronograma inicial. Cliente demonstrou interesse em soluções de automação de marketing.',
    tipo: 'reuniao',
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 'note-2',
    user_id: 'mock-user',
    project_id: 'mock-2',
    titulo: 'Análise de concorrência',
    conteudo: 'Pesquisa detalhada sobre concorrentes diretos e indiretos. Identificadas oportunidades de diferenciação no mercado.',
    tipo: 'pesquisa',
    created_at: '2024-01-16T15:30:00Z',
    updated_at: '2024-01-16T15:30:00Z'
  },
  {
    id: 'note-3',
    user_id: 'mock-user',
    project_id: 'mock-3',
    titulo: 'Feedback do protótipo',
    conteudo: 'Cliente aprovou o design geral, mas solicitou ajustes na paleta de cores e layout da página inicial.',
    tipo: 'feedback',
    created_at: '2024-01-17T10:15:00Z',
    updated_at: '2024-01-17T10:15:00Z'
  },
  {
    id: 'note-4',
    user_id: 'mock-user',
    project_id: 'mock-1',
    titulo: 'Proposta comercial enviada',
    conteudo: 'Enviada proposta detalhada com 3 opções de planos. Cliente tem até sexta-feira para retorno.',
    tipo: 'comercial',
    created_at: '2024-01-15T16:00:00Z',
    updated_at: '2024-01-15T16:00:00Z'
  },
  {
    id: 'note-5',
    user_id: 'mock-user',
    project_id: 'mock-4',
    titulo: 'Implementação de SEO',
    conteudo: 'Iniciado trabalho de otimização para mecanismos de busca. Foco em palavras-chave do segmento.',
    tipo: 'tecnico',
    created_at: '2024-01-18T17:45:00Z',
    updated_at: '2024-01-18T17:45:00Z'
  }
];

export const mockAppointments = [
  {
    id: 'appointment-1',
    user_id: 'mock-user',
    project_id: 'mock-1',
    title: 'Reunião de Kickoff',
    description: 'Reunião inicial para alinhamento do projeto e definição de cronograma',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  },
  {
    id: 'appointment-2',
    user_id: 'mock-user',
    project_id: 'mock-2',
    title: 'Apresentação de Resultados',
    description: 'Apresentação dos resultados do primeiro mês de campanha',
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    created_at: '2024-01-16T16:30:00Z',
    updated_at: '2024-01-16T16:30:00Z'
  },
  {
    id: 'appointment-3',
    user_id: 'mock-user',
    project_id: 'mock-3',
    title: 'Treinamento da Equipe',
    description: 'Treinamento da equipe do cliente para uso da nova plataforma',
    start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-01-17T11:15:00Z',
    updated_at: '2024-01-17T11:15:00Z'
  },
  {
    id: 'appointment-4',
    user_id: 'mock-user',
    project_id: 'mock-6',
    title: 'Revisão de Design',
    description: 'Revisão final dos materiais gráficos e aprovação',
    start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    created_at: '2024-01-20T14:10:00Z',
    updated_at: '2024-01-20T14:10:00Z'
  }
];

// Função para verificar se deve usar dados mockados
export const shouldUseMockData = () => {
  // Usar dados mockados se não houver dados reais ou se estiver em modo de demonstração
  return process.env.NODE_ENV === 'development' || localStorage.getItem('useMockData') === 'true';
};

// Função para ativar/desativar dados mockados
export const toggleMockData = (enabled: boolean) => {
  localStorage.setItem('useMockData', enabled.toString());
  window.location.reload(); // Recarregar para aplicar as mudanças
};
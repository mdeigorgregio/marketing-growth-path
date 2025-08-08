// Script para popular o banco com dados de teste realistas
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://fnanvlzrdlkfbwyowdve.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYW52bHpyZGxrZmJ3eW93ZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjg3MTksImV4cCI6MjA2OTk0NDcxOX0.zJtHu_OAVQiCosrj3xhUSxzXEVa-DoL2Vvh6pIBIXcE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dados de exemplo realistas
const empresasExemplo = [
  {
    empresa: "Tech Solutions Ltda",
    responsavel: "João Silva",
    telefone: "(11) 99999-1234",
    email: "joao@techsolutions.com.br",
    site: "https://techsolutions.com.br",
    rua: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    status: "Assinante",
    plano_escolhido: "Plano Premium",
    origem: "Tráfego Pago",
    servicos_avulsos: ["Consultoria SEO", "Gestão de Redes Sociais"]
  },
  {
    empresa: "Inovação Digital",
    responsavel: "Maria Santos",
    telefone: "(21) 98888-5678",
    email: "maria@inovacaodigital.com",
    site: "https://inovacaodigital.com",
    rua: "Av. Paulista",
    numero: "456",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100",
    status: "LEAD",
    plano_escolhido: "Plano Básico",
    origem: "LA Educação",
    servicos_avulsos: ["Criação de Site"]
  },
  {
    empresa: "Consultoria Empresarial ABC",
    responsavel: "Carlos Oliveira",
    telefone: "(31) 97777-9012",
    email: "carlos@consultoriaabc.com.br",
    site: "https://consultoriaabc.com.br",
    rua: "Rua dos Negócios",
    numero: "789",
    bairro: "Savassi",
    cidade: "Belo Horizonte",
    estado: "MG",
    cep: "30112-000",
    status: "Assinante",
    plano_escolhido: "Plano Empresarial",
    origem: "Indicação",
    servicos_avulsos: ["Auditoria Digital", "Treinamento"]
  },
  {
    empresa: "StartUp Inovadora",
    responsavel: "Ana Costa",
    telefone: "(41) 96666-3456",
    email: "ana@startupinovadora.com",
    site: "https://startupinovadora.com",
    rua: "Rua da Inovação",
    numero: "321",
    bairro: "Batel",
    cidade: "Curitiba",
    estado: "PR",
    cep: "80420-090",
    status: "Inadimplente",
    plano_escolhido: "Plano Básico",
    origem: "Orgânico",
    servicos_avulsos: ["Consultoria de Marketing"]
  },
  {
    empresa: "E-commerce Plus",
    responsavel: "Pedro Almeida",
    telefone: "(51) 95555-7890",
    email: "pedro@ecommerceplus.com.br",
    site: "https://ecommerceplus.com.br",
    rua: "Av. dos Estados",
    numero: "654",
    bairro: "Moinhos de Vento",
    cidade: "Porto Alegre",
    estado: "RS",
    cep: "90570-000",
    status: "LEAD",
    plano_escolhido: "Plano Premium",
    origem: "Tráfego Pago",
    servicos_avulsos: ["Integração de Sistemas"]
  },
  {
    empresa: "Agência Criativa 360",
    responsavel: "Lucia Ferreira",
    telefone: "(85) 94444-2468",
    email: "lucia@criativa360.com",
    site: "https://criativa360.com",
    rua: "Rua da Criatividade",
    numero: "987",
    bairro: "Aldeota",
    cidade: "Fortaleza",
    estado: "CE",
    cep: "60150-160",
    status: "Assinante",
    plano_escolhido: "Plano Premium",
    origem: "LA Educação",
    servicos_avulsos: ["Design Gráfico", "Produção de Conteúdo"]
  },
  {
    empresa: "Logística Inteligente",
    responsavel: "Roberto Lima",
    telefone: "(62) 93333-1357",
    email: "roberto@logisticainteligente.com.br",
    site: "https://logisticainteligente.com.br",
    rua: "Av. T-4",
    numero: "159",
    bairro: "Setor Bueno",
    cidade: "Goiânia",
    estado: "GO",
    cep: "74210-010",
    status: "Cancelado",
    plano_escolhido: "Plano Básico",
    origem: "Indicação",
    servicos_avulsos: []
  },
  {
    empresa: "Saúde Digital",
    responsavel: "Dra. Fernanda Rocha",
    telefone: "(71) 92222-8024",
    email: "fernanda@saudedigital.med.br",
    site: "https://saudedigital.med.br",
    rua: "Rua da Saúde",
    numero: "753",
    bairro: "Pituba",
    cidade: "Salvador",
    estado: "BA",
    cep: "41810-011",
    status: "Assinante",
    plano_escolhido: "Plano Empresarial",
    origem: "Orgânico",
    servicos_avulsos: ["Telemedicina", "Prontuário Eletrônico"]
  }
];

// Notas de exemplo
const notasExemplo = [
  {
    titulo: "Reunião inicial com cliente",
    conteudo: "Discussão sobre requisitos do projeto e cronograma inicial. Cliente demonstrou interesse em soluções de automação de marketing.",
    tipo: "reuniao"
  },
  {
    titulo: "Análise de concorrência",
    conteudo: "Pesquisa detalhada sobre concorrentes diretos e indiretos. Identificadas oportunidades de diferenciação no mercado.",
    tipo: "pesquisa"
  },
  {
    titulo: "Feedback do protótipo",
    conteudo: "Cliente aprovou o design geral, mas solicitou ajustes na paleta de cores e layout da página inicial.",
    tipo: "feedback"
  },
  {
    titulo: "Proposta comercial enviada",
    conteudo: "Enviada proposta detalhada com 3 opções de planos. Cliente tem até sexta-feira para retorno.",
    tipo: "comercial"
  },
  {
    titulo: "Implementação de SEO",
    conteudo: "Iniciado trabalho de otimização para mecanismos de busca. Foco em palavras-chave do segmento.",
    tipo: "tecnico"
  }
];

// Agendamentos de exemplo
const agendamentosExemplo = [
  {
    titulo: "Reunião de Kickoff",
    descricao: "Reunião inicial para alinhamento do projeto e definição de cronograma",
    data_agendamento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias a partir de hoje
    tipo: "reuniao",
    status: "agendado"
  },
  {
    titulo: "Apresentação de Resultados",
    descricao: "Apresentação dos resultados do primeiro mês de campanha",
    data_agendamento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana a partir de hoje
    tipo: "apresentacao",
    status: "agendado"
  },
  {
    titulo: "Treinamento da Equipe",
    descricao: "Treinamento da equipe do cliente para uso da nova plataforma",
    data_agendamento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 semanas a partir de hoje
    tipo: "treinamento",
    status: "agendado"
  }
];

async function popularDados() {
  try {
    console.log('🚀 Iniciando população de dados de teste...');
    
    // Fazer login com o usuário de teste
    console.log('🔐 Fazendo login com usuário de teste...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'teste@crm.com',
      password: '123456'
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }
    
    const user = loginData.user;
    if (!user) {
      console.log('❌ Falha ao obter dados do usuário.');
      return;
    }
    
    console.log(`✅ Usuário logado: ${user.email}`);
    
    // Inserir projetos
    console.log('📊 Inserindo projetos de exemplo...');
    const projetosComUserId = empresasExemplo.map(empresa => ({
      ...empresa,
      user_id: user.id
    }));
    
    const { data: projetos, error: errorProjetos } = await supabase
      .from('projects')
      .insert(projetosComUserId)
      .select();
    
    if (errorProjetos) {
      console.error('❌ Erro ao inserir projetos:', errorProjetos);
      return;
    }
    
    console.log(`✅ ${projetos.length} projetos inseridos com sucesso!`);
    
    // Inserir notas para alguns projetos
    console.log('📝 Inserindo notas de exemplo...');
    const notasComProjetos = [];
    
    projetos.slice(0, 5).forEach((projeto, index) => {
      notasExemplo.forEach((nota, notaIndex) => {
        if (notaIndex <= index) { // Distribuir notas entre projetos
          notasComProjetos.push({
            ...nota,
            project_id: projeto.id,
            user_id: user.id
          });
        }
      });
    });
    
    const { data: notas, error: errorNotas } = await supabase
      .from('notes')
      .insert(notasComProjetos)
      .select();
    
    if (errorNotas) {
      console.error('❌ Erro ao inserir notas:', errorNotas);
    } else {
      console.log(`✅ ${notas.length} notas inseridas com sucesso!`);
    }
    
    // Inserir agendamentos para alguns projetos
    console.log('📅 Inserindo agendamentos de exemplo...');
    const agendamentosComProjetos = [];
    
    projetos.slice(0, 3).forEach((projeto, index) => {
      agendamentosExemplo.forEach((agendamento, agendamentoIndex) => {
        if (agendamentoIndex <= index) { // Distribuir agendamentos entre projetos
          agendamentosComProjetos.push({
            ...agendamento,
            project_id: projeto.id,
            user_id: user.id
          });
        }
      });
    });
    
    const { data: agendamentos, error: errorAgendamentos } = await supabase
      .from('appointments')
      .insert(agendamentosComProjetos)
      .select();
    
    if (errorAgendamentos) {
      console.error('❌ Erro ao inserir agendamentos:', errorAgendamentos);
    } else {
      console.log(`✅ ${agendamentos.length} agendamentos inseridos com sucesso!`);
    }
    
    console.log('🎉 População de dados concluída com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - ${projetos.length} projetos`);
    console.log(`   - ${notas?.length || 0} notas`);
    console.log(`   - ${agendamentos?.length || 0} agendamentos`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
popularDados();

module.exports = { popularDados };
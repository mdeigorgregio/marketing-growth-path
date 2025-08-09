const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Templates de email para cobrança
const emailTemplates = [
  {
    nome: 'Lembrete de Vencimento',
    categoria: 'cobranca',
    assunto: '⏰ Lembrete: Seu pagamento vence em breve - {{nome_empresa}}',
    corpo: `Olá {{responsavel}}!

Esperamos que esteja tudo bem com a {{nome_empresa}}.

Este é um lembrete amigável de que o pagamento do seu plano {{plano_escolhido}} vence em {{dias_para_vencimento}} dia(s).

📅 Data de vencimento: {{data_vencimento}}
💰 Valor: R$ {{valor_plano}}

Para evitar qualquer interrupção no serviço, pedimos que realize o pagamento até a data de vencimento.

Se já realizou o pagamento, pode desconsiderar este email.

Qualquer dúvida, estamos à disposição!

Atenciosamente,
Equipe de Cobrança`,
    variaveis: ['responsavel', 'nome_empresa', 'plano_escolhido', 'dias_para_vencimento', 'data_vencimento', 'valor_plano']
  },
  {
    nome: 'Cobrança Amigável - 1º Aviso',
    categoria: 'cobranca',
    assunto: '📋 Pagamento em atraso - {{nome_empresa}}',
    corpo: `Olá {{responsavel}}!

Identificamos que o pagamento do seu plano {{plano_escolhido}} está em atraso.

📅 Data de vencimento: {{data_vencimento}}
💰 Valor: R$ {{valor_plano}}
⏰ Dias em atraso: {{dias_atraso}}

Para regularizar sua situação e evitar a suspensão do serviço, pedimos que realize o pagamento o quanto antes.

Se já realizou o pagamento, entre em contato conosco para confirmarmos o recebimento.

Estamos aqui para ajudar!

Atenciosamente,
Equipe Financeira`,
    variaveis: ['responsavel', 'nome_empresa', 'plano_escolhido', 'data_vencimento', 'valor_plano', 'dias_atraso']
  },
  {
    nome: 'Cobrança Firme - 2º Aviso',
    categoria: 'cobranca',
    assunto: '🚨 URGENTE: Pagamento em atraso - {{nome_empresa}}',
    corpo: `{{responsavel}},

Seu pagamento está em atraso há {{dias_atraso}} dias.

📋 DETALHES DA PENDÊNCIA:
• Empresa: {{nome_empresa}}
• Plano: {{plano_escolhido}}
• Valor: R$ {{valor_plano}}
• Vencimento: {{data_vencimento}}
• Dias em atraso: {{dias_atraso}}

⚠️ ATENÇÃO: Para evitar a suspensão do serviço, o pagamento deve ser realizado em até 48 horas.

Caso tenha dificuldades, entre em contato conosco para negociarmos uma solução.

Aguardamos seu retorno.

Departamento Financeiro`,
    variaveis: ['responsavel', 'nome_empresa', 'plano_escolhido', 'valor_plano', 'data_vencimento', 'dias_atraso']
  },
  {
    nome: 'Cobrança Final - 3º Aviso',
    categoria: 'cobranca',
    assunto: '🔴 ÚLTIMO AVISO: Suspensão iminente - {{nome_empresa}}',
    corpo: `{{responsavel}},

Este é nosso último aviso antes da suspensão do serviço.

🔴 SITUAÇÃO CRÍTICA:
• Empresa: {{nome_empresa}}
• Valor em atraso: R$ {{valor_plano}}
• Dias em atraso: {{dias_atraso}}
• Vencimento original: {{data_vencimento}}

⚠️ PRAZO FINAL: 24 HORAS

Após este prazo, seu serviço será suspenso automaticamente.

Para evitar transtornos:
1. Realize o pagamento imediatamente
2. Ou entre em contato para negociação

Não deixe para depois!

Departamento Financeiro
Telefone: (11) 99999-9999`,
    variaveis: ['responsavel', 'nome_empresa', 'valor_plano', 'dias_atraso', 'data_vencimento']
  },
  {
    nome: 'Welcome Email - Novo Cliente',
    categoria: 'welcome',
    assunto: '🎉 Bem-vindo(a) à nossa equipe, {{nome_empresa}}!',
    corpo: `Olá {{responsavel}}!

Seja muito bem-vindo(a) à nossa família! 🎉

Estamos muito felizes em tê-lo(a) como nosso cliente e ansiosos para ajudar a {{nome_empresa}} a crescer.

📋 DETALHES DO SEU PLANO:
• Plano contratado: {{plano_escolhido}}
• Data de início: {{data_contrato}}
• Próximo vencimento: {{data_vencimento}}
• Valor mensal: R$ {{valor_plano}}

🚀 PRÓXIMOS PASSOS:
1. Nossa equipe entrará em contato em breve
2. Vamos agendar uma reunião de onboarding
3. Começaremos a trabalhar no seu projeto

Qualquer dúvida, estamos à disposição!

Vamos juntos alcançar grandes resultados! 💪

Equipe Comercial`,
    variaveis: ['responsavel', 'nome_empresa', 'plano_escolhido', 'data_contrato', 'data_vencimento', 'valor_plano']
  },
  {
    nome: 'Follow-up Pós Reunião',
    categoria: 'follow_up',
    assunto: 'Obrigado pela reunião - {{nome_empresa}}',
    corpo: `Olá {{responsavel}}!

Foi um prazer conversar com você hoje sobre as necessidades da {{nome_empresa}}.

📝 RESUMO DA NOSSA CONVERSA:
• Discutimos sobre {{topicos_discutidos}}
• Identificamos oportunidades de melhoria
• Apresentamos nossa proposta de solução

📎 PRÓXIMOS PASSOS:
1. Enviaremos a proposta detalhada em até 24h
2. Agendar nova reunião para esclarecimentos
3. Definir cronograma de implementação

Ficou alguma dúvida? Estou à disposição!

Obrigado pela confiança.

{{nome_consultor}}
Consultor Comercial`,
    variaveis: ['responsavel', 'nome_empresa', 'topicos_discutidos', 'nome_consultor']
  },
  {
    nome: 'Pesquisa de Satisfação',
    categoria: 'pesquisa',
    assunto: 'Como está sendo sua experiência conosco? - {{nome_empresa}}',
    corpo: `Olá {{responsavel}}!

Esperamos que esteja satisfeito(a) com nossos serviços.

Sua opinião é muito importante para nós! Por isso, gostaríamos de saber como está sendo sua experiência com a {{nome_empresa}}.

⭐ AVALIE NOSSO SERVIÇO:
• Qualidade do atendimento
• Cumprimento de prazos
• Resultados obtidos
• Comunicação da equipe

📝 Clique aqui para responder nossa pesquisa rápida (2 minutos):
[LINK DA PESQUISA]

Sua opinião nos ajuda a melhorar continuamente!

Obrigado pelo seu tempo.

Equipe de Qualidade`,
    variaveis: ['responsavel', 'nome_empresa']
  }
];

// Automações pré-configuradas
const automacoes = [
  {
    nome: 'Lembrete de Vencimento (7 dias antes)',
    ativo: true,
    trigger_tipo: 'vencimento_proximo',
    trigger_config: { dias_antes: 7 },
    condicoes: [
      { campo: 'status_pagamento', operador: 'igual', valor: 'Adimplente' }
    ],
    acoes: [
      {
        tipo: 'enviar_email',
        template: 'Lembrete de Vencimento',
        destinatario: 'cliente'
      },
      {
        tipo: 'criar_tarefa',
        titulo: 'Acompanhar pagamento de {{nome_empresa}}',
        tipo_tarefa: 'Verificar pagamento',
        prazo_dias: 7
      }
    ]
  },
  {
    nome: 'Cobrança Automática - 1º Aviso',
    ativo: true,
    trigger_tipo: 'status_mudou',
    trigger_config: { status_de: 'Adimplente', status_para: 'Inadimplente' },
    condicoes: [],
    acoes: [
      {
        tipo: 'enviar_email',
        template: 'Cobrança Amigável - 1º Aviso',
        destinatario: 'cliente'
      },
      {
        tipo: 'criar_tarefa',
        titulo: 'Cobrar {{nome_empresa}} - 1º aviso',
        tipo_tarefa: 'Cobrar pagamento',
        prioridade: 'Alta'
      },
      {
        tipo: 'adicionar_tag',
        tag: 'Em Atraso'
      }
    ]
  },
  {
    nome: 'Cobrança Automática - 2º Aviso (3 dias)',
    ativo: true,
    trigger_tipo: 'dias_atraso',
    trigger_config: { dias: 3 },
    condicoes: [
      { campo: 'status_pagamento', operador: 'igual', valor: 'Inadimplente' }
    ],
    acoes: [
      {
        tipo: 'enviar_email',
        template: 'Cobrança Firme - 2º Aviso',
        destinatario: 'cliente'
      },
      {
        tipo: 'criar_tarefa',
        titulo: 'URGENTE: Cobrar {{nome_empresa}} - 2º aviso',
        tipo_tarefa: 'Cobrar pagamento',
        prioridade: 'Urgente'
      }
    ]
  },
  {
    nome: 'Cobrança Final (7 dias)',
    ativo: true,
    trigger_tipo: 'dias_atraso',
    trigger_config: { dias: 7 },
    condicoes: [
      { campo: 'status_pagamento', operador: 'igual', valor: 'Inadimplente' }
    ],
    acoes: [
      {
        tipo: 'enviar_email',
        template: 'Cobrança Final - 3º Aviso',
        destinatario: 'cliente'
      },
      {
        tipo: 'criar_tarefa',
        titulo: 'CRÍTICO: Última cobrança {{nome_empresa}}',
        tipo_tarefa: 'Cobrar pagamento',
        prioridade: 'Urgente'
      },
      {
        tipo: 'adicionar_tag',
        tag: 'Risco Cancelamento'
      }
    ]
  },
  {
    nome: 'Welcome Series - Novo Cliente',
    ativo: true,
    trigger_tipo: 'cliente_criado',
    trigger_config: {},
    condicoes: [
      { campo: 'status', operador: 'igual', valor: 'Assinante' }
    ],
    acoes: [
      {
        tipo: 'enviar_email',
        template: 'Welcome Email - Novo Cliente',
        destinatario: 'cliente',
        delay_horas: 1
      },
      {
        tipo: 'criar_tarefa',
        titulo: 'Agendar onboarding com {{nome_empresa}}',
        tipo_tarefa: 'Reunião',
        prazo_dias: 3
      },
      {
        tipo: 'adicionar_tag',
        tag: 'Novo Cliente'
      }
    ]
  },
  {
    nome: 'Follow-up Lead Sem Contato',
    ativo: true,
    trigger_tipo: 'sem_contato',
    trigger_config: { dias: 7 },
    condicoes: [
      { campo: 'status', operador: 'igual', valor: 'Lead' }
    ],
    acoes: [
      {
        tipo: 'criar_tarefa',
        titulo: 'Follow-up: {{nome_empresa}} sem contato há 7 dias',
        tipo_tarefa: 'WhatsApp follow-up',
        prioridade: 'Média'
      },
      {
        tipo: 'adicionar_tag',
        tag: 'Follow-up Necessário'
      }
    ]
  }
];

async function popularDados() {
  try {
    console.log('🚀 Iniciando população de dados financeiros...');

    // Inserir templates de email
    console.log('📧 Inserindo templates de email...');
    const { data: templatesData, error: templatesError } = await supabase
      .from('email_templates')
      .insert(emailTemplates);

    if (templatesError) {
      console.error('❌ Erro ao inserir templates:', templatesError);
    } else {
      console.log('✅ Templates de email inseridos com sucesso!');
    }

    // Inserir automações
    console.log('🤖 Inserindo automações...');
    const { data: automacoesData, error: automacoesError } = await supabase
      .from('automacoes')
      .insert(automacoes);

    if (automacoesError) {
      console.error('❌ Erro ao inserir automações:', automacoesError);
    } else {
      console.log('✅ Automações inseridas com sucesso!');
    }

    // Atualizar alguns clientes existentes com dados financeiros de exemplo
    console.log('💰 Atualizando clientes com dados financeiros...');
    
    // Buscar alguns clientes existentes
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('id, nome_empresa')
      .limit(5);

    if (clientesError) {
      console.error('❌ Erro ao buscar clientes:', clientesError);
    } else if (clientes && clientes.length > 0) {
      // Atualizar com dados financeiros de exemplo
      const updates = clientes.map((cliente, index) => {
        const hoje = new Date();
        const dataContrato = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 dias atrás
        const dataVencimento = new Date(hoje.getTime() + ((index - 2) * 24 * 60 * 60 * 1000)); // Alguns vencidos, outros não
        
        return {
          id: cliente.id,
          valor_plano: [500, 800, 1200, 300, 1500][index],
          data_contrato: dataContrato.toISOString().split('T')[0],
          data_vencimento: dataVencimento.toISOString().split('T')[0]
        };
      });

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('clientes')
          .update({
            valor_plano: update.valor_plano,
            data_contrato: update.data_contrato,
            data_vencimento: update.data_vencimento
          })
          .eq('id', update.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar cliente ${update.id}:`, updateError);
        }
      }

      console.log('✅ Clientes atualizados com dados financeiros!');
    }

    // Executar função para atualizar status de pagamento
    console.log('🔄 Atualizando status de pagamento...');
    const { error: funcaoError } = await supabase.rpc('atualizar_status_pagamento');
    
    if (funcaoError) {
      console.error('❌ Erro ao executar função de atualização:', funcaoError);
    } else {
      console.log('✅ Status de pagamento atualizado!');
    }

    // Criar notificações de exemplo
    console.log('📢 Criando notificações de exemplo...');
    
    const notificacoesExemplo = [
      {
        tipo: 'vencimento_hoje',
        titulo: 'Vencimento Hoje',
        mensagem: 'Cliente TechCorp tem pagamento vencendo hoje (R$ 1.500,00)',
        prioridade: 'alta',
        lida: false,
        acao_texto: 'Ver Cliente',
        acao_url: '/clientes/1',
        valor_relacionado: 1500,
        data_vencimento: new Date().toISOString().split('T')[0]
      },
      {
        tipo: 'cliente_inadimplente',
        titulo: 'Cliente Inadimplente',
        mensagem: 'StartupXYZ ficou inadimplente há 5 dias (R$ 800,00)',
        prioridade: 'urgente',
        lida: false,
        acao_texto: 'Cobrar Agora',
        acao_url: '/cobranca/2',
        valor_relacionado: 800
      },
      {
        tipo: 'pagamento_regularizado',
        titulo: 'Pagamento Regularizado',
        mensagem: 'InovaCorp regularizou o pagamento em atraso',
        prioridade: 'media',
        lida: false,
        acao_texto: 'Ver Detalhes',
        valor_relacionado: 1200
      },
      {
        tipo: 'vencimento_proximo',
        titulo: 'Vencimento Próximo',
        mensagem: '3 clientes com vencimento em 2 dias',
        prioridade: 'media',
        lida: false,
        acao_texto: 'Ver Lista',
        acao_url: '/dashboard/financeiro'
      },
      {
        tipo: 'alto_valor_atraso',
        titulo: 'Alto Valor em Atraso',
        mensagem: 'MegaCorp com R$ 5.000,00 em atraso há 15 dias',
        prioridade: 'urgente',
        lida: false,
        acao_texto: 'Ação Urgente',
        valor_relacionado: 5000
      },
      {
        tipo: 'novo_cliente',
        titulo: 'Novo Cliente',
        mensagem: 'NovaEmpresa foi cadastrada como Lead',
        prioridade: 'baixa',
        lida: true,
        acao_texto: 'Ver Cliente'
      },
      {
        tipo: 'tarefa_vencida',
        titulo: 'Tarefa Vencida',
        mensagem: 'Tarefa "Ligar para cliente" está vencida há 2 dias',
        prioridade: 'alta',
        lida: false,
        acao_texto: 'Ver Tarefa',
        acao_url: '/tarefas'
      },
      {
        tipo: 'meta_atingida',
        titulo: 'Meta Atingida',
        mensagem: 'Meta de cobrança do mês foi atingida! (105%)',
        prioridade: 'baixa',
        lida: false,
        acao_texto: 'Ver Relatório'
      }
    ];

    for (const notificacao of notificacoesExemplo) {
      const { error } = await supabase
        .from('notificacoes')
        .insert(notificacao);
      
      if (error) {
        console.error('Erro ao criar notificação:', error);
      }
    }

    // Criar configurações padrão de notificação
    console.log('⚙️ Criando configurações padrão de notificação...');
    
    const tiposNotificacao = [
      'vencimento_hoje', 'cliente_inadimplente', 'atraso_30_dias',
      'pagamento_regularizado', 'alto_valor_atraso', 'vencimento_proximo',
      'novo_cliente', 'tarefa_vencida', 'meta_atingida', 'sistema'
    ];

    for (const tipo of tiposNotificacao) {
      const { error } = await supabase
        .from('configuracoes_notificacao')
        .insert({
          tipo_notificacao: tipo,
          ativa: true,
          email: tipo.includes('inadimplente') || tipo.includes('atraso') || tipo.includes('vencimento'),
          push: true,
          sms: tipo === 'atraso_30_dias' || tipo === 'alto_valor_atraso',
          antecedencia_dias: tipo.includes('vencimento') ? 3 : 0,
          horario_envio: '09:00:00'
        });
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erro ao criar configuração:', error);
      }
    }

    console.log('🎉 População de dados concluída com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`• ${emailTemplates.length} templates de email criados`);
    console.log(`• ${automacoes.length} automações configuradas`);
    console.log('• Dados financeiros adicionados aos clientes existentes');
    console.log('• Status de pagamento atualizado automaticamente');
    console.log(`• ${notificacoesExemplo.length} notificações de exemplo criadas`);
    console.log(`• ${tiposNotificacao.length} configurações de notificação criadas`);

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  popularDados();
}

module.exports = { popularDados };
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Cliente } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WhatsAppButtonProps {
  cliente: Cliente;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const whatsappTemplates = {
  'Adimplente': {
    'LEAD': (cliente: Cliente) => `Olá *${cliente.responsavel}* da *${cliente.empresa}*! 👋\n\nObrigado pelo interesse em nossos serviços. Estou entrando em contato para entender melhor suas necessidades e apresentar nossa solução.\n\nQuando podemos conversar?`,
    
    'Assinante': (cliente: Cliente) => `Olá *${cliente.responsavel}*! 😊\n\nEspero que esteja tudo bem com a *${cliente.empresa}*.\n\nEstou entrando em contato para saber como está sendo sua experiência com nosso serviço. Há algo em que posso ajudar?`,
    
    'Inadimplente': (cliente: Cliente) => `Olá *${cliente.responsavel}*! 😊\n\nEspero que esteja tudo bem com a *${cliente.empresa}*.\n\nEstou entrando em contato para saber como está sendo sua experiência com nosso serviço. Há algo em que posso ajudar?`,
    
    'Cancelado': (cliente: Cliente) => `Olá *${cliente.responsavel}* da *${cliente.empresa}*! 👋\n\nSentimos muito por ter cancelado nossos serviços. Gostaríamos de entender melhor os motivos e ver como podemos melhorar.\n\nPoderia nos dar um feedback?`
  },
  
  'Inadimplente': (cliente: Cliente) => `Olá *${cliente.responsavel}* da *${cliente.empresa}*! 👋\n\n📋 *LEMBRETE DE PAGAMENTO*\n\nIdentificamos que o pagamento do seu plano *${cliente.plano_escolhido || 'contratado'}* está em atraso há *${cliente.dias_atraso || 0}* dia(s).\n\n💰 Valor: R$ ${cliente.valor_plano?.toFixed(2) || '0,00'}\n📅 Vencimento: ${cliente.data_vencimento ? new Date(cliente.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'}\n\nPara regularizar, entre em contato conosco. Estamos aqui para ajudar! 🤝`,
  
  'Pendente': (cliente: Cliente) => `Olá *${cliente.responsavel}*! ⏰\n\nSeu pagamento do plano *${cliente.plano_escolhido || 'contratado'}* vence em breve.\n\n📅 Vencimento: ${cliente.data_vencimento ? new Date(cliente.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'}\n💰 Valor: R$ ${cliente.valor_plano?.toFixed(2) || '0,00'}\n\nPara evitar interrupções no serviço, não esqueça de realizar o pagamento. Qualquer dúvida, estou à disposição! 😊`
};

export const WhatsAppButton = ({ cliente, variant = 'default', size = 'sm' }: WhatsAppButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Adiciona o código do país se não tiver
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      return `55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `5511${cleaned}`;
    } else if (cleaned.length === 11) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  };

  const generateMessage = () => {
    const statusPagamento = cliente.status_pagamento || 'Adimplente';
    
    if (statusPagamento === 'Inadimplente') {
      return whatsappTemplates.Inadimplente(cliente);
    } else if (statusPagamento === 'Pendente') {
      return whatsappTemplates.Pendente(cliente);
    } else {
      // Adimplente - escolhe template baseado no status do cliente
      const template = whatsappTemplates.Adimplente[cliente.status as keyof typeof whatsappTemplates.Adimplente];
      if (typeof template === 'function') {
        return template(cliente);
      }
      return whatsappTemplates.Adimplente.LEAD(cliente);
    }
  };

  const logWhatsAppUsage = async (telefone: string, mensagem: string, tipoMensagem: string) => {
    if (!user) return;

    try {
      await supabase
        .from('whatsapp_history')
        .insert({
          cliente_id: cliente.id,
          telefone,
          mensagem,
          tipo_mensagem: tipoMensagem,
          user_id: user.id
        });
    } catch (error) {
      console.error('Erro ao salvar histórico WhatsApp:', error);
    }
  };

  const handleWhatsAppClick = async () => {
    if (!cliente.telefone) {
      toast.error('Cliente não possui telefone cadastrado');
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(cliente.telefone);
      const message = generateMessage();
      const encodedMessage = encodeURIComponent(message);
      
      // Determinar tipo da mensagem
      const tipoMensagem = cliente.status_pagamento === 'Inadimplente' ? 'cobranca' :
                          cliente.status_pagamento === 'Pendente' ? 'lembrete' :
                          cliente.status === 'LEAD' ? 'saudacao' : 'followup';

      // Log do uso
      await logWhatsAppUsage(formattedPhone, message, tipoMensagem);

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');

      toast.success('WhatsApp aberto com mensagem pré-preenchida!');
    } catch (error) {
      toast.error('Erro ao abrir WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (cliente.status_pagamento === 'Inadimplente') {
      return <Badge variant="destructive" className="text-xs">Cobrança</Badge>;
    } else if (cliente.status_pagamento === 'Pendente') {
      return <Badge variant="outline" className="text-xs">Lembrete</Badge>;
    } else if (cliente.status === 'LEAD') {
      return <Badge variant="secondary" className="text-xs">Saudação</Badge>;
    }
    return <Badge variant="default" className="text-xs">Follow-up</Badge>;
  };

  if (!cliente.telefone) {
    return (
      <Button variant="ghost" size="default" disabled className="text-muted-foreground">
        <MessageCircle className="w-4 h-4 mr-1" />
        Sem telefone
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
          size="default"
        onClick={handleWhatsAppClick}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <MessageCircle className="w-4 h-4 mr-1" />
        {isLoading ? 'Abrindo...' : 'WhatsApp'}
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>
      {getStatusBadge()}
    </div>
  );
};
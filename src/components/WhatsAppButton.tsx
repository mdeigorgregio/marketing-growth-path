import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Cliente {
  id: string;
  nome_empresa: string;
  responsavel: string;
  telefone: string;
  status: string;
  status_pagamento?: 'Adimplente' | 'Inadimplente' | 'Pendente';
  dias_atraso?: number;
  valor_plano?: number;
  data_vencimento?: string;
  plano_escolhido?: string;
}

interface WhatsAppButtonProps {
  cliente: Cliente;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

const whatsappTemplates = {
  'Adimplente': {
    'Lead': `Olá *{{responsavel}}* da *{{nome_empresa}}*! 👋

Obrigado pelo interesse em nossos serviços. Estou entrando em contato para entender melhor suas necessidades e apresentar nossa solução.

Quando podemos conversar?`,
    
    'Assinante': `Olá *{{responsavel}}*! 😊

Espero que esteja tudo bem com a *{{nome_empresa}}*.

Estou entrando em contato para saber como está sendo sua experiência com nosso serviço. Há algo em que posso ajudar?`,
    
    'default': `Olá *{{responsavel}}* da *{{nome_empresa}}*! 👋

Como posso ajudá-lo(a) hoje?`
  },
  
  'Inadimplente': `Olá *{{responsavel}}* da *{{nome_empresa}}*! 👋

📋 *LEMBRETE DE PAGAMENTO*

Identificamos que o pagamento do seu plano *{{plano_escolhido}}* está em atraso há *{{dias_atraso}}* dia(s).

💰 Valor: R$ {{valor_plano}}
📅 Vencimento: {{data_vencimento}}

Para regularizar, entre em contato conosco. Estamos aqui para ajudar! 🤝`,
  
  'Pendente': `Olá *{{responsavel}}*! ⏰

Seu pagamento do plano *{{plano_escolhido}}* vence em breve.

📅 Vencimento: {{data_vencimento}}
💰 Valor: R$ {{valor_plano}}

Para evitar interrupções no serviço, não esqueça de realizar o pagamento. Qualquer dúvida, estou à disposição! 😊`
};

export function WhatsAppButton({ 
  cliente, 
  size = 'default', 
  variant = 'default',
  showLabel = true 
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  const getTemplate = () => {
    const statusPagamento = cliente.status_pagamento || 'Adimplente';
    
    if (statusPagamento === 'Adimplente') {
      const statusCliente = cliente.status;
      return whatsappTemplates.Adimplente[statusCliente as keyof typeof whatsappTemplates.Adimplente] || 
             whatsappTemplates.Adimplente.default;
    }
    
    return whatsappTemplates[statusPagamento];
  };

  const replaceVariables = (template: string) => {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return template
      .replace(/{{responsavel}}/g, cliente.responsavel || 'Cliente')
      .replace(/{{nome_empresa}}/g, cliente.nome_empresa || 'Empresa')
      .replace(/{{plano_escolhido}}/g, cliente.plano_escolhido || 'seu plano')
      .replace(/{{dias_atraso}}/g, String(cliente.dias_atraso || 0))
      .replace(/{{valor_plano}}/g, cliente.valor_plano ? formatCurrency(cliente.valor_plano) : 'R$ 0,00')
      .replace(/{{data_vencimento}}/g, cliente.data_vencimento ? formatDate(cliente.data_vencimento) : 'não definida');
  };

  const getDefaultMessage = () => {
    const template = getTemplate();
    return replaceVariables(template);
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      return `55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `5511${cleaned}`;
    } else if (cleaned.length === 11) {
      return `55${cleaned}`;
    } else if (cleaned.startsWith('55')) {
      return cleaned;
    }
    
    return `55${cleaned}`;
  };

  const sendWhatsApp = async (message: string) => {
    try {
      if (!cliente.telefone) {
        toast({
          title: 'Erro',
          description: 'Cliente não possui telefone cadastrado.',
          variant: 'destructive'
        });
        return;
      }

      const formattedPhone = formatPhoneNumber(cliente.telefone);
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

      // Salvar histórico no banco
      const { error } = await supabase
        .from('whatsapp_history')
        .insert({
          cliente_id: cliente.id,
          telefone: formattedPhone,
          mensagem: message,
          template_usado: cliente.status_pagamento || 'Adimplente'
        });

      if (error) {
        console.error('Erro ao salvar histórico WhatsApp:', error);
      }

      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: 'WhatsApp Aberto',
        description: 'Mensagem enviada para o WhatsApp!',
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao abrir WhatsApp. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleQuickSend = () => {
    const defaultMessage = getDefaultMessage();
    sendWhatsApp(defaultMessage);
  };

  const handleCustomSend = () => {
    if (!customMessage.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite uma mensagem antes de enviar.',
        variant: 'destructive'
      });
      return;
    }
    sendWhatsApp(customMessage);
  };

  const getButtonColor = () => {
    const statusPagamento = cliente.status_pagamento;
    if (statusPagamento === 'Inadimplente') {
      return 'bg-red-600 hover:bg-red-700';
    } else if (statusPagamento === 'Pendente') {
      return 'bg-yellow-600 hover:bg-yellow-700';
    }
    return 'bg-green-600 hover:bg-green-700';
  };

  const getStatusIndicator = () => {
    const statusPagamento = cliente.status_pagamento;
    if (statusPagamento === 'Inadimplente') {
      return '🔴';
    } else if (statusPagamento === 'Pendente') {
      return '🟡';
    }
    return '🟢';
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Botão rápido */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={size}
              variant={variant}
              onClick={handleQuickSend}
              className={`${getButtonColor()} text-white border-0`}
            >
              <MessageCircle className="h-4 w-4" />
              {showLabel && <span className="ml-2">WhatsApp {getStatusIndicator()}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-medium mb-2">Envio rápido - {cliente.status_pagamento || 'Adimplente'}</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {getDefaultMessage().substring(0, 100)}...
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Botão para mensagem personalizada */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size={size} variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar WhatsApp - {cliente.nome_empresa}</DialogTitle>
              <DialogDescription>
                Personalize sua mensagem antes de enviar para {cliente.responsavel}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Mensagem Padrão ({cliente.status_pagamento || 'Adimplente'})
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{getDefaultMessage()}</p>
                </div>
                <Button 
                  onClick={handleQuickSend}
                  className={`mt-2 ${getButtonColor()} text-white`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem Padrão
                </Button>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">
                  Ou escreva uma mensagem personalizada:
                </label>
                <Textarea
                  placeholder="Digite sua mensagem personalizada..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                  className="mb-2"
                />
                <Button 
                  onClick={handleCustomSend}
                  variant="outline"
                  disabled={!customMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem Personalizada
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
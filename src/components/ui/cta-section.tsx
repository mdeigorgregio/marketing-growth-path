import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export const CTASection = () => {
  const benefits = [
    "Setup em menos de 5 minutos",
    "Suporte técnico especializado",
    "Atualizações automáticas",
    "Dados seguros na nuvem"
  ];

  return (
    <section className="py-24 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Transformar Sua Gestão?
          </h2>
          
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de empresas que já otimizaram seus processos 
            com o Sistema MDE. Comece hoje mesmo!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 justify-center md:justify-start">
                <CheckCircle className="h-5 w-5 text-white/80" />
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
            >
              Agendar Demonstração
            </Button>
          </div>
          
          <p className="text-sm opacity-75 mt-6">
            * Sem compromisso. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
};
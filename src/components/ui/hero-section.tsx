import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Users, TrendingUp } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6 leading-tight">
            Transforme Sua Gestão de Projetos Educacionais
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            A plataforma completa para empresas de marketing digital educacional organizarem clientes, 
            projetos e notas de forma eficiente e profissional.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6 shadow-elegant" onClick={() => window.location.href = '/auth'}>
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Ver Demonstração
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center p-6 bg-card/50 backdrop-blur-sm rounded-lg border shadow-card">
              <Target className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestão Focada</h3>
              <p className="text-muted-foreground text-center">
                Organize todos os seus clientes educacionais em um só lugar
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card/50 backdrop-blur-sm rounded-lg border shadow-card">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Colaboração</h3>
              <p className="text-muted-foreground text-center">
                Facilite a comunicação entre equipe e clientes
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card/50 backdrop-blur-sm rounded-lg border shadow-card">
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Resultados</h3>
              <p className="text-muted-foreground text-center">
                Acompanhe o crescimento dos seus projetos educacionais
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
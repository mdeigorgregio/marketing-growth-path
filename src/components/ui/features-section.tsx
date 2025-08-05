import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  MessageSquare, 
  Shield, 
  BarChart3, 
  Zap 
} from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Gestão de Projetos",
      description: "Organize todos os dados dos seus clientes educacionais com informações comerciais detalhadas",
      badge: "Essencial"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Sistema de Notas",
      description: "Editor rico para documentar reuniões, ideias e acompanhar o progresso dos projetos",
      badge: "Produtividade"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Agendamentos",
      description: "Calendário integrado para gerenciar reuniões e prazos importantes",
      badge: "Organização"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Segurança Total",
      description: "Dados protegidos com autenticação segura e controle de acesso por usuário",
      badge: "Segurança"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Relatórios",
      description: "Acompanhe métricas de conversão, status de clientes e performance de projetos",
      badge: "Analytics"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Interface Moderna",
      description: "Design responsivo e intuitivo para trabalhar de qualquer dispositivo",
      badge: "UX"
    }
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Funcionalidades que Impulsionam Resultados
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tudo o que você precisa para gerenciar seus projetos de marketing digital educacional 
            de forma profissional e eficiente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
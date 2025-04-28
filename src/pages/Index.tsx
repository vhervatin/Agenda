import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';

const Index = () => {
  const features = [
    { title: "Agendamento Fácil", description: "Escolha serviços e horários disponíveis em poucos cliques" },
    { title: "Lembretes Automáticos", description: "Receba notificações antes dos seus compromissos" },
    { title: "Cancelamento Flexível", description: "Gerencie sua agenda com facilidade quando necessário" },
    { title: "Histórico Completo", description: "Acompanhe todos os seus agendamentos anteriores" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-block px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Agendamento simplificado
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Reserve seu horário em segundos
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Um sistema de agendamento elegante e intuitivo para otimizar seu tempo e garantir a melhor experiência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="px-8">
                <Link to="/booking">
                  Agendar Agora <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/appointments">Ver Agendamentos</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="bg-secondary py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16 animate-slide-up">
              <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
              <p className="text-muted-foreground text-lg">
                Simples, rápido e eficiente. Nosso sistema foi desenvolvido pensando em você.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-background rounded-xl p-6 shadow-sm animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto glass-panel rounded-2xl p-8 md:p-12 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto para agendar?</h2>
                <p className="text-muted-foreground mb-6 md:mb-0">
                  Reserve seu horário agora e aproveite uma experiência diferenciada.
                </p>
              </div>
              <Button size="lg" asChild className="min-w-40">
                <Link to="/booking" className="flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Agendar
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-muted-foreground text-sm">
                © 2025 Glívan Sistemas (79) 99813-0038. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Termos
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

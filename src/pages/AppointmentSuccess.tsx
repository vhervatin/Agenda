
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';

interface AppointmentData {
  date?: string;
  time?: string;
  service?: {
    name: string;
    duration: string;
    price: string;
  };
  professionalName?: string;
  clientName?: string;
  clientPhone?: string;
}

const AppointmentSuccess = () => {
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const location = useLocation();

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById('success-icon');
      if (element) {
        element.classList.add('scale-100');
      }
    }, 100);
    
    // Try to get appointment data from location state
    if (location.state && location.state.appointmentData) {
      setAppointmentData(location.state.appointmentData);
      console.log("Appointment data:", location.state.appointmentData);
    }
    
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto text-center animate-fade-in">
          {/* Success Icon */}
          <div 
            id="success-icon"
            className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center transform scale-50 transition-transform duration-700 ease-out"
          >
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-4">Agendamento Confirmado!</h1>
          
          {/* Appointment Details Card */}
          <div className="bg-card border rounded-lg p-6 mb-8 animate-slide-up">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground text-sm">Data e Hora</p>
                  <p className="font-medium">
                    {appointmentData?.date || "Data não informada"} - {appointmentData?.time || "Horário não informado"}
                  </p>
                </div>
              </div>
              
              <div className="border-t my-4 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Serviço</span>
                  <span className="font-medium">{appointmentData?.service?.name || "Serviço não especificado"}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Duração</span>
                  <span>{appointmentData?.service?.duration || "Não informada"}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-medium">{appointmentData?.service?.price || "Não informado"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link to="/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Meus Agendamentos
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentSuccess;


import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAppointmentById } from '@/services/api';

const AppointmentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('id');
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (appointmentId) {
      setLoading(true);
      fetchAppointmentById(appointmentId)
        .then(data => {
          setAppointment(data);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching appointment:", error);
          toast.error("Não foi possível carregar os detalhes do agendamento");
          setLoading(false);
        });
    }
  }, [appointmentId]);
  
  const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  };
  
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || price === 0) {
      return '';
    }
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    return format(date, 'HH:mm');
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleViewAppointments = () => {
    navigate('/appointments');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-lg">Carregando informações do agendamento...</h2>
          </div>
        </main>
      </div>
    );
  }
  
  if (!appointment) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Agendamento não encontrado</CardTitle>
              <CardDescription>
                Não foi possível encontrar os detalhes do agendamento.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={handleBack}>Voltar para a página inicial</Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Agendamento confirmado!</CardTitle>
            <CardDescription>
              Seu agendamento foi realizado com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">Serviço</h3>
              <p className="text-lg">{appointment.services?.name}</p>
              {appointment.services?.duration ? (
                <p className="text-sm text-muted-foreground">
                  {formatDuration(appointment.services.duration)}
                </p>
              ) : null}
              {appointment.services?.price ? (
                <p className="font-medium mt-1">
                  {formatPrice(appointment.services.price)}
                </p>
              ) : null}
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">Data e horário</h3>
              <p>{formatDate(appointment.appointment_date)}</p>
              <p className="font-medium">
                {appointment.slots?.start_time && formatTime(appointment.slots.start_time)}
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">Profissional</h3>
              <p>{appointment.professionals?.name}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Seus dados</h3>
              <p>{appointment.client_name}</p>
              <p className="text-sm text-muted-foreground">{appointment.client_phone}</p>
              <p className="text-sm text-muted-foreground">{appointment.client_cpf}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              variant="default" 
              onClick={handleViewAppointments}
            >
              Ver meus agendamentos
            </Button>
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={handleBack}
            >
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AppointmentSuccess;

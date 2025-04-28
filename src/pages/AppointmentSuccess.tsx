import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAppointmentById, fetchConvenioById } from '@/services/api';
import { Appointment, Convenio } from '@/types/types';

const AppointmentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('id');
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [convenio, setConvenio] = useState<Convenio | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const appointmentData = await fetchAppointmentById(appointmentId);
        
        if (appointmentData) {
          setAppointment(appointmentData);
          
          // Se tiver convenio_id, buscar os dados do convênio
          if (appointmentData.convenio_id) {
            try {
              const convenioData = await fetchConvenioById(appointmentData.convenio_id);
              setConvenio(convenioData);
            } catch (err) {
              console.error("Error fetching convenio:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
        toast.error("Não foi possível carregar os detalhes do agendamento");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
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
    
    try {
      // Garantir que a data está no formato correto antes de criar o objeto Date
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month - 1 porque os meses em JS são 0-based
      
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', dateString);
        return '';
      }
      
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
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
                {appointment.slots?.start_time ? formatTime(appointment.slots.start_time) : ''}
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">Profissional</h3>
              <p>{appointment.professionals?.name}</p>
            </div>
            
            {convenio && (
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Convênio</h3>
                <p>{convenio.nome}</p>
              </div>
            )}
            
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

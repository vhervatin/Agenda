
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, User, Clock, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Service, Professional, TimeSlot } from '@/types/types';
import { supabase } from '@/integrations/supabase/client';

const AppointmentSuccess = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('id');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) {
        setError("ID do agendamento não encontrado.");
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching appointment with ID:', appointmentId);
        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select(`
            *,
            professionals:professional_id (id, name, photo_url),
            services:service_id (id, name, duration, price, description),
            slots:slot_id (id, start_time, end_time)
          `)
          .eq('id', appointmentId)
          .single();
        
        if (fetchError) {
          console.error('Error fetching appointment details:', fetchError);
          setError("Erro ao carregar detalhes do agendamento.");
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.error('No appointment data found');
          setError("Agendamento não encontrado.");
          setLoading(false);
          return;
        }

        console.log('Appointment data received:', data);
        
        const appointmentData: Appointment = {
          id: data.id,
          professional_id: data.professional_id,
          service_id: data.service_id,
          slot_id: data.slot_id,
          client_name: data.client_name,
          client_phone: data.client_phone,
          status: data.status as 'confirmed' | 'cancelled' | 'completed',
          created_at: data.created_at,
          professionals: data.professionals as Professional,
          services: data.services as Service,
          slots: data.slots as TimeSlot
        };
        
        setAppointment(appointmentData);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError("Ocorreu um erro inesperado.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointmentDetails();
  }, [appointmentId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center">
              <p>Carregando detalhes do agendamento...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !appointment || !appointment.slots) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>{error || "Não foi possível encontrar os detalhes do agendamento."}</p>
              <Button asChild className="mt-4">
                <Link to="/">Voltar para o início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const appointmentDate = appointment.slots.start_time ? parseISO(appointment.slots.start_time) : new Date();
  const formattedDate = format(appointmentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const formattedTime = format(appointmentDate, "HH:mm");
  
  const serviceName = appointment.services?.name || "Serviço não especificado";
  const serviceDescription = appointment.services?.description || "";
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4 mb-6 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Agendamento Confirmado!</h1>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-muted-foreground">Data e Hora</h2>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <p className="capitalize">{formattedDate} - {formattedTime}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-muted-foreground">Serviço</h2>
              <div className="flex items-center space-x-2">
                <Scissors className="h-5 w-5 text-primary" />
                <p>{serviceName}</p>
              </div>
              {serviceDescription && (
                <p className="text-sm text-muted-foreground ml-7">{serviceDescription}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-muted-foreground">Profissional</h2>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <p>{appointment.professionals?.name || "Profissional não especificado"}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-muted-foreground">Cliente</h2>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <p>{appointment.client_name}</p>
              </div>
              <div className="flex items-center space-x-2 ml-7">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chegue com 10 minutos de antecedência</p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link to="/appointments">Ver Meus Agendamentos</Link>
              </Button>
            </div>
            
            <div className="text-center text-xs text-muted-foreground pt-2">
              <p>Para cancelar ou reagendar, entre em contato conosco.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentSuccess;

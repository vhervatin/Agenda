
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Calendar, Clock, User, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAppointmentById } from '@/services/api';
import { Appointment } from '@/types/types';
import NavBar from '@/components/NavBar';

const AppointmentSuccess = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadAppointment = async () => {
      try {
        if (!id) {
          setError('ID do agendamento não encontrado.');
          setLoading(false);
          return;
        }
        
        const data = await fetchAppointmentById(id);
        if (!data) {
          setError('Agendamento não encontrado.');
        } else {
          setAppointment(data);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar detalhes do agendamento.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointment();
  }, [id]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long'
    }).format(date);
  };
  
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Horário não disponível';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container max-w-md mx-auto py-10 px-4">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <NavBar />
        <div className="container max-w-md mx-auto py-10 px-4">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto flex items-center justify-center">
              <Clipboard className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600">{error}</h1>
            <p className="text-muted-foreground">
              Não conseguimos encontrar os detalhes do seu agendamento.
            </p>
            <Button asChild className="mt-4">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o início
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <NavBar />
      <div className="container max-w-md mx-auto py-10 px-4">
        <div className="text-center mb-6">
          <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mt-4">Agendamento Confirmado!</h1>
          <p className="text-muted-foreground">
            Seu agendamento foi realizado com sucesso.
          </p>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold">Detalhes do Agendamento</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="rounded-full p-2 bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium capitalize">
                  {appointment?.appointment_date 
                    ? formatDate(appointment.appointment_date) 
                    : formatDate(appointment?.slots?.start_time)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="rounded-full p-2 bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horário</p>
                <p className="font-medium">
                  {appointment?.appointment_date 
                    ? formatTime(appointment.appointment_date) 
                    : formatTime(appointment?.slots?.start_time)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="rounded-full p-2 bg-primary/10">
                <Clipboard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Serviço</p>
                <p className="font-medium">{appointment?.services?.name || 'Serviço não especificado'}</p>
                {appointment?.services && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.services.duration} minutos • R$ {appointment.services.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="rounded-full p-2 bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profissional</p>
                <p className="font-medium">{appointment?.professionals?.name || 'Profissional não especificado'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="border-t w-full pt-4 text-center text-sm text-muted-foreground">
              Você receberá um lembrete antes do seu agendamento.
            </div>
          </CardFooter>
        </Card>
        
        <div className="flex flex-col space-y-3">
          <Button asChild variant="default">
            <Link to="/appointments">
              Ver meus agendamentos
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default AppointmentSuccess;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus, Trash2, Search, CreditCard } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAppointmentsByCpf, updateAppointmentStatus } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

const AppointmentCard = ({ 
  appointment, 
  isPast = false,
  onCancel 
}: { 
  appointment: any, 
  isPast?: boolean,
  onCancel?: (id: string) => void 
}) => {
  // Format the date from the appointment
  const formatAppointmentDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Format the time from the appointment
  const formatAppointmentTime = (startTime: string) => {
    if (!startTime) return '';
    const date = new Date(startTime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border rounded-lg p-4 bg-card animate-scale-in">
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-block px-2 py-1 mb-2 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
            {appointment.services?.name || appointment.service}
          </span>
          <h3 className="font-medium">
            {appointment.appointment_date 
              ? formatAppointmentDate(appointment.appointment_date)
              : ''}
          </h3>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {appointment.slots?.start_time 
                ? formatAppointmentTime(appointment.slots.start_time) 
                : appointment.time}
            </span>
            <span className="mx-2">•</span>
            <span>{appointment.professionals?.name || appointment.provider}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {appointment.services?.price 
              ? `R$ ${Number(appointment.services.price).toFixed(2).replace('.', ',')}` 
              : appointment.price}
          </p>
          
          {appointment.status === 'cancelled' && (
            <span className="text-xs text-destructive font-medium">CANCELADO</span>
          )}
          
          {!isPast && appointment.status !== 'cancelled' && onCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deseja cancelar este agendamento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O horário será disponibilizado para outros clientes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(appointment.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmar Cancelamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

const CPFEntryForm = ({ onSubmit }: { onSubmit: (cpf: string) => void }) => {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');

  const formatCpf = (value: string): string => {
    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplicar a formatação 000.000.000-00
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    } else {
      return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;
    }
  };

  const handleCpfChange = (value: string) => {
    const formattedCpf = formatCpf(value);
    setCpf(formattedCpf);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cpf) {
      setError('Por favor, digite seu CPF');
      return;
    }
    
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) {
      setError('CPF inválido. Digite os 11 dígitos do CPF');
      return;
    }
    
    setError('');
    onSubmit(cpf);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Consultar Meus Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">Informe seu CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              maxLength={14}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Digite o mesmo CPF usado no agendamento.
            </p>
          </div>
          <Button type="submit" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Buscar Agendamentos
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const Appointments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clientCpf, setClientCpf] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const queryClient = useQueryClient();
  
  // Query to fetch appointments by CPF
  const { 
    data: fetchedAppointments,
    isLoading,
    isError,
    refetch 
  } = useQuery({
    queryKey: ['appointments', clientCpf],
    queryFn: () => clientCpf ? fetchAppointmentsByCpf(clientCpf) : Promise.resolve([]),
    enabled: !!clientCpf
  });
  
  // Mutation for cancelling appointment
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      return await updateAppointmentStatus(appointmentId, 'cancelled');
    },
    onSuccess: (data) => {
      // Atualizar a lista de agendamentos removendo o agendamento cancelado
      setAppointments(prevAppointments => 
        prevAppointments.filter(app => app.id !== data?.id)
      );
      queryClient.invalidateQueries({ queryKey: ['appointments', clientCpf] });
      toast.success("Agendamento cancelado com sucesso!");
    },
    onError: (error) => {
      console.error('Error cancelling appointment:', error);
      toast.error("Erro ao cancelar agendamento. Tente novamente.");
    }
  });
  
  // Update appointments when data is fetched
  useEffect(() => {
    if (fetchedAppointments) {
      console.log('Agendamentos recebidos:', fetchedAppointments);
      setAppointments(fetchedAppointments);
    }
  }, [fetchedAppointments]);
  
  // Handle appointment cancellation
  const handleCancelAppointment = (id: string) => {
    cancelAppointmentMutation.mutate(id);
  };
  
  // Filter appointments based on search query and tab
  const filteredAppointments = appointments.filter(app => {
    const serviceName = app.services?.name || app.service || '';
    const professionalName = app.professionals?.name || app.provider || '';
    const appointmentDate = app.appointment_date ? new Date(app.appointment_date) : null;
    const formattedDate = appointmentDate ? 
      new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(appointmentDate) : 
      '';
    
    const matchesSearch = (
      serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professionalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formattedDate.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return matchesSearch;
  });

  // Separate appointments into upcoming and past
  const now = new Date();
  const upcomingAppointments = filteredAppointments.filter(app => {
    const appointmentDate = app.appointment_date ? new Date(app.appointment_date) : null;
    return appointmentDate && appointmentDate >= now && app.status !== 'cancelled';
  });

  const pastAppointments = filteredAppointments.filter(app => {
    const appointmentDate = app.appointment_date ? new Date(app.appointment_date) : null;
    return appointmentDate && (appointmentDate < now || app.status === 'cancelled');
  });

  // Sort appointments by date
  upcomingAppointments.sort((a, b) => {
    const dateA = new Date(a.appointment_date);
    const dateB = new Date(b.appointment_date);
    return dateA.getTime() - dateB.getTime();
  });

  pastAppointments.sort((a, b) => {
    const dateA = new Date(a.appointment_date);
    const dateB = new Date(b.appointment_date);
    return dateB.getTime() - dateA.getTime(); // Ordem decrescente para histórico
  });
  
  // If no CPF provided yet, show the CPF entry form
  if (!clientCpf) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <CPFEntryForm onSubmit={setClientCpf} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar agendamentos"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-56"
                />
              </div>
              
              <Button asChild>
                <Link to="/booking">
                  <Plus className="h-4 w-4 mr-1" /> Novo
                </Link>
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p>Carregando seus agendamentos...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive">Erro ao carregar agendamentos. Tente novamente.</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()} 
                className="mt-4"
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <p className="text-sm">
                  CPF: <span className="font-medium">{clientCpf}</span>
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setClientCpf(null)}
                >
                  Alterar
                </Button>
              </div>
              
              <Tabs defaultValue="upcoming" className="animate-fade-in">
                <TabsList className="mb-6">
                  <TabsTrigger value="upcoming" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Próximos
                  </TabsTrigger>
                  <TabsTrigger value="past">Histórico</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(appointment => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onCancel={handleCancelAppointment}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 animate-fade-in">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                      <h3 className="text-lg font-medium mb-2">Nenhum agendamento encontrado</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery 
                          ? "Tente buscar usando outros termos." 
                          : "Você não possui agendamentos futuros para este CPF."}
                      </p>
                      <Button asChild>
                        <Link to="/booking">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Agendamento
                        </Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past" className="space-y-4">
                  {pastAppointments.length > 0 ? (
                    pastAppointments.map(appointment => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        isPast
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 animate-fade-in">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                      <h3 className="text-lg font-medium mb-2">Nenhum histórico encontrado</h3>
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? "Tente buscar usando outros termos." 
                          : "Você não possui agendamentos anteriores para este CPF."}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Appointments;

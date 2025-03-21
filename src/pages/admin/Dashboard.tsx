
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays,
  Users,
  Scissors,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { 
  fetchProfessionals, 
  fetchServices, 
  fetchAppointments 
} from '@/services/api';
import { isToday } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  // Fetch professionals
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals
  });
  
  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices
  });
  
  // Fetch appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments
  });
  
  // Count today's appointments
  const todayAppointments = appointments.filter(appointment => {
    if (!appointment.slots?.start_time) return false;
    return isToday(new Date(appointment.slots.start_time));
  });
  
  // Count appointments by status
  const appointmentsByStatus = {
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Painel de Controle</h1>
        
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos de Hoje</p>
                  <p className="text-3xl font-semibold">{todayAppointments.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profissionais Ativos</p>
                  <p className="text-3xl font-semibold">{professionals.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Serviços</p>
                  <p className="text-3xl font-semibold">{services.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Scissors className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
                  <p className="text-3xl font-semibold">{appointments.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Agendamentos</CardTitle>
              <CardDescription>
                Visão geral dos status de todos os agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <Clock className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Confirmados</span>
                      <span className="text-sm text-muted-foreground">{appointmentsByStatus.confirmed}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ 
                          width: `${
                            appointments.length > 0 
                              ? (appointmentsByStatus.confirmed / appointments.length) * 100 
                              : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <CheckCircle className="h-4 w-4 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Concluídos</span>
                      <span className="text-sm text-muted-foreground">{appointmentsByStatus.completed}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ 
                          width: `${
                            appointments.length > 0 
                              ? (appointmentsByStatus.completed / appointments.length) * 100 
                              : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-4">
                    <XCircle className="h-4 w-4 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Cancelados</span>
                      <span className="text-sm text-muted-foreground">{appointmentsByStatus.cancelled}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ 
                          width: `${
                            appointments.length > 0 
                              ? (appointmentsByStatus.cancelled / appointments.length) * 100 
                              : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos de Hoje</CardTitle>
              <CardDescription>
                Listagem dos agendamentos do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento para hoje.
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start space-x-4 p-3 rounded-lg border">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center
                        ${appointment.status === 'confirmed' ? 'bg-blue-100' : 
                          appointment.status === 'completed' ? 'bg-green-100' : 'bg-red-100'}`
                      }>
                        {appointment.status === 'confirmed' ? (
                          <Clock className={`h-5 w-5 text-blue-700`} />
                        ) : appointment.status === 'completed' ? (
                          <CheckCircle className={`h-5 w-5 text-green-700`} />
                        ) : (
                          <XCircle className={`h-5 w-5 text-red-700`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{appointment.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.slots && new Date(appointment.slots.start_time).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {appointment.services?.name} • {appointment.professionals?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

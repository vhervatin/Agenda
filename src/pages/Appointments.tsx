
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus, Trash2, Search } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Mock data for appointments
const upcomingAppointments = [
  {
    id: '1',
    service: 'Corte de Cabelo',
    date: '12 de Junho, 2024',
    time: '14:30',
    provider: 'João Silva',
    price: 'R$ 80,00',
  },
  {
    id: '2',
    service: 'Barba',
    date: '20 de Junho, 2024',
    time: '10:00',
    provider: 'Carlos Oliveira',
    price: 'R$ 50,00',
  },
];

const pastAppointments = [
  {
    id: '3',
    service: 'Pacote Completo',
    date: '5 de Maio, 2024',
    time: '11:30',
    provider: 'João Silva',
    price: 'R$ 120,00',
  },
  {
    id: '4',
    service: 'Corte de Cabelo',
    date: '15 de Abril, 2024',
    time: '16:00',
    provider: 'Carlos Oliveira',
    price: 'R$ 80,00',
  },
  {
    id: '5',
    service: 'Hidratação',
    date: '30 de Março, 2024',
    time: '09:15',
    provider: 'Ana Santos',
    price: 'R$ 70,00',
  },
];

const AppointmentCard = ({ 
  appointment, 
  isPast = false,
  onCancel 
}: { 
  appointment: typeof upcomingAppointments[0], 
  isPast?: boolean,
  onCancel?: (id: string) => void 
}) => {
  return (
    <div className="border rounded-lg p-4 bg-card animate-scale-in">
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-block px-2 py-1 mb-2 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
            {appointment.service}
          </span>
          <h3 className="font-medium">{appointment.date}</h3>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{appointment.time}</span>
            <span className="mx-2">•</span>
            <span>{appointment.provider}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">{appointment.price}</p>
          
          {!isPast && onCancel && (
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

const Appointments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState({
    upcoming: [...upcomingAppointments],
    past: [...pastAppointments],
  });
  
  // Handle appointment cancellation
  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => ({
      ...prev,
      upcoming: prev.upcoming.filter(app => app.id !== id)
    }));
    
    toast.success("Agendamento cancelado com sucesso.");
  };
  
  // Filter appointments based on search query
  const filteredUpcoming = appointments.upcoming.filter(app => 
    app.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPast = appointments.past.filter(app => 
    app.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          
          <Tabs defaultValue="upcoming" className="animate-fade-in">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Próximos
              </TabsTrigger>
              <TabsTrigger value="past">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4">
              {filteredUpcoming.length > 0 ? (
                filteredUpcoming.map(appointment => (
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
                    {searchQuery ? "Tente buscar usando outros termos." : "Você não possui agendamentos futuros."}
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
              {filteredPast.length > 0 ? (
                filteredPast.map(appointment => (
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
                    {searchQuery ? "Tente buscar usando outros termos." : "Você não possui agendamentos anteriores."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Appointments;

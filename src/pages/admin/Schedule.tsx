import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse, addDays, addMinutes, setHours, setMinutes } from 'date-fns';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Calendar as CalendarIcon, X, Filter } from 'lucide-react';
import ScheduleForm from '@/components/admin/ScheduleForm';
import { fetchAvailableSlots, createAvailableSlotsBulk, fetchAppointments, fetchProfessionals, deleteAvailableSlot, deleteAvailableSlotsByDate } from '@/services/api';
import { TimeRange, TimeSlot } from '@/types/types';
import { ptBR } from 'date-fns/locale';

// Interface para os slots locais
interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const generateTimeSlots = (startTime: string, endTime: string, interval: number) => {
  const slots = [];
  let currentTime = parse(startTime, 'HH:mm', new Date());
  const parsedEndTime = parse(endTime, 'HH:mm', new Date());

  while (currentTime <= parsedEndTime) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, interval);
  }

  return slots;
};

const Schedule = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotDuration, setSlotDuration] = useState(30);
  
  const [professionalId, setProfessionalId] = useState('');
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startHour: '08',
    startMinute: '00',
    endHour: '18',
    endMinute: '00',
  });
  
  // Get the date string for the API
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  // Fetch professionals for the form
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals
  });
  
  const { data: availableSlotsData = [], isLoading: isLoadingAvailableSlots, refetch: refetchSlots } = useQuery({
    queryKey: ['availableSlots', formattedDate],
    queryFn: () => fetchAvailableSlots(formattedDate, null),
    enabled: !!formattedDate
  });
  
  useEffect(() => {
    if (availableSlotsData) {
      // Converta TimeSlot[] para Slot[]
      const convertedSlots: Slot[] = availableSlotsData.map(slot => ({
        id: slot.id,
        start_time: slot.start_time || '',
        end_time: slot.end_time || '',
        is_available: slot.is_available ?? slot.available ?? false
      }));
      
      setSlots(convertedSlots);
    }
  }, [availableSlotsData]);
  
  const createSlotsMutation = useMutation({
    mutationFn: createAvailableSlotsBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      toast.success('Horários gerados com sucesso!');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar horários: ${error.message}`);
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: deleteAvailableSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      toast.success('Horário removido com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao remover horário: ${error.message}`);
    }
  });

  const deleteSlotsByDateMutation = useMutation({
    mutationFn: deleteAvailableSlotsByDate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      toast.success('Todos os horários do dia foram removidos com sucesso!');
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao remover horários: ${error.message}`);
    }
  });
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  };
  
  const handleDateRangeChange = (newDateRange: Date[]) => {
    setDateRange(newDateRange);
  };
  
  const handleProfessionalChange = (newProfessionalId: string) => {
    setProfessionalId(newProfessionalId);
  };

  const handleSlotDurationChange = (duration: number) => {
    setSlotDuration(duration);
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSlotMutation.mutate(slotId);
  };

  const handleDeleteAllSlots = () => {
    if (!selectedDate) return;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    deleteSlotsByDateMutation.mutate(dateString);
  };
  
  const handleGenerateSlots = () => {
    if (!professionalId || dateRange.length === 0) {
      toast.error('Por favor, selecione um profissional e um intervalo de datas.');
      return;
    }
    
    const startTime = `${timeRange.startHour}:${timeRange.startMinute}`;
    const endTime = `${timeRange.endHour}:${timeRange.endMinute}`;
    
    const slotsToCreate = [];
    
    dateRange.forEach(date => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const timeSlots = generateTimeSlots(startTime, endTime, slotDuration);
      
      timeSlots.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const startDateTime = new Date(date);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + slotDuration);
        
        slotsToCreate.push({
          professional_id: professionalId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          is_available: true
        });
      });
    });
    
    createSlotsMutation.mutate(slotsToCreate);
  };
  
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments', formattedDate],
    queryFn: () => fetchAppointments({ date: formattedDate })
  });
  
  const availableSlots = slots.filter(slot => slot.is_available);
  const bookedSlots = appointments.filter(appointment => 
    appointment.status === 'confirmed' || appointment.status === 'completed'
  );

  const selectedDateHasSlots = availableSlots.length > 0;
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Horários</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>Gerar Horários</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Gerar Horários Disponíveis</DialogTitle>
              </DialogHeader>
              <ScheduleForm
                onTimeRangeChange={handleTimeRangeChange}
                onDateRangeChange={handleDateRangeChange}
                onProfessionalChange={handleProfessionalChange}
                onSlotDurationChange={handleSlotDurationChange}
                onSubmit={handleGenerateSlots}
                isLoading={createSlotsMutation.isPending}
                onClose={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="w-full"
                locale={ptBR}
                initialFocus
              />
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Horários Disponíveis</CardTitle>
                {selectedDateHasSlots && (
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover Todos
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remover Todos os Horários</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja remover todos os horários do dia {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}?
                          Esta ação não pode ser desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDeleteAllSlots}>
                          Remover Todos
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {isLoadingAvailableSlots ? (
                  <div className="text-center py-8">Carregando horários...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {selectedDate ? "Nenhum horário disponível para esta data." : "Selecione uma data para ver os horários disponíveis."}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <span>{format(new Date(slot.start_time), 'HH:mm')}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="text-center py-8">Carregando agendamentos...</div>
                ) : bookedSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento para esta data.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Horário</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookedSlots.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {format(new Date(appointment.slots.start_time), 'HH:mm')}
                          </TableCell>
                          <TableCell>{appointment.client_name}</TableCell>
                          <TableCell>{appointment.service_name}</TableCell>
                          <TableCell>
                            <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                              {appointment.status === 'confirmed' ? 'Confirmado' : 'Concluído'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Schedule;

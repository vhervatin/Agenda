
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse, addDays, addMinutes } from 'date-fns';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ScheduleForm from '@/components/admin/ScheduleForm';
import { fetchAvailableSlots, createAvailableSlotsBulk, fetchAppointments, fetchProfessionals } from '@/services/api';
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
  const [slots, setSlots] = useState<Slot[]>([]);
  
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
  
  const { data: availableSlotsData = [], isLoading: isLoadingAvailableSlots } = useQuery({
    queryKey: ['availableSlots', formattedDate],
    queryFn: () => fetchAvailableSlots(formattedDate),
    enabled: !!formattedDate
  });
  
  useEffect(() => {
    if (availableSlotsData) {
      // Converta TimeSlot[] para Slot[]
      const convertedSlots: Slot[] = availableSlotsData.map(slot => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available || false
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
      const timeSlots = generateTimeSlots(startTime, endTime, 30);
      
      timeSlots.forEach(time => {
        const startDateTime = parse(`${formattedDate} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
        const endDateTime = addMinutes(startDateTime, 30);
        
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
    queryKey: ['appointments', { date: formattedDate }],
    queryFn: () => fetchAppointments({ queryKey: ['appointments', { date: formattedDate }] }),
    enabled: !!formattedDate
  });
  
  const availableSlots = slots.filter(slot => slot.is_available);
  const bookedSlots = appointments.filter(appointment => 
    appointment.status === 'confirmed' || appointment.status === 'completed'
  );
  
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
                onSubmit={handleGenerateSlots}
                isLoading={createSlotsMutation.isPending}
                onClose={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardContent className="grid gap-6 md:grid-cols-2 p-4 md:p-6">
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[300px] border rounded-md overflow-hidden">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  className="border-0"
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Horários para {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data não selecionada'}
              </h2>
              
              {isLoadingAvailableSlots ? (
                <div className="text-center py-4">Carregando horários...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>
                          {format(new Date(slot.start_time), 'HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Disponível</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {bookedSlots.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {appointment.slots?.start_time && format(new Date(appointment.slots.start_time), 'HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Agendado</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {availableSlots.length === 0 && bookedSlots.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          Nenhum horário disponível para este dia.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Schedule;

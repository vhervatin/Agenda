
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse, addDays, addMinutes, setHours, setMinutes } from 'date-fns';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Calendar as CalendarIcon, X, Filter } from 'lucide-react';
import ScheduleForm from '@/components/admin/ScheduleForm';
import { fetchAvailableSlots, createAvailableSlotsBulk, fetchAppointments, fetchProfessionals, deleteAvailableSlot, deleteAvailableSlotsByDate, fetchConvenios } from '@/services/api';
import { TimeRange, TimeSlot, Convenio } from '@/types/types';
import { ptBR } from 'date-fns/locale';

// Interface para os slots locais
interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  convenio_id?: string | null;
  convenio_nome?: string;
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
  const [convenioFilter, setConvenioFilter] = useState<string | null>(null);
  
  const [professionalId, setProfessionalId] = useState('');
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startHour: '08',
    startMinute: '00',
    endHour: '18',
    endMinute: '00',
  });
  const [selectedConvenioId, setSelectedConvenioId] = useState<string | null>(null);
  
  // Get the date string for the API
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  // Fetch professionals for the form
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals
  });

  // Fetch convenios for filtering
  const { data: convenios = [] } = useQuery({
    queryKey: ['convenios'],
    queryFn: fetchConvenios
  });
  
  const { data: availableSlotsData = [], isLoading: isLoadingAvailableSlots, refetch: refetchSlots } = useQuery({
    queryKey: ['availableSlots', formattedDate, convenioFilter],
    queryFn: () => fetchAvailableSlots(formattedDate),
    enabled: !!formattedDate
  });
  
  useEffect(() => {
    if (availableSlotsData) {
      // Converta TimeSlot[] para Slot[] e aplique filtro por convênio se necessário
      let convertedSlots: Slot[] = availableSlotsData.map(slot => ({
        id: slot.id,
        start_time: slot.start_time || '',
        end_time: slot.end_time || '',
        is_available: slot.is_available || false,
        convenio_id: slot.convenio_id,
        convenio_nome: slot.convenio_nome
      }));

      // Aplicar filtro por convênio se estiver selecionado
      if (convenioFilter) {
        convertedSlots = convertedSlots.filter(slot => 
          convenioFilter === 'none' 
            ? !slot.convenio_id 
            : slot.convenio_id === convenioFilter
        );
      }
      
      setSlots(convertedSlots);
    }
  }, [availableSlotsData, convenioFilter]);
  
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

  const handleConvenioChange = (newConvenioId: string | null) => {
    setSelectedConvenioId(newConvenioId);
  };

  const handleConvenioFilterChange = (value: string) => {
    setConvenioFilter(value === 'all' ? null : value);
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
          is_available: true,
          convenio_id: selectedConvenioId
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
                onConvenioChange={handleConvenioChange}
                onSubmit={handleGenerateSlots}
                isLoading={createSlotsMutation.isPending}
                onClose={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardContent className="grid gap-6 md:grid-cols-2 p-4 md:p-6">
            <div className="w-full flex flex-col gap-4">
              <div className="w-full max-w-[300px] border rounded-md overflow-hidden">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  className="border-0"
                />
              </div>
              
              <div className="w-full max-w-[300px]">
                <Label htmlFor="convenio-filter" className="mb-2 block">Filtrar por convênio</Label>
                <Select
                  value={convenioFilter === null ? 'all' : convenioFilter}
                  onValueChange={handleConvenioFilterChange}
                >
                  <SelectTrigger id="convenio-filter" className="w-full">
                    <SelectValue placeholder="Filtrar por convênio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os convênios</SelectItem>
                    <SelectItem value="none">Sem convênio (Particular)</SelectItem>
                    {convenios.map((convenio) => (
                      <SelectItem key={convenio.id} value={convenio.id}>
                        {convenio.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Horários para {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data não selecionada'}
                </h2>
                
                {selectedDateHasSlots && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir Todos</span>
                  </Button>
                )}
              </div>
              
              {isLoadingAvailableSlots ? (
                <div className="text-center py-4">Carregando horários...</div>
              ) : (
                <>
                  {availableSlots.length === 0 && bookedSlots.length === 0 ? (
                    <Alert className="bg-muted">
                      <CalendarIcon className="h-4 w-4" />
                      <AlertDescription>
                        Nenhum horário disponível para este dia. Use o botão "Gerar Horários" para adicionar vagas.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Horário</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Convênio</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
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
                            <TableCell>
                              {slot.convenio_nome || 'Particular'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="h-8 w-8 text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
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
                            <TableCell>
                              {appointment.convenio_nome || 'Particular'}
                            </TableCell>
                            <TableCell className="text-right">
                              {/* Ações indisponíveis para slots agendados */}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação para excluir todos os horários */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir todos os horários do dia {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : ''}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllSlots}
              disabled={deleteSlotsByDateMutation.isPending}
            >
              {deleteSlotsByDateMutation.isPending ? 'Excluindo...' : 'Excluir Todos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Schedule;

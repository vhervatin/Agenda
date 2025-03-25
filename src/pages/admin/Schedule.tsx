import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { CheckCircle, XCircle, RotateCcw, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isToday, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  fetchAppointments, 
  fetchProfessionals,
  updateAppointmentStatus,
  createAvailableSlotsBulk
} from '@/services/api';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const BulkScheduleFormSchema = z.object({
  professionalId: z.string().min(1, {
    message: "Selecione um profissional",
  }),
  startDate: z.date({
    required_error: "Uma data de início é necessária.",
  }),
  endDate: z.date({
    required_error: "Uma data de término é necessária.",
  }),
  days: z.array(z.number()).refine((value) => value.some((item) => item), {
    message: "Selecione pelo menos um dia.",
  }),
  timeRanges: z.array(
    z.object({
      startHour: z.string().min(1, {
        message: "Hora de início é necessária.",
      }),
      startMinute: z.string().min(1, {
        message: "Minuto de início é necessário.",
      }),
      endHour: z.string().min(1, {
        message: "Hora de término é necessária.",
      }),
      endMinute: z.string().min(1, {
        message: "Minuto de término é necessário.",
      }),
    })
  ).min(1, {
    message: "Adicione pelo menos um horário.",
  }),
});

type BulkScheduleFormValues = z.infer<typeof BulkScheduleFormSchema>;

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const Schedule = () => {
  const queryClient = useQueryClient();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'confirmed' | 'cancelled' | 'completed'>('confirmed');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch professionals
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals
  });
  
  // Fetch appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments
  });
  
  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'confirmed' | 'cancelled' | 'completed' }) => 
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Status atualizado com sucesso');
      setIsStatusDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });
  
  const handleUpdateStatus = () => {
    if (!selectedAppointment) return;
    
    updateStatusMutation.mutate({
      id: selectedAppointment.id,
      status: selectedStatus
    });
  };
  
  const openStatusDialog = (appointment: any, initialStatus: 'confirmed' | 'cancelled' | 'completed') => {
    setSelectedAppointment(appointment);
    setSelectedStatus(initialStatus);
    setIsStatusDialogOpen(true);
  };
  
  // Filter appointments based on selected date and status
  const filteredAppointments = appointments.filter(appointment => {
    if (!appointment.slots?.start_time) return false;
    
    const appointmentDate = new Date(appointment.slots.start_time);
    
    // Apply date filter
    const dateMatch = selectedDate 
      ? appointmentDate.toDateString() === selectedDate.toDateString() 
      : true;
    
    // Apply status filter
    const statusMatch = filterStatus === 'all' || appointment.status === filterStatus;
    
    return dateMatch && statusMatch;
  });
  
  // Group appointments by date
  const appointmentsByDate = filteredAppointments.reduce((acc, appointment) => {
    if (!appointment.slots?.start_time) return acc;
    
    const dateStr = new Date(appointment.slots.start_time).toDateString();
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    
    acc[dateStr].push(appointment);
    return acc;
  }, {} as Record<string, any[]>);
  
  const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  // Get counts of appointments by status
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700';
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Format appointment time
  const formatAppointmentTime = (startTime: string, endTime?: string) => {
    if (!startTime) return '-';
    
    if (endTime) {
      return `${format(new Date(startTime), 'HH:mm')} - ${format(new Date(endTime), 'HH:mm')}`;
    }
    
    return format(new Date(startTime), 'HH:mm');
  };

  const form = useForm<BulkScheduleFormValues>({
    resolver: zodResolver(BulkScheduleFormSchema),
    defaultValues: {
      professionalId: '',
      startDate: new Date(),
      endDate: new Date(),
      days: [],
      timeRanges: [{ startHour: '09', startMinute: '00', endHour: '10', endMinute: '00' }],
    },
  });

  const handleBulkCreate = async (form: BulkScheduleFormValues) => {
    try {
      setSubmitting(true);

      // Ensure all timeRanges have required fields
      const formattedTimeRanges: TimeRange[] = form.timeRanges.map(range => ({
        startHour: range.startHour,
        startMinute: range.startMinute,
        endHour: range.endHour,
        endMinute: range.endMinute
      }));

      const response = await createAvailableSlotsBulk(
        form.professionalId,
        new Date(form.startDate),
        new Date(form.endDate),
        form.days,
        formattedTimeRanges
      );

      toast.success(`${response.count} horários criados com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setBulkModalOpen(false);
    } catch (error: any) {
      toast.error(`Erro ao criar horários: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const refetchSlots = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Agendamentos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold">{confirmedCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold">{cancelledCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-700" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <div className="border rounded-md p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="mx-auto"
                      locale={ptBR}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filter-status">Status</Label>
                  <Select 
                    value={filterStatus} 
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="confirmed">Confirmados</SelectItem>
                      <SelectItem value="completed">Concluídos</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setFilterStatus('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Lista de Agendamentos</CardTitle>
              <CardDescription>
                {selectedDate ? (
                  <span>
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                ) : 'Todos os agendamentos'}
                {filterStatus !== 'all' && (
                  <span> - {
                    filterStatus === 'confirmed' ? 'Confirmados' : 
                    filterStatus === 'completed' ? 'Concluídos' : 'Cancelados'
                  }</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="text-center py-8">Carregando agendamentos...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado com os filtros selecionados.
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedDates.map(dateStr => (
                    <div key={dateStr}>
                      <h3 className="font-medium mb-2 text-muted-foreground">
                        {format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        {isToday(new Date(dateStr)) && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                            Hoje
                          </span>
                        )}
                      </h3>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Horário</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointmentsByDate[dateStr].map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                {appointment.slots && formatAppointmentTime(appointment.slots.start_time, appointment.slots.end_time)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {appointment.client_name}
                              </TableCell>
                              <TableCell>{appointment.client_phone}</TableCell>
                              <TableCell>{appointment.professionals?.name || '-'}</TableCell>
                              <TableCell>{appointment.services?.name || '-'}</TableCell>
                              <TableCell>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                  {getStatusIcon(appointment.status)}
                                  <span className="ml-1">
                                    {appointment.status === 'confirmed' ? 'Confirmado' : 
                                     appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => openStatusDialog(appointment, 
                                    appointment.status as 'confirmed' | 'cancelled' | 'completed'
                                  )}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Button onClick={() => setBulkModalOpen(true)}>Criar Horários em Massa</Button>
      </div>
      
      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status do Agendamento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedAppointment.client_name}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">{selectedAppointment.services?.name || '-'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">
                    {selectedAppointment.slots && (
                      <>
                        {format(new Date(selectedAppointment.slots.start_time), "dd/MM/yyyy HH:mm")}
                        {selectedAppointment.slots.end_time && (
                          <> - {format(new Date(selectedAppointment.slots.end_time), "HH:mm")}</>
                        )}
                      </>
                    )}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={selectedStatus} 
                    onValueChange={(value) => setSelectedStatus(value as 'confirmed' | 'cancelled' | 'completed')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Modal */}
      <Dialog open={isBulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Horários em Massa</DialogTitle>
            <DialogClose className="absolute top-2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleBulkCreate)} className="space-y-8">
              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            {professional.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Data de Início</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={format(field.value, "dd/MM/yyyy") ? "w-full justify-start text-left font-normal" : "w-full justify-start text-left font-normal text-muted-foreground"}
                            >
                              {format(field.value, "dd/MM/yyyy") ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione a data de início</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            locale={ptBR}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              isBefore(date, new Date())
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Data de Término</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={format(field.value, "dd/MM/yyyy") ? "w-full justify-start text-left font-normal" : "w-full justify-start text-left font-normal text-muted-foreground"}
                            >
                              {format(field.value, "dd/MM/yyyy") ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione a data de término</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            locale={ptBR}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              isBefore(date, new Date()) || isBefore(date, form.getValues("startDate"))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias da Semana</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Input
                            type="checkbox"
                            id={`day-${day.value}`}
                            checked={field.value.includes(day.value)}
                            onChange={() => {
                              if (field.value.includes(day.value)) {
                                field.onChange(field.value.filter((v) => v !== day.value));
                              } else {
                                field.onChange([...field.value, day.value]);
                              }
                            }}
                          />
                          <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Horários</FormLabel>
                {form.watch("timeRanges").map((_, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`timeRanges.${index}.startHour`}
                      render={({ field }) => (
                        <FormItem className="w-1/4">
                          <FormLabel>Hora Início</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`timeRanges.${index}.startMinute`}
                      render={({ field }) => (
                        <FormItem className="w-1/4">
                          <FormLabel>Minuto Início</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`timeRanges.${index}.endHour`}
                      render={({ field }) => (
                        <FormItem className="w-1/4">
                          <FormLabel>Hora Fim</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`timeRanges.${index}.endMinute`}
                      render={({ field }) => (
                        <FormItem className="w-1/4">
                          <FormLabel>Minuto Fim</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Criando..." : "Criar Horários"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Schedule;

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
  updateAppointmentStatus
} from '@/services/api';

const AppointmentsAdmin = () => {
  const queryClient = useQueryClient();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'confirmed' | 'cancelled' | 'completed'>('confirmed');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const filters = {
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined
  };
  
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals
  });
  
  const { 
    data: appointments = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['appointments', filters],
    queryFn: fetchAppointments
  });
  
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
  
  const filteredAppointments = appointments.filter(appointment => {
    if (!appointment.slots?.start_time) return false;
    
    const appointmentDate = new Date(appointment.slots.start_time);
    
    const dateMatch = selectedDate 
      ? appointmentDate.toDateString() === selectedDate.toDateString() 
      : true;
    
    const statusMatch = filterStatus === 'all' || appointment.status === filterStatus;
    
    return dateMatch && statusMatch;
  });
  
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
  
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  
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
  
  const formatAppointmentTime = (startTime: string, endTime?: string) => {
    if (!startTime) return '-';
    
    if (endTime) {
      return `${format(new Date(startTime), 'HH:mm')} - ${format(new Date(endTime), 'HH:mm')}`;
    }
    
    return format(new Date(startTime), 'HH:mm');
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
              {isLoading ? (
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
      </div>
      
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
    </AdminLayout>
  );
};

export default AppointmentsAdmin;

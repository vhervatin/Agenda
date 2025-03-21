
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Plus, Scissors } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Professional, Service } from '@/types/types';
import { 
  fetchServices, 
  createService, 
  updateService, 
  deleteService,
  fetchProfessionals,
  fetchProfessionalServices,
  associateProfessionalService,
  dissociateProfessionalService
} from '@/services/api';

const Services = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  
  // Fetch services
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices
  });
  
  // Fetch professionals
  const { data: professionals = [], isLoading: isLoadingProfessionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals
  });
  
  // Create service mutation
  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço cadastrado com sucesso');
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar serviço: ${error.message}`);
    }
  });
  
  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) => 
      updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço atualizado com sucesso');
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar serviço: ${error.message}`);
    }
  });
  
  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço removido com sucesso');
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao remover serviço: ${error.message}`);
    }
  });
  
  // Associate service to professional mutation
  const associateMutation = useMutation({
    mutationFn: ({ professionalId, serviceId }: { professionalId: string; serviceId: string }) => 
      associateProfessionalService(professionalId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionalServices'] });
      toast.success('Serviço associado com sucesso');
      setIsAssociateDialogOpen(false);
      setSelectedProfessionalId('');
      setSelectedServiceId('');
    },
    onError: (error) => {
      toast.error(`Erro ao associar serviço: ${error.message}`);
    }
  });
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setDuration('');
    setPrice('');
    setSelectedService(null);
  };
  
  const handleCreateService = () => {
    if (!name.trim() || !duration || !price) {
      toast.error('Nome, duração e preço são obrigatórios');
      return;
    }
    
    createMutation.mutate({
      name,
      description,
      duration: parseInt(duration),
      price: parseFloat(price),
      active: true
    });
  };
  
  const handleUpdateService = () => {
    if (!selectedService || !name.trim() || !duration || !price) {
      toast.error('Nome, duração e preço são obrigatórios');
      return;
    }
    
    updateMutation.mutate({
      id: selectedService.id,
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price)
      }
    });
  };
  
  const handleDeleteService = () => {
    if (!selectedService) return;
    
    deleteMutation.mutate(selectedService.id);
  };
  
  const handleAssociateService = () => {
    if (!selectedProfessionalId || !selectedServiceId) {
      toast.error('Selecione um profissional e um serviço');
      return;
    }
    
    associateMutation.mutate({
      professionalId: selectedProfessionalId,
      serviceId: selectedServiceId
    });
  };
  
  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setName(service.name);
    setDescription(service.description || '');
    setDuration(service.duration.toString());
    setPrice(service.price.toString());
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };
  
  // Format duration display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  };
  
  // Format price display
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Serviços</h1>
          
          <div className="flex gap-2">
            <Dialog open={isAssociateDialogOpen} onOpenChange={setIsAssociateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Associar Serviço
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Associar Serviço a Profissional</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="professional">Profissional*</Label>
                    <Select 
                      value={selectedProfessionalId} 
                      onValueChange={setSelectedProfessionalId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            {professional.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço*</Label>
                    <Select 
                      value={selectedServiceId} 
                      onValueChange={setSelectedServiceId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAssociateService}
                    disabled={associateMutation.isPending}
                  >
                    {associateMutation.isPending ? 'Associando...' : 'Associar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Novo Serviço
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Serviço</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome*</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Nome do serviço" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Descrição do serviço" 
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (minutos)*</Label>
                      <Input 
                        id="duration" 
                        type="number" 
                        value={duration} 
                        onChange={(e) => setDuration(e.target.value)} 
                        placeholder="30" 
                        min="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$)*</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        placeholder="50.00" 
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleCreateService}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Serviços</CardTitle>
            <CardDescription>
              Gerenciar serviços disponíveis para agendamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingServices ? (
              <div className="text-center py-8">Carregando serviços...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum serviço cadastrado. Clique em "Novo Serviço" para adicionar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{formatDuration(service.duration)}</TableCell>
                      <TableCell>{formatPrice(service.price)}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {service.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => openDeleteDialog(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome*</Label>
              <Input 
                id="edit-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nome do serviço" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea 
                id="edit-description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Descrição do serviço" 
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duração (minutos)*</Label>
                <Input 
                  id="edit-duration" 
                  type="number" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)} 
                  placeholder="30" 
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço (R$)*</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="50.00" 
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateService}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja remover o serviço{' '}
              <span className="font-semibold">{selectedService?.name}</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação irá desativar o serviço. Todos os agendamentos existentes serão mantidos.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteService}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Services;

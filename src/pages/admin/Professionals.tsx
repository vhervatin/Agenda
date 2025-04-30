
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Professional } from '@/types/types';
import { fetchProfessionals, createProfessional, updateProfessional, deleteProfessional } from '@/services/api';

const Professionals = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setMail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // Fetch professionals
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals
  });
  
  // Create professional mutation
  const createMutation = useMutation({
    mutationFn: createProfessional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Profissional cadastrado com sucesso');
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar profissional: ${error.message}`);
    }
  });
  
  // Update professional mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Professional> }) => 
      updateProfessional(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Profissional atualizado com sucesso');
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar profissional: ${error.message}`);
    }
  });
  
  // Delete professional mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProfessional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Profissional removido com sucesso');
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao remover profissional: ${error.message}`);
    }
  });
  
  const resetForm = () => {
    setName('');
    setBio('');
    setMail('');
    setPhone('');
    setPhotoUrl('');
    setSelectedProfessional(null);
  };
  
  const handleCreateProfessional = () => {
    if (!name.trim()) {
      toast.error('O nome do profissional é obrigatório');
      return;
    }
    
    createMutation.mutate({
      name,
      bio,
      email,
      photo_url: photoUrl,
      phone, // This now matches our updated type
      active: true
    });
  };
  
  const handleUpdateProfessional = () => {
    if (!selectedProfessional || !name.trim()) {
      toast.error('O nome do profissional é obrigatório');
      return;
    }
    
    updateMutation.mutate({
      id: selectedProfessional.id,
      data: {
        name,
        bio,
        email,
        photo_url: photoUrl,
        phone // This now matches our updated type
      }
    });
  };
  
  const handleDeleteProfessional = () => {
    if (!selectedProfessional) return;
    
    deleteMutation.mutate(selectedProfessional.id);
  };
  
  const openEditDialog = (professional: Professional) => {
    setSelectedProfessional(professional);
    setName(professional.name);
    setBio(professional.bio || '');
    setPhone(professional.phone || '');
    setMail(professional.email || '');
    setPhotoUrl(professional.photo_url || '');
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Profissionais</h1>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Novo Profissional
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Profissional</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome*</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Nome do profissional" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="(00) 00000-0000" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mail">E-mail</Label>
                  <Input 
                    id="mail" 
                    value={email} 
                    onChange={(e) => setMail(e.target.value)} 
                    placeholder="xxxx@xxxxx.com" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Uma breve descrição sobre o profissional" 
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="photo">URL da Foto</Label>
                  <Input 
                    id="photo" 
                    value={photoUrl} 
                    onChange={(e) => setPhotoUrl(e.target.value)} 
                    placeholder="https://exemplo.com/foto.jpg" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateProfessional}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>
              Gerenciar profissionais disponíveis para agendamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando profissionais...</div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum profissional cadastrado. Clique em "Novo Profissional" para adicionar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Biografia</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals.map((professional) => (
                    <TableRow key={professional.id}>
                      <TableCell className="font-medium">{professional.name}</TableCell>
                      <TableCell>{professional.phone || '-'}</TableCell>
                      <TableCell>{professional.email || '-'}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {professional.bio || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(professional)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => openDeleteDialog(professional)}
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
      
      {/* Edit Professional Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Profissional</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome*</Label>
              <Input 
                id="edit-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nome do profissional" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input 
                id="edit-phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="(00) 00000-0000" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mail">E-mail</Label>
              <Input 
                id="edit-mail" 
                value={email} 
                onChange={(e) => setMail(e.target.value)} 
                placeholder="xxxx@xxxxx.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Biografia</Label>
              <Textarea 
                id="edit-bio" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Uma breve descrição sobre o profissional" 
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-photo">URL da Foto</Label>
              <Input 
                id="edit-photo" 
                value={photoUrl} 
                onChange={(e) => setPhotoUrl(e.target.value)} 
                placeholder="https://exemplo.com/foto.jpg" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateProfessional}
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
              Tem certeza que deseja remover o profissional{' '}
              <span className="font-semibold">{selectedProfessional?.name}</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação irá desativar o profissional. Todos os agendamentos existentes serão mantidos.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProfessional}
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

export default Professionals;


import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import ConvenioForm from '@/components/admin/ConvenioForm';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchConvenios, deleteConvenio } from '@/services/api';

const Convenios = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: convenios = [], isLoading, error } = useQuery({
    queryKey: ['convenios'],
    queryFn: fetchConvenios
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['convenios'] });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConvenio(id);
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      toast.success('Convênio removido com sucesso');
    } catch (error) {
      console.error('Error deleting convenio:', error);
      toast.error('Erro ao remover convênio');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Convênios</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Novo Convênio</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Convênio</DialogTitle>
              </DialogHeader>
              <ConvenioForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Convênios</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Carregando convênios...</div>
            ) : error ? (
              <div className="text-center text-destructive py-4">Erro ao carregar convênios</div>
            ) : convenios.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Nenhum convênio cadastrado. Use o botão "Novo Convênio" para adicionar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convenios.map((convenio) => (
                    <TableRow key={convenio.id}>
                      <TableCell>{convenio.nome}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(convenio.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Convenios;

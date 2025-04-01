import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SuperAdminLayout from '@/components/admin/SuperAdminLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  createCompany,
  fetchCompanies,
} from '@/services/api';

const Companies = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    slug: '',
    primary_color: '#663399',
    secondary_color: '#FFA500'
  });

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  });

  const createCompanyMutation = useMutation({
    mutationFn: (company: {
      name: string;
      slug: string;
      logo_url?: string;
      primary_color: string;
      secondary_color: string;
      plan?: string;
      plan_value?: number;
      plan_expiry_date?: string;
      is_active?: boolean;
    }) => createCompany(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsAddDialogOpen(false);
      setNewCompany({
        name: '',
        slug: '',
        primary_color: '#663399',
        secondary_color: '#FFA500'
      });
      toast.success('Empresa criada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar empresa: ${error.message}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCompany({ ...newCompany, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompanyMutation.mutate(newCompany);
  };

  return (
    <SuperAdminLayout>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Empresas</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>Adicionar Empresa</Button>
        </div>

        <Table>
          <TableCaption>Lista de empresas cadastradas no sistema.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Nenhuma empresa encontrada.</TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.slug}</TableCell>
                  <TableCell>{format(new Date(company.created_at || ''), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Empresa</DialogTitle>
              <DialogDescription>
                Crie uma nova empresa para começar a gerenciar agendamentos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={newCompany.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  type="text"
                  id="slug"
                  name="slug"
                  value={newCompany.slug}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="primary_color" className="text-right">
                  Cor Primária
                </Label>
                <Input
                  type="color"
                  id="primary_color"
                  name="primary_color"
                  value={newCompany.primary_color}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="secondary_color" className="text-right">
                  Cor Secundária
                </Label>
                <Input
                  type="color"
                  id="secondary_color"
                  name="secondary_color"
                  value={newCompany.secondary_color}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  {createCompanyMutation.isPending ? 'Criando...' : 'Criar Empresa'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
};

export default Companies;

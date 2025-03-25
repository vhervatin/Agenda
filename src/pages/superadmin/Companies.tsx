import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SuperAdminLayout from '@/components/admin/SuperAdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  fetchCompanies, 
  createCompany, 
  updateCompany,
  createUserForCompany
} from '@/services/api';
import { Company } from '@/types/types';

const Companies = () => {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Zod schema for company form
  const companyFormSchema = z.object({
    name: z.string().min(2, {
      message: "O nome da empresa deve ter pelo menos 2 caracteres.",
    }),
    slug: z.string().optional(),
    logo_url: z.string().url("URL inválida").optional(),
    primary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Cor primária inválida").optional(),
    secondary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Cor secundária inválida").optional(),
    plan: z.string().optional(),
    plan_value: z.number().optional(),
    plan_expiry_date: z.string().optional(),
    is_active: z.boolean().default(true).optional(),
  });
  
  // React Hook Form for company creation/edition
  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo_url: "",
      primary_color: "",
      secondary_color: "",
      plan: "",
      plan_value: 0,
      plan_expiry_date: "",
      is_active: true,
    },
  });
  
  // Zod schema for user form
  const userFormSchema = z.object({
    name: z.string().min(2, {
      message: "O nome do usuário deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
      message: "Email inválido.",
    }),
  });
  
  // React Hook Form for user creation
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  
  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  });
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => createCompany(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa criada com sucesso!');
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Erro ao criar empresa: ${error.message}`);
    },
  });
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, company }: { id: string, company: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>> }) => 
      updateCompany(id, company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa atualizada com sucesso!');
      setIsEditDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar empresa: ${error.message}`);
    },
  });
  
  // Create user for company mutation
  const createUserMutation = useMutation({
    mutationFn: ({ user, companyId }: { user: Omit<any, 'id' | 'created_at' | 'updated_at'>, companyId: string }) => 
      createUserForCompany(user, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Usuário criado com sucesso!');
      setCreateUserDialogOpen(false);
      userForm.reset();
    },
    onError: (error) => {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    },
  });
  
  // Handlers
  const handleCreateCompanySubmit = async (values: z.infer<typeof companyFormSchema>) => {
    try {
      setIsSaving(true);
      await createCompanyMutation.mutateAsync(values);
    } catch (error) {
      console.error("Error creating company:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditCompanySubmit = async (values: z.infer<typeof companyFormSchema>) => {
    if (!selectedCompany) return;
    try {
      setIsSaving(true);
      await updateCompanyMutation.mutateAsync({ id: selectedCompany.id, company: values });
    } catch (error) {
      console.error("Error updating company:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fix the createUserForCompany function call to include both required arguments
  const handleCreateUserSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      setIsCreatingUser(true);
      
      // Create user with company association
      await createUserForCompany(
        {
          name: data.name,
          email: data.email,
          role: "admin",
          tipo_usuario: "admin"
        },
        selectedCompany.id
      );
      
      toast.success("Usuário criado com sucesso!");
      setCreateUserDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    } finally {
      setIsCreatingUser(false);
    }
  };
  
  return (
    <SuperAdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Empresas</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Criar Empresa
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
            <CardDescription>
              Gerencie as empresas cadastradas no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando empresas...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[200px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.slug}</TableCell>
                      <TableCell>{company.is_active ? 'Ativa' : 'Inativa'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            form.reset({
                              name: company.name,
                              slug: company.slug,
                              logo_url: company.logo_url || "",
                              primary_color: company.primary_color || "",
                              secondary_color: company.secondary_color || "",
                              plan: company.plan || "",
                              plan_value: company.plan_value || 0,
                              plan_expiry_date: company.plan_expiry_date || "",
                              is_active: company.is_active || true,
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => {
                            setSelectedCompany(company);
                            setCreateUserDialogOpen(true);
                          }}
                        >
                          Criar Usuário
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
      
      {/* Create Company Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Empresa</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar uma nova empresa.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateCompanySubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="Slug da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input placeholder="URL do logo da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Primária</FormLabel>
                    <FormControl>
                      <Input placeholder="#000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Secundária</FormLabel>
                    <FormControl>
                      <Input placeholder="#FFFFFF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Edite os campos abaixo para atualizar a empresa.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditCompanySubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="Slug da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input placeholder="URL do logo da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Primária</FormLabel>
                    <FormControl>
                      <Input placeholder="#000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Secundária</FormLabel>
                    <FormControl>
                      <Input placeholder="#FFFFFF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Usuário para {selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar um novo usuário para a empresa selecionada.
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(handleCreateUserSubmit)} className="space-y-4 py-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isCreatingUser}>
                  {isCreatingUser ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default Companies;

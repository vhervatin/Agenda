import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import DatePicker from '@/components/DatePicker';
import {
  Building2,
  PlusCircle,
  Edit,
  Trash2,
  Globe,
  Calendar as CalendarIcon,
  DollarSign,
  Palette,
  Image
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormDescription, FormLabel, FormMessage } from '@/components/ui/form';
import { fetchCompanies, createCompany, updateCompany } from '@/services/api';
import { Company } from '@/types/types';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Import SuperAdminLayout from Dashboard.tsx
import SuperAdminDashboard from './Dashboard';

// Re-define SuperAdminLayout type for this file
type SuperAdminLayoutProps = React.ComponentProps<typeof SuperAdminDashboard>;
const SuperAdminLayout: React.FC<{ children: React.ReactNode, title?: string }> = (props) => {
  // @ts-ignore - TypeScript doesn't know about the Dashboard component structure
  const DashboardComponent = SuperAdminDashboard as any;
  // Extract the layout component from Dashboard
  return DashboardComponent.type.type.render(props);
};

// Create a schema for company creation
const companySchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  slug: z.string()
    .min(3, { message: 'Slug deve ter pelo menos 3 caracteres' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug deve conter apenas letras minúsculas, números e hífens' }),
  logo_url: z.string().optional(),
  primary_color: z.string().default('#663399'),
  secondary_color: z.string().default('#FFA500'),
  plan: z.enum(['basic', 'premium', 'enterprise']).default('basic'),
  plan_value: z.coerce.number().min(0).default(0),
  plan_expiry_date: z.date().optional(),
  is_active: z.boolean().default(true)
});

type CompanyFormValues = z.infer<typeof companySchema>;

const PLANS = [
  { value: 'basic', label: 'Básico', description: 'Plano básico com funcionalidades essenciais', price: 49.90 },
  { value: 'premium', label: 'Premium', description: 'Plano premium com funcionalidades avançadas', price: 99.90 },
  { value: 'enterprise', label: 'Enterprise', description: 'Plano empresarial com suporte dedicado', price: 199.90 }
];

const Companies = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Form
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      slug: '',
      logo_url: '',
      primary_color: '#663399',
      secondary_color: '#FFA500',
      plan: 'basic',
      plan_value: 49.90,
      is_active: true
    }
  });
  
  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  });
  
  // Create company mutation
  const createMutation = useMutation({
    mutationFn: (company: Partial<Company>) => createCompany(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast.success('Empresa criada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar empresa: ${error.message}`);
    }
  });
  
  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, company }: { id: string; company: Partial<Company> }) => 
      updateCompany(id, company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsEditDialogOpen(false);
      toast.success('Empresa atualizada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar empresa: ${error.message}`);
    }
  });
  
  // Delete company mutation (soft delete by setting is_active = false)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => updateCompany(id, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsDeleteDialogOpen(false);
      toast.success('Empresa desativada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao desativar empresa: ${error.message}`);
    }
  });
  
  const onSubmit = (data: CompanyFormValues) => {
    // Format the data for API
    const companyData: Partial<Company> = {
      ...data,
      plan_expiry_date: data.plan_expiry_date ? data.plan_expiry_date.toISOString() : undefined
    };
    
    createMutation.mutate(companyData);
  };
  
  const onEdit = (data: CompanyFormValues) => {
    if (!selectedCompany) return;
    
    // Format the data for API
    const companyData: Partial<Company> = {
      ...data,
      plan_expiry_date: data.plan_expiry_date ? data.plan_expiry_date.toISOString() : undefined
    };
    
    updateMutation.mutate({ id: selectedCompany.id, company: companyData });
  };
  
  const handleDelete = () => {
    if (!selectedCompany) return;
    deleteMutation.mutate(selectedCompany.id);
  };
  
  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    
    // Set form values
    form.reset({
      name: company.name,
      slug: company.slug,
      logo_url: company.logo_url || '',
      primary_color: company.primary_color || '#663399',
      secondary_color: company.secondary_color || '#FFA500',
      plan: (company.plan as any) || 'basic',
      plan_value: company.plan_value || 0,
      plan_expiry_date: company.plan_expiry_date ? new Date(company.plan_expiry_date) : undefined,
      is_active: company.is_active !== false
    });
    
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };
  
  const handlePlanChange = (value: string) => {
    const plan = PLANS.find(p => p.value === value);
    if (plan) {
      form.setValue('plan_value', plan.price);
    }
  };
  
  const generateRandomSlug = () => {
    const companyName = form.getValues('name');
    if (!companyName) {
      toast.error('Preencha o nome da empresa primeiro');
      return;
    }
    
    const baseSlug = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check if slug already exists
    const slugExists = companies.some(c => c.slug === baseSlug);
    
    if (slugExists) {
      const randomPart = Math.floor(Math.random() * 1000);
      form.setValue('slug', `${baseSlug}-${randomPart}`);
    } else {
      form.setValue('slug', baseSlug);
    }
  };
  
  return (
    <SuperAdminLayout title="Empresas">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas na plataforma
          </p>
        </div>
        <Button onClick={() => {
          form.reset({
            name: '',
            slug: '',
            logo_url: '',
            primary_color: '#663399',
            secondary_color: '#FFA500',
            plan: 'basic',
            plan_value: 49.90,
            plan_expiry_date: addMonths(new Date(), 1),
            is_active: true
          });
          setIsAddDialogOpen(true);
        }}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Empresas</CardTitle>
          <CardDescription>
            Lista de empresas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando empresas...</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Nenhuma empresa cadastrada.</p>
              <p className="text-sm mt-2">
                Comece cadastrando uma nova empresa usando o botão acima.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name} 
                            className="h-6 w-6 rounded object-cover"
                          />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{company.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{company.plan || 'basic'}</span>
                    </TableCell>
                    <TableCell>
                      R$ {company.plan_value?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      {company.plan_expiry_date ? (
                        format(new Date(company.plan_expiry_date), 'dd/MM/yyyy')
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={company.is_active} 
                          onCheckedChange={() => 
                            updateMutation.mutate({ 
                              id: company.id, 
                              company: { is_active: !company.is_active } 
                            })
                          }
                          disabled={updateMutation.isPending}
                        />
                        <span className={company.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                          {company.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openDeleteDialog(company)}
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
      
      {/* Add Company Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="info">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="appearance">Aparência</TabsTrigger>
                  <TabsTrigger value="plan">Plano</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="empresa-slug" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL única da empresa: app.seudominio.com/{field.value}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateRandomSlug}
                    >
                      Gerar
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Logo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL da imagem do logo da empresa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 rounded-md border p-3">
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Empresa ativa e disponível para acesso
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primary_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Primária</FormLabel>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-8 w-8 rounded-full border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Cor principal da marca
                          </FormDescription>
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
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-8 w-8 rounded-full border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Cor de destaque secundária
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <Label>Prévia</Label>
                    <div className="mt-2 border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ 
                            backgroundColor: form.getValues('primary_color'),
                            color: 'white'
                          }}>
                            <Building2 className="h-4 w-4" />
                          </div>
                          <span className="font-semibold">{form.getValues('name') || 'Nome da Empresa'}</span>
                        </div>
                        <Button style={{ 
                          backgroundColor: form.getValues('primary_color'),
                          color: 'white'
                        }}>
                          Agendar
                        </Button>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="border rounded-md p-2 text-center">Serviço 1</div>
                        <div className="border rounded-md p-2 text-center" style={{ 
                          backgroundColor: form.getValues('primary_color'),
                          color: 'white'
                        }}>Serviço 2</div>
                        <div className="border rounded-md p-2 text-center">Serviço 3</div>
                      </div>
                      <div className="mt-4">
                        <div className="h-4 w-24 rounded" style={{ backgroundColor: form.getValues('secondary_color') }}></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="plan" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handlePlanChange(value);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PLANS.map(plan => (
                              <SelectItem key={plan.value} value={plan.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="capitalize">{plan.label}</span>
                                  <span className="text-muted-foreground">
                                    R$ {plan.price.toFixed(2)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {PLANS.find(p => p.value === field.value)?.description || 'Selecione um plano'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plan_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Plano (R$)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="number" step="0.01" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Valor mensal cobrado da empresa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plan_expiry_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Expiração</FormLabel>
                        <FormControl>
                          <div className="border rounded-md p-2">
                            <DatePicker
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              locale={ptBR}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Data em que o plano expirará
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Criando...' : 'Criar Empresa'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEdit)} className="space-y-6">
              <Tabs defaultValue="info">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="appearance">Aparência</TabsTrigger>
                  <TabsTrigger value="plan">Plano</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="empresa-slug" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL única da empresa: app.seudominio.com/{field.value}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateRandomSlug}
                    >
                      Gerar
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Logo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL da imagem do logo da empresa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 rounded-md border p-3">
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Empresa ativa e disponível para acesso
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primary_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Primária</FormLabel>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-8 w-8 rounded-full border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Cor principal da marca
                          </FormDescription>
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
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-8 w-8 rounded-full border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Cor de destaque secundária
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <Label>Prévia</Label>
                    <div className="mt-2 border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ 
                            backgroundColor: form.getValues('primary_color'),
                            color: 'white'
                          }}>
                            <Building2 className="h-4 w-4" />
                          </div>
                          <span className="font-semibold">{form.getValues('name') || 'Nome da Empresa'}</span>
                        </div>
                        <Button style={{ 
                          backgroundColor: form.getValues('primary_color'),
                          color: 'white'
                        }}>
                          Agendar
                        </Button>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="border rounded-md p-2 text-center">Serviço 1</div>
                        <div className="border rounded-md p-2 text-center" style={{ 
                          backgroundColor: form.getValues('primary_color'),
                          color: 'white'
                        }}>Serviço 2</div>
                        <div className="border rounded-md p-2 text-center">Serviço 3</div>
                      </div>
                      <div className="mt-4">
                        <div className="h-4 w-24 rounded" style={{ backgroundColor: form.getValues('secondary_color') }}></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="plan" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handlePlanChange(value);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PLANS.map(plan => (
                              <SelectItem key={plan.value} value={plan.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="capitalize">{plan.label}</span>
                                  <span className="text-muted-foreground">
                                    R$ {plan.price.toFixed(2)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {PLANS.find(p => p.value === field.value)?.description || 'Selecione um plano'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plan_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Plano (R$)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="number" step="0.01" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Valor mensal cobrado da empresa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plan_expiry_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Expiração</FormLabel>
                        <FormControl>
                          <div className="border rounded-md p-2">
                            <DatePicker
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              locale={ptBR}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Data em que o plano expirará
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Atualizando...' : 'Atualizar Empresa'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Desativação</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja desativar a empresa {selectedCompany?.name}?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              A empresa será marcada como inativa e não poderá ser acessada pelos usuários.
              Essa ação pode ser revertida posteriormente.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Desativando...' : 'Desativar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default Companies;

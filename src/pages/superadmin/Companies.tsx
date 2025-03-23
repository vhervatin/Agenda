
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCompanies, createCompany, updateCompany, createUserForCompany } from '@/services/api';
import { 
  Building2, 
  Pencil, 
  Check, 
  X, 
  CalendarIcon, 
  Hash, 
  CreditCard, 
  Mail, 
  Phone, 
  PlusCircle, 
  Loader2,
  CalendarDays,
  Upload,
  UserIcon,
  Lock
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Company } from '@/types/types';

const Companies = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();
  
  const { 
    data: companies = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  });
  
  const createCompanyMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsCreateDialogOpen(false);
      toast.success('Empresa criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar empresa: ${error.message || 'Unknown error'}`);
    }
  });
  
  const updateCompanyMutation = useMutation({
    mutationFn: (updates: { id: string; company: Partial<Company> }) => 
      updateCompany(updates.id, updates.company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsEditDialogOpen(false);
      toast.success('Empresa atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar empresa: ${error.message || 'Unknown error'}`);
    }
  });
  
  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };
  
  const handleOpenEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedCompany(null);
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Carregando empresas...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">Erro ao carregar empresas.</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>Gerencie as empresas cadastradas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Ativa</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.slug}</TableCell>
                  <TableCell>{company.plan || 'Básico'}</TableCell>
                  <TableCell>
                    {company.is_active ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenEditDialog(company)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <CompanyFormDialog 
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        createCompanyMutation={createCompanyMutation}
      />
      
      {selectedCompany && (
        <CompanyEditDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          company={selectedCompany}
          updateCompanyMutation={updateCompanyMutation}
        />
      )}
    </div>
  );
};

interface CompanyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  createCompanyMutation: any;
}

const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({ isOpen, onClose, createCompanyMutation }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [plan, setPlan] = useState('');
  const [planValue, setPlanValue] = useState(0);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error('Por favor, preencha os campos obrigatórios da empresa.');
      return;
    }
    
    if (!adminEmail || !adminPassword) {
      toast.error('Por favor, forneça o email e senha do administrador da empresa.');
      return;
    }
    
    if (adminPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setIsSubmitting(true);
    
    const companyData: Partial<Company> = {
      name,
      slug,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      plan,
      plan_value: planValue,
      plan_expiry_date: expiryDate ? expiryDate.toISOString() : null,
      is_active: isActive,
    };
    
    try {
      // First create the company
      const createdCompany = await createCompanyMutation.mutateAsync(companyData);
      
      // Then create the admin user for this company
      await createUserForCompany({
        email: adminEmail,
        password: adminPassword,
        name: `Admin ${name}`,
        companyId: createdCompany.id,
        role: 'admin'
      });
      
      onClose();
      toast.success('Empresa e usuário administrador criados com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao criar empresa: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Empresa</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar uma nova empresa.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="company">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="admin">Administrador</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome*</Label>
                <Input
                  id="name"
                  placeholder="Nome da empresa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug*</Label>
                <Input
                  id="slug"
                  placeholder="Slug da empresa"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL do Logo</Label>
                <Input
                  id="logoUrl"
                  placeholder="URL do logo da empresa"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <Input
                  id="primaryColor"
                  placeholder="Cor primária da empresa"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <Input
                  id="secondaryColor"
                  placeholder="Cor secundária da empresa"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planValue">Valor do Plano</Label>
                <Input
                  id="planValue"
                  type="number"
                  placeholder="Valor do plano"
                  value={planValue}
                  onChange={(e) => setPlanValue(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Data de Expiração do Plano</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!expiryDate && 'text-muted-foreground'}`}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isActive">Ativa</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email do Administrador*</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@empresa.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha do Administrador*</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Senha"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">A senha deve ter pelo menos 6 caracteres</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Criando...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Criar Empresa'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CompanyEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  updateCompanyMutation: any;
}

const CompanyEditDialog: React.FC<CompanyEditDialogProps> = ({ isOpen, onClose, company, updateCompanyMutation }) => {
  const [name, setName] = useState(company.name);
  const [slug, setSlug] = useState(company.slug);
  const [logoUrl, setLogoUrl] = useState(company.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(company.primary_color || '');
  const [secondaryColor, setSecondaryColor] = useState(company.secondary_color || '');
  const [plan, setPlan] = useState(company.plan || '');
  const [planValue, setPlanValue] = useState(company.plan_value || 0);
  const [expiryDate, setExpiryDate] = useState<Date | null>(company.plan_expiry_date ? new Date(company.plan_expiry_date) : null);
  const [isActive, setIsActive] = useState(company.is_active !== undefined ? company.is_active : true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    setName(company.name);
    setSlug(company.slug);
    setLogoUrl(company.logo_url || '');
    setPrimaryColor(company.primary_color || '');
    setSecondaryColor(company.secondary_color || '');
    setPlan(company.plan || '');
    setPlanValue(company.plan_value || 0);
    setExpiryDate(company.plan_expiry_date ? new Date(company.plan_expiry_date) : null);
    setIsActive(company.is_active !== undefined ? company.is_active : true);
  }, [company]);
  
  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    
    const companyData: Partial<Company> = {
      name,
      slug,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      plan,
      plan_value: planValue,
      plan_expiry_date: expiryDate ? expiryDate.toISOString() : null,
      is_active: isActive,
    };
    
    try {
      await updateCompanyMutation.mutateAsync({ id: company.id, company: companyData });
      onClose();
      toast.success('Empresa atualizada com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao atualizar empresa: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>
            Edite os campos abaixo para atualizar a empresa.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome da empresa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Slug da empresa"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL do Logo</Label>
                <Input
                  id="logoUrl"
                  placeholder="URL do logo da empresa"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <Input
                  id="primaryColor"
                  placeholder="Cor primária da empresa"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <Input
                  id="secondaryColor"
                  placeholder="Cor secundária da empresa"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planValue">Valor do Plano</Label>
                <Input
                  id="planValue"
                  type="number"
                  placeholder="Valor do plano"
                  value={planValue}
                  onChange={(e) => setPlanValue(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Data de Expiração do Plano</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!expiryDate && 'text-muted-foreground'}`}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isActive">Ativa</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Atualizando...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Atualizar Empresa'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Companies;

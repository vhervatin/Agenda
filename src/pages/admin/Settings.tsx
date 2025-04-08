import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createCompanySettings, fetchCompanySettings, updateCompanySettings } from '@/services/api';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da empresa deve ter pelo menos 2 caracteres.",
  }),
  slug: z.string().min(2, {
    message: "O slug deve ter pelo menos 2 caracteres.",
  }),
  logo_url: z.string().optional(),
  primary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, {
    message: "A cor primária deve ser um código hexadecimal válido.",
  }),
  secondary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, {
    message: "A cor secundária deve ser um código hexadecimal válido.",
  }),
});

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  
  const { 
    data: companySettings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['company-settings'],
    queryFn: fetchCompanySettings,
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: companySettings?.name || "",
      slug: companySettings?.slug || "",
      logo_url: companySettings?.logo_url || "",
      primary_color: companySettings?.primary_color || "#000000",
      secondary_color: companySettings?.secondary_color || "#000000",
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    if (companySettings) {
      form.reset(companySettings);
    }
  }, [companySettings, form]);
  
  const handleCreateSettings = async () => {
    try {
      setSubmitting(true);
      
      const settingsData = {
        name: form.getValues('name'),
        slug: form.getValues('slug'),
        logo_url: form.getValues('logo_url'),
        primary_color: form.getValues('primary_color'),
        secondary_color: form.getValues('secondary_color')
      };
      
      const result = await createCompanySettings(settingsData);
      
      if (result) {
        toast.success('Configurações da empresa criadas com sucesso');
        queryClient.invalidateQueries({ queryKey: ['company-settings'] });
        setActiveTab('customize');
      }
    } catch (error: any) {
      toast.error(`Erro ao criar configurações: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleUpdateSettings = async () => {
    if (!companySettings) return;
    
    try {
      setSubmitting(true);
      
      const settingsData = {
        id: companySettings.id,
        name: form.getValues('name'),
        slug: form.getValues('slug'),
        logo_url: form.getValues('logo_url'),
        primary_color: form.getValues('primary_color'),
        secondary_color: form.getValues('secondary_color')
      };
      
      const result = await updateCompanySettings(settingsData);
      
      if (result) {
        toast.success('Configurações atualizadas com sucesso');
        queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      }
    } catch (error: any) {
      toast.error(`Erro ao atualizar configurações: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (companySettings) {
      await handleUpdateSettings();
    } else {
      await handleCreateSettings();
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-4 md:p-6 overflow-x-hidden">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Configurações da Empresa</h1>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="w-full overflow-x-auto flex">
            <TabsTrigger value="general" className="flex-1">Geral</TabsTrigger>
            <TabsTrigger value="customize" disabled={!companySettings} className="flex-1">
              Personalização
              {!companySettings && (
                <AlertTriangle className="ml-1 h-4 w-4" />
              )}
            </TabsTrigger>
            <TabsTrigger value="convenios" className="flex-1">
              Convênios
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Empresa</CardTitle>
                <CardDescription>
                  Informações básicas sobre a sua empresa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Carregando...</p>
                ) : error ? (
                  <p className="text-red-500">Erro ao carregar as configurações.</p>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Empresa</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da Empresa" {...field} />
                            </FormControl>
                            <FormDescription>
                              Este é o nome que seus clientes verão.
                            </FormDescription>
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
                              <Input placeholder="Slug" {...field} />
                            </FormControl>
                            <FormDescription>
                              O slug é usado na URL da sua empresa.
                            </FormDescription>
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
                              <Input placeholder="URL do Logo" {...field} />
                            </FormControl>
                            <FormDescription>
                              URL para o logo da sua empresa.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                        {submitting
                          ? 'Salvando...'
                          : companySettings
                            ? 'Atualizar'
                            : 'Salvar'}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personalização</CardTitle>
                <CardDescription>
                  Altere as cores da sua empresa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Carregando...</p>
                ) : error ? (
                  <p className="text-red-500">Erro ao carregar as configurações.</p>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="primary_color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Primária</FormLabel>
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                            <FormDescription>
                              A cor primária da sua empresa.
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
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                            <FormDescription>
                              A cor secundária da sua empresa.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                        {submitting
                          ? 'Salvando...'
                          : companySettings
                            ? 'Atualizar'
                            : 'Salvar'}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="convenios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Convênios</CardTitle>
                <CardDescription>
                  Gerencie os convênios disponíveis para agendamentos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Link to="/admin/convenios">
                    <Button className="w-full md:w-auto">
                      Acessar Gerenciamento de Convênios
                    </Button>
                  </Link>
                </div>
                <p className="text-muted-foreground text-sm">
                  Utilize esta área para cadastrar, editar e excluir convênios que serão usados na agenda.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  fetchCompanySettings,
  updateCompanySettings,
  createCompanySettings
} from '@/services/api';

const settingsSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da empresa deve ter pelo menos 2 caracteres.",
  }),
  slug: z.string().optional(),
  logo_url: z.string().url("URL inválida").optional(),
  primary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, {
    message: "Cor primária inválida. Use um código hexadecimal (ex: #FFFFFF).",
  }),
  secondary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, {
    message: "Cor secundária inválida. Use um código hexadecimal (ex: #000000).",
  }),
});

const Settings = () => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);

  const { data: companyData, isLoading } = useQuery({
    queryKey: ['companySettings'],
    queryFn: fetchCompanySettings,
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: companyData?.name || "",
      slug: companyData?.slug || "",
      logo_url: companyData?.logo_url || "",
      primary_color: companyData?.primary_color || "#000000",
      secondary_color: companyData?.secondary_color || "#FFFFFF",
    },
    mode: "onChange",
  });

  const handleSaveSettings = async (data: z.infer<typeof settingsSchema>) => {
    try {
      setIsSaving(true);
      
      const settings = {
        ...data,
        slug: data.slug.toLowerCase()
      };
      
      let updatedSettings;
      
      if (companyData?.id) {
        // If company exists, update it
        updatedSettings = await updateCompanySettings({
          ...settings,
          id: companyData.id
        });
        toast.success('Configurações atualizadas com sucesso!');
      } else {
        // If company doesn't exist, create it
        updatedSettings = await createCompanySettings(settings);
        toast.success('Configurações criadas com sucesso!');
      }
      
      // Refetch data if it was successful
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
    } catch (error: any) {
      toast.error(`Erro ao salvar configurações: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveForm = async (data: z.infer<typeof settingsSchema>) => {
    try {
      setIsSaving(true);
      
      // Ensure we have a slug - generate one from name if not provided
      const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');
      
      await createCompanySettings({
        ...data,
        slug
      });
      
      toast.success('Configurações criadas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(`Erro ao criar configurações: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    
    try {
      // Ensure all required fields are present
      const companyData = {
        name: formData.name || 'My Company', // Provide default values for required fields
        slug: formData.slug,
        logo_url: formData.logo_url,
        primary_color: formData.primary_color || '#663399',
        secondary_color: formData.secondary_color || '#FFA500'
      };
      
      const result = await createCompanySettings(companyData);
      
      if (result) {
        toast.success("Configurações criadas com sucesso!");
        setCompanySettings(result);
      }
    } catch (error: any) {
      console.error("Error creating settings:", error);
      toast.error(`Erro ao criar configurações: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!companySettings?.id) return;
    
    setLoading(true);
    
    try {
      // Ensure name is always provided
      const updatedData = {
        ...formData,
        name: formData.name || companySettings.name || 'My Company'
      };
      
      const result = await updateCompanySettings({
        ...updatedData,
        id: companySettings.id
      });
      
      if (result) {
        toast.success("Configurações atualizadas com sucesso!");
        setCompanySettings(result);
      }
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error(`Erro ao atualizar configurações: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Configurações da Empresa</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua empresa.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Empresa</CardTitle>
            <CardDescription>
              Informações básicas sobre a sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {isLoading ? (
              <p>Carregando configurações...</p>
            ) : companyData ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da Empresa" {...field} />
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
                          <Input type="color" {...field} />
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
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Nenhuma configuração encontrada.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      Criar Configurações
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Criar Configurações</DialogTitle>
                      <DialogDescription>
                        Crie as configurações da sua empresa.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSaveForm)} className="space-y-8">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome da Empresa" {...field} />
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
                                <Input type="color" {...field} />
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
                                <Input type="color" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? "Salvando..." : "Salvar"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;

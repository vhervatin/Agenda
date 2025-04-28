import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fetchCompanySettings, updateCompanySettings } from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { Company } from '@/types/types';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { PrimaryColorDemo } from '@/components/ui/primary-color-demo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome da empresa deve ter pelo menos 2 caracteres.',
  }),
  logo_url: z.string().url({ message: 'Por favor, insira uma URL válida.' }).optional().nullable(),
  primary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: 'Por favor, insira um código de cor hexadecimal válido.' }),
  slug: z.string().min(2, {
    message: 'O slug deve ter pelo menos 2 caracteres.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const navigate = useNavigate();
  const { refreshSettings } = useCompanySettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo_url: '',
      primary_color: '#000000',
      slug: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await fetchCompanySettings();
        if (settings) {
          setCompany(settings);
          form.reset({
            name: settings.name,
            logo_url: settings.logo_url || '',
            primary_color: settings.primary_color,
            slug: settings.slug
          });
        }
      } catch (error) {
        console.error('Error fetching company settings:', error);
        toast.error('Erro ao carregar configurações');
        navigate('/admin/dashboard');
      }
    };

    fetchSettings();
  }, [form, navigate]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (company) {
        await updateCompanySettings(company.id, {
          name: values.name,
          logo_url: values.logo_url || company.logo_url,
          primary_color: values.primary_color,
          slug: values.slug,
        });
        
        // Atualizar as configurações no contexto para aplicar a nova cor
        await refreshSettings();
        
        toast.success('Configurações atualizadas com sucesso!');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Configurações da Empresa</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome da empresa" {...field} />
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
                      <Input placeholder="Insira a URL do logo" {...field} />
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
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-1" {...field} />
                        <Input
                          placeholder="#000000"
                          className="font-mono"
                          {...field}
                        />
                      </div>
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
                      <Input placeholder="Digite o slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Atualizando...' : 'Atualizar Configurações'}
              </Button>
            </form>
          </Form>

          <Card>
            <CardHeader>
              <CardTitle>Visualização da Cor Primária</CardTitle>
              <CardDescription>
                Veja como a cor primária será aplicada no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrimaryColorDemo />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;

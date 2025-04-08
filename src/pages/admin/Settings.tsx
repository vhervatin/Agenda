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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome da empresa deve ter pelo menos 2 caracteres.',
  }),
  logo_url: z.string().url({ message: 'Por favor, insira uma URL válida.' }).optional(),
  primary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: 'Por favor, insira um código de cor hexadecimal válido.' }),
  secondary_color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: 'Por favor, insira um código de cor hexadecimal válido.' }),
  slug: z.string().min(2, {
    message: 'O slug deve ter pelo menos 2 caracteres.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo_url: '',
      primary_color: '#000000',
      secondary_color: '#000000',
      slug: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await fetchCompanySettings();
        if (settings) {
          setCompany(settings);
          form.reset(settings);
        }
      } catch (error) {
        console.error('Error fetching company settings:', error);
        toast.error('Erro ao carregar configurações');
        navigate('/admin/dashboard');
      }
    };

    fetchSettings();
  }, [form, navigate]);

  // Update the updateCompanySettings function call to pass both parameters
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (company) {
        await updateCompanySettings(company.id, {
          name: values.name,
          logo_url: values.logo_url || company.logo_url,
          primary_color: values.primary_color,
          secondary_color: values.secondary_color,
          slug: values.slug,
        });
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
      </div>
    </AdminLayout>
  );
};

export default Settings;

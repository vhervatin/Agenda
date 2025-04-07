
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createConvenio } from '@/services/api';

const formSchema = z.object({
  nome: z.string().min(2, {
    message: 'O nome do convênio deve ter pelo menos 2 caracteres.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ConvenioForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createConvenio({ nome: values.nome });
      toast.success('Convênio cadastrado com sucesso!');
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating convenio:', error);
      toast.error('Erro ao cadastrar convênio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Convênio</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do convênio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Convênio'}
        </Button>
      </form>
    </Form>
  );
};

export default ConvenioForm;

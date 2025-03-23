
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(8, {
    message: "A senha deve ter pelo menos 8 caracteres.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log("Login successful:", data);
      
      // Check if user is superadmin (for demonstration - you should check actual roles)
      const email = form.getValues().email;
      if (email === "glivan.santos090420@gmail.com") {
        localStorage.setItem('userType', 'superadmin');
        navigate("/superadmin/dashboard");
      } else {
        localStorage.setItem('userType', 'admin');
        navigate("/admin/dashboard");
      }
      
      setLoginError(null);
      toast.success("Login realizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      setLoginError("Falha ao realizar o login. Verifique seu email e senha.");
      toast.error("Falha ao realizar o login. Verifique seu email e senha.");
    },
  });

  const onSubmit = (values: FormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold">Login</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seuemail@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" onClick={() => navigate("/")} type="button" variant="outline">
              Voltar para o início
            </Button>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;

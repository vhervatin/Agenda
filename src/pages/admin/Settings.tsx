
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Settings = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Company settings
  const [businessName, setBusinessName] = useState('Meu Negócio');
  const [businessEmail, setBusinessEmail] = useState('contato@meunegocio.com');
  const [businessPhone, setBusinessPhone] = useState('(00) 00000-0000');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#663399');
  const [secondaryColor, setSecondaryColor] = useState('#FFA500');
  
  // Appointment settings
  const [allowCancellations, setAllowCancellations] = useState(true);
  const [cancellationTimeLimit, setCancellationTimeLimit] = useState(24);
  const [allowRescheduling, setAllowRescheduling] = useState(true);
  const [defaultAppointmentDuration, setDefaultAppointmentDuration] = useState(60);
  
  // Account settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Fetch company information
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        setBusinessName(data.name || 'Meu Negócio');
        setLogoUrl(data.logo_url || '');
        setPrimaryColor(data.primary_color || '#663399');
        setSecondaryColor(data.secondary_color || '#FFA500');
      }
    }
  });
  
  // Update company information
  const updateCompanyMutation = useMutation({
    mutationFn: async (companyData: {
      name: string;
      logo_url?: string;
      primary_color: string;
      secondary_color: string;
    }) => {
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', companyData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Informações da empresa atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar informações: ${error.message}`);
    }
  });

  const handleSaveGeneralSettings = () => {
    setIsLoading(true);
    
    if (companyData) {
      updateCompanyMutation.mutate({
        id: companyData.id,
        name: businessName,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor
      });
    } else {
      // Create a new company record if none exists
      const createNewCompany = async () => {
        try {
          const { data, error } = await supabase
            .from('companies')
            .insert({
              name: businessName,
              logo_url: logoUrl,
              primary_color: primaryColor,
              secondary_color: secondaryColor
            })
            .select()
            .single();
          
          if (error) throw error;
          
          queryClient.invalidateQueries({ queryKey: ['company'] });
          toast.success('Informações da empresa criadas com sucesso!');
        } catch (error: any) {
          toast.error(`Erro ao criar informações: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      createNewCompany();
    }
    
    setIsLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error('Erro ao atualizar senha. Verifique a senha atual.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      // Check if 'logos' storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'logos')) {
        await supabase.storage.createBucket('logos', {
          public: true
        });
      }
      
      // Upload the file
      const fileName = `logo-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);
      
      setLogoUrl(publicUrlData.publicUrl);
      toast.success('Logo enviado com sucesso!');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(`Erro ao enviar logo: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Negócio</CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Nome do Negócio</Label>
                  <Input 
                    id="business-name" 
                    value={businessName} 
                    onChange={(e) => setBusinessName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-email">E-mail de Contato</Label>
                  <Input 
                    id="business-email" 
                    type="email"
                    value={businessEmail} 
                    onChange={(e) => setBusinessEmail(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Telefone de Contato</Label>
                  <Input 
                    id="business-phone" 
                    value={businessPhone} 
                    onChange={(e) => setBusinessPhone(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo do Negócio</Label>
                  {logoUrl && (
                    <div className="mb-2">
                      <img 
                        src={logoUrl} 
                        alt="Logo da empresa" 
                        className="max-h-32 rounded-md"
                      />
                    </div>
                  )}
                  <Input 
                    id="logo" 
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-sm text-muted-foreground">
                    Recomendado: PNG ou JPG, tamanho máximo de 2MB
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="primary-color" 
                        type="color"
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)} 
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Cor Secundária</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="secondary-color" 
                        type="color"
                        value={secondaryColor} 
                        onChange={(e) => setSecondaryColor(e.target.value)} 
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regras de Agendamento</CardTitle>
                <CardDescription>
                  Configure as regras para agendamentos e cancelamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-cancellations">Permitir Cancelamentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Clientes podem cancelar agendamentos
                    </p>
                  </div>
                  <Switch 
                    id="allow-cancellations"
                    checked={allowCancellations}
                    onCheckedChange={setAllowCancellations}
                  />
                </div>
                
                {allowCancellations && (
                  <div className="space-y-2">
                    <Label htmlFor="cancellation-time">
                      Limite de Horas para Cancelamento
                    </Label>
                    <Input
                      id="cancellation-time"
                      type="number"
                      min="1"
                      value={cancellationTimeLimit}
                      onChange={(e) => setCancellationTimeLimit(Number(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Cancelamentos permitidos até {cancellationTimeLimit} horas antes do horário agendado
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-rescheduling">Permitir Reagendamentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Clientes podem reagendar seus horários
                    </p>
                  </div>
                  <Switch 
                    id="allow-rescheduling"
                    checked={allowRescheduling}
                    onCheckedChange={setAllowRescheduling}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="default-duration">
                    Duração Padrão (minutos)
                  </Label>
                  <Input
                    id="default-duration"
                    type="number"
                    min="15"
                    step="15"
                    value={defaultAppointmentDuration}
                    onChange={(e) => setDefaultAppointmentDuration(Number(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Duração padrão dos serviços quando não especificado
                  </p>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleSaveGeneralSettings}
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize a senha da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleChangePassword}
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Gerenciar como as notificações são enviadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações de novos agendamentos por e-mail
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications"
                    defaultChecked={true}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes de agendamento por SMS para clientes
                    </p>
                  </div>
                  <Switch 
                    id="sms-notifications"
                    defaultChecked={false}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder-notifications">Lembretes</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes 24h antes do agendamento
                    </p>
                  </div>
                  <Switch 
                    id="reminder-notifications"
                    defaultChecked={true}
                  />
                </div>
                
                <Button className="w-full">
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;

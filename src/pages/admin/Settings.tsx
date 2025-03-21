
import React, { useState } from 'react';
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

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState('Meu Salão');
  const [businessEmail, setBusinessEmail] = useState('contato@meusalao.com');
  const [businessPhone, setBusinessPhone] = useState('(00) 00000-0000');
  const [allowCancellations, setAllowCancellations] = useState(true);
  const [cancellationTimeLimit, setCancellationTimeLimit] = useState(24);
  const [allowRescheduling, setAllowRescheduling] = useState(true);
  const [defaultAppointmentDuration, setDefaultAppointmentDuration] = useState(60);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveGeneralSettings = () => {
    setIsLoading(true);
    
    // In a real application, you would save these to Supabase
    // For now, we'll just simulate the API call
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Configurações gerais salvas com sucesso!');
    }, 1000);
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
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Erro ao atualizar senha. Verifique a senha atual.');
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

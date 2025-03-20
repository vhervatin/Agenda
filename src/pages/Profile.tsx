
import React from 'react';
import { User, Mail, Phone, MapPin, Bell, Shield, LogOut } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from "sonner";

const Profile = () => {
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perfil atualizado com sucesso");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Meu Perfil</h1>
          
          <div className="grid gap-8 animate-fade-in">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize seus dados de contato e informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" defaultValue="Maria Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="maria.silva@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" defaultValue="(11) 98765-4321" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input id="address" defaultValue="Rua das Flores, 123" />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button type="submit">Salvar Alterações</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Notifications Preferences Card */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-primary" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Gerencie como deseja receber lembretes e atualizações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Lembretes por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes sobre seus agendamentos
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Lembretes por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes por mensagem de texto
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notificações Promocionais</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba ofertas especiais e promoções
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => toast.success("Preferências salvas")}>
                  Salvar Preferências
                </Button>
              </CardFooter>
            </Card>
            
            {/* Account Security Card */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Segurança da Conta
                </CardTitle>
                <CardDescription>
                  Atualize sua senha e gerencia a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => toast.success("Senha atualizada")}>
                  Atualizar Senha
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

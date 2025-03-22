
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { WebhookConfiguration, WebhookLog } from '@/types/webhook';

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  RefreshCcw,
  Plug,
  Send,
  XCircle,
  Code,
  Loader2,
  Settings
} from 'lucide-react';

const IntegrationsPage = () => {
  const navigate = useNavigate();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookActive, setWebhookActive] = useState(true);
  const [webhookEventType, setWebhookEventType] = useState('appointment_created');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfiguration[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch webhook configurations
      const { data: webhookData, error: webhookError } = await supabase
        .from('webhook_configurations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (webhookError) throw webhookError;
      
      // Fetch webhook logs
      const { data: logsData, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (logsError) throw logsError;
      
      setWebhookConfigs(webhookData as WebhookConfiguration[]);
      setWebhookLogs(logsData as WebhookLog[]);
      
      // If there's a webhook config, set the form values
      if (webhookData && webhookData.length > 0) {
        setWebhookUrl(webhookData[0].url);
        setWebhookActive(webhookData[0].is_active);
        setWebhookEventType(webhookData[0].event_type || 'appointment_created');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Por favor, informe a URL do webhook');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // URL validation
      try {
        new URL(webhookUrl);
      } catch (e) {
        toast.error('URL inválida');
        setIsSaving(false);
        return;
      }
      
      const webhookData = {
        url: webhookUrl,
        is_active: webhookActive,
        event_type: webhookEventType
      };
      
      if (webhookConfigs.length > 0) {
        // Update existing webhook
        const { error } = await supabase
          .from('webhook_configurations')
          .update(webhookData)
          .eq('id', webhookConfigs[0].id);
        
        if (error) throw error;
        
        toast.success('Webhook atualizado com sucesso');
      } else {
        // Create new webhook
        const { error } = await supabase
          .from('webhook_configurations')
          .insert([webhookData]);
        
        if (error) throw error;
        
        toast.success('Webhook configurado com sucesso');
      }
      
      fetchData();
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Erro ao salvar webhook');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSendTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Por favor, configure a URL do webhook primeiro');
      return;
    }
    
    try {
      setIsSendingTest(true);
      
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          event_type: webhookEventType,
          payload: {
            event: webhookEventType,
            test: true,
            timestamp: new Date().toISOString()
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar webhook de teste');
      }
      
      toast.success('Webhook de teste enviado com sucesso');
      
      // Refresh logs after a delay
      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error sending test webhook:', error);
      toast.error(`Erro ao enviar webhook de teste: ${error.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sucesso</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falha</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEventTypeName = (eventType: string) => {
    switch (eventType) {
      case 'appointment_created':
        return 'Agendamento Criado';
      case 'appointment_updated':
        return 'Agendamento Atualizado';
      case 'appointment_cancelled':
        return 'Agendamento Cancelado';
      case 'appointment_completed':
        return 'Agendamento Concluído';
      default:
        return eventType;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Integrações</h1>
        </div>
        
        <Tabs defaultValue="webhooks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="webhooks" className="flex items-center">
              <Plug className="mr-2 h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center">
              <Code className="mr-2 h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Configuração de Webhook
                </CardTitle>
                <CardDescription>
                  Configure um endpoint para receber notificações em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://seu-endpoint.exemplo.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Uma URL válida para onde os eventos serão enviados
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-event">Evento de Teste</Label>
                  <select
                    id="webhook-event"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={webhookEventType}
                    onChange={(e) => setWebhookEventType(e.target.value)}
                  >
                    <option value="appointment_created">Agendamento Criado</option>
                    <option value="appointment_updated">Agendamento Atualizado</option>
                    <option value="appointment_cancelled">Agendamento Cancelado</option>
                    <option value="appointment_completed">Agendamento Concluído</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Selecione o tipo de evento para o teste
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="webhook-active"
                    checked={webhookActive}
                    onCheckedChange={setWebhookActive}
                  />
                  <Label htmlFor="webhook-active">Webhook Ativo</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleSendTestWebhook()}
                  disabled={isSendingTest || !webhookUrl}
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Teste
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleSaveWebhook()}
                  disabled={isSaving || !webhookUrl}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Configuração'
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Eventos</CardTitle>
                <CardDescription>
                  Registros dos últimos webhooks enviados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                  </div>
                ) : webhookLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum evento de webhook foi registrado ainda
                    </p>
                  </div>
                ) : (
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Evento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tentativas</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {webhookLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {formatDate(log.created_at)}
                            </TableCell>
                            <TableCell>
                              {getEventTypeName(log.event_type)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(log.status)}
                            </TableCell>
                            <TableCell>{log.attempts}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log('Log details:', log);
                                  toast.info('Detalhes do log no console');
                                }}
                              >
                                Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => fetchData()}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API de Integração</CardTitle>
                <CardDescription>
                  Acesse nossa API para integrar com outros sistemas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">Documentação em Breve</h3>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>
                          Estamos trabalhando na documentação da API. Em breve você poderá integrar seu sistema diretamente com nossa plataforma.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Integração</CardTitle>
                <CardDescription>
                  Gerencie as configurações gerais de integração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Integração de Notificações</h3>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações de agendamentos por email
                      </p>
                    </div>
                    <Switch id="notification-integration" defaultChecked={true} />
                  </div>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Integração de Calendário</h3>
                      <p className="text-sm text-muted-foreground">
                        Sincronize com Google Agenda (em breve)
                      </p>
                    </div>
                    <Switch id="calendar-integration" disabled />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Integração de Pagamentos</h3>
                      <p className="text-sm text-muted-foreground">
                        Processe pagamentos online (em breve)
                      </p>
                    </div>
                    <Switch id="payment-integration" disabled />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">Salvar Configurações</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default IntegrationsPage;

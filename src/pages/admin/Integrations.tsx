
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, RefreshCw, Webhook } from 'lucide-react';

interface WebhookConfig {
  id: string;
  url: string;
  is_active: boolean;
}

interface WebhookLog {
  id: string;
  event_type: string;
  payload: any;
  status: string;
  attempts: number;
  created_at: string;
}

const Integrations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [webhookId, setWebhookId] = useState<string | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadWebhookConfig();
    loadWebhookLogs();
  }, []);

  const loadWebhookConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configurations')
        .select('*')
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setWebhookUrl(data[0].url);
        setIsActive(data[0].is_active);
        setWebhookId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading webhook config:', error);
      toast.error('Erro ao carregar configurações do webhook');
    }
  };

  const loadWebhookLogs = async () => {
    setLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setWebhookLogs(data || []);
    } catch (error) {
      console.error('Error loading webhook logs:', error);
      toast.error('Erro ao carregar logs de webhook');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Por favor, insira uma URL de webhook válida');
      return;
    }

    setIsLoading(true);
    try {
      let result;

      if (webhookId) {
        // Update existing webhook
        result = await supabase
          .from('webhook_configurations')
          .update({
            url: webhookUrl,
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', webhookId);
      } else {
        // Create new webhook
        result = await supabase
          .from('webhook_configurations')
          .insert({
            url: webhookUrl,
            is_active: isActive
          })
          .select();

        if (result.data && result.data.length > 0) {
          setWebhookId(result.data[0].id);
        }
      }

      if (result.error) throw result.error;

      toast.success('Configurações de webhook salvas com sucesso!');
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Erro ao salvar configurações do webhook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Por favor, insira uma URL de webhook válida');
      return;
    }

    setIsTesting(true);
    try {
      // Create a test payload
      const testPayload = {
        evento: 'teste_webhook',
        timestamp: new Date().toISOString(),
        mensagem: 'Este é um teste de webhook do sistema de agendamentos'
      };

      // Send directly to the webhook URL
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        toast.success('Teste de webhook enviado com sucesso!');
      } else {
        const errorText = await response.text();
        throw new Error(`Status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      toast.error(`Erro ao testar webhook: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <RefreshCw className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Integrações</h1>
        </div>

        <Tabs defaultValue="webhooks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="webhooks" className="flex items-center">
              <Webhook className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Webhook</CardTitle>
                <CardDescription>
                  Configure uma URL de webhook para receber notificações dos eventos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input 
                    id="webhook-url" 
                    placeholder="https://exemplo.com/webhook"
                    value={webhookUrl} 
                    onChange={(e) => setWebhookUrl(e.target.value)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is-active">Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative para enviar notificações para esta URL
                    </p>
                  </div>
                  <Switch 
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="w-full sm:w-auto"
                  onClick={handleSaveWebhook}
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={handleTestWebhook}
                  disabled={isTesting || !webhookUrl}
                >
                  {isTesting ? 'Enviando...' : 'Testar Webhook'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Eventos do Webhook</CardTitle>
                <CardDescription>
                  Os seguintes eventos serão enviados para o webhook configurado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Agendamento Criado</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enviado quando um novo agendamento for feito
                    </p>
                    <pre className="bg-secondary/50 p-3 rounded-md text-xs overflow-auto">
                      {`{
  "evento": "agendamento_criado",
  "id_agendamento": "12345",
  "profissional": "Dr. João",
  "serviço": "Consulta",
  "data": "2025-03-21",
  "hora": "14:00",
  "cliente": "Carlos Silva",
  "telefone": "(99) 99999-9999"
}`}
                    </pre>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Agendamento Cancelado</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enviado quando um agendamento for cancelado
                    </p>
                    <pre className="bg-secondary/50 p-3 rounded-md text-xs overflow-auto">
                      {`{
  "evento": "agendamento_cancelado",
  "id_agendamento": "12345",
  "motivo": "Solicitação do cliente"
}`}
                    </pre>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Agendamento Concluído</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enviado quando um agendamento for marcado como concluído
                    </p>
                    <pre className="bg-secondary/50 p-3 rounded-md text-xs overflow-auto">
                      {`{
  "evento": "agendamento_concluido",
  "id_agendamento": "12345"
}`}
                    </pre>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Lembrete de Agendamento</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enviado 30 minutos antes do horário marcado
                    </p>
                    <pre className="bg-secondary/50 p-3 rounded-md text-xs overflow-auto">
                      {`{
  "evento": "lembrete_agendamento",
  "id_agendamento": "12345",
  "mensagem": "Seu agendamento com Dr. João é às 14:00. Não se atrase!"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Histórico de Webhooks</CardTitle>
                  <CardDescription>
                    Últimos 20 webhooks enviados
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadWebhookLogs}
                  disabled={logsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-4">Carregando logs...</div>
                ) : webhookLogs.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum log de webhook encontrado
                  </div>
                ) : (
                  <div className="space-y-3">
                    {webhookLogs.map(log => (
                      <div key={log.id} className="flex items-start gap-2 border-b pb-3">
                        <div className="mt-1">
                          {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="font-medium truncate">{log.event_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(log.created_at)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs truncate">
                              Payload: {JSON.stringify(log.payload).substring(0, 50)}...
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              log.status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : log.status === 'failed' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {log.status === 'delivered' 
                                ? 'Entregue' 
                                : log.status === 'failed' 
                                  ? `Falhou (${log.attempts} tentativas)` 
                                  : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Integrations;

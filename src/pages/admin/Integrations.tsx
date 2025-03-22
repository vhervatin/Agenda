
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Webhook, ArrowUpDown, Clock, Check, X } from 'lucide-react';

interface WebhookConfiguration {
  id: string;
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  status: string;
  attempts: number;
  created_at: string;
  updated_at: string;
}

const IntegrationsPage = () => {
  const [url, setUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfiguration | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);

  useEffect(() => {
    fetchWebhookConfig();
    fetchWebhookLogs();
  }, []);

  const fetchWebhookConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configurations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching webhook config:', error);
        return;
      }

      if (data) {
        setWebhookConfig(data as WebhookConfiguration);
        setUrl(data.url);
        setIsActive(data.is_active);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching webhook logs:', error);
        return;
      }

      setWebhookLogs(data as WebhookLog[]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveWebhook = async () => {
    if (!url) {
      toast.error('Por favor, insira uma URL válida');
      return;
    }

    setIsSaving(true);

    try {
      let operation;
      
      if (webhookConfig) {
        // Update existing webhook
        operation = supabase
          .from('webhook_configurations')
          .update({ url, is_active: isActive })
          .eq('id', webhookConfig.id);
      } else {
        // Create new webhook
        operation = supabase
          .from('webhook_configurations')
          .insert([{ url, is_active: isActive }]);
      }

      const { error } = await operation;

      if (error) throw error;

      toast.success('Webhook configurado com sucesso');
      fetchWebhookConfig();
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Erro ao salvar o webhook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!url) {
      toast.error('Por favor, insira uma URL válida');
      return;
    }

    setIsTesting(true);

    try {
      const testPayload = {
        evento: 'teste_webhook',
        timestamp: new Date().toISOString(),
        mensagem: 'Este é um teste de webhook'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (!response.ok) {
        throw new Error(`Erro no teste: ${response.status} ${response.statusText}`);
      }

      toast.success('Teste de webhook enviado com sucesso');
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error(`Erro ao testar webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Sucesso</Badge>;
      case 'failed':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Falha</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Integrações</h1>
        </div>

        <Tabs defaultValue="webhook">
          <TabsList className="mb-4">
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhook">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Webhook className="h-5 w-5 mr-2" />
                  Configuração de Webhook
                </CardTitle>
                <CardDescription>
                  Configure um webhook para receber notificações de eventos como agendamentos criados, cancelados e lembretes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">URL do Webhook</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://exemplo.com/webhook"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="webhook-active" 
                      checked={isActive} 
                      onCheckedChange={setIsActive} 
                    />
                    <Label htmlFor="webhook-active">Ativar webhook</Label>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={handleSaveWebhook} 
                      disabled={isSaving || !url}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleTestWebhook} 
                      disabled={isTesting || !url}
                    >
                      {isTesting ? 'Testando...' : 'Testar Webhook'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Eventos Suportados</CardTitle>
                <CardDescription>
                  O sistema envia webhooks nos seguintes eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Agendamento Criado</h3>
                    <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">
                      {JSON.stringify({
                        evento: "agendamento_criado",
                        id_agendamento: "12345",
                        profissional: "Dr. João",
                        serviço: "Consulta",
                        data: "2025-03-21",
                        hora: "14:00",
                        cliente: "Carlos Silva",
                        telefone: "(99) 99999-9999"
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Agendamento Cancelado</h3>
                    <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">
                      {JSON.stringify({
                        evento: "agendamento_cancelado",
                        id_agendamento: "12345",
                        motivo: "Solicitação do cliente"
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Agendamento Concluído</h3>
                    <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">
                      {JSON.stringify({
                        evento: "agendamento_concluido",
                        id_agendamento: "12345"
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Lembrete de Agendamento</h3>
                    <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">
                      {JSON.stringify({
                        evento: "lembrete_agendamento",
                        id_agendamento: "12345",
                        mensagem: "Seu agendamento com Dr. João é às 14:00. Não se atrase!"
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpDown className="h-5 w-5 mr-2" />
                  Logs de Webhooks
                </CardTitle>
                <CardDescription>
                  Histórico dos webhooks enviados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {webhookLogs.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhum log de webhook encontrado
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webhookLogs.map((log) => (
                      <div key={log.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium">{log.event_type}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div>{getStatusBadge(log.status)}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tentativas: {log.attempts}
                        </div>
                        <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={fetchWebhookLogs}
                >
                  Atualizar Logs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default IntegrationsPage;

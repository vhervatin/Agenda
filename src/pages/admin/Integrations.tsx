import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightFromLine, Link as LinkIcon, Code, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { 
  fetchWebhookConfigurations, 
  fetchWebhookLogs,
  createWebhookConfiguration,
  updateWebhookConfiguration,
  testWebhook
} from '@/services/api';
import { WebhookConfiguration as WebhookConfig } from '@/types/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Integrations = () => {
  const queryClient = useQueryClient();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [selectedEventType, setSelectedEventType] = useState('appointment_created');
  const [testEventType, setTestEventType] = useState('appointment_created');
  const [isTesting, setIsTesting] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: webhookConfigurations = [], isLoading: isLoadingConfigurations } = useQuery({
    queryKey: ['webhook-configurations'],
    queryFn: fetchWebhookConfigurations
  });
  
  const { data: webhookLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: fetchWebhookLogs
  });
  
  const createMutation = useMutation({
    mutationFn: (webhook: { url: string; is_active: boolean; event_type: string }) => 
      createWebhookConfiguration(webhook.url, webhook.event_type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-configurations'] });
      setIsAddDialogOpen(false);
      setWebhookUrl('');
      toast.success('Webhook configurado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao configurar webhook: ${error.message}`);
    }
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      updateWebhookConfiguration(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-configurations'] });
      toast.success('Status do webhook atualizado');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });
  
  const testWebhookMutation = useMutation({
    mutationFn: (id: string) => testWebhook(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-logs'] });
      
      if (data.success) {
        toast.success('Webhook enviado com sucesso');
      } else {
        toast.error(`Erro no envio: ${data.message}`);
      }
      
      setIsTesting(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao testar webhook: ${error.message}`);
      setIsTesting(false);
    }
  });
  
  const handleAddWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error('Insira uma URL válida');
      return;
    }
    
    createMutation.mutate({
      url: webhookUrl,
      is_active: isActive,
      event_type: selectedEventType
    });
  };
  
  const handleToggleStatus = (webhook: WebhookConfig) => {
    updateStatusMutation.mutate({
      id: webhook.id,
      isActive: !webhook.is_active
    });
  };
  
  const handleTestWebhook = (webhookId: string) => {
    testWebhook(webhookId)
      .then(() => {
        toast.success('Webhook testado com sucesso');
      })
      .catch(error => {
        toast.error(`Erro ao testar webhook: ${error.message}`);
      });
  };
  
  const openTestDialog = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setTestEventType(webhook.event_type || 'appointment_created');
    setIsTestDialogOpen(true);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4" />;
      case 'failed':
        return <X className="h-4 w-4" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const eventTypeOptions = [
    { value: 'appointment_created', label: 'Agendamento Criado' },
    { value: 'appointment_cancelled', label: 'Agendamento Cancelado' },
    { value: 'appointment_completed', label: 'Agendamento Concluído' },
    { value: 'professional_created', label: 'Profissional Criado' },
    { value: 'service_created', label: 'Serviço Criado' }
  ];
  
  const getEventTypeLabel = (value: string) => {
    const option = eventTypeOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };
  
  const handleAdicionarSuccess = () => {
    toast.success('Webhook adicionado com sucesso!');
    navigate('/admin/integrations');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Integrações</h1>
        
        <Tabs defaultValue="webhooks">
          <TabsList className="mb-6">
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhooks">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>
                      Conecte sua aplicação a eventos do sistema
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    Adicionar Webhook
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingConfigurations ? (
                    <div className="text-center py-4">Carregando configurações...</div>
                  ) : webhookConfigurations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <LinkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Nenhum webhook configurado.</p>
                      <p className="text-sm mt-2">
                        Configure webhooks para receber notificações em tempo real quando eventos ocorrerem no sistema.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>URL</TableHead>
                          <TableHead>Evento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {webhookConfigurations.map((webhook) => (
                          <TableRow key={webhook.id}>
                            <TableCell className="font-medium truncate max-w-xs">
                              {webhook.url}
                            </TableCell>
                            <TableCell>
                              {getEventTypeLabel(webhook.event_type)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={webhook.is_active} 
                                  onCheckedChange={() => handleToggleStatus(webhook)}
                                  disabled={updateStatusMutation.isPending}
                                />
                                <span className={webhook.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                                  {webhook.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {webhook.created_at && format(new Date(webhook.created_at), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => openTestDialog(webhook)}
                                title="Testar Webhook"
                              >
                                <ArrowRightFromLine className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Logs de Webhooks</CardTitle>
                  <CardDescription>
                    Histórico de envios de webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLogs ? (
                    <div className="text-center py-4">Carregando logs...</div>
                  ) : webhookLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Nenhum log de webhook disponível.</p>
                      <p className="text-sm mt-2">
                        Os logs aparecerão aqui quando webhooks forem acionados.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Evento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tentativas</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {webhookLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{getEventTypeLabel(log.event_type)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${getStatusColor(log.status)} flex items-center gap-1`}>
                                {getStatusIcon(log.status)}
                                <span className="ml-1 capitalize">{log.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>{log.attempts}</TableCell>
                            <TableCell>
                              {log.created_at && format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API</CardTitle>
                <CardDescription>
                  Informações para integrar com a API do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>URL Base</Label>
                  <div className="flex">
                    <Input readOnly value="https://api.example.com/v1" />
                    <Button variant="ghost" className="ml-2">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Autenticação</Label>
                  <p className="text-sm text-muted-foreground">
                    Para autenticar suas requisições, use o cabeçalho <code>Authorization</code> com um token JWT.
                  </p>
                  <div className="bg-secondary p-2 rounded-md">
                    <code className="text-xs">
                      Authorization: Bearer seu_token_jwt
                    </code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Documentação</Label>
                  <p className="text-sm text-muted-foreground">
                    Consulte nossa documentação completa para mais informações sobre como utilizar a API.
                  </p>
                  <Button variant="outline" className="w-full">
                    Acessar Documentação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Webhook</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <Input 
                id="webhook-url" 
                placeholder="https://" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-type">Tipo de Evento</Label>
              <Select 
                value={selectedEventType} 
                onValueChange={setSelectedEventType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Este webhook será acionado quando o evento ocorrer.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="is-active" 
                checked={isActive} 
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is-active">Ativar Webhook</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleAddWebhook}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Configurando...' : 'Configurar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testar Webhook</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedWebhook && (
              <>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <p className="text-sm font-medium">{selectedWebhook.url}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test-event-type">Tipo de Evento</Label>
                  <Select 
                    value={testEventType} 
                    onValueChange={setTestEventType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Selecione o tipo de evento para o teste.
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={() => handleTestWebhook(selectedWebhook.id)}
              disabled={isTesting}
            >
              {isTesting ? 'Enviando...' : 'Enviar Teste'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Integrations;

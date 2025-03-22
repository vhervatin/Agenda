
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Building, Users, Settings, Calendar, CreditCard } from 'lucide-react';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [companyCount, setCompanyCount] = useState(0);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        const { data: userData, error } = await supabase
          .from('users')
          .select('role, tipo_usuario')
          .eq('auth_id', session.user.id)
          .single();
        
        if (error) throw error;
        
        if (!userData || userData.tipo_usuario !== 'superadmin') {
          navigate('/admin/dashboard');
          return;
        }
        
        setIsSuperAdmin(true);
        fetchCompanyCount();
      } catch (error) {
        console.error('Error checking superadmin access:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [navigate]);

  const fetchCompanyCount = async () => {
    try {
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setCompanyCount(count || 0);
    } catch (error) {
      console.error('Error fetching company count:', error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p>Verificando acesso...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                Acesso Negado
              </CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin/dashboard')} className="w-full">
                Voltar para o Painel
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Painel SuperAdmin</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyCount}</div>
              <p className="text-xs text-muted-foreground">
                Total de empresas gerenciadas
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => navigate('/superadmin/companies')}>
                Gerenciar Empresas
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Assinaturas</div>
              <p className="text-xs text-muted-foreground">
                Gerencie planos e pagamentos
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => navigate('/superadmin/plans')}>
                Gerenciar Planos
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Contas</div>
              <p className="text-xs text-muted-foreground">
                Gerenciar contas de administradores
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => navigate('/superadmin/users')}>
                Gerenciar Usuários
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Relatórios</div>
              <p className="text-xs text-muted-foreground">
                Visualizar estatísticas de agendamentos
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" onClick={() => navigate('/superadmin/reports')}>
                Ver Relatórios
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;

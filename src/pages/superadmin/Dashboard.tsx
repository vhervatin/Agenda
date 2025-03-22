
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, CalendarDays, Settings, BarChart3, PlusCircle } from 'lucide-react';
import { fetchUserByAuthId, fetchCompanies } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/types';
import { Company } from '@/types/webhook';

// Create a layout component for SuperAdmin
const SuperAdminLayout: React.FC<{ children: React.ReactNode, title?: string }> = ({ children, title }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/login');
        return;
      }
      
      const userData = await fetchUserByAuthId(data.session.user.id);
      
      if (!userData || userData.tipo_usuario !== 'superadmin') {
        navigate('/login');
        return;
      }
      
      setUser(userData);
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col fixed h-screen bg-gray-900">
          <div className="flex items-center justify-center h-16 bg-gray-800">
            <h1 className="text-white text-xl font-bold">SuperAdmin</h1>
          </div>
          <div className="flex-1 overflow-y-auto pt-5 px-3 space-y-1">
            <Link to="/superadmin/dashboard" className="flex items-center px-2 py-2 text-base font-medium rounded-md text-white bg-gray-800">
              <BarChart3 className="mr-3 h-6 w-6" />
              Dashboard
            </Link>
            <Link to="/superadmin/companies" className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700">
              <Building2 className="mr-3 h-6 w-6" />
              Empresas
            </Link>
            <Link to="/admin/settings" className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700">
              <Settings className="mr-3 h-6 w-6" />
              Configurações
            </Link>
          </div>
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                  {user?.name?.charAt(0) || 'S'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'Superadmin'}</p>
                <p className="text-xs text-gray-300">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="mt-2 w-full justify-start text-gray-300 hover:text-white" 
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>
        
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b shadow-sm h-16 flex items-center px-4">
          <h1 className="text-xl font-bold">SuperAdmin</h1>
        </div>
        
        {/* Main content */}
        <div className="md:ml-64 flex-1 p-6 md:p-8 md:pt-6 mt-16 md:mt-0">
          {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  );
};

// SuperAdmin Dashboard Component
const SuperAdminDashboard = () => {
  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  });
  
  // Calculate statistics
  const activeCompanies = companies.filter(company => company.is_active).length;
  const totalCompanies = companies.length;
  const expiredCompanies = companies.filter(company => {
    if (!company.plan_expiry_date) return false;
    return new Date(company.plan_expiry_date) < new Date();
  }).length;
  
  return (
    <SuperAdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Empresas Ativas</p>
              <p className="text-2xl font-bold">{activeCompanies}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Empresas</p>
              <p className="text-2xl font-bold">{totalCompanies}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Planos Expirados</p>
              <p className="text-2xl font-bold">{expiredCompanies}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle>Empresas Recentes</CardTitle>
              <CardDescription>Últimas empresas cadastradas</CardDescription>
            </div>
            <Button asChild>
              <Link to="/superadmin/companies">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Empresa
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Nenhuma empresa cadastrada
              </div>
            ) : (
              <div className="space-y-4">
                {companies.slice(0, 5).map((company) => (
                  <div key={company.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name} 
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.plan || 'Plano Básico'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {company.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {companies.length > 5 && (
              <div className="pt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/superadmin/companies">Ver todas</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Receita mensal por planos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Calculate revenue by plan */}
              {['basic', 'premium', 'enterprise'].map(plan => {
                const planCompanies = companies.filter(c => c.plan === plan && c.is_active);
                const planRevenue = planCompanies.reduce((sum, company) => sum + (company.plan_value || 0), 0);
                const planCount = planCompanies.length;
                
                return (
                  <div key={plan} className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium capitalize">{plan}</p>
                      <p className="text-sm text-muted-foreground">{planCount} empresas</p>
                    </div>
                    <p className="font-semibold">
                      R$ {planRevenue.toFixed(2)}
                    </p>
                  </div>
                );
              })}
              
              <div className="flex justify-between items-center pt-2">
                <p className="font-semibold">Total Mensal</p>
                <p className="font-bold text-lg">
                  R$ {companies
                    .filter(c => c.is_active)
                    .reduce((sum, company) => sum + (company.plan_value || 0), 0)
                    .toFixed(2)
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;

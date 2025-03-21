
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Painel de Controle</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-medium mb-2">Agendamentos do Dia</h2>
            <p className="text-3xl font-semibold">0</p>
          </div>
          
          <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-medium mb-2">Profissionais Ativos</h2>
            <p className="text-3xl font-semibold">0</p>
          </div>
          
          <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-medium mb-2">Total de Serviços</h2>
            <p className="text-3xl font-semibold">4</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

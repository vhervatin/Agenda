
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchUserByAuthId } from '@/services/api';
import SuperAdminLayout from '@/components/admin/SuperAdminLayout';
import { User } from '@/types/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserByAuthId();
        
        if (!userData) {
          toast.error("Usuário não encontrado");
          navigate('/login');
          return;
        }
        
        if (userData.tipo_usuario !== 'superadmin') {
          toast.error("Acesso não autorizado");
          navigate('/admin/dashboard');
          return;
        }
        
        setUser(userData as User);
      } catch (error) {
        console.error("Error checking access:", error);
        toast.error("Erro ao verificar acesso");
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [navigate]);
  
  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <p className="text-lg">Carregando...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }
  
  return (
    <SuperAdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </SuperAdminLayout>
  );
};

export default Dashboard;

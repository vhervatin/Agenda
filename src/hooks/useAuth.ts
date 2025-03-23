
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<'admin' | 'superadmin' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('tipo_usuario')
          .eq('auth_id', session.user.id)
          .single();

        if (error) throw error;

        const tipo = userData?.tipo_usuario as 'admin' | 'superadmin';
        setUserType(tipo);
        setIsAuthenticated(true);

        // Redirect based on user type
        if (tipo === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else if (tipo === 'admin') {
          navigate('/admin/dashboard');
        }
      } catch (error) {
        console.error('Error fetching user type:', error);
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserType(null);
        navigate('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return { isAuthenticated, userType, loading };
};

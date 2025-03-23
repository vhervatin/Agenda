
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import AppointmentSuccess from "./pages/AppointmentSuccess";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminProfessionals from "./pages/admin/Professionals";
import AdminServices from "./pages/admin/Services";
import AdminSchedule from "./pages/admin/Schedule";
import AdminAppointments from "./pages/admin/Appointments";
import AdminSettings from "./pages/admin/Settings";
import AdminIntegrations from "./pages/admin/Integrations";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminCompanies from "./pages/superadmin/Companies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth route component
const ProtectedRoute = ({ 
  children, 
  userType, 
  redirectTo = "/login" 
}: { 
  children: React.ReactNode; 
  userType: 'admin' | 'superadmin' | null; 
  redirectTo?: string;
}) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }
      
      // Get stored user type
      const storedUserType = localStorage.getItem('userType');
      setCurrentUserType(storedUserType);
      
      // User is authenticated
      setIsAuthenticated(true);
      setLoading(false);
      
      // Check if user is accessing the correct routes based on their type
      if (userType === 'superadmin' && storedUserType !== 'superadmin') {
        navigate('/admin/dashboard');
      } else if (userType === 'admin' && storedUserType === 'superadmin') {
        navigate('/superadmin/dashboard');
      }
    };
    
    checkAuth();
  }, [location.pathname, navigate, userType]);
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/appointment-success" element={<AppointmentSuccess />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute userType="admin">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/professionals" element={
            <ProtectedRoute userType="admin">
              <AdminProfessionals />
            </ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute userType="admin">
              <AdminServices />
            </ProtectedRoute>
          } />
          <Route path="/admin/schedule" element={
            <ProtectedRoute userType="admin">
              <AdminSchedule />
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute userType="admin">
              <AdminAppointments />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute userType="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/integrations" element={
            <ProtectedRoute userType="admin">
              <AdminIntegrations />
            </ProtectedRoute>
          } />
          
          {/* SuperAdmin Routes */}
          <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="/superadmin/dashboard" element={
            <ProtectedRoute userType="superadmin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/superadmin/companies" element={
            <ProtectedRoute userType="superadmin">
              <SuperAdminCompanies />
            </ProtectedRoute>
          } />
          
          {/* Company subdomain routes */}
          <Route path="/:companySlug/*" element={<Index />} />
          
          {/* Calendar route will redirect to appointments for now */}
          <Route path="/calendar" element={<Appointments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

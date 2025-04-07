
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// Admin related pages
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/admin/Dashboard';
import Professionals from '@/pages/admin/Professionals';
import Services from '@/pages/admin/Services';
import Convenios from '@/pages/admin/Convenios';
import Schedule from '@/pages/admin/Schedule';
import AdminAppointments from '@/pages/admin/Appointments';
import Settings from '@/pages/admin/Settings';
import Integrations from '@/pages/admin/Integrations';

// SuperAdmin pages
import SuperAdminDashboard from '@/pages/superadmin/Dashboard';
import Companies from '@/pages/superadmin/Companies';

// Client related pages
import Index from '@/pages/Index';
import Booking from '@/pages/Booking';
import Appointments from '@/pages/Appointments';
import AppointmentSuccess from '@/pages/AppointmentSuccess';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointment-success" element={<AppointmentSuccess />} />
          <Route path="/profile" element={<Profile />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/professionals" element={<Professionals />} />
          <Route path="/admin/services" element={<Services />} />
          <Route path="/admin/convenios" element={<Convenios />} />
          <Route path="/admin/schedule" element={<Schedule />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/integrations" element={<Integrations />} />
          
          {/* SuperAdmin routes */}
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/companies" element={<Companies />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <SonnerToaster position="top-right" richColors />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/professionals" element={<AdminProfessionals />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/integrations" element={<AdminIntegrations />} />
          
          {/* SuperAdmin Routes */}
          <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/companies" element={<SuperAdminCompanies />} />
          
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

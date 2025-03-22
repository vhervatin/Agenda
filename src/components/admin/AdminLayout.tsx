
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Calendar, 
  CalendarClock, 
  Settings, 
  LogOut,
  Menu,
  X,
  Webhook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, text, isActive, onClick }) => (
  <Link
    to={href}
    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
    onClick={onClick}
  >
    {icon}
    <span>{text}</span>
  </Link>
);

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };
  
  const navigation = [
    {
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      text: 'Dashboard'
    },
    {
      href: '/admin/professionals',
      icon: <Users className="h-5 w-5" />,
      text: 'Profissionais'
    },
    {
      href: '/admin/services',
      icon: <Scissors className="h-5 w-5" />,
      text: 'Serviços'
    },
    {
      href: '/admin/schedule',
      icon: <Calendar className="h-5 w-5" />,
      text: 'Agenda'
    },
    {
      href: '/admin/appointments',
      icon: <CalendarClock className="h-5 w-5" />,
      text: 'Agendamentos'
    },
    {
      href: '/admin/integrations',
      icon: <Webhook className="h-5 w-5" />,
      text: 'Integrações'
    },
    {
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      text: 'Configurações'
    }
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link 
          to="/admin/dashboard" 
          className="flex items-center font-semibold"
          onClick={() => setOpen(false)}
        >
          Admin Dashboard
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium gap-1">
          {navigation.map((item) => (
            <NavItem 
              key={item.href}
              href={item.href}
              icon={item.icon}
              text={item.text}
              isActive={isActive(item.href)}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      {isMobile ? (
        <>
          <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px]">
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex-1">{children}</div>
        </>
      ) : (
        <div className="flex min-h-screen">
          <div className="w-[300px] border-r hidden md:block">
            {sidebarContent}
          </div>
          <div className="flex-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;

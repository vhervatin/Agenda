
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  Scissors,
  Calendar,
  ClipboardList,
  Settings,
  LogOut,
} from 'lucide-react';
import Logo from '@/components/Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: path === '/admin/dashboard',
    },
    {
      name: 'Profissionais',
      href: '/admin/professionals',
      icon: Users,
      current: path === '/admin/professionals',
    },
    {
      name: 'Serviços',
      href: '/admin/services',
      icon: Scissors,
      current: path === '/admin/services',
    },
    {
      name: 'Agenda',
      href: '/admin/schedule',
      icon: Calendar,
      current: path === '/admin/schedule',
    },
    {
      name: 'Agendamentos',
      href: '/admin/appointments',
      icon: ClipboardList,
      current: path === '/admin/appointments',
    },
    {
      name: 'Configurações',
      href: '/admin/settings',
      icon: Settings,
      current: path === '/admin/settings',
    },
  ];

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-64 bg-background border-r border-border flex flex-col">
        <div className="p-4 flex items-center border-b border-border h-16">
          <Link to="/" className="flex items-center">
            <Logo />
            <span className="ml-2 text-lg font-semibold">Salão Admin</span>
          </Link>
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  item.current
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/">
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

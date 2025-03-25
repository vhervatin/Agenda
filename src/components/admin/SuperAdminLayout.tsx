
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard,
  ChevronLeft
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-border bg-card pt-5">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-xl font-bold">Admin Central</h1>
          </div>
          
          <div className="flex flex-col flex-grow">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              <Link
                to="/superadmin/dashboard"
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive("/superadmin/dashboard")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <Link
                to="/superadmin/companies"
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive("/superadmin/companies")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Building2 className="mr-3 h-5 w-5" />
                Empresas
              </Link>
            </nav>
          </div>
          
          <div className="px-3 py-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar para o site
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;

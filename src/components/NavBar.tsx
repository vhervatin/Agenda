
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Menu, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { fetchCompanySettings } from '@/services/api';

const NavBar = () => {
  const location = useLocation();
  const [companyName, setCompanyName] = useState('Agenda');
  
  useEffect(() => {
    const getCompanyName = async () => {
      try {
        const settings = await fetchCompanySettings();
        if (settings && settings.name) {
          setCompanyName(settings.name);
        }
      } catch (error) {
        console.error('Error fetching company name:', error);
      }
    };
    
    getCompanyName();
  }, []);
  
  const links = [
    { href: '/', label: 'Início' },
    { href: '/booking', label: 'Agendar' },
    { href: '/appointments', label: 'Meus Agendamentos' },
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-bold">{companyName}</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="hidden md:flex">
            <Link to="/booking">
              <CalendarDays className="mr-2 h-4 w-4" />
              Agendar
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="hidden md:flex">
            <Link to="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Área Restrita
            </Link>
          </Button>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <div className="px-7">
                <Link to="/" className="flex items-center gap-2 mb-8">
                  <Logo />
                  <span className="text-xl font-bold">{companyName}</span>
                </Link>
                
                <nav className="flex flex-col gap-4">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex font-medium transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <Link
                    to="/login"
                    className="flex font-medium transition-colors hover:text-foreground"
                  >
                    Área Restrita
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NavBar;

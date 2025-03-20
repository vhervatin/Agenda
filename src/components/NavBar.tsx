
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, User, Menu } from 'lucide-react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const NavBar = () => {
  const navLinks = [
    { name: 'Calendário', href: '/calendar', icon: <CalendarDays className="h-4 w-4 mr-2" /> },
    { name: 'Agendamentos', href: '/appointments', icon: <Clock className="h-4 w-4 mr-2" /> },
    { name: 'Perfil', href: '/profile', icon: <User className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary subtle-underline"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <Button size="sm">Agendar</Button>
        </nav>
        
        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center py-2 text-base font-medium transition-colors hover:text-primary"
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <Button className="mt-4 w-full">Agendar</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default NavBar;

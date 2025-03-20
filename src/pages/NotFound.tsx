
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-5xl font-bold text-primary">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
        <Button asChild className="mx-auto">
          <Link to="/" className="flex items-center">
            <HomeIcon className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

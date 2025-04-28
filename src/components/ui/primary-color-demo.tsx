import React from 'react';
import { usePrimaryColor } from '@/hooks/usePrimaryColor';

interface PrimaryColorDemoProps {
  className?: string;
}

/**
 * Componente de demonstração que mostra como a cor primária pode ser aplicada
 * em componentes específicos usando o hook usePrimaryColor
 */
export function PrimaryColorDemo({ className = '' }: PrimaryColorDemoProps) {
  const primaryColor = usePrimaryColor();
  
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-2">Demonstração da Cor Primária</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="p-4 rounded-md text-white text-center"
          style={{ backgroundColor: primaryColor }}
        >
          Fundo
        </div>
        
        <div 
          className="p-4 rounded-md border-2 text-center"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          Borda e Texto
        </div>
        
        <div className="p-4 rounded-md border border-gray-200 text-center">
          <div 
            className="w-8 h-8 rounded-full mx-auto mb-2"
            style={{ backgroundColor: primaryColor }}
          />
          <span>Ícone</span>
        </div>
      </div>
      
      <div className="mt-4 p-2 bg-gray-100 rounded-md">
        <p className="text-sm font-mono">
          Código da cor: <span style={{ color: primaryColor }}>{primaryColor}</span>
        </p>
      </div>
    </div>
  );
} 
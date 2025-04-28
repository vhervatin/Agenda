import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company } from '@/types/types';
import { fetchCompanySettings } from '@/services/api';

interface CompanySettingsContextType {
  settings: Company | null;
  isLoading: boolean;
  error: Error | null;
  refreshSettings: () => Promise<void>;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

export function CompanySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCompanySettings();
      setSettings(data);
      
      // Aplicar a cor primária como variável CSS
      if (data?.primary_color) {
        applyPrimaryColor(data.primary_color);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar configurações'));
      console.error('Erro ao carregar configurações da empresa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para aplicar a cor primária como variável CSS
  const applyPrimaryColor = (color: string) => {
    // Converter a cor hexadecimal para HSL
    const hsl = hexToHSL(color);
    if (hsl) {
      // Aplicar a cor como variável CSS
      document.documentElement.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      
      // Ajustar a cor do anel (ring) também
      document.documentElement.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  };

  // Função para converter cor hexadecimal para HSL
  const hexToHSL = (hex: string) => {
    // Remover o # se presente
    hex = hex.replace('#', '');
    
    // Converter para RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Encontrar min e max valores RGB
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    // Calcular luminosidade
    let l = (max + min) / 2;
    
    // Calcular saturação
    let s = 0;
    if (max !== min) {
      s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    }
    
    // Calcular matiz (hue)
    let h = 0;
    if (max !== min) {
      if (max === r) {
        h = (g - b) / (max - min) + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / (max - min) + 2;
      } else if (max === b) {
        h = (r - g) / (max - min) + 4;
      }
      h /= 6;
    }
    
    // Converter para graus, porcentagem, porcentagem
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return { h, s, l };
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <CompanySettingsContext.Provider value={{ settings, isLoading, error, refreshSettings }}>
      {children}
    </CompanySettingsContext.Provider>
  );
}

export function useCompanySettings() {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error('useCompanySettings deve ser usado dentro de um CompanySettingsProvider');
  }
  return context;
} 
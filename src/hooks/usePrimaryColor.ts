import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useEffect, useState } from 'react';

/**
 * Hook para obter a cor primária atual da empresa
 * @returns A cor primária em formato hexadecimal
 */
export function usePrimaryColor() {
  const { settings } = useCompanySettings();
  const [primaryColor, setPrimaryColor] = useState<string>('#0080FF'); // Cor padrão

  useEffect(() => {
    if (settings?.primary_color) {
      setPrimaryColor(settings.primary_color);
    }
  }, [settings]);

  return primaryColor;
}

/**
 * Hook para obter estilos CSS baseados na cor primária
 * @returns Objeto com estilos CSS para usar com a cor primária
 */
export function usePrimaryColorStyles() {
  const primaryColor = usePrimaryColor();
  
  return {
    color: primaryColor,
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    // Adicione mais propriedades conforme necessário
  };
} 
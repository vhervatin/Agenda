import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { fetchCompanySettings } from '@/services/api';

const Logo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const getCompanyLogo = async () => {
      try {
        const settings = await fetchCompanySettings();
        if (settings?.logo_url) {
          setLogoUrl(settings.logo_url);
        }
      } catch (error) {
        console.error('Error fetching company logo:', error);
      }
    };

    getCompanyLogo();
  }, []);

  if (logoUrl) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={logoUrl} alt="Logo da empresa" />
        <AvatarFallback>
          <div className="w-3 h-3 bg-primary rounded-sm transform rotate-45" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 bg-primary rounded-lg animate-spin-slow opacity-20" />
      <div className="absolute inset-1 bg-background rounded-md" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-primary rounded-sm transform rotate-45" />
      </div>
    </div>
  );
};

export default Logo;

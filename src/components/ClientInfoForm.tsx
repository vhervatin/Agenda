
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ClientInfoFormProps {
  clientName: string;
  clientPhone: string;
  onClientNameChange: (value: string) => void;
  onClientPhoneChange: (value: string) => void;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  clientName,
  clientPhone,
  onClientNameChange,
  onClientPhoneChange
}) => {
  const handleNameChange = (value: string) => {
    if (value.length > 50) {
      toast.warning("O nome não pode ter mais de 50 caracteres");
      return;
    }
    onClientNameChange(value);
  };

  const handlePhoneChange = (value: string) => {
    if (value.length > 15) {
      toast.warning("O telefone não pode ter mais de 15 caracteres");
      return;
    }
    onClientPhoneChange(value);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Seus dados</h2>
      
      <div className="space-y-2">
        <Label htmlFor="client-name">Nome completo</Label>
        <Input
          id="client-name"
          placeholder="Digite seu nome completo"
          value={clientName}
          onChange={(e) => handleNameChange(e.target.value)}
          maxLength={50}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {clientName.length}/50 caracteres
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="client-phone">Telefone</Label>
        <Input
          id="client-phone"
          placeholder="(00) 00000-0000"
          type="tel"
          value={clientPhone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          maxLength={15}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {clientPhone.length}/15 caracteres
        </p>
      </div>
    </div>
  );
};

export default ClientInfoForm;

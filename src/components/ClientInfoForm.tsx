
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ClientInfoFormProps {
  clientName: string;
  clientPhone: string;
  clientCpf: string;
  onClientNameChange: (value: string) => void;
  onClientPhoneChange: (value: string) => void;
  onClientCpfChange: (value: string) => void;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  clientName,
  clientPhone,
  clientCpf,
  onClientNameChange,
  onClientPhoneChange,
  onClientCpfChange
}) => {
  const handleNameChange = (value: string) => {
    if (value.length > 50) {
      toast.warning("O nome não pode ter mais de 50 caracteres");
      return;
    }
    onClientNameChange(value);
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplicar a formatação (00) 00000-0000
    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 7) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    } else {
      // Limite em 11 dígitos
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneNumber(value);
    onClientPhoneChange(formattedPhone);
  };

  const formatCpf = (value: string): string => {
    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplicar a formatação 000.000.000-00
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    } else {
      return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;
    }
  };

  const handleCpfChange = (value: string) => {
    const formattedCpf = formatCpf(value);
    if (formattedCpf.replace(/\D/g, '').length > 11) {
      toast.warning("O CPF não pode ter mais de 11 dígitos");
      return;
    }
    onClientCpfChange(formattedCpf);
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
      
      <div className="space-y-2">
        <Label htmlFor="client-cpf">CPF</Label>
        <Input
          id="client-cpf"
          placeholder="000.000.000-00"
          value={clientCpf}
          onChange={(e) => handleCpfChange(e.target.value)}
          maxLength={14}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {clientCpf.length}/14 caracteres
        </p>
      </div>
    </div>
  );
};

export default ClientInfoForm;

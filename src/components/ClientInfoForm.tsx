
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Seus dados</h2>
      
      <div className="space-y-2">
        <Label htmlFor="client-name">Nome completo</Label>
        <Input
          id="client-name"
          placeholder="Digite seu nome completo"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="client-phone">Telefone</Label>
        <Input
          id="client-phone"
          placeholder="(00) 00000-0000"
          type="tel"
          value={clientPhone}
          onChange={(e) => onClientPhoneChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default ClientInfoForm;

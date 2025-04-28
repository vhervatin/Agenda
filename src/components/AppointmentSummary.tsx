import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AppointmentSummaryProps {
  service: {
    name: string;
    duration: string;
    price: string;
  };
  date: Date | null;
  time: string | null;
  professionalName: string;
  clientName: string;
  clientPhone: string;
  clientCpf: string;
  onConfirm: () => void;
  onEdit: () => void;
  isSubmitting: boolean;
}

const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  service,
  date,
  time,
  professionalName,
  clientName,
  clientPhone,
  clientCpf,
  onConfirm,
  onEdit,
  isSubmitting
}) => {
  const formatCpf = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
  
  const formatPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl">
          <Check className="mr-2 h-5 w-5 text-primary" />
          Confirmar Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Serviço</h3>
            <p className="text-muted-foreground">{service.name}</p>
            <div className="flex flex-wrap gap-x-4 mt-1">
              <span className="text-sm">{service.duration}</span>
              <span className="text-sm">{service.price}</span>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold">Profissional</h3>
            <p className="text-muted-foreground">{professionalName}</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold">Data e Horário</h3>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data não selecionada'}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <Clock className="h-4 w-4" />
              <span>{time || 'Horário não selecionado'}</span>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold">Dados do Cliente</h3>
            <div className="space-y-1 text-muted-foreground">
              <p>{clientName}</p>
              <p>{formatPhone(clientPhone)}</p>
              <p>{formatCpf(clientCpf)}</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onEdit}
              disabled={isSubmitting}
              className="flex-1"
            >
              Editar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentSummary;

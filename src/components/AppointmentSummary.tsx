
import React from 'react';
import { CalendarDays, Clock, Scissors, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AppointmentSummaryProps {
  service: {
    name: string;
    duration: string;
    price: string;
  } | null;
  date: Date | null;
  time: string | null;
  professionalName?: string;
  clientName?: string;
  clientPhone?: string;
  onConfirm: () => void;
  onEdit: () => void;
  isSubmitting?: boolean;
}

const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  service,
  date,
  time,
  professionalName,
  clientName,
  clientPhone,
  onConfirm,
  onEdit,
  isSubmitting = false
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const allDetailsProvided = service && date && time && professionalName;

  return (
    <Card className="w-full animate-scale-in">
      <CardHeader>
        <CardTitle className="text-xl">Resumo do Agendamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="rounded-full p-2 bg-primary/10">
            <Scissors className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Serviço</p>
            <p className="font-medium">{service?.name || "Nenhum serviço selecionado"}</p>
            {service && (
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{service.duration}</span>
                <span className="mx-2">•</span>
                <span>{service.price}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="rounded-full p-2 bg-primary/10">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data e Horário</p>
            <p className="font-medium">{date ? formatDate(date) : "Nenhuma data selecionada"}</p>
            {time && <p className="text-sm text-muted-foreground mt-1">{time}</p>}
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="rounded-full p-2 bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Prestador</p>
            <p className="font-medium">{professionalName || "Nenhum profissional selecionado"}</p>
          </div>
        </div>

        {(clientName || clientPhone) && (
          <div className="flex items-start space-x-3">
            <div className="rounded-full p-2 bg-primary/10">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seus dados</p>
              <p className="font-medium">{clientName}</p>
              {clientPhone && <p className="text-sm text-muted-foreground mt-1">{clientPhone}</p>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          onClick={onConfirm} 
          className="w-full" 
          disabled={!allDetailsProvided || isSubmitting}
        >
          {isSubmitting ? "Processando..." : "Confirmar Agendamento"}
        </Button>
        <Button 
          variant="outline" 
          onClick={onEdit} 
          className="w-full" 
          disabled={isSubmitting}
        >
          Editar Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppointmentSummary;

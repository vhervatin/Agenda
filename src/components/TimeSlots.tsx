
import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
  professional_id?: string;
  convenio_id?: string;
  convenio_nome?: string;
  is_available?: boolean;
}

interface TimeSlotsProps {
  timeSlots: TimeSlot[];
  selectedSlot: string | null;
  onSelectTimeSlot: (slotId: string) => void;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({
  timeSlots,
  selectedSlot,
  onSelectTimeSlot
}) => {
  // Filter out past time slots if the date is today and unavailable slots
  const currentTime = new Date();
  
  const filteredTimeSlots = timeSlots.filter(slot => {
    // Skip unavailable slots
    if (!slot.available || slot.is_available === false) {
      return false;
    }
    
    if (!slot.start_time) return true;
    
    const slotTime = new Date(slot.start_time);
    const isToday = new Date().toDateString() === slotTime.toDateString();
    
    // Only filter out past times if the slot is for today
    if (isToday) {
      return slotTime > currentTime;
    }
    
    return true;
  });
  
  if (filteredTimeSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground animate-fade-in">
        <Clock className="h-8 w-8 mb-2 opacity-50" />
        <p>Nenhum horário disponível para esta data</p>
        <p className="text-sm">Por favor, selecione outra data</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <h3 className="text-base font-medium mb-3">Horários disponíveis</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filteredTimeSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.available && onSelectTimeSlot(slot.id)}
            disabled={!slot.available}
            className={cn(
              "time-slot flex items-center justify-center p-2 border rounded-md hover:bg-primary/10 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
              selectedSlot === slot.id && "bg-primary text-primary-foreground hover:bg-primary hover:border-primary",
              !slot.available && "opacity-40 cursor-not-allowed bg-muted hover:bg-muted hover:border-border"
            )}
            aria-label={`Horário ${slot.time} ${slot.available ? 'disponível' : 'indisponível'}${slot.convenio_nome ? ` (${slot.convenio_nome})` : ''}`}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center">
                <Clock className={cn(
                  "h-3 w-3 mr-2",
                  selectedSlot === slot.id ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                <span className="text-sm font-medium">{slot.time}</span>
              </div>
              {slot.convenio_nome && (
                <span className={cn(
                  "text-xs mt-1",
                  selectedSlot === slot.id ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {slot.convenio_nome}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlots;

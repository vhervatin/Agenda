
import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
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
  // Filter out past time slots if the date is today
  const currentTime = new Date();
  
  const filteredTimeSlots = timeSlots.filter(slot => {
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
              "time-slot",
              selectedSlot === slot.id && "time-slot-selected",
              !slot.available && "opacity-40 cursor-not-allowed bg-muted hover:bg-muted hover:border-border"
            )}
          >
            <div className="flex items-center justify-center">
              <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">{slot.time}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlots;

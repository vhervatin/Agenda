
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabledDates?: Date[];
  className?: string;
  availableDates?: string[]; // Array of date strings that have available slots
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  availableDates = [],
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  
  // Generate days for the month view
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  
  // Get day names for the week header (starting from Sunday)
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startOfWeek(new Date()), i);
    return format(date, 'EEEEEE', { locale: ptBR }).toUpperCase();
  });
  
  // Adjust the calendar grid to start from the correct day of week
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayIndex = firstDayOfMonth.getDay();
  const prefixDays = Array(startingDayIndex).fill(null);
  
  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable dates in the past
    if (isBefore(date, today)) return true;
    
    // Disable specific dates provided
    if (disabledDates.some(disabledDate => isSameDay(disabledDate, date))) return true;
    
    // If availableDates is provided, only enable dates in that list
    if (availableDates.length > 0) {
      const dateString = format(date, 'yyyy-MM-dd');
      return !availableDates.includes(dateString);
    }
    
    return false;
  };

  return (
    <div className={cn("w-full p-3 bg-card rounded-xl border shadow-sm animate-scale-in", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToPreviousMonth} 
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-base font-medium capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToNextMonth} 
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-xs font-medium text-center text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first of the month */}
        {prefixDays.map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day opacity-0"></div>
        ))}
        
        {/* Actual days of the month */}
        {daysInMonth.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDisabled = isDateDisabled(day);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && onDateSelect(day)}
              disabled={isDisabled}
              className={cn(
                "calendar-day",
                isSelected && "calendar-day-selected",
                isDisabled && "calendar-day-disabled",
                isTodayDate && !isSelected && "border border-primary/40"
              )}
            >
              <span className="text-sm">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;

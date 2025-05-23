import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { fetchProfessionals } from '@/services/api';
import { TimeRange, DateRangeOptions } from '@/types/types';

interface ScheduleFormProps {
  onTimeRangeChange: (timeRange: TimeRange) => void;
  onDateRangeChange: (dateRange: Date[]) => void;
  onProfessionalChange: (professionalId: string) => void;
  onSlotDurationChange: (duration: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onClose: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onTimeRangeChange,
  onDateRangeChange,
  onProfessionalChange,
  onSlotDurationChange,
  onSubmit,
  isLoading,
  onClose
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startHour: '08',
    startMinute: '00',
    endHour: '18',
    endMinute: '00',
  });
  
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOptions>({
    startDate: new Date(),
    endDate: undefined,
    selectedDays: [0, 1, 2, 3, 4, 5, 6], // All days selected by default
  });
  
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => fetchProfessionals()
  });
  
  const handleTimeRangeChange = (field: keyof TimeRange, value: string) => {
    const newTimeRange = { ...timeRange, [field]: value };
    setTimeRange(newTimeRange);
    onTimeRangeChange(newTimeRange);
  };
  
  const handleProfessionalChange = (value: string) => {
    setSelectedProfessional(value);
    onProfessionalChange(value);
  };
  
  const handleSlotDurationChange = (value: number) => {
    setSlotDuration(value);
    onSlotDurationChange(value);
  };
  
  const handleDateSelect = (date: Date) => {
    const newDateRange = [date];
    if (dateRangeOption.endDate) {
      newDateRange.push(dateRangeOption.endDate);
    }
    onDateRangeChange(newDateRange);
    setDateRangeOption(prev => ({ ...prev, startDate: date }));
  };
  
  const handleDaySelect = (day: number) => {
    const newSelectedDays = dateRangeOption.selectedDays.includes(day)
      ? dateRangeOption.selectedDays.filter(d => d !== day)
      : [...dateRangeOption.selectedDays, day];
    
    setDateRangeOption(prev => ({ ...prev, selectedDays: newSelectedDays }));
  };
  
  const getDayName = (day: number): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day];
  };
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="professional">Profissional</Label>
          <Select
            value={selectedProfessional}
            onValueChange={handleProfessionalChange}
          >
            <SelectTrigger id="professional">
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Horário inicial</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={timeRange.startHour}
                onValueChange={(value) => handleTimeRangeChange('startHour', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 24}, (_, i) => i).map((hour) => (
                    <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={timeRange.startMinute}
                onValueChange={(value) => handleTimeRangeChange('startMinute', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Minuto" />
                </SelectTrigger>
                <SelectContent>
                  {['00', '15', '30', '45'].map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Horário final</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={timeRange.endHour}
                onValueChange={(value) => handleTimeRangeChange('endHour', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 24}, (_, i) => i).map((hour) => (
                    <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={timeRange.endMinute}
                onValueChange={(value) => handleTimeRangeChange('endMinute', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Minuto" />
                </SelectTrigger>
                <SelectContent>
                  {['00', '15', '30', '45'].map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="slot-duration">Duração de cada horário</Label>
          <RadioGroup
            value={slotDuration.toString()}
            onValueChange={(value) => handleSlotDurationChange(parseInt(value))}
            className="flex flex-wrap gap-4 mt-2"
          >
            {[15, 30, 45, 60].map((duration) => (
              <div key={duration} className="flex items-center space-x-2">
                <RadioGroupItem value={duration.toString()} id={`duration-${duration}`} />
                <Label htmlFor={`duration-${duration}`}>{duration} min</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Período</Label>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="range"
                selected={{
                  from: dateRangeOption.startDate,
                  to: dateRangeOption.endDate
                }}
                onSelect={(range) => {
                  if (!range) return;
                  handleDateSelect(range.from);
                  if (range.to) handleDateSelect(range.to);
                }}
                className="border rounded-md"
              />
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Dias da semana</div>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={dateRangeOption.selectedDays.includes(day) ? "default" : "outline"}
                    onClick={() => handleDaySelect(day)}
                    className="justify-start"
                  >
                    {getDayName(day)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !selectedProfessional || !(dateRangeOption.startDate)}>
          {isLoading ? "Gerando..." : "Gerar Horários"}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleForm;


import React, { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import * as z from "zod"
import { useQuery } from '@tanstack/react-query';
import { addDays, format, isAfter, isBefore, isWithinInterval } from 'date-fns';

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TimeRange, DateRangeOptions } from '@/types/types';
import { fetchProfessionals } from '@/services/api';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const timeRangeSchema = z.object({
  startHour: z.string().min(1, {
    message: "Selecione a hora de início.",
  }),
  startMinute: z.string().min(1, {
    message: "Selecione o minuto de início.",
  }),
  endHour: z.string().min(1, {
    message: "Selecione a hora de término.",
  }),
  endMinute: z.string().min(1, {
    message: "Selecione o minuto de término.",
  }),
  slotDuration: z.number().min(5).max(180)
})

interface ScheduleFormProps {
  onTimeRangeChange: (timeRange: TimeRange) => void;
  onDateRangeChange: (dateRange: Date[]) => void;
  onProfessionalChange: (professionalId: string) => void;
  onSlotDurationChange?: (duration: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onTimeRangeChange,
  onDateRangeChange,
  onProfessionalChange,
  onSlotDurationChange,
  onSubmit,
  isLoading,
  onClose
}) => {
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRangeOptions>({
    startDate: undefined,
    endDate: undefined,
    selectedDays: [1, 2, 3, 4, 5] // Default to weekdays
  });
  const [slotDuration, setSlotDuration] = useState(30); // Default 30 minutes

  // Fetch professionals data
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: fetchProfessionals
  });

  const form = useForm<z.infer<typeof timeRangeSchema>>({
    resolver: zodResolver(timeRangeSchema),
    defaultValues: {
      startHour: "09",
      startMinute: "00",
      endHour: "17",
      endMinute: "00",
      slotDuration: 30,
    },
  });

  const addTimeRange = (values: z.infer<typeof timeRangeSchema>) => {
    // Make sure we have all required fields for TimeRange
    const newTimeRange: TimeRange = {
      startHour: values.startHour,
      startMinute: values.startMinute,
      endHour: values.endHour,
      endMinute: values.endMinute
    };
    setTimeRanges([...timeRanges, newTimeRange]);
    // Also update parent component
    onTimeRangeChange(newTimeRange);
    form.reset({
      startHour: values.startHour,
      startMinute: values.startMinute,
      endHour: values.endHour,
      endMinute: values.endMinute,
      slotDuration: values.slotDuration
    });
    
    if (onSlotDurationChange) {
      onSlotDurationChange(values.slotDuration);
    }
  };

  const removeTimeRange = (index: number) => {
    const newTimeRanges = [...timeRanges];
    newTimeRanges.splice(index, 1);
    setTimeRanges(newTimeRanges);
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: Date | undefined) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Generate dates to pass to parent component
    generateDatesToParent({ ...dateRange, [field]: value });
  };

  const handleDayToggle = (day: number) => {
    setDateRange(prev => {
      const newSelectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day];
      
      // Generate dates to pass to parent component
      const newDateRange = {
        ...prev,
        selectedDays: newSelectedDays
      };
      
      generateDatesToParent(newDateRange);
      
      return newDateRange;
    });
  };

  const generateDatesToParent = (options: DateRangeOptions) => {
    const { startDate, endDate, selectedDays } = options;
    
    if (!startDate || !endDate) return;
    
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (selectedDays.includes(dayOfWeek)) {
        dates.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }
    
    onDateRangeChange(dates);
  };

  const handleProfessionalChange = (value: string) => {
    setSelectedProfessional(value);
    onProfessionalChange(value);
  };

  const handleSlotDurationChange = (value: number[]) => {
    const duration = value[0];
    setSlotDuration(duration);
    form.setValue("slotDuration", duration);
    
    if (onSlotDurationChange) {
      onSlotDurationChange(duration);
    }
  };

  const handleSubmitForm = () => {
    if (!selectedProfessional) {
      toast.error("Selecione um profissional para continuar.");
      return;
    }
    
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Selecione o período de datas.");
      return;
    }
    
    if (dateRange.selectedDays.length === 0) {
      toast.error("Selecione pelo menos um dia da semana.");
      return;
    }
    
    if (timeRanges.length === 0) {
      // Usar o valor atual do formulário diretamente
      const currentValues = form.getValues();
      addTimeRange(currentValues);
    }
    
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Profissional</Label>
        <Select onValueChange={handleProfessionalChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um profissional" />
          </SelectTrigger>
          <SelectContent>
            {professionals && professionals.map((professional) => (
              <SelectItem key={professional.id} value={professional.id}>
                {professional.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        <Label className="text-base">Período</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Data inicial</Label>
            <div className="border rounded-md">
              <Calendar
                mode="single"
                selected={dateRange.startDate}
                onSelect={(date) => handleDateRangeChange('startDate', date)}
                className="w-full max-w-full border-0"
                disabled={(date) => dateRange.endDate ? isAfter(date as Date, dateRange.endDate) : false}
              />
            </div>
          </div>
          <div>
            <Label>Data final</Label>
            <div className="border rounded-md">
              <Calendar
                mode="single"
                selected={dateRange.endDate}
                onSelect={(date) => handleDateRangeChange('endDate', date)}
                className="w-full max-w-full border-0"
                disabled={(date) => dateRange.startDate ? isBefore(date as Date, dateRange.startDate) : false}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <Label className="text-base mb-2 block">Dias da semana</Label>
        <div className="grid grid-cols-4 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`day-${day.value}`} 
                checked={dateRange.selectedDays.includes(day.value)}
                onCheckedChange={() => handleDayToggle(day.value)}
              />
              <label
                htmlFor={`day-${day.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {day.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <FormProvider {...form}>
        <Form {...form}>
          <div className="space-y-4">
            <Label className="text-base">Horários</Label>
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="startHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Início</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startMinute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minuto Início</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Minuto" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Fim</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endMinute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minuto Fim</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Minuto" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="slotDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração de cada vaga (minutos): {slotDuration}</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[30]}
                      max={180}
                      min={5}
                      step={5}
                      value={[field.value]}
                      onValueChange={handleSlotDurationChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Defina a duração de cada vaga entre 5 e 180 minutos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="button" onClick={() => addTimeRange(form.getValues())}>Adicionar Horário</Button>

            {timeRanges.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Horários Adicionados</h3>
                <ul>
                  {timeRanges.map((range, index) => (
                    <li key={index} className="flex items-center justify-between py-2 border-b">
                      <span>{range.startHour}:{range.startMinute} - {range.endHour}:{range.endMinute}</span>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeTimeRange(index)}>Remover</Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Form>
      </FormProvider>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleSubmitForm}
          disabled={isLoading}
        >
          {isLoading ? 'Gerando...' : 'Gerar Horários'}
        </Button>
      </div>
    </div>
  );
};

export default ScheduleForm;

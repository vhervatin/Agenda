
import React, { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import * as z from "zod"
import { useQuery } from '@tanstack/react-query';

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
import { TimeRange } from '@/types/types';
import { fetchProfessionals } from '@/services/api';
import { Calendar } from '@/components/ui/calendar';

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
})

interface ScheduleFormProps {
  onTimeRangeChange: (timeRange: TimeRange) => void;
  onDateRangeChange: (dateRange: Date[]) => void;
  onProfessionalChange: (professionalId: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onClose: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onTimeRangeChange,
  onDateRangeChange,
  onProfessionalChange,
  onSubmit,
  isLoading,
  onClose
}) => {
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string | undefined>(undefined);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

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
      endHour: "10",
      endMinute: "00",
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
      endMinute: values.endMinute
    });
  };

  const removeTimeRange = (index: number) => {
    const newTimeRanges = [...timeRanges];
    newTimeRanges.splice(index, 1);
    setTimeRanges(newTimeRanges);
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates);
      onDateRangeChange(dates);
    }
  };

  const handleProfessionalChange = (value: string) => {
    setSelectedProfessional(value);
    onProfessionalChange(value);
  };

  const handleSubmitForm = () => {
    if (!selectedProfessional) {
      toast.error("Selecione um profissional para continuar.");
      return;
    }
    
    if (selectedDates.length === 0) {
      toast.error("Selecione pelo menos uma data.");
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
      
      <div>
        <Label className="text-base">Datas</Label>
        <div className="border rounded-md p-2">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDateSelect}
            className="mx-auto"
          />
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

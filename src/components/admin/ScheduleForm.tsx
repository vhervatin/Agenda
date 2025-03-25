import React, { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { TimeRange } from '@/types/types';

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
  professionals: { id: string; name: string }[];
  onAddSlots: (professionalId: string, timeRanges: TimeRange[]) => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ professionals, onAddSlots }) => {
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof timeRangeSchema>>({
    resolver: zodResolver(timeRangeSchema),
    defaultValues: {
      startHour: "09",
      startMinute: "00",
      endHour: "10",
      endMinute: "00",
    },
  })

  const addTimeRange = (values: z.infer<typeof timeRangeSchema>) => {
    setTimeRanges([...timeRanges, values]);
    form.reset();
  };

  const removeTimeRange = (index: number) => {
    const newTimeRanges = [...timeRanges];
    newTimeRanges.splice(index, 1);
    setTimeRanges(newTimeRanges);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedProfessional) {
      toast({
        title: "Erro",
        description: "Selecione um profissional para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    if (timeRanges.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um horário.",
        variant: "destructive",
      });
      return;
    }
    
    // Make sure all TimeRange properties are strings to match the required type
    const formattedTimeRanges = timeRanges.map(range => ({
      startHour: range.startHour || '09',
      startMinute: range.startMinute || '00',
      endHour: range.endHour || '10',
      endMinute: range.endMinute || '00'
    }));
    
    onAddSlots(selectedProfessional, formattedTimeRanges);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FormLabel>Profissional</FormLabel>
          <Select onValueChange={setSelectedProfessional}>
            <SelectTrigger>
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
        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="startHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Início</FormLabel>
                <Select {...field}>
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
                <Select {...field}>
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
                <Select {...field}>
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
                <Select {...field}>
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
            <h3>Horários Adicionados</h3>
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

        <Button type="submit">Agendar Horários</Button>
      </form>
    </Form>
  );
};

export default ScheduleForm;

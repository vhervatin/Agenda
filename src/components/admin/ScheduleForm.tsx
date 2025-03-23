import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

import { cn } from "@/lib/utils"
import { createAvailableSlotsBulk, fetchProfessionals } from '@/services/api';
import { Professional } from '@/types/types';

const timeRangeSchema = z.object({
  startHour: z.string().min(1, { message: "Selecione a hora de início" }),
  startMinute: z.string().min(1, { message: "Selecione o minuto de início" }),
  endHour: z.string().min(1, { message: "Selecione a hora de término" }),
  endMinute: z.string().min(1, { message: "Selecione o minuto de término" }),
});

const formSchema = z.object({
  professionalId: z.string().min(1, { message: "Selecione um profissional" }),
  startDate: z.date({
    required_error: "Uma data de início é necessária.",
  }),
  endDate: z.date({
    required_error: "Uma data de término é necessária.",
  }),
  selectedDays: z.array(z.number()).min(1, { message: "Selecione pelo menos um dia da semana" }),
  timeRanges: z.array(timeRangeSchema).min(1, { message: "Adicione pelo menos um intervalo de tempo" }),
});

const ScheduleForm = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProfessionals = async () => {
      setIsLoading(true);
      try {
        const fetchedProfessionals = await fetchProfessionals();
        setProfessionals(fetchedProfessionals);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar profissionais.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfessionals();
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalId: "",
      startDate: new Date(),
      endDate: new Date(),
      selectedDays: [],
      timeRanges: [{ startHour: "09", startMinute: "00", endHour: "17", endMinute: "00" }],
    },
  });
  
  const { control, handleSubmit, watch, setValue } = form;
  
  const professionalId = watch("professionalId");
  const selectedDays = watch("selectedDays");
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { professionalId, startDate, endDate, selectedDays, timeRanges } = values;
      
      const result = await createAvailableSlotsBulk(
        professionalId,
        startDate,
        endDate,
        selectedDays,
        timeRanges
      );
      
      toast.success(`Criado(s) ${result.count} horários com sucesso!`);
      form.reset();
    } catch (error: any) {
      toast.error(`Erro ao criar horários: ${error.message || 'Erro desconhecido'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Profissional</Label>
          <Select onValueChange={(value) => setValue("professionalId", value)} value={professionalId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Início</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Término</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || (form.getValues("startDate") && date < form.getValues("startDate"))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <FormLabel>Dias da Semana</FormLabel>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Domingo", value: 0 },
            { label: "Segunda", value: 1 },
            { label: "Terça", value: 2 },
            { label: "Quarta", value: 3 },
            { label: "Quinta", value: 4 },
            { label: "Sexta", value: 5 },
            { label: "Sábado", value: 6 },
          ].map((day) => (
            <FormField
              key={day.value}
              control={control}
              name="selectedDays"
              render={({ field }) => {
                return (
                  <FormItem
                    key={day.value}
                    className="flex flex-row items-center space-x-2 rounded-md border border-muted p-2"
                  >
                    <FormControl>
                      <Switch
                        checked={field.value?.includes(day.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), day.value]);
                          } else {
                            field.onChange(field.value?.filter((v) => v !== day.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{day.label}</FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
        </div>
        <FormMessage />
      </div>

      <div className="space-y-2">
        <FormLabel>Horários</FormLabel>
        {form.getValues("timeRanges").map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 items-center">
            <FormField
              control={control}
              name={`timeRanges.${index}.startHour`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora Início</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`timeRanges.${index}.startMinute`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minuto Início</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`timeRanges.${index}.endHour`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora Fim</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`timeRanges.${index}.endMinute`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minuto Fim</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => setValue("timeRanges", [...form.getValues("timeRanges"), { startHour: "09", startMinute: "00", endHour: "17", endMinute: "00" }])}>
          Adicionar Horário
        </Button>
        <FormMessage />
      </div>

      <Button type="submit">Criar Horários</Button>
    </form>
  );
};

export default ScheduleForm;

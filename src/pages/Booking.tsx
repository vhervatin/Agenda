
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import StepIndicator from '@/components/StepIndicator';
import ServiceItem from '@/components/ServiceItem';
import DatePicker from '@/components/DatePicker';
import TimeSlots, { TimeSlot } from '@/components/TimeSlots';
import AppointmentSummary from '@/components/AppointmentSummary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const STEPS = ["Serviço", "Data", "Horário", "Confirmação"];

// Mock data for services
const services = [
  {
    id: "service-1",
    name: "Corte de Cabelo",
    duration: "45 min",
    price: "R$ 80,00",
    description: "Corte personalizado de acordo com seu estilo e preferência."
  },
  {
    id: "service-2",
    name: "Barba",
    duration: "30 min",
    price: "R$ 50,00",
    description: "Modelagem e acabamento de barba com toalha quente."
  },
  {
    id: "service-3",
    name: "Pacote Completo",
    duration: "75 min",
    price: "R$ 120,00",
    description: "Corte de cabelo + barba com desconto especial."
  },
  {
    id: "service-4",
    name: "Hidratação",
    duration: "50 min",
    price: "R$ 70,00",
    description: "Tratamento profundo para cabelos danificados ou ressecados."
  }
];

// Generate mock time slots for a given date
const generateTimeSlots = (date: Date): TimeSlot[] => {
  // This would come from a back-end API in a real application
  const slots = [];
  
  // Generate slots from 8:00 to 18:00 every 30 minutes
  for (let hour = 8; hour < 18; hour++) {
    for (let minute of [0, 30]) {
      // Generate some random availability
      const available = Math.random() > 0.3;
      
      slots.push({
        id: `slot-${hour}-${minute}`,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        available: available
      });
    }
  }
  
  return slots;
};

const Booking = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
      setSelectedTimeSlot(null); // Reset selected time slot when date changes
    }
  }, [selectedDate]);
  
  // Find the selected service object
  const selectedServiceObject = selectedService 
    ? services.find(service => service.id === selectedService) || null
    : null;
  
  // Find the selected time slot object
  const selectedTimeObject = selectedTimeSlot
    ? timeSlots.find(slot => slot.id === selectedTimeSlot)
    : null;
  
  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleConfirmAppointment = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Agendamento confirmado com sucesso!");
      navigate("/appointment-success");
    }, 1500);
  };
  
  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: return !!selectedService;
      case 1: return !!selectedDate;
      case 2: return !!selectedTimeSlot;
      default: return true;
    }
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Escolha um serviço</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <ServiceItem
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  duration={service.duration}
                  price={service.price}
                  description={service.description}
                  selected={service.id === selectedService}
                  onSelect={setSelectedService}
                />
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Escolha uma data</h2>
            <div className="max-w-md mx-auto">
              <DatePicker
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Escolha um horário</h2>
            <TimeSlots
              timeSlots={timeSlots}
              selectedSlot={selectedTimeSlot}
              onSelectTimeSlot={setSelectedTimeSlot}
            />
          </div>
        );
      case 3:
        return (
          <div className="max-w-md mx-auto">
            <AppointmentSummary
              service={selectedServiceObject}
              date={selectedDate}
              time={selectedTimeObject?.time || null}
              onConfirm={handleConfirmAppointment}
              onEdit={() => setCurrentStep(0)}
              isSubmitting={isSubmitting}
            />
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
          
          <div className="mt-8 mb-16">
            {renderStepContent()}
          </div>
          
          {currentStep < STEPS.length - 1 && (
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevStep}
                disabled={currentStep === 0 || isSubmitting}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              
              <Button
                onClick={handleNextStep}
                disabled={!isCurrentStepValid() || isSubmitting}
                className="flex items-center"
              >
                Avançar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Booking;

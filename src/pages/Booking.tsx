import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import NavBar from '@/components/NavBar';
import StepIndicator from '@/components/StepIndicator';
import ServiceItem from '@/components/ServiceItem';
import ProfessionalItem from '@/components/ProfessionalItem';
import DatePicker from '@/components/DatePicker';
import TimeSlots from '@/components/TimeSlots';
import ClientInfoForm from '@/components/ClientInfoForm';
import AppointmentSummary from '@/components/AppointmentSummary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { 
  fetchProfessionalServices, 
  fetchServiceProfessionals, 
  fetchAvailableSlots,
  createAppointment 
} from '@/services/api';
import { Professional, Service, TimeSlot } from '@/types/types';

const STEPS = ["Serviço", "Profissional", "Data", "Horário", "Dados", "Confirmação"];

const Booking = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCpf, setClientCpf] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cpfIsValid, setCpfIsValid] = useState(true);
  
  const { 
    data: services = [], 
    isLoading: isLoadingServices,
    error: servicesError
  } = useQuery({
    queryKey: ['services'],
    queryFn: () => fetchProfessionalServices()
  });
  
  const { 
    data: professionals = [], 
    isLoading: isLoadingProfessionals,
  } = useQuery({
    queryKey: ['professionals', selectedService],
    queryFn: () => selectedService ? fetchServiceProfessionals(selectedService) : Promise.resolve([]),
    enabled: !!selectedService
  });
  
  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      fetchAvailableSlots(formattedDate, selectedProfessional)
        .then(slots => {
          setTimeSlots(slots);
          setSelectedTimeSlot(null);
        })
        .catch(error => {
          console.error("Error fetching time slots:", error);
          toast.error("Não foi possível carregar os horários disponíveis");
        });
    }
  }, [selectedProfessional, selectedDate]);

  useEffect(() => {
    if (selectedProfessional) {
      setSelectedProfessional(null);
    }
  }, [selectedService]);
  
  const selectedProfessionalObject = selectedProfessional 
    ? professionals.find(prof => prof.id === selectedProfessional) || null
    : null;
    
  const selectedServiceObject = selectedService 
    ? services.find(service => service.id === selectedService) || null
    : null;
  
  const selectedTimeObject = selectedTimeSlot
    ? timeSlots.find(slot => slot.id === selectedTimeSlot)
    : null;
  
  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const isValidCpf = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      return false;
    }
    
    if (/^(\d)\1+$/.test(cleanCpf)) {
      return false;
    }
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) {
      return false;
    }
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) {
      return false;
    }
    
    return true;
  };
  
  useEffect(() => {
    if (clientCpf && clientCpf.replace(/\D/g, '').length === 11) {
      setCpfIsValid(isValidCpf(clientCpf));
    } else {
      setCpfIsValid(true);
    }
  }, [clientCpf]);
  
  const handleConfirmAppointment = () => {
    if (!selectedProfessional || !selectedService || !selectedTimeSlot || !clientName || !clientPhone || !clientCpf) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    if (!cpfIsValid) {
      toast.error("Por favor, insira um CPF válido");
      return;
    }
    
    if (!selectedTimeObject || !selectedDate) {
      toast.error("Por favor, selecione um horário válido");
      return;
    }
    
    setIsSubmitting(true);
    
    const appointment = {
      professional_id: selectedProfessional,
      service_id: selectedService,
      slot_id: selectedTimeSlot,
      client_name: clientName,
      client_phone: clientPhone,
      client_cpf: clientCpf,
      status: 'confirmed' as const,
      appointment_date: selectedTimeObject.start_time || new Date().toISOString()
    };
    
    createAppointment(appointment)
      .then(result => {
        setIsSubmitting(false);
        toast.success("Agendamento confirmado com sucesso!");
        navigate(`/appointment-success?id=${result.id}`);
      })
      .catch((error) => {
        console.error("Error creating appointment:", error);
        setIsSubmitting(false);
        toast.error("Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente.");
      });
  };
  
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: return !!selectedService;
      case 1: return !!selectedProfessional;
      case 2: return !!selectedDate;
      case 3: return !!selectedTimeSlot;
      case 4: return !!clientName && !!clientPhone && !!clientCpf && clientCpf.replace(/\D/g, '').length === 11 && cpfIsValid;
      default: return true;
    }
  };
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  };
  
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) {
      return 'Preço indisponível';
    }
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Escolha um serviço</h2>
            
            {isLoadingServices ? (
              <div className="text-center py-8">Carregando serviços...</div>
            ) : servicesError ? (
              <div className="text-center py-8 text-destructive">
                Erro ao carregar serviços. Por favor, tente novamente.
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">Nenhum serviço disponível no momento.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const serviceData = service.services || service;
                  return (
                    <ServiceItem
                      key={service.id}
                      id={service.id}
                      name={serviceData.name || 'Serviço sem nome'}
                      duration={formatDuration(serviceData.duration || 0)}
                      price={formatPrice(serviceData.price)}
                      description={serviceData.description || ''}
                      selected={service.id === selectedService}
                      onSelect={setSelectedService}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Escolha um profissional</h2>
            
            {isLoadingProfessionals ? (
              <div className="text-center py-8">Carregando profissionais...</div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-8">
                Nenhum profissional disponível para este serviço.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {professionals.map((professional) => {
                  const professionalData = professional.professionals || professional;
                  return (
                    <ProfessionalItem
                      key={professional.id}
                      id={professional.id}
                      name={professionalData.name || 'Profissional sem nome'}
                      photoUrl={professionalData.photo_url || ''}
                      bio={professionalData.bio || ''}
                      selected={professional.id === selectedProfessional}
                      onSelect={setSelectedProfessional}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      case 2:
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
      case 3:
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
      case 4:
        return (
          <ClientInfoForm
            clientName={clientName}
            clientPhone={clientPhone}
            clientCpf={clientCpf}
            onClientNameChange={setClientName}
            onClientPhoneChange={setClientPhone}
            onClientCpfChange={setClientCpf}
          />
        );
      case 5:
        return (
          <div className="max-w-md mx-auto">
            <AppointmentSummary
              service={{
                name: selectedServiceObject?.services?.name || selectedServiceObject?.name || '',
                duration: selectedServiceObject ? 
                  formatDuration(selectedServiceObject.services?.duration || selectedServiceObject.duration || 0) : '',
                price: selectedServiceObject ? 
                  formatPrice(selectedServiceObject.services?.price || selectedServiceObject.price) : '',
              }}
              date={selectedDate}
              time={selectedTimeObject?.time || null}
              professionalName={selectedProfessionalObject?.professionals?.name || selectedProfessionalObject?.name || ''}
              clientName={clientName}
              clientPhone={clientPhone}
              clientCpf={clientCpf}
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

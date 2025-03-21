
import { supabase } from "@/integrations/supabase/client";
import { Professional, Service, TimeSlot } from "@/types/types";

// Fetch all active professionals
export const fetchProfessionals = async (): Promise<Professional[]> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('active', true);
  
  if (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch services for a specific professional
export const fetchProfessionalServices = async (professionalId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('professional_services')
    .select('service_id')
    .eq('professional_id', professionalId);
  
  if (error) {
    console.error('Error fetching professional services:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  const serviceIds = data.map(item => item.service_id);
  
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .in('id', serviceIds)
    .eq('active', true);
  
  if (servicesError) {
    console.error('Error fetching services:', servicesError);
    throw servicesError;
  }
  
  return services || [];
};

// Fetch available time slots for a professional on a specific date
export const fetchAvailableSlots = async (professionalId: string, date: Date): Promise<TimeSlot[]> => {
  // Format the date to ISO string and get start/end of the day
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const { data, error } = await supabase
    .from('available_slots')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('is_available', true)
    .gte('start_time', selectedDate.toISOString())
    .lt('start_time', nextDay.toISOString())
    .order('start_time');
  
  if (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
  
  return (data || []).map(slot => ({
    id: slot.id,
    time: new Date(slot.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    available: slot.is_available,
    start_time: slot.start_time,
    end_time: slot.end_time
  }));
};

// Create a new appointment
export const createAppointment = async (
  professionalId: string,
  serviceId: string,
  slotId: string,
  clientName: string,
  clientPhone: string
): Promise<{ success: boolean; appointmentId?: string; error?: any }> => {
  
  // First update the slot to mark it as unavailable
  const { error: slotError } = await supabase
    .from('available_slots')
    .update({ is_available: false })
    .eq('id', slotId);
  
  if (slotError) {
    console.error('Error updating slot availability:', slotError);
    return { success: false, error: slotError };
  }
  
  // Then create the appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        professional_id: professionalId,
        service_id: serviceId,
        slot_id: slotId,
        client_name: clientName,
        client_phone: clientPhone,
        status: 'confirmed'
      }
    ])
    .select();
  
  if (error) {
    console.error('Error creating appointment:', error);
    // Try to revert the slot status if appointment creation failed
    await supabase
      .from('available_slots')
      .update({ is_available: true })
      .eq('id', slotId);
    
    return { success: false, error };
  }
  
  return {
    success: true,
    appointmentId: data?.[0]?.id
  };
};

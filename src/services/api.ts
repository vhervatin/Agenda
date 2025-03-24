import { supabase } from "@/integrations/supabase/client";
import { 
  Professional, 
  Service, 
  TimeSlot, 
  Appointment, 
  ProfessionalService,
  User,
  Company,
  WebhookConfiguration,
  TimeRange
} from "@/types/types";

// Function to fetch professionals
export const fetchProfessionals = async (): Promise<Professional[]> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('active', true);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
};

// Function to fetch professional services
export const fetchProfessionalServices = async (professionalId: string): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('professional_services')
      .select('service_id')
      .eq('professional_id', professionalId);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const serviceIds = data.map(item => item.service_id);
    
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds)
      .eq('active', true);
      
    if (servicesError) throw servicesError;
    
    return servicesData || [];
  } catch (error) {
    console.error('Error fetching professional services:', error);
    throw error;
  }
};

// Function to fetch available slots
export const fetchAvailableSlots = async (professionalId: string, date: Date): Promise<TimeSlot[]> => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('available_slots')
      .select('id, start_time, end_time, is_available')
      .eq('professional_id', professionalId)
      .gte('start_time', `${formattedDate}T00:00:00`)
      .lt('start_time', `${formattedDate}T23:59:59`)
      .eq('is_available', true)
      .order('start_time', { ascending: true });
      
    if (error) throw error;
    
    return (data || []).map(slot => ({
      id: slot.id,
      time: new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      available: slot.is_available,
      start_time: slot.start_time,
      end_time: slot.end_time,
      professional_id: professionalId
    }));
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

// Function to create appointment
export const createAppointment = async (
  professionalId: string,
  serviceId: string,
  slotId: string,
  clientName: string,
  clientPhone: string,
  clientCpf: string
): Promise<{ success: boolean; appointmentId?: string }> => {
  try {
    // Get the slot details
    const { data: slotData, error: slotError } = await supabase
      .from('available_slots')
      .select('*')
      .eq('id', slotId)
      .single();
    
    if (slotError || !slotData) {
      console.error('Error fetching slot:', slotError);
      return { success: false };
    }
    
    // Create the appointment
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        professional_id: professionalId,
        service_id: serviceId,
        slot_id: slotId,
        client_name: clientName,
        client_phone: clientPhone,
        client_cpf: clientCpf,
        status: 'confirmed'
      })
      .select('id')
      .single();
    
    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      return { success: false };
    }
    
    // Mark the slot as unavailable
    const { error: updateError } = await supabase
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', slotId);
    
    if (updateError) {
      console.error('Error updating slot availability:', updateError);
      // We already created the appointment, so we'll return success anyway
    }
    
    // Process webhook for appointment_created event
    try {
      const { data: webhookConfigs } = await supabase
        .from('webhook_configurations')
        .select('*')
        .eq('event_type', 'appointment_created')
        .eq('is_active', true);
      
      if (webhookConfigs && webhookConfigs.length > 0) {
        // Get the appointment date from the slot
        const appointmentDate = slotData.start_time;
        
        // For each active webhook, trigger it
        for (const webhook of webhookConfigs) {
          await supabase.functions.invoke('process-webhook', {
            body: {
              webhookId: webhook.id,
              eventType: 'appointment_created',
              payload: {
                appointment_id: appointmentData.id,
                professional_id: professionalId,
                service_id: serviceId,
                client_name: clientName,
                client_phone: clientPhone,
                client_cpf: clientCpf,
                appointment_date: appointmentDate
              }
            }
          });
        }
      }
    } catch (webhookError) {
      console.error('Error processing webhook:', webhookError);
      // We already created the appointment, so we'll return success anyway
    }
    
    return { 
      success: true,
      appointmentId: appointmentData?.id
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false };
  }
};

// ... keep existing code (other API functions)

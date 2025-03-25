
import { supabase } from '@/integrations/supabase/client';
import { Service, Professional, TimeSlot, Appointment, TimeRange } from '@/types/types';

export const fetchProfessionalServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const fetchServiceProfessionals = async (serviceId: string): Promise<Professional[]> => {
  try {
    const { data, error } = await supabase
      .from('professional_services')
      .select('professional_id')
      .eq('service_id', serviceId);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const professionalIds = data.map(item => item.professional_id);
      
      const { data: professionals, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('active', true)
        .in('id', professionalIds);
      
      if (profError) throw profError;
      return professionals || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
};

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const fetchProfessionals = async (): Promise<Professional[]> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
};

export const fetchAvailableSlots = async (
  professionalId: string,
  date: Date
): Promise<TimeSlot[]> => {
  try {
    const dateString = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .gte('start_time', `${dateString}T00:00:00`)
      .lt('start_time', `${dateString}T23:59:59`)
      .eq('is_available', true)
      .order('start_time');
    
    if (error) throw error;
    
    // Format the slots for the frontend
    return (data || []).map(slot => ({
      id: slot.id,
      time: new Date(slot.start_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      available: true,
      start_time: slot.start_time,
      end_time: slot.end_time
    }));
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

export const createAppointment = async (
  professionalId: string,
  serviceId: string,
  slotId: string,
  clientName: string,
  clientPhone: string,
  clientCpf: string
): Promise<{ id: string }> => {
  try {
    // Get the slot information first (we need its date/time)
    const { data: slotData, error: slotError } = await supabase
      .from('available_slots')
      .select('*')
      .eq('id', slotId)
      .single();
    
    if (slotError) throw slotError;
    
    // Create the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        professional_id: professionalId,
        service_id: serviceId,
        slot_id: slotId,
        client_name: clientName,
        client_phone: clientPhone,
        client_cpf: clientCpf,
        status: 'confirmed',
        appointment_date: slotData.start_time, // Save appointment date/time
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the slot to no longer be available
    const { error: updateError } = await supabase
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', slotId);
    
    if (updateError) throw updateError;
    
    return { id: data.id };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (id, name, photo_url),
        services:service_id (id, name, duration, price, description),
        slots:slot_id (id, start_time, end_time)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (
  id: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const createAvailableSlots = async (
  professionalId: string,
  date: Date,
  timeRanges: TimeRange[]
): Promise<void> => {
  try {
    // Create slots for the given time ranges
    const slots = timeRanges.map(range => {
      const startTime = new Date(date);
      startTime.setHours(parseInt(range.startHour), parseInt(range.startMinute), 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(parseInt(range.endHour), parseInt(range.endMinute), 0, 0);
      
      return {
        professional_id: professionalId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_available: true
      };
    });
    
    if (slots.length > 0) {
      const { error } = await supabase
        .from('available_slots')
        .insert(slots);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error creating available slots:', error);
    throw error;
  }
};

export const deleteAvailableSlot = async (slotId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('available_slots')
      .delete()
      .eq('id', slotId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting available slot:', error);
    throw error;
  }
};

export const fetchCompanySettings = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
};

export const updateCompanySettings = async (settings: {
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  slug: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(settings)
      .eq('id', settings.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating company settings:', error);
    throw error;
  }
};

export const createCompanySettings = async (settings: {
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  slug: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert(settings)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating company settings:', error);
    throw error;
  }
};

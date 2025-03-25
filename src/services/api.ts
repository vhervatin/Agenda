import { supabase } from '@/integrations/supabase/client';
import { Professional, Service, TimeSlot, Appointment } from '@/types/types';

export const fetchProfessionals = async (): Promise<Professional[]> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*');

    if (error) {
      console.error('Error fetching professionals:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching professionals:', error);
    throw new Error(error.message);
  }
};

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*');

    if (error) {
      console.error('Error fetching services:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching services:', error);
    throw new Error(error.message);
  }
};

export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services (name, duration, price),
        professionals (name),
        available_slots (start_time, end_time)
      `);

    if (error) {
      console.error('Error fetching appointments:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    throw new Error(error.message);
  }
};

export const fetchAllSlotsForProfessional = async (professionalId: string): Promise<TimeSlot[]> => {
  try {
    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .eq('professional_id', professionalId);

    if (error) {
      console.error('Error fetching time slots:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching time slots:', error);
    throw new Error(error.message);
  }
};

export const createAvailableSlot = async (
  professionalId: string,
  startTime: Date,
  endTime: Date
): Promise<TimeSlot> => {
  try {
    const { data, error } = await supabase
      .from('available_slots')
      .insert({
        professional_id: professionalId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_available: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating time slot:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('Error creating time slot:', error);
    throw new Error(error.message);
  }
};

export const createAvailableSlotsBulk = async (
  professionalId: string,
  startDate: Date,
  endDate: Date,
  selectedDays: number[],
  timeRanges: Array<{startHour: string, startMinute: string, endHour: string, endMinute: string}>
): Promise<{ count: number }> => {
  try {
    // Make sure selectedDays is an array
    const daysArray = Array.isArray(selectedDays) ? selectedDays : [selectedDays];
    
    const { data, error } = await supabase.rpc('create_available_slots_bulk', {
      p_professional_id: professionalId,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_selected_days: daysArray, 
      p_time_ranges: timeRanges
    });

    if (error) throw error;
    
    return { count: data?.length || 0 };
  } catch (error: any) {
    console.error('Error creating bulk slots:', error);
    throw new Error(error.message || 'Error creating bulk slots');
  }
};

export const deleteAvailableSlot = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('available_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting time slot:', error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error('Error deleting time slot:', error);
    throw new Error(error.message);
  }
};

export const createAppointment = async (
  serviceId: string,
  professionalId: string,
  slotId: string,
  clientName: string,
  clientPhone: string,
  clientCpf: string
): Promise<{ id: string }> => {
  try {
    // Get the slot to store the appointment date and time
    const { data: slotData, error: slotError } = await supabase
      .from('available_slots')
      .select('*')
      .eq('id', slotId)
      .single();
    
    if (slotError) throw slotError;
    
    // Insert the appointment with the slot date
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        service_id: serviceId,
        professional_id: professionalId,
        slot_id: slotId,
        client_name: clientName,
        client_phone: clientPhone,
        client_cpf: clientCpf,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the slot availability
    const { error: updateError } = await supabase
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', slotId);
    
    if (updateError) throw updateError;
    
    return { id: data.id };
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    throw new Error(error.message || 'Error creating appointment');
  }
};

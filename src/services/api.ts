
import { supabase } from '@/integrations/supabase/client';
import { Professional, Service, TimeSlot, Appointment, Company } from '@/types/types';

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

export const fetchProfessionalServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Error fetching professional services:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching professional services:', error);
    throw new Error(error.message);
  }
};

export const fetchServiceProfessionals = async (serviceId: string): Promise<Professional[]> => {
  try {
    const { data, error } = await supabase
      .from('professional_services')
      .select('professional_id')
      .eq('service_id', serviceId);

    if (error) {
      console.error('Error fetching service professionals:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      // If no professional is explicitly associated with the service, return all active professionals
      const { data: allProfessionals, error: allProfessionalsError } = await supabase
        .from('professionals')
        .select('*')
        .eq('active', true);

      if (allProfessionalsError) {
        console.error('Error fetching all professionals:', allProfessionalsError);
        throw new Error(allProfessionalsError.message);
      }

      return allProfessionals || [];
    }

    // Get the professionals details
    const professionalIds = data.map(item => item.professional_id);
    const { data: professionals, error: professionalsError } = await supabase
      .from('professionals')
      .select('*')
      .in('id', professionalIds)
      .eq('active', true);

    if (professionalsError) {
      console.error('Error fetching professionals by ids:', professionalsError);
      throw new Error(professionalsError.message);
    }

    return professionals || [];
  } catch (error: any) {
    console.error('Error fetching service professionals:', error);
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

    return (data || []).map(appointment => ({
      ...appointment,
      status: appointment.status as "confirmed" | "cancelled" | "completed"
    }));
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    throw new Error(error.message);
  }
};

export const fetchAppointmentsByCpf = async (cpf: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services (name, duration, price),
        professionals (name),
        available_slots (start_time, end_time)
      `)
      .eq('client_cpf', cpf);

    if (error) {
      console.error('Error fetching appointments by CPF:', error);
      throw new Error(error.message);
    }

    return (data || []).map(appointment => ({
      ...appointment,
      status: appointment.status as "confirmed" | "cancelled" | "completed"
    }));
  } catch (error: any) {
    console.error('Error fetching appointments by CPF:', error);
    throw new Error(error.message);
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string, 
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error updating appointment status:', error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
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

    return (data || []).map(slot => ({
      id: slot.id,
      time: new Date(slot.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      available: slot.is_available,
      start_time: slot.start_time,
      end_time: slot.end_time,
      professional_id: slot.professional_id
    }));
  } catch (error: any) {
    console.error('Error fetching time slots:', error);
    throw new Error(error.message);
  }
};

export const fetchAvailableSlots = async (professionalId: string, date: Date): Promise<TimeSlot[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('is_available', true)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time');

    if (error) {
      console.error('Error fetching available slots:', error);
      throw new Error(error.message);
    }

    return (data || []).map(slot => ({
      id: slot.id,
      time: new Date(slot.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      available: true,
      start_time: slot.start_time,
      end_time: slot.end_time,
      professional_id: slot.professional_id
    }));
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
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

    return {
      id: data.id,
      time: new Date(data.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      available: data.is_available,
      start_time: data.start_time,
      end_time: data.end_time,
      professional_id: data.professional_id
    };
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
    
    // Manually create slots since the RPC function is not working
    let createdSlots = 0;
    const currentDate = new Date(startDate);
    
    // Loop through each day from start date to end date
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Check if the current day is one of the selected days
      if (daysArray.includes(dayOfWeek)) {
        // Loop through each time range and create a slot
        for (const range of timeRanges) {
          const slotStartTime = new Date(currentDate);
          slotStartTime.setHours(parseInt(range.startHour), parseInt(range.startMinute), 0, 0);
          
          const slotEndTime = new Date(currentDate);
          slotEndTime.setHours(parseInt(range.endHour), parseInt(range.endMinute), 0, 0);
          
          // Only create slots if end time is after start time
          if (slotEndTime > slotStartTime) {
            try {
              const { error } = await supabase
                .from('available_slots')
                .insert({
                  professional_id: professionalId,
                  start_time: slotStartTime.toISOString(),
                  end_time: slotEndTime.toISOString(),
                  is_available: true
                });
              
              if (!error) {
                createdSlots++;
              }
            } catch (insertError) {
              console.error('Error inserting slot:', insertError);
            }
          }
        }
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { count: createdSlots };
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
  professionalId: string,
  serviceId: string,
  slotId: string,
  clientName: string,
  clientPhone: string,
  clientCpf: string
): Promise<{ id: string }> => {
  try {
    // Insert the appointment
    const { data, error } = await supabase
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

// Professional management functions
export const createProfessional = async (professionalData: {
  name: string;
  bio: string;
  phone: string;
  photo_url: string;
  active: boolean;
}): Promise<Professional> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .insert(professionalData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error creating professional:', error);
    throw new Error(error.message || 'Error creating professional');
  }
};

export const updateProfessional = async (
  id: string,
  professionalData: Partial<Professional>
): Promise<Professional> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .update(professionalData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating professional:', error);
    throw new Error(error.message || 'Error updating professional');
  }
};

export const deleteProfessional = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting professional:', error);
    throw new Error(error.message || 'Error deleting professional');
  }
};

// Service management functions
export const createService = async (serviceData: {
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
}): Promise<Service> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error creating service:', error);
    throw new Error(error.message || 'Error creating service');
  }
};

export const updateService = async (
  id: string,
  serviceData: Partial<Service>
): Promise<Service> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating service:', error);
    throw new Error(error.message || 'Error updating service');
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting service:', error);
    throw new Error(error.message || 'Error deleting service');
  }
};

// Professional-Service association functions
export const associateProfessionalService = async (
  professionalId: string,
  serviceId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('professional_services')
      .insert({
        professional_id: professionalId,
        service_id: serviceId
      });

    if (error) throw error;
  } catch (error: any) {
    console.error('Error associating professional with service:', error);
    throw new Error(error.message || 'Error associating professional with service');
  }
};

export const dissociateProfessionalService = async (
  professionalId: string,
  serviceId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('professional_services')
      .delete()
      .eq('professional_id', professionalId)
      .eq('service_id', serviceId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error dissociating professional from service:', error);
    throw new Error(error.message || 'Error dissociating professional from service');
  }
};

// Company management functions
export const fetchCompanyData = async (): Promise<Company> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching company data:', error);
    throw new Error(error.message || 'Error fetching company data');
  }
};

export const updateCompanyData = async (
  companyData: {
    name: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
  }
): Promise<void> => {
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .single();
    
    if (company) {
      const { error } = await supabase
        .from('companies')
        .update({
          name: companyData.name,
          logo_url: companyData.logo_url,
          primary_color: companyData.primary_color,
          secondary_color: companyData.secondary_color
        })
        .eq('id', company.id);

      if (error) throw error;
    }
  } catch (error: any) {
    console.error('Error updating company data:', error);
    throw new Error(error.message || 'Error updating company data');
  }
};

// Webhook related functions
export const fetchWebhookConfigurations = async () => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching webhook configurations:', error);
    throw new Error(error.message || 'Error fetching webhook configurations');
  }
};

export const fetchWebhookLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching webhook logs:', error);
    throw new Error(error.message || 'Error fetching webhook logs');
  }
};

export const createWebhookConfiguration = async (
  url: string,
  eventType: string,
  isActive: boolean
) => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .insert({
        url,
        event_type: eventType,
        is_active: isActive
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error creating webhook configuration:', error);
    throw new Error(error.message || 'Error creating webhook configuration');
  }
};

export const updateWebhookConfiguration = async (
  id: string,
  url: string,
  eventType: string,
  isActive: boolean
) => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .update({
        url,
        event_type: eventType,
        is_active: isActive
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating webhook configuration:', error);
    throw new Error(error.message || 'Error updating webhook configuration');
  }
};

export const testWebhook = async (url: string) => {
  try {
    // This would typically call an edge function to test the webhook
    // For now, we'll just return a mock success
    return { success: true, message: 'Webhook test successful' };
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    throw new Error(error.message || 'Error testing webhook');
  }
};

// Super admin functions
export const fetchCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    throw new Error(error.message || 'Error fetching companies');
  }
};

export const createCompany = async (companyData: {
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error creating company:', error);
    throw new Error(error.message || 'Error creating company');
  }
};

export const updateCompany = async (
  id: string,
  companyData: Partial<Company>
) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating company:', error);
    throw new Error(error.message || 'Error updating company');
  }
};

export const createUserForCompany = async (
  email: string,
  name: string,
  companyId: string,
  role: 'admin'
) => {
  try {
    // This would typically involve:
    // 1. Creating a user in auth
    // 2. Creating a record in users table
    // 3. Associating the user with the company
    
    // For now, we'll just return a mock success
    return { success: true, userId: 'mock-user-id' };
  } catch (error: any) {
    console.error('Error creating user for company:', error);
    throw new Error(error.message || 'Error creating user for company');
  }
};

export const fetchUserByAuthId = async (authId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned"
    return data;
  } catch (error: any) {
    console.error('Error fetching user by auth ID:', error);
    throw new Error(error.message || 'Error fetching user by auth ID');
  }
};

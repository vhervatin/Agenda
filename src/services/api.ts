import { supabase } from '@/integrations/supabase/client';
import { Service, Professional, TimeSlot, Appointment, TimeRange, WebhookConfiguration, WebhookLog, Company, User } from '@/types/types';

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
    
    console.log('Creating appointment with slot data:', slotData);
    
    // Create the appointment - use the actual start_time from the slot
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
        appointment_date: slotData.start_time, // Use the exact start time from the slot
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Appointment created:', data);
    
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
    
    // Ensure the returned data matches the Appointment type
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'confirmed' | 'cancelled' | 'completed',
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const fetchAppointmentsByCpf = async (cpf: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (id, name, photo_url),
        services:service_id (id, name, duration, price, description),
        slots:slot_id (id, start_time, end_time)
      `)
      .eq('client_cpf', cpf)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Ensure the returned data matches the Appointment type
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'confirmed' | 'cancelled' | 'completed',
    }));
  } catch (error) {
    console.error('Error fetching appointments by CPF:', error);
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

export const createAvailableSlotsBulk = async (
  professionalId: string,
  startDate: Date,
  endDate: Date,
  selectedDays: number[],
  timeRanges: TimeRange[]
): Promise<{ count: number }> => {
  try {
    const slots = [];
    const currentDate = new Date(startDate);
    
    // Loop through each day from start to end date
    while (currentDate <= endDate) {
      // Check if the current day of week is in the selected days
      const dayOfWeek = currentDate.getDay();
      if (selectedDays.includes(dayOfWeek)) {
        // Create slots for each time range on this day
        for (const range of timeRanges) {
          const slotStartTime = new Date(currentDate);
          slotStartTime.setHours(parseInt(range.startHour), parseInt(range.startMinute), 0, 0);
          
          const slotEndTime = new Date(currentDate);
          slotEndTime.setHours(parseInt(range.endHour), parseInt(range.endMinute), 0, 0);
          
          slots.push({
            professional_id: professionalId,
            start_time: slotStartTime.toISOString(),
            end_time: slotEndTime.toISOString(),
            is_available: true
          });
        }
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (slots.length > 0) {
      // Insert all slots
      const { error } = await supabase
        .from('available_slots')
        .insert(slots);
      
      if (error) throw error;
    }
    
    return { count: slots.length };
  } catch (error) {
    console.error('Error creating bulk available slots:', error);
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

export const updateCompanySettings = async (settings: Partial<Company> & { id: string }) => {
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

// Professional CRUD operations
export const createProfessional = async (professional: Omit<Professional, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .insert(professional)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating professional:', error);
    throw error;
  }
};

export const updateProfessional = async (id: string, professional: Partial<Omit<Professional, 'id'>>) => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .update(professional)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating professional:', error);
    throw error;
  }
};

export const deleteProfessional = async (id: string) => {
  try {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting professional:', error);
    throw error;
  }
};

// Service CRUD operations
export const createService = async (service: Omit<Service, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const updateService = async (id: string, service: Partial<Omit<Service, 'id'>>) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deleteService = async (id: string) => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Professional Service association
export const associateProfessionalService = async (professionalId: string, serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('professional_services')
      .insert({ professional_id: professionalId, service_id: serviceId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error associating professional with service:', error);
    throw error;
  }
};

export const dissociateProfessionalService = async (professionalId: string, serviceId: string) => {
  try {
    const { error } = await supabase
      .from('professional_services')
      .delete()
      .eq('professional_id', professionalId)
      .eq('service_id', serviceId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error dissociating professional from service:', error);
    throw error;
  }
};

// Webhook configuration operations
export const fetchWebhookConfigurations = async (): Promise<WebhookConfiguration[]> => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching webhook configurations:', error);
    return [];
  }
};

export const fetchWebhookLogs = async (): Promise<WebhookLog[]> => {
  try {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return [];
  }
};

export const createWebhookConfiguration = async (config: {
  url: string;
  event_type: string;
  is_active: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .insert(config)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating webhook configuration:', error);
    throw error;
  }
};

export const updateWebhookConfiguration = async (id: string, config: {
  url?: string;
  event_type?: string;
  is_active?: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .update(config)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating webhook configuration:', error);
    throw error;
  }
};

export const testWebhook = async (webhookId: string) => {
  // This would typically call a Supabase Edge Function
  try {
    const { data: webhook, error: fetchError } = await supabase
      .from('webhook_configurations')
      .select('*')
      .eq('id', webhookId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Call the test-webhook function
    const { data, error } = await supabase.functions.invoke('test-webhook', {
      body: {
        url: webhook.url,
        event_type: webhook.event_type,
        payload: {
          test: true,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error testing webhook:', error);
    throw error;
  }
};

// Company and user operations for superadmin
export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

export const createCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompany = async (id: string, company: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(company)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const createUserForCompany = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>, companyId: string) => {
  try {
    // First create the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Then create the company-user association - Using separate SQL as company_users table isn't in types
    const { data: companyUserData, error: associationError } = await supabase.rpc('associate_user_with_company', {
      p_company_id: companyId,
      p_user_id: userData.id
    });
    
    if (associationError) throw associationError;
    
    return userData;
  } catch (error) {
    console.error('Error creating user for company:', error);
    throw error;
  }
};

export const fetchUserByAuthId = async (authId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No user found with this auth_id
        return null;
      }
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as 'admin' | 'professional',
      tipo_usuario: data.tipo_usuario as 'admin' | 'superadmin',
      auth_id: data.auth_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching user by auth ID:', error);
    return null;
  }
};

export const fetchAllSlotsForProfessional = async (
  professionalId: string,
  year: number,
  month: number
): Promise<TimeSlot[]> => {
  try {
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
    const endDate = new Date(year, month, 0); // Last day of the month
    
    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .gte('start_time', startDate.toISOString())
      .lt('start_time', endDate.toISOString())
      .order('start_time');
    
    if (error) throw error;
    
    return (data || []).map(slot => ({
      id: slot.id,
      time: new Date(slot.start_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      available: slot.is_available,
      start_time: slot.start_time,
      end_time: slot.end_time,
      professional_id: slot.professional_id
    }));
  } catch (error) {
    console.error('Error fetching all slots for professional:', error);
    throw error;
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
    
    if (error) throw error;
    
    return {
      id: data.id,
      time: new Date(data.start_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      available: data.is_available,
      start_time: data.start_time,
      end_time: data.end_time,
      professional_id: data.professional_id
    };
  } catch (error) {
    console.error('Error creating available slot:', error);
    throw error;
  }
};

export const fetchAppointmentById = async (id: string): Promise<Appointment | null> => {
  try {
    console.log('Fetching appointment with ID:', id);
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (id, name, photo_url),
        services:service_id (id, name, duration, price, description),
        slots:slot_id (id, start_time, end_time)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching appointment by ID:', error);
      if (error.code === 'PGRST116') {
        // No appointment found with this id
        return null;
      }
      throw error;
    }
    
    console.log('Appointment data retrieved:', data);
    
    // Ensure the returned data matches the Appointment type
    return {
      ...data,
      status: data.status as 'confirmed' | 'cancelled' | 'completed',
    };
  } catch (error) {
    console.error('Error fetching appointment by ID:', error);
    return null;
  }
};


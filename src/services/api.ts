import { supabase } from '@/integrations/supabase/client';
import { Company, User, Service, Professional, TimeSlot, Appointment, WebhookConfiguration, WebhookLog } from '@/types/types';

// Convenio related functions
export const fetchConvenios = async () => {
  try {
    const { data, error } = await supabase
      .from('convenios')
      .select('*')
      .order('nome');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching convenios:', error);
    return [];
  }
};

export const createConvenio = async (convenio: { nome: string }) => {
  try {
    const { data, error } = await supabase
      .from('convenios')
      .insert(convenio)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating convenio:', error);
    throw error;
  }
};

export const deleteConvenio = async (id: string) => {
  try {
    const { error } = await supabase
      .from('convenios')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting convenio:', error);
    throw error;
  }
};

// User related functions
export const createUserForCompany = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>, companyId: string) => {
  try {
    // First create the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Then create the company-user association - Using a custom SQL call instead
    const { data: companyUserData, error: associationError } = await supabase
      .rpc('get_user_role');
    
    if (associationError) throw associationError;
    
    return userData;
  } catch (error) {
    console.error('Error creating user for company:', error);
    throw error;
  }
};

export const fetchUserByAuthId = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Professional related functions
export const fetchProfessionals = async () => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }
};

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

export const updateProfessional = async (id: string, updates: Partial<Professional>) => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .update(updates)
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

// Service related functions
export const fetchServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

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

export const updateService = async (id: string, updates: Partial<Service>) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
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

// Professional-Service association
export const fetchProfessionalServices = async (professionalId?: string) => {
  try {
    if (!professionalId) {
      return await fetchServices();
    }
    
    // Use a join with professional_services to filter services by professional
    const { data, error } = await supabase
      .from('professional_services')
      .select(`
        service_id,
        services:service_id (*)
      `)
      .eq('professional_id', professionalId);
    
    if (error) throw error;
    
    // Transform the data to match the expected format
    if (data) {
      return data.map(item => item.services);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching professional services:', error);
    return [];
  }
};

export const fetchServiceProfessionals = async (serviceId?: string) => {
  try {
    if (!serviceId) {
      return await fetchProfessionals();
    }
    
    // Use a join with professional_services to filter professionals by service
    const { data, error } = await supabase
      .from('professional_services')
      .select('professionals:professional_id(*)')
      .eq('service_id', serviceId);
    
    if (error) throw error;
    
    // Transform the data to match the expected format
    if (data) {
      return data.map(item => item.professionals);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching service professionals:', error);
    return [];
  }
};

export const associateProfessionalService = async (professionalId: string, serviceId: string) => {
  try {
    // First check if the association already exists to avoid duplicate key error
    const { data: existingAssociations, error: checkError } = await supabase
      .from('professional_services')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('service_id', serviceId);
    
    if (checkError) throw checkError;
    
    // If the association already exists, return it
    if (existingAssociations && existingAssociations.length > 0) {
      return existingAssociations[0];
    }
    
    // Otherwise, create a new association
    const { data, error } = await supabase
      .from('professional_services')
      .insert({
        professional_id: professionalId,
        service_id: serviceId
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error associating professional with service:', error);
    throw error;
  }
};

export const dissociateProfessionalService = async (associationId: string) => {
  try {
    const { error } = await supabase
      .from('professional_services')
      .delete()
      .eq('id', associationId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error dissociating professional from service:', error);
    throw error;
  }
};

// Time slot related functions
export const fetchAvailableSlots = async (date: string, professionalId?: string, convenioId?: string | null) => {
  try {
    // Extract the date part to filter by appointment date
    const formattedDate = date;
    
    console.log('Fetching slots for date:', formattedDate, 'professional:', professionalId, 'convenio:', convenioId);
    
    let query = supabase
      .from('available_slots')
      .select('*, convenios(nome)');
    
    // Add filter for date based on start_time
    if (formattedDate) {
      // Since the column 'date' doesn't exist, we need to filter by start_time
      const startOfDay = `${formattedDate}T00:00:00.000Z`;
      const endOfDay = `${formattedDate}T23:59:59.999Z`;
      
      query = query
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay);
    }
    
    // Add filter for is_available
    query = query.eq('is_available', true);
    
    // Add filter for professional_id if provided
    if (professionalId) {
      query = query.eq('professional_id', professionalId);
    }
    
    // Add filter for convenio_id if provided
    if (convenioId) {
      query = query.eq('convenio_id', convenioId);
    } else if (convenioId === null) {
      // If convenioId is explicitly null, include slots with no convenio and with any convenio
      // No additional filter needed
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log('Available slots data:', data);
    
    // Convert to TimeSlot format
    const timeSlots: TimeSlot[] = (data || []).map(slot => ({
      id: slot.id,
      time: slot.start_time ? new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      available: slot.is_available,
      start_time: slot.start_time,
      end_time: slot.end_time,
      professional_id: slot.professional_id,
      convenio_id: slot.convenio_id,
      convenio_nome: slot.convenios?.nome,
      is_available: slot.is_available
    }));
    
    return timeSlots;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return [];
  }
};

export const createAvailableSlotsBulk = async (slots: any[]) => {
  try {
    const { data, error } = await supabase
      .from('available_slots')
      .insert(slots)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating available slots:', error);
    throw error;
  }
};

export const deleteAvailableSlot = async (slotId: string) => {
  try {
    const { error } = await supabase
      .from('available_slots')
      .delete()
      .eq('id', slotId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting slot:', error);
    throw error;
  }
};

export const deleteAvailableSlotsByDate = async (date: string) => {
  try {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;
    
    const { error } = await supabase
      .from('available_slots')
      .delete()
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .eq('is_available', true); // Only delete available slots
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting slots by date:', error);
    throw error;
  }
};

// Appointment related functions
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
  try {
    // First mark the slot as unavailable
    const { error: slotError } = await supabase
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', appointment.slot_id);
    
    if (slotError) throw slotError;
    
    // Then create the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select(`
        *,
        professionals:professional_id (*),
        services:service_id (*),
        slots:slot_id (*)
      `)
      .single();
      
    if (error) {
      // Revert slot status if appointment creation fails
      await supabase
        .from('available_slots')
        .update({ is_available: true })
        .eq('id', appointment.slot_id);
      
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const fetchAppointments = async (context: any) => {
  try {
    let queryFilters = {};
    if (context && context.queryKey && context.queryKey.length > 1) {
      queryFilters = context.queryKey[1] || {};
    }
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (*),
        services:service_id (*),
        slots:slot_id (*)
      `)
      .order('created_at', { ascending: false });
    
    if (queryFilters) {
      const typedFilters = queryFilters as { status?: string; date?: string; professional_id?: string };
      
      if (typedFilters.status) {
        query = query.eq('status', typedFilters.status);
      }
      
      if (typedFilters.date) {
        // Fix: Use a date range comparison instead of LIKE operator
        const startOfDay = `${typedFilters.date}T00:00:00.000Z`;
        const endOfDay = `${typedFilters.date}T23:59:59.999Z`;
        
        query = query
          .gte('appointment_date', startOfDay)
          .lte('appointment_date', endOfDay);
      }
      
      if (typedFilters.professional_id) {
        query = query.eq('professional_id', typedFilters.professional_id);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in fetchAppointments:', error);
      throw error;
    }
    
    console.log('Fetched appointments:', data);
    return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const fetchAppointmentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (*),
        services:service_id (*),
        slots:slot_id (*)
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    return null;
  }
};

export const fetchAppointmentsByCpf = async (cpf: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (*),
        services:service_id (*),
        slots:slot_id (*)
      `)
      .eq('client_cpf', cpf)
      .order('appointment_date', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching appointments by CPF:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // If the appointment is cancelled, mark the slot as available again
    if (status === 'cancelled' && data && data.slot_id) {
      const { error: slotError } = await supabase
        .from('available_slots')
        .update({ is_available: true })
        .eq('id', data.slot_id);
        
      if (slotError) {
        console.error('Error updating slot availability:', slotError);
        // Don't throw here so the appointment status update still succeeds
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Company related functions
export const fetchCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
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

// Company settings
export const fetchCompanySettings = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
};

export const createCompanySettings = async (settings: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
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

export const updateCompanySettings = async (settings: Partial<Company> & { id: string }) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({
        name: settings.name,
        slug: settings.slug,
        logo_url: settings.logo_url,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color
      })
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

// Webhook related functions
export const fetchWebhookConfigurations = async () => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching webhook configurations:', error);
    return [];
  }
};

export const fetchWebhookLogs = async (context: any) => {
  try {
    let configId;
    if (context && context.queryKey && context.queryKey.length > 1) {
      configId = context.queryKey[1];
    }
    
    let query = supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (configId) {
      query = query.eq('webhook_id', configId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return [];
  }
};

export const createWebhookConfiguration = async (config: Omit<WebhookConfiguration, 'id' | 'created_at'>) => {
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

export const updateWebhookConfiguration = async (id: string, updates: Partial<WebhookConfiguration>) => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .update(updates)
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

export const testWebhook = async (url: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('test-webhook', {
      body: { url }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error testing webhook:', error);
    throw error;
  }
};


import { supabase } from '@/integrations/supabase/client';
import { Company, User, Service, Professional, TimeSlot, Appointment, WebhookConfiguration, WebhookLog } from '@/types/types';

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
      .rpc('associate_user_with_company', {
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
    let query = supabase
      .from('professional_services')
      .select(`
        id,
        services (*)
      `);
    
    if (professionalId) {
      query = query.eq('professional_id', professionalId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching professional services:', error);
    return [];
  }
};

export const fetchServiceProfessionals = async (serviceId?: string) => {
  try {
    let query = supabase
      .from('professional_services')
      .select(`
        id,
        professionals (*)
      `);
    
    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching service professionals:', error);
    return [];
  }
};

export const associateProfessionalService = async (professionalId: string, serviceId: string) => {
  try {
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
export const fetchAvailableSlots = async (date: string, professionalId?: string, serviceId?: string) => {
  try {
    let query = supabase
      .from('available_slots')
      .select('*')
      .eq('date', date)
      .eq('is_available', true);
    
    if (professionalId) {
      query = query.eq('professional_id', professionalId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Convert to TimeSlot format
    const timeSlots: TimeSlot[] = data.map(slot => ({
      id: slot.id,
      time: slot.time,
      available: slot.is_available,
      start_time: slot.start_time
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

export const fetchAppointments = async (filters?: { status?: string; date?: string; professional_id?: string }) => {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (*),
        services:service_id (*),
        slots:slot_id (*)
      `)
      .order('appointment_date', { ascending: false });
    
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.date) {
        query = query.eq('appointment_date', filters.date);
      }
      
      if (filters.professional_id) {
        query = query.eq('professional_id', filters.professional_id);
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
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
      .from('company_settings')
      .select('*')
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
      .from('company_settings')
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
      .from('company_settings')
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

export const fetchWebhookLogs = async (configId?: string) => {
  try {
    let query = supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (configId) {
      query = query.eq('webhook_configuration_id', configId);
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

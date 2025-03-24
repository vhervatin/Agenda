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
export const fetchProfessionalServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name');
      
    if (error) throw error;
    
    return data as Service[];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

// Function to fetch professionals who offer a specific service
export const fetchServiceProfessionals = async (serviceId: string): Promise<Professional[]> => {
  try {
    // First get all professional_ids that offer this service
    const { data: professionalServices, error: psError } = await supabase
      .from('professional_services')
      .select('professional_id')
      .eq('service_id', serviceId);
      
    if (psError) throw psError;
    
    if (!professionalServices.length) {
      return [];
    }
    
    // Extract the professional IDs
    const professionalIds = professionalServices.map(ps => ps.professional_id);
    
    // Then fetch the professionals with those IDs
    const { data: professionals, error: profError } = await supabase
      .from('professionals')
      .select('*')
      .in('id', professionalIds)
      .eq('active', true)
      .order('name');
      
    if (profError) throw profError;
    
    return professionals as Professional[];
  } catch (error) {
    console.error('Error fetching professionals for service:', error);
    return [];
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

// Function to fetch appointments by phone
export const fetchAppointmentsByPhone = async (phone: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (*),
        services:service_id (*),
        slots:slot_id (*)
      `)
      .eq('client_phone', phone)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching appointments by phone:', error);
    throw error;
  }
};

// Function to fetch appointments by CPF
export const fetchAppointmentsByCpf = async (cpf: string): Promise<Appointment[]> => {
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
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching appointments by CPF:', error);
    throw error;
  }
};

// Function to update appointment status
export const updateAppointmentStatus = async (
  appointmentId: string, 
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Function to fetch all appointments for admin
export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (*),
        services:service_id (*),
        slots:slot_id (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// Function to fetch all services
export const fetchServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Function to create a service
export const createService = async (service: Omit<Service, 'id'>): Promise<Service> => {
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

// Function to update a service
export const updateService = async (id: string, service: Partial<Service>): Promise<Service> => {
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

// Function to delete a service
export const deleteService = async (id: string): Promise<boolean> => {
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

// Function to create a professional
export const createProfessional = async (professional: Omit<Professional, 'id'>): Promise<Professional> => {
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

// Function to update a professional
export const updateProfessional = async (id: string, professional: Partial<Professional>): Promise<Professional> => {
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

// Function to delete a professional
export const deleteProfessional = async (id: string): Promise<boolean> => {
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

// Function to associate a professional with a service
export const associateProfessionalService = async (professionalId: string, serviceId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('professional_services')
      .insert({
        professional_id: professionalId,
        service_id: serviceId
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error associating professional with service:', error);
    throw error;
  }
};

// Function to dissociate a professional from a service
export const dissociateProfessionalService = async (professionalId: string, serviceId: string): Promise<boolean> => {
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

// Available Slots Management
export const createAvailableSlot = async (
  professionalId: string,
  startTime: string,
  endTime: string
): Promise<TimeSlot> => {
  try {
    const { data, error } = await supabase
      .from('available_slots')
      .insert({
        professional_id: professionalId,
        start_time: startTime,
        end_time: endTime,
        is_available: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating available slot:', error);
    throw error;
  }
};

export const createAvailableSlotsBulk = async (
  professionalId: string,
  slots: { startTime: string; endTime: string }[]
): Promise<{ count: number }> => {
  try {
    const slotsToInsert = slots.map(slot => ({
      professional_id: professionalId,
      start_time: slot.startTime,
      end_time: slot.endTime,
      is_available: true
    }));
    
    const { data, error } = await supabase
      .from('available_slots')
      .insert(slotsToInsert);
    
    if (error) throw error;
    
    return { count: slotsToInsert.length };
  } catch (error) {
    console.error('Error creating available slots in bulk:', error);
    throw error;
  }
};

export const fetchAllSlotsForProfessional = async (
  professionalId: string,
  startDate: string,
  endDate: string
): Promise<TimeSlot[]> => {
  try {
    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching all slots for professional:', error);
    throw error;
  }
};

export const deleteAvailableSlot = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('available_slots')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting available slot:', error);
    throw error;
  }
};

// Webhook management
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
    throw error;
  }
};

export const fetchWebhookLogs = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    throw error;
  }
};

export const createWebhookConfiguration = async (webhookConfig: Omit<WebhookConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<WebhookConfiguration> => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .insert(webhookConfig)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating webhook configuration:', error);
    throw error;
  }
};

export const updateWebhookConfiguration = async (id: string, webhookConfig: Partial<WebhookConfiguration>): Promise<WebhookConfiguration> => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .update(webhookConfig)
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

export const testWebhook = async (webhookId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('test-webhook', {
      body: { webhookId }
    });
    
    if (error) throw error;
    
    return data || { success: false, message: 'No response from test function' };
  } catch (error) {
    console.error('Error testing webhook:', error);
    throw error;
  }
};

// Company management
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
    throw error;
  }
};

export const createCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> => {
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

export const updateCompany = async (id: string, company: Partial<Company>): Promise<Company> => {
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

// User management
export const fetchUserByAuthId = async (authId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user by auth ID:', error);
    throw error;
  }
};

export const createUserForCompany = async (
  email: string,
  password: string,
  name: string,
  companyId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    
    if (authError) throw authError;
    
    // Create user in users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        role: 'admin',
        auth_id: authData.user.id,
        company_id: companyId
      });
    
    if (userError) throw userError;
    
    return { success: true };
  } catch (error) {
    console.error('Error creating user for company:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

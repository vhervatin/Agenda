import { createClient } from '@supabase/supabase-js';
import { Service, Professional, TimeSlot, Appointment, Convenio, WebhookConfiguration, WebhookLog, Company, User, ProfessionalService } from '@/types/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch the professional services
export const fetchProfessionalServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error('Error fetching services:', error);
    throw new Error('Failed to fetch services');
  }

  return data || [];
};

// Function to fetch a single service by ID
export const fetchServiceById = async (id: string): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching service:', error);
    return null;
  }

  return data;
};

// Function to create a new service
export const createService = async (service: Omit<Service, 'id'>): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();

  if (error) {
    console.error('Error creating service:', error);
    return null;
  }

  return data;
};

// Function to update an existing service
export const updateService = async (id: string, updates: Partial<Service>): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service:', error);
    return null;
  }

  return data;
};

// Function to delete a service
export const deleteService = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    return false;
  }

  return true;
};

// Function to fetch all professionals
export const fetchProfessionals = async (): Promise<Professional[]> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error('Error fetching professionals:', error);
    throw new Error('Failed to fetch professionals');
  }

  return data || [];
};

// Function to fetch a single professional by ID
export const fetchProfessionalById = async (id: string): Promise<Professional | null> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching professional:', error);
    return null;
  }

  return data;
};

// Function to create a new professional
export const createProfessional = async (professional: Omit<Professional, 'id'>): Promise<Professional | null> => {
  const { data, error } = await supabase
    .from('professionals')
    .insert([professional])
    .select()
    .single();

  if (error) {
    console.error('Error creating professional:', error);
    return null;
  }

  return data;
};

// Function to update an existing professional
export const updateProfessional = async (id: string, updates: Partial<Professional>): Promise<Professional | null> => {
  const { data, error } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating professional:', error);
    return null;
  }

  return data;
};

// Function to delete a professional
export const deleteProfessional = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting professional:', error);
    return false;
  }

  return true;
};

// Function to fetch professionals by service ID
export const fetchServiceProfessionals = async (serviceId: string): Promise<Professional[]> => {
  const { data: professionalServices, error: psError } = await supabase
    .from('professional_services')
    .select('professional_id')
    .eq('service_id', serviceId);

  if (psError) {
    console.error('Error fetching professional services:', psError);
    return [];
  }

  const professionalIds = professionalServices.map(ps => ps.professional_id);

  if (professionalIds.length === 0) {
    return [];
  }

  const { data: professionals, error: pError } = await supabase
    .from('professionals')
    .select('*')
    .in('id', professionalIds)
    .eq('active', true);

  if (pError) {
    console.error('Error fetching professionals:', pError);
    return [];
  }

  return professionals || [];
};

// Function to fetch all convenios
export const fetchConvenios = async (): Promise<Convenio[]> => {
  const { data, error } = await supabase
    .from('convenios')
    .select('*');

  if (error) {
    console.error('Error fetching convenios:', error);
    throw new Error('Failed to fetch convenios');
  }

  return data || [];
};

// Function to fetch a single convenio by ID
export const fetchConvenioById = async (id: string): Promise<Convenio | null> => {
  const { data, error } = await supabase
    .from('convenios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching convenio:', error);
    return null;
  }

  return data;
};

// Function to create a new convenio
export const createConvenio = async (convenio: Omit<Convenio, 'id'>): Promise<Convenio | null> => {
  const { data, error } = await supabase
    .from('convenios')
    .insert([convenio])
    .select()
    .single();

  if (error) {
    console.error('Error creating convenio:', error);
    return null;
  }

  return data;
};

// Function to update an existing convenio
export const updateConvenio = async (id: string, updates: Partial<Convenio>): Promise<Convenio | null> => {
  const { data, error } = await supabase
    .from('convenios')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating convenio:', error);
    return null;
  }

  return data;
};

// Function to delete a convenio
export const deleteConvenio = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('convenios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting convenio:', error);
    return false;
  }

  return true;
};

// Fetch available slots by date and professional
export const fetchAvailableSlots = async (
  date: string,
  professionalId?: string,
  convenioId?: string | null
): Promise<TimeSlot[]> => {
  let query = supabase
    .from('available_slots')
    .select(`
      *,
      convenios (
        nome
      )
    `)
    .eq('is_available', true);

  if (professionalId) {
    query = query.eq('professional_id', professionalId);
  }

  if (date) {
    // Filter by the specified date (ignoring time part)
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;
    
    query = query.gte('start_time', startOfDay).lte('start_time', endOfDay);
  }

  // Filter by convenio if specified
  if (convenioId) {
    query = query.eq('convenio_id', convenioId);
  } else if (convenioId === null) {
    // If null is explicitly passed, look for slots with no convenio
    query = query.is('convenio_id', null);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching available slots:', error);
    throw new Error('Failed to fetch available slots');
  }

  // Format the time slots for display
  return (data || []).map(slot => ({
    id: slot.id,
    time: new Date(slot.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    available: slot.is_available || false,
    start_time: slot.start_time,
    end_time: slot.end_time,
    professional_id: slot.professional_id,
    convenio_id: slot.convenio_id,
    convenio_nome: slot.convenios?.nome,
    is_available: slot.is_available
  }));
};

// Function to create available slots in bulk
export const createAvailableSlotsBulk = async (slots: Omit<TimeSlot, 'id' | 'time' | 'available'>[]): Promise<TimeSlot[]> => {
  const { data, error } = await supabase
    .from('available_slots')
    .insert(slots)
    .select();

  if (error) {
    console.error('Error creating available slots:', error);
    throw new Error('Failed to create available slots');
  }

  return data || [];
};

// Function to delete an available slot by ID
export const deleteAvailableSlot = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('available_slots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting available slot:', error);
    return false;
  }

  return true;
};

// Function to delete available slots by date
export const deleteAvailableSlotsByDate = async (date: string): Promise<boolean> => {
  const { error } = await supabase
    .from('available_slots')
    .delete()
    .gte('start_time', `${date}T00:00:00`)
    .lte('start_time', `${date}T23:59:59`);

  if (error) {
    console.error('Error deleting available slots for date:', error);
    return false;
  }

  return true;
};

// Fetch available dates for a professional and convênio
export const fetchAvailableDates = async (
  professionalId: string,
  convenioId: string | null
): Promise<string[]> => {
  let query = supabase
    .from('available_slots')
    .select('start_time')
    .eq('is_available', true)
    .eq('professional_id', professionalId);

  // Filter by convenio if specified
  if (convenioId) {
    query = query.eq('convenio_id', convenioId);
  } else if (convenioId === null) {
    // If null is explicitly passed, look for slots with no convenio
    query = query.is('convenio_id', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching available dates:', error);
    throw new Error('Failed to fetch available dates');
  }

  // Extract unique dates from the slots
  const uniqueDates = new Set<string>();
  (data || []).forEach(slot => {
    const dateString = new Date(slot.start_time).toISOString().split('T')[0];
    uniqueDates.add(dateString);
  });

  return Array.from(uniqueDates);
};

// Function to create a new appointment
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string }> => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }

  return data;
};

// Function to fetch appointments with filters
export const fetchAppointments = async (filters?: any): Promise<Appointment[]> => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      professionals:professional_id (*),
      services:service_id (*),
      slots:slot_id (*),
      convenios:convenio_id (*)
    `);

  // Apply filters if provided
  if (filters) {
    if (filters.date) {
      const startOfDay = `${filters.date}T00:00:00`;
      const endOfDay = `${filters.date}T23:59:59`;
      query = query.gte('appointment_date', startOfDay).lte('appointment_date', endOfDay);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.professional_id) {
      query = query.eq('professional_id', filters.professional_id);
    }
  }

  const { data, error } = await query.order('appointment_date', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    throw new Error('Failed to fetch appointments');
  }

  return data.map(appointment => ({
    ...appointment,
    convenio_nome: appointment.convenios?.nome
  })) || [];
};

// Function to update an existing appointment
export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment:', error);
    return null;
  }

  return data;
};

// Function to delete an appointment
export const deleteAppointment = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting appointment:', error);
    return false;
  }

  return true;
};

// Function to fetch all webhook configurations
export const fetchWebhookConfigurations = async (): Promise<WebhookConfiguration[]> => {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .select('*');

  if (error) {
    console.error('Error fetching webhook configurations:', error);
    throw new Error('Failed to fetch webhook configurations');
  }

  return data || [];
};

// Function to fetch a single webhook configuration by ID
export const fetchWebhookConfigurationById = async (id: string): Promise<WebhookConfiguration | null> => {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching webhook configuration:', error);
    return null;
  }

  return data;
};

// Function to create a new webhook configuration
export const createWebhookConfiguration = async (webhookConfiguration: Omit<WebhookConfiguration, 'id' | 'created_at'>): Promise<WebhookConfiguration | null> => {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .insert([webhookConfiguration])
    .select()
    .single();

  if (error) {
    console.error('Error creating webhook configuration:', error);
    return null;
  }

  return data;
};

// Function to update an existing webhook configuration
export const updateWebhookConfiguration = async (id: string, updates: Partial<WebhookConfiguration>): Promise<WebhookConfiguration | null> => {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating webhook configuration:', error);
    return null;
  }

  return data;
};

// Function to delete a webhook configuration
export const deleteWebhookConfiguration = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('webhook_configurations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting webhook configuration:', error);
    return false;
  }

  return true;
};

// Function to fetch webhook logs with optional webhook_id filter
export const fetchWebhookLogs = async (filters?: { queryKey: any }): Promise<any[]> => {
  let query = supabase
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply webhook_id filter if provided
  if (filters && filters.queryKey && filters.queryKey[1]) {
    const webhookId = filters.queryKey[1];
    query = query.eq('webhook_id', webhookId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching webhook logs:', error);
    throw new Error('Failed to fetch webhook logs');
  }

  return data || [];
};

// Function to test a webhook
export const testWebhook = async (url: string, event_type: string, payload: any): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Event-Type': event_type,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook test failed:', response.status, response.statusText);
      throw new Error(`Webhook test failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error testing webhook:', error);
    throw new Error(`Failed to test webhook: ${error.message}`);
  }
};

// Function to fetch company information
export const fetchCompany = async (): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }

  return data;
};

// Function to update company information
export const updateCompany = async (id: string, updates: Partial<Company>): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('company')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating company:', error);
    return null;
  }

  return data;
};

// Function to fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }

  return data || [];
};

// Function to fetch a single user by ID
export const fetchUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
};

// Function to create a new user
export const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
};

// Function to update an existing user
export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  return data;
};

// Function to delete a user
export const deleteUser = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  return true;
};

// Function to fetch all professional-service associations
export const fetchProfessionalServicesAssociations = async (): Promise<ProfessionalService[]> => {
  const { data, error } = await supabase
    .from('professional_services')
    .select('*');

  if (error) {
    console.error('Error fetching professional-service associations:', error);
    throw new Error('Failed to fetch professional-service associations');
  }

  return data || [];
};

// Function to create a new professional-service association
export const createProfessionalServiceAssociation = async (association: Omit<ProfessionalService, 'id'>): Promise<ProfessionalService | null> => {
  const { data, error } = await supabase
    .from('professional_services')
    .insert([association])
    .select()
    .single();

  if (error) {
    console.error('Error creating professional-service association:', error);
    return null;
  }

  return data;
};

// Function to delete a professional-service association
export const deleteProfessionalServiceAssociation = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('professional_services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting professional-service association:', error);
    return false;
  }

  return true;
};

import { supabase } from "@/integrations/supabase/client";
import { Service, Professional, Appointment, TimeSlot, WebhookConfiguration, WebhookLog, User, Convenio } from "@/types/types";

// Convenios API Functions
export const fetchConvenios = async (): Promise<Convenio[]> => {
  const { data, error } = await supabase
    .from('convenios')
    .select('*')
    .order('nome');
  
  if (error) {
    console.error("Error fetching convenios:", error);
    throw error;
  }
  
  return data || [];
};

export const createConvenio = async (convenio: { nome: string }): Promise<Convenio> => {
  const { data, error } = await supabase
    .from('convenios')
    .insert(convenio)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating convenio:", error);
    throw error;
  }
  
  return data;
};

export const deleteConvenio = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('convenios')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting convenio:", error);
    throw error;
  }
};

// Services API Functions
export const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name');

  if (error) {
    console.error("Error fetching services:", error);
    throw error;
  }

  return data || [];
};

export const createService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();

  if (error) {
    console.error("Error creating service:", error);
    throw error;
  }

  return data;
};

export const updateService = async (id: string, updates: Partial<Service>): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating service:", error);
    throw error;
  }

  return data;
};

export const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

// Professionals API Functions
export const fetchProfessionals = async (): Promise<Professional[]> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('name');

  if (error) {
    console.error("Error fetching professionals:", error);
    throw error;
  }

  return data || [];
};

export const createProfessional = async (professional: Omit<Professional, 'id'>): Promise<Professional> => {
  const { data, error } = await supabase
    .from('professionals')
    .insert([professional])
    .select()
    .single();

  if (error) {
    console.error("Error creating professional:", error);
    throw error;
  }

  return data;
};

export const updateProfessional = async (id: string, updates: Partial<Professional>): Promise<Professional> => {
  const { data, error } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating professional:", error);
    throw error;
  }

  return data;
};

export const deleteProfessional = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting professional:", error);
    throw error;
  }
};

// Appointments API Functions
export const fetchAppointments = async (filter: { status?: string } = {}): Promise<Appointment[]> => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      professionals (*),
      services (*),
      available_slots (*)
    `)
    .order('created_at', { ascending: false });

  if (filter.status) {
    query = query.eq('status', filter.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }

  return data || [];
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single();

  if (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }

  return data;
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }

  return data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};

// Time slots API Functions
export const fetchAvailableTimeSlots = async (
  date: string,
  professionalId?: string,
  convenioId?: string
): Promise<TimeSlot[]> => {
  let query = supabase
    .from('available_slots')
    .select(`
      *,
      convenios(*)
    `)
    .eq('is_available', true);
  
  // Filter by date if provided
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query = query
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString());
  }
  
  // Filter by professional ID if provided
  if (professionalId) {
    query = query.eq('professional_id', professionalId);
  }
  
  // Filter by convenio ID if provided
  if (convenioId) {
    query = query.eq('convenio_id', convenioId);
  }
  
  const { data, error } = await query.order('start_time');
  
  if (error) {
    console.error("Error fetching available time slots:", error);
    throw error;
  }
  
  return data.map(slot => ({
    ...slot,
    convenio_nome: slot.convenios?.nome,
    time: new Date(slot.start_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  })) || [];
};

export const createTimeSlot = async (
  professionalId: string,
  startTime: string,
  endTime: string
): Promise<TimeSlot> => {
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

  if (error) {
    console.error("Error creating time slot:", error);
    throw error;
  }

  return data;
};

export const updateTimeSlot = async (id: string, updates: Partial<TimeSlot>): Promise<TimeSlot> => {
  const { data, error } = await supabase
    .from('available_slots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating time slot:", error);
    throw error;
  }

  return data;
};

export const deleteTimeSlot = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('available_slots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting time slot:", error);
    throw error;
  }
};

// Webhook Configuration API Functions
export const fetchWebhookConfigurations = async (): Promise<WebhookConfiguration[]> => {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .select('*');

  if (error) {
    console.error("Error fetching webhook configurations:", error);
    throw error;
  }

  return data || [];
};

export const createWebhookConfiguration = async (webhookConfiguration: Omit<WebhookConfiguration, 'id' | 'created_at'>): Promise<WebhookConfiguration> => {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .insert([webhookConfiguration])
    .select()
    .single();

  if (error) {
    console.error("Error creating webhook configuration:", error);
    throw error;
  }

  return data;
};

export const updateWebhookConfiguration = async (id: string, updates: Partial<WebhookConfiguration>): Promise<WebhookConfiguration> => {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating webhook configuration:", error);
    throw error;
  }

  return data;
};

export const deleteWebhookConfiguration = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('webhook_configurations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting webhook configuration:", error);
    throw error;
  }
};

// Webhook Logs API Functions
export const fetchWebhookLogs = async (): Promise<WebhookLog[]> => {
  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching webhook logs:", error);
    throw error;
  }

  return data || [];
};

// Users API Functions
export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
  
  return data || [];
};

export const fetchUserByAuthId = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("No user session found.");
    return null;
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();
  
  if (error) {
    console.error("Error fetching user by auth_id:", error);
    throw error;
  }
  
  return data || null;
};

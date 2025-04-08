import { supabase } from "@/integrations/supabase/client";
import { Service, Professional, Appointment, TimeSlot, WebhookConfiguration, WebhookLog, User, Convenio, ProfessionalService } from "@/types/types";

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

// Professional-Service Association Functions
export const fetchProfessionalServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    console.error("Error fetching professional services:", error);
    throw error;
  }

  return data || [];
};

export const fetchServiceProfessionals = async (serviceId: string): Promise<Professional[]> => {
  const { data, error } = await supabase
    .from('professional_services')
    .select(`
      professional_id,
      professionals (*)
    `)
    .eq('service_id', serviceId);

  if (error) {
    console.error("Error fetching service professionals:", error);
    throw error;
  }

  // Extract professionals from nested structure
  return data.map(item => item.professionals).filter(Boolean) || [];
};

export const associateProfessionalService = async (professionalId: string, serviceId: string): Promise<ProfessionalService> => {
  const { data, error } = await supabase
    .from('professional_services')
    .insert({
      professional_id: professionalId,
      service_id: serviceId
    })
    .select()
    .single();

  if (error) {
    console.error("Error associating professional with service:", error);
    throw error;
  }

  return data;
};

export const dissociateProfessionalService = async (professionalId: string, serviceId: string): Promise<void> => {
  const { error } = await supabase
    .from('professional_services')
    .delete()
    .match({
      professional_id: professionalId,
      service_id: serviceId
    });

  if (error) {
    console.error("Error dissociating professional from service:", error);
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
      slots:available_slots (*)
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

  // Transform the data to include the required TimeSlot properties
  return (data || []).map(item => ({
    ...item,
    status: (item.status as "confirmed" | "cancelled" | "completed") || "confirmed",
    slots: item.slots ? {
      ...item.slots,
      time: new Date(item.slots.start_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      available: Boolean(item.slots.is_available)
    } : undefined
  }));
};

export const fetchAppointmentById = async (id: string): Promise<Appointment | null> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      professionals (*),
      services (*),
      slots:available_slots (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found error
      return null;
    }
    console.error("Error fetching appointment:", error);
    throw error;
  }

  // Transform to include required TimeSlot properties
  return {
    ...data,
    status: (data.status as "confirmed" | "cancelled" | "completed") || "confirmed",
    slots: data.slots ? {
      ...data.slots,
      time: new Date(data.slots.start_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      available: Boolean(data.slots.is_available)
    } : undefined
  };
};

export const fetchAppointmentsByCpf = async (cpf: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      professionals (*),
      services (*),
      slots:available_slots (*)
    `)
    .eq('client_cpf', cpf)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching appointments by CPF:", error);
    throw error;
  }

  // Transform to include required TimeSlot properties
  return (data || []).map(item => ({
    ...item,
    status: (item.status as "confirmed" | "cancelled" | "completed") || "confirmed",
    slots: item.slots ? {
      ...item.slots,
      time: new Date(item.slots.start_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      available: Boolean(item.slots.is_available)
    } : undefined
  }));
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

  return {
    ...data,
    status: (data.status as "confirmed" | "cancelled" | "completed") || "confirmed"
  };
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

  return {
    ...data,
    status: (data.status as "confirmed" | "cancelled" | "completed") || "confirmed"
  };
};

export const updateAppointmentStatus = async (id: string, status: "confirmed" | "cancelled" | "completed"): Promise<Appointment> => {
  return updateAppointment(id, { status });
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
    id: slot.id,
    time: new Date(slot.start_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    available: true,
    start_time: slot.start_time,
    end_time: slot.end_time,
    professional_id: slot.professional_id,
    is_available: slot.is_available,
    convenio_id: slot.convenio_id,
    convenio_nome: slot.convenios?.nome,
    convenios: slot.convenios
  })) || [];
};

// Alias for backward compatibility
export const fetchAvailableSlots = fetchAvailableTimeSlots;

export const createTimeSlot = async (
  professionalId: string,
  startTime: string,
  endTime: string,
  convenioId?: string
): Promise<TimeSlot> => {
  const { data, error } = await supabase
    .from('available_slots')
    .insert({
      professional_id: professionalId,
      start_time: startTime,
      end_time: endTime,
      is_available: true,
      convenio_id: convenioId
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating time slot:", error);
    throw error;
  }

  return {
    id: data.id,
    time: new Date(data.start_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    available: true,
    start_time: data.start_time,
    end_time: data.end_time,
    professional_id: data.professional_id,
    is_available: data.is_available,
    convenio_id: data.convenio_id
  };
};

export const createAvailableSlotsBulk = async (
  slots: Array<{
    professional_id: string;
    start_time: string;
    end_time: string;
    convenio_id?: string;
  }>
): Promise<TimeSlot[]> => {
  const { data, error } = await supabase
    .from('available_slots')
    .insert(slots.map(slot => ({
      ...slot,
      is_available: true
    })))
    .select();

  if (error) {
    console.error("Error creating bulk time slots:", error);
    throw error;
  }

  return data.map(slot => ({
    id: slot.id,
    time: new Date(slot.start_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    available: true,
    start_time: slot.start_time,
    end_time: slot.end_time,
    professional_id: slot.professional_id,
    is_available: slot.is_available,
    convenio_id: slot.convenio_id
  }));
};

export const updateTimeSlot = async (id: string, updates: Partial<TimeSlot>): Promise<TimeSlot> => {
  const { data, error } = await supabase
    .from('available_slots')
    .update({
      professional_id: updates.professional_id,
      start_time: updates.start_time,
      end_time: updates.end_time,
      is_available: updates.is_available,
      convenio_id: updates.convenio_id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating time slot:", error);
    throw error;
  }

  return {
    id: data.id,
    time: new Date(data.start_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    available: true,
    start_time: data.start_time,
    end_time: data.end_time,
    professional_id: data.professional_id,
    is_available: data.is_available,
    convenio_id: data.convenio_id
  };
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

export const deleteAvailableSlot = deleteTimeSlot;

export const deleteAvailableSlotsByDate = async (date: string, professionalId?: string): Promise<void> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  let query = supabase
    .from('available_slots')
    .delete()
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString());
  
  if (professionalId) {
    query = query.eq('professional_id', professionalId);
  }
  
  const { error } = await query;
  
  if (error) {
    console.error("Error deleting time slots by date:", error);
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

export const testWebhook = async (id: string): Promise<any> => {
  // This is a placeholder for the actual implementation
  console.log(`Testing webhook with ID: ${id}`);
  return { success: true, message: "Webhook test sent successfully" };
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
  
  return (data || []).map(user => ({
    ...user,
    tipo_usuario: (user.tipo_usuario as "admin" | "superadmin") || "admin"
  }));
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
  
  return data ? {
    ...data,
    tipo_usuario: (data.tipo_usuario as "admin" | "superadmin") || "admin"
  } : null;
};

// Company settings API Functions
export const fetchCompanySettings = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .limit(1)
    .single();
  
  if (error) {
    console.error("Error fetching company settings:", error);
    return null;
  }
  
  return data;
};

export const updateCompanySettings = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating company settings:", error);
    throw error;
  }
  
  return data;
};

export const createCompanySettings = async (settings: any) => {
  const { data, error } = await supabase
    .from('companies')
    .insert([settings])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating company settings:", error);
    throw error;
  }
  
  return data;
};

// SuperAdmin company management
export const fetchCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
  
  return data;
};

export const createCompany = async (company: any) => {
  const { data, error } = await supabase
    .from('companies')
    .insert([company])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating company:", error);
    throw error;
  }
  
  return data;
};

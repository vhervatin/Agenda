import { supabase } from "@/integrations/supabase/client";
import { Professional, Service, TimeSlot, Appointment, User, WebhookConfiguration, Company } from "@/types/types";

export const createWebhooks = async (webhooks: { url: string; event_type: string; is_active?: boolean }[]) => {
  try {
    const validWebhooks = webhooks.filter(webhook => webhook.url);
    
    if (validWebhooks.length === 0) {
      throw new Error('No valid webhooks to create');
    }
    
    const { data, error } = await supabase
      .from('webhook_configurations')
      .insert(validWebhooks)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating webhooks:', error);
    throw error;
  }
};

export const createCompanies = async (companies: { name: string; slug: string; logo_url?: string; primary_color?: string; secondary_color?: string; plan?: string; plan_value?: number; plan_expiry_date?: string; is_active?: boolean }[]) => {
  try {
    const validCompanies = companies.filter(company => company.name && company.slug);
    
    if (validCompanies.length === 0) {
      throw new Error('No valid companies to create');
    }
    
    const { data, error } = await supabase
      .from('companies')
      .insert(validCompanies)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating companies:', error);
    throw error;
  }
};

export const createUsers = async (users: { email: string; name: string; role: 'admin' | 'professional'; tipo_usuario?: 'admin' | 'superadmin'; auth_id?: string; company_id?: string }[]) => {
  try {
    const validUsers = users.filter(user => user.email && user.name && user.role);
    
    if (validUsers.length === 0) {
      throw new Error('No valid users to create');
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert(validUsers)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
};

export const getUserByAuth = async (authId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      auth_id: data.auth_id,
      tipo_usuario: data.tipo_usuario as 'admin' | 'superadmin',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    return user;
  } catch (error) {
    console.error('Error fetching user by auth id:', error);
    throw error;
  }
};

export const fetchProfessionals = async (): Promise<Professional[]> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
};

export const createProfessional = async (professional: { name: string; bio?: string; phone?: string; photo_url?: string; active?: boolean; user_id?: string; company_id?: string }): Promise<Professional> => {
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

export const deleteProfessional = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting professional:', error);
    throw error;
  }
};

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

export const createService = async (service: { name: string; description?: string; duration: number; price: number; active?: boolean; company_id?: string }): Promise<Service> => {
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

export const fetchProfessionalServices = async (professionalId: string): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('professional_services')
      .select('service_id')
      .eq('professional_id', professionalId);
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    const serviceIds = data.map(item => item.service_id);
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds)
      .order('name', { ascending: true });
      
    if (servicesError) throw servicesError;
    
    return services || [];
  } catch (error) {
    console.error('Error fetching professional services:', error);
    throw error;
  }
};

export const associateProfessionalService = async (professionalId: string, serviceId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('professional_services')
      .insert({ professional_id: professionalId, service_id: serviceId });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error associating professional with service:', error);
    throw error;
  }
};

export const dissociateProfessionalService = async (professionalId: string, serviceId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('professional_services')
      .delete()
      .eq('professional_id', professionalId)
      .eq('service_id', serviceId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error dissociating professional from service:', error);
    throw error;
  }
};

export const fetchAvailableSlots = async (professionalId: string | "all", date: Date): Promise<TimeSlot[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    let query = supabase
      .from('available_slots')
      .select('*')
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .eq('is_available', true);

    if (professionalId !== "all") {
      query = query.eq('professional_id', professionalId);
    }
      
    const { data, error } = await query.order('start_time', { ascending: true });
      
    if (error) throw error;
    
    return (data || []).map(slot => ({
      id: slot.id,
      time: new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      available: slot.is_available,
      start_time: slot.start_time,
      end_time: slot.end_time,
      professional_id: slot.professional_id
    }));
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

export const fetchAllSlotsForProfessional = async (professionalId: string, date?: Date): Promise<any[]> => {
  try {
    let query = supabase
      .from('available_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .order('start_time', { ascending: true });
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all slots:', error);
    throw error;
  }
};

export const createAvailableSlot = async (professionalId: string, startTime: Date, endTime: Date): Promise<any> => {
  try {
    console.log('Creating slot:', { professionalId, startTime, endTime });
    
    const slotData = {
      professional_id: professionalId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      is_available: true
    };
    
    const { data, error } = await supabase
      .from('available_slots')
      .insert(slotData)
      .select();
      
    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('Error creating available slot:', error);
    throw error;
  }
};

export const createAvailableSlotsBulk = async (
  professionalId: string | "all",
  startDate: Date,
  endDate: Date,
  selectedDays: number[],
  timeRanges: Array<{startHour: string, startMinute: string, endHour: string, endMinute: string}>
): Promise<{count: number}> => {
  try {
    const slots = [];
    let currentDate = new Date(startDate);

    let professionals: { id: string }[] = [];
    if (professionalId === "all") {
      const { data: profsData, error: profsError } = await supabase
        .from('professionals')
        .select('id')
        .eq('active', true);
        
      if (profsError) throw profsError;
      professionals = profsData || [];
    } else {
      professionals = [{ id: professionalId }];
    }
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (selectedDays.includes(dayOfWeek)) {
        for (const range of timeRanges) {
          for (const prof of professionals) {
            const slotStartTime = new Date(currentDate);
            slotStartTime.setHours(
              parseInt(range.startHour),
              parseInt(range.startMinute),
              0,
              0
            );
            
            const slotEndTime = new Date(currentDate);
            slotEndTime.setHours(
              parseInt(range.endHour),
              parseInt(range.endMinute),
              0,
              0
            );
            
            slots.push({
              professional_id: prof.id,
              start_time: slotStartTime.toISOString(),
              end_time: slotEndTime.toISOString(),
              is_available: true
            });
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Creating ${slots.length} slots in bulk`);
    
    if (slots.length === 0) {
      return { count: 0 };
    }
    
    const { data, error } = await supabase
      .from('available_slots')
      .insert(slots)
      .select();
      
    if (error) throw error;
    
    return { count: data?.length || 0 };
  } catch (error) {
    console.error('Error creating available slots in bulk:', error);
    throw error;
  }
};

export const deleteAvailableSlot = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('available_slots')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting available slot:', error);
    throw error;
  }
};

export const createAppointment = async (
  professionalId: string,
  serviceId: string,
  slotId: string,
  clientName: string,
  clientPhone: string
): Promise<{ success: boolean; appointmentId?: string }> => {
  try {
    const { data: slotData } = await supabase
      .from('available_slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (!slotData) {
      console.error('Slot not found');
      return { success: false };
    }

    const appointmentData = {
      professional_id: professionalId,
      service_id: serviceId,
      slot_id: slotId,
      client_name: clientName,
      client_phone: clientPhone,
      status: 'confirmed',
      appointment_date: slotData.start_time
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating appointment:', error);
      return { success: false };
    }
    
    const { error: slotError } = await supabase
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', slotId);
      
    if (slotError) {
      console.error('Error updating slot availability:', slotError);
      return { success: false };
    }
    
    return { success: true, appointmentId: data.id };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false };
  }
};

export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (id, name, photo_url),
        services:service_id (id, name, duration, price),
        slots:slot_id (id, start_time, end_time)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      professional_id: item.professional_id,
      service_id: item.service_id,
      slot_id: item.slot_id,
      client_name: item.client_name,
      client_phone: item.client_phone,
      status: item.status as 'confirmed' | 'cancelled' | 'completed',
      created_at: item.created_at,
      professionals: item.professionals,
      services: item.services,
      slots: item.slots,
      company_id: item.company_id
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const fetchAppointmentsByPhone = async (phone: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (id, name, photo_url),
        services:service_id (id, name, duration, price),
        slots:slot_id (id, start_time, end_time)
      `)
      .eq('client_phone', phone)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      professional_id: item.professional_id,
      service_id: item.service_id,
      slot_id: item.slot_id,
      client_name: item.client_name,
      client_phone: item.client_phone,
      status: item.status as 'confirmed' | 'cancelled' | 'completed',
      created_at: item.created_at,
      professionals: item.professionals,
      services: item.services,
      slots: item.slots,
      company_id: item.company_id
    }));
  } catch (error) {
    console.error('Error fetching appointments by phone:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<void> => {
  try {
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('slot_id, status')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);
      
    if (error) throw error;
    
    if (status === 'cancelled' && appointment.status !== 'cancelled') {
      console.log('Making slot available again:', appointment.slot_id);
      const { error: slotError } = await supabase
        .from('available_slots')
        .update({ is_available: true })
        .eq('id', appointment.slot_id);
        
      if (slotError) {
        console.error('Error making slot available again:', slotError);
        throw slotError;
      }
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

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

export const createWebhookConfiguration = async (url: string, eventType: string): Promise<WebhookConfiguration> => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .insert({ url, event_type: eventType })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating webhook configuration:', error);
    throw error;
  }
};

export const updateWebhookConfiguration = async (id: string, updates: Partial<WebhookConfiguration>): Promise<WebhookConfiguration> => {
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

export const testWebhook = async (webhookId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data: webhook, error: fetchError } = await supabase
      .from('webhook_configurations')
      .select('url, event_type')
      .eq('id', webhookId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { data, error } = await supabase.functions.invoke('test-webhook', {
      body: { url: webhook.url, event_type: webhook.event_type }
    });
    
    if (error) throw error;
    
    return { success: true, message: 'Webhook tested successfully' };
  } catch (error) {
    console.error('Error testing webhook:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

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

export const createCompany = async (company: { name: string; slug: string; logo_url?: string; primary_color?: string; secondary_color?: string; plan?: string; plan_value?: number; plan_expiry_date?: string; is_active?: boolean }): Promise<Company> => {
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

export const fetchUserByAuthId = async (authId: string): Promise<User | null> => {
  return getUserByAuth(authId);
};

export const createUserForCompany = async ({ 
  email, 
  password, 
  name, 
  companyId, 
  role 
}: { 
  email: string;
  password: string;
  name: string;
  companyId: string;
  role: 'admin' | 'professional';
}) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('User creation failed');
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        email,
        name,
        role,
        tipo_usuario: 'admin',
      })
      .select()
      .single();
    
    if (userError) {
      console.error('Error creating user record:', userError);
      throw userError;
    }
    
    return userData;
  } catch (error) {
    console.error('Error in createUserForCompany:', error);
    throw error;
  }
};

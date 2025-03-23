
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
export const fetchProfessionalServices = async (professionalId: string): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('professional_services')
      .select('service_id')
      .eq('professional_id', professionalId);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const serviceIds = data.map(item => item.service_id);
    
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds)
      .eq('active', true);
      
    if (servicesError) throw servicesError;
    
    return servicesData || [];
  } catch (error) {
    console.error('Error fetching professional services:', error);
    throw error;
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
  clientPhone: string
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

// Function to fetch all appointments
export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (id, name, photo_url),
        services:service_id (id, name, description, duration, price),
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
      slots: item.slots
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// Function to fetch appointments by client phone
export const fetchAppointmentsByPhone = async (clientPhone: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals:professional_id (id, name, photo_url),
        services:service_id (id, name, description, duration, price),
        slots:slot_id (id, start_time, end_time)
      `)
      .eq('client_phone', clientPhone)
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
      slots: item.slots
    }));
  } catch (error) {
    console.error('Error fetching appointments by phone:', error);
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
    return false;
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
export const createService = async (serviceData: {
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
}): Promise<Service | null> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: serviceData.name,
        description: serviceData.description,
        duration: serviceData.duration,
        price: serviceData.price,
        active: serviceData.active
      })
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
export const updateService = async (
  serviceId: string,
  serviceData: Partial<Service>
): Promise<Service | null> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update({
        name: serviceData.name,
        description: serviceData.description,
        duration: serviceData.duration,
        price: serviceData.price,
        active: serviceData.active
      })
      .eq('id', serviceId)
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
export const deleteService = async (serviceId: string): Promise<boolean> => {
  try {
    // First delete service associations
    await supabase
      .from('professional_services')
      .delete()
      .eq('service_id', serviceId);
      
    // Then delete the service
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Function to create a professional
export const createProfessional = async (professionalData: {
  name: string;
  bio: string;
  phone: string;
  photo_url: string;
  active: boolean;
}): Promise<Professional | null> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .insert({
        name: professionalData.name,
        bio: professionalData.bio,
        phone: professionalData.phone,
        photo_url: professionalData.photo_url,
        active: professionalData.active
      })
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
export const updateProfessional = async (
  professionalId: string,
  professionalData: Partial<Professional>
): Promise<Professional | null> => {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .update({
        name: professionalData.name,
        bio: professionalData.bio,
        phone: professionalData.phone,
        photo_url: professionalData.photo_url,
        active: professionalData.active
      })
      .eq('id', professionalId)
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
export const deleteProfessional = async (professionalId: string): Promise<boolean> => {
  try {
    // First delete professional associations
    await supabase
      .from('professional_services')
      .delete()
      .eq('professional_id', professionalId);
      
    // Then delete the professional
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', professionalId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting professional:', error);
    throw error;
  }
};

// Function to associate a professional with a service
export const associateProfessionalService = async (
  professionalId: string,
  serviceId: string
): Promise<ProfessionalService | null> => {
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

// Function to dissociate a professional from a service
export const dissociateProfessionalService = async (
  professionalId: string,
  serviceId: string
): Promise<boolean> => {
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

// Function to create available slots in bulk
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
    
    // Ensure we have valid time ranges with all required properties
    const validTimeRanges = timeRanges.filter(range => 
      range.startHour && range.startMinute && range.endHour && range.endMinute
    ) as Array<{startHour: string, startMinute: string, endHour: string, endMinute: string}>;
    
    if (validTimeRanges.length === 0) {
      return { count: 0 };
    }
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (selectedDays.includes(dayOfWeek)) {
        for (const range of validTimeRanges) {
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

// Function to create a single available slot
export const createAvailableSlot = async (
  professionalId: string,
  startTime: Date,
  endTime: Date
): Promise<TimeSlot | null> => {
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
      time: new Date(data.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

// Function to delete an available slot
export const deleteAvailableSlot = async (slotId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('available_slots')
      .delete()
      .eq('id', slotId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting available slot:', error);
    throw error;
  }
};

// Function to fetch all slots for a professional
export const fetchAllSlotsForProfessional = async (
  professionalId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeSlot[]> => {
  try {
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .gte('start_time', startDateStr)
      .lte('start_time', endDateStr)
      .order('start_time', { ascending: true });
      
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
    console.error('Error fetching all slots for professional:', error);
    throw error;
  }
};

// Function to fetch user by auth ID
export const fetchUserByAuthId = async (authId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user by auth ID:', error);
    return null;
  }
};

// Function to fetch companies
export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

// Function to create a company
export const createCompany = async (companyData: {
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  plan?: string;
  plan_value?: number;
  plan_expiry_date?: string;
  is_active?: boolean;
}): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: companyData.name,
        slug: companyData.slug,
        logo_url: companyData.logo_url,
        primary_color: companyData.primary_color,
        secondary_color: companyData.secondary_color,
        plan: companyData.plan,
        plan_value: companyData.plan_value,
        plan_expiry_date: companyData.plan_expiry_date,
        is_active: companyData.is_active !== undefined ? companyData.is_active : true
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

// Function to update a company
export const updateCompany = async (
  companyId: string,
  companyData: {
    name?: string;
    slug?: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    plan?: string;
    plan_value?: number;
    plan_expiry_date?: string;
    is_active?: boolean;
  }
): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', companyId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

// Function to create a user for a company
export const createUserForCompany = async (
  companyId: string,
  userData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'professional';
  }
): Promise<{ success: boolean; userId?: string }> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    
    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      return { success: false };
    }
    
    // Create user record
    const { data: userData2, error: userError } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        auth_id: authData.user.id,
        tipo_usuario: 'admin'
      })
      .select()
      .single();
      
    if (userError) {
      console.error('Error creating user record:', userError);
      return { success: false };
    }
    
    // Associate user with company
    const { error: companyUserError } = await supabase
      .from('company_users')
      .insert({
        company_id: companyId,
        user_id: userData2.id
      });
      
    if (companyUserError) {
      console.error('Error associating user with company:', companyUserError);
      return { success: false };
    }
    
    return { 
      success: true,
      userId: userData2.id
    };
  } catch (error) {
    console.error('Error creating user for company:', error);
    return { success: false };
  }
};

// Function to fetch webhook configurations
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

// Function to fetch webhook logs
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

// Function to create a webhook configuration
export const createWebhookConfiguration = async (
  webhookData: {
    url: string;
    event_type: string;
    is_active: boolean;
  }
): Promise<WebhookConfiguration | null> => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .insert({
        url: webhookData.url,
        event_type: webhookData.event_type,
        is_active: webhookData.is_active
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating webhook configuration:', error);
    throw error;
  }
};

// Function to update a webhook configuration
export const updateWebhookConfiguration = async (
  webhookId: string,
  webhookData: {
    url?: string;
    event_type?: string;
    is_active?: boolean;
  }
): Promise<WebhookConfiguration | null> => {
  try {
    const { data, error } = await supabase
      .from('webhook_configurations')
      .update(webhookData)
      .eq('id', webhookId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating webhook configuration:', error);
    throw error;
  }
};

// Function to test a webhook
export const testWebhook = async (webhookUrl: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/test-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: webhookUrl }),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      message: data.message || 'Webhook teste enviado com sucesso',
    };
  } catch (error) {
    console.error('Error testing webhook:', error);
    return {
      success: false,
      message: 'Erro ao testar webhook',
    };
  }
};

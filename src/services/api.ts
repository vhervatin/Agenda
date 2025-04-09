import { createClient } from '@supabase/supabase-js';
import { Service, Professional, TimeSlot, Appointment, Convenio, WebhookConfiguration, WebhookLog, Company, User, ProfessionalService } from '@/types/types';
import { supabase } from '@/integrations/supabase/client';

// Function to fetch all services
export const fetchServices = async (): Promise<Service[]> => {
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
  date?: string,
  professionalId?: string | null,
  convenioId?: string | null
): Promise<TimeSlot[]> => {
  try {
    console.log(`Fetching slots for date: ${date}, professional: ${professionalId}, convenio: ${convenioId}`);
    
    let query = supabase
      .from('available_slots')
      .select('*, convenios(nome)')
      .eq('is_available', true);
    
    if (date) {
      // Convert date string to the beginning and end of the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());
    }
    
    if (professionalId) {
      query = query.eq('professional_id', professionalId);
    }
    
    if (convenioId !== undefined) {
      if (convenioId === null) {
        query = query.is('convenio_id', null);
      } else {
        query = query.eq('convenio_id', convenioId);
      }
    }
    
    const { data, error } = await query.order('start_time');
    
    if (error) {
      console.error('Error fetching available slots:', error);
      throw new Error(error.message);
    }
    
    if (!data) return [];
    
    // Transform the data to match TimeSlot interface
    return data.map(slot => {
      const startTime = new Date(slot.start_time);
      const convenioData = slot.convenios as Convenio | null;
      
      return {
        id: slot.id,
        time: format(startTime, 'HH:mm'),
        available: slot.is_available || false,
        start_time: slot.start_time,
        end_time: slot.end_time,
        professional_id: slot.professional_id,
        convenio_id: slot.convenio_id,
        convenio_nome: convenioData?.nome,
        is_available: slot.is_available
      };
    });
  } catch (error) {
    console.error('Error in fetchAvailableSlots:', error);
    throw error;
  }
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

  const formattedSlots = (data || []).map(slot => ({
    id: slot.id,
    time: new Date(slot.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    available: slot.is_available || false,
    start_time: slot.start_time,
    end_time: slot.end_time,
    professional_id: slot.professional_id,
    convenio_id: slot.convenio_id,
    is_available: slot.is_available
  }));

  return formattedSlots;
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
  // First, check if the slot is still available
  const { data: slotData, error: slotError } = await supabase
    .from('available_slots')
    .select('is_available')
    .eq('id', appointment.slot_id)
    .single();

  if (slotError) {
    console.error('Error checking slot availability:', slotError);
    throw new Error('Failed to check slot availability');
  }

  if (!slotData.is_available) {
    throw new Error('Este horário não está mais disponível. Por favor, escolha outro horário.');
  }

  // Start a transaction to update slot availability and create appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }

  // Update the slot to mark it as unavailable
  const { error: updateError } = await supabase
    .from('available_slots')
    .update({ is_available: false })
    .eq('id', appointment.slot_id);

  if (updateError) {
    console.error('Error updating slot availability:', updateError);
    // The appointment was created, but we failed to update the slot
    // We'll still return the appointment ID and log the error
  }

  return data;
};

interface FetchAppointmentsParams {
  date?: string;
  status?: string;
  professional_id?: string;
  convenio_id?: string;
  queryKey?: [string, any];
}

export const fetchAppointments = async (params: FetchAppointmentsParams = {}): Promise<Appointment[]> => {
  try {
    console.log('Fetching appointments with params:', params);
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        professionals(*),
        services(*),
        slots:available_slots(*),
        convenios(*)
      `);
    
    if (params.date) {
      const startDate = new Date(params.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(params.date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query
        .gte('appointment_date', startDate.toISOString())
        .lte('appointment_date', endDate.toISOString());
    }
    
    if (params.status) {
      query = query.eq('status', params.status);
    }
    
    if (params.professional_id) {
      query = query.eq('professional_id', params.professional_id);
    }
    
    if (params.convenio_id) {
      if (params.convenio_id === 'none') {
        query = query.is('convenio_id', null);
      } else {
        query = query.eq('convenio_id', params.convenio_id);
      }
    }
    
    const { data, error } = await query.order('appointment_date');
    
    if (error) {
      console.error('Error fetching appointments:', error);
      throw new Error(error.message);
    }
    
    if (!data) return [];
    
    // Transform the data to match the Appointment interface
    return data.map(appointment => {
      const slot = appointment.slots || {};
      const convenio = appointment.convenios || null;
      
      const convenioNome = convenio && typeof convenio === 'object' && 'nome' in convenio ? 
        convenio.nome as string : null;
        
      const slotData: TimeSlot = {
        id: typeof slot === 'object' && slot !== null && 'id' in slot ? String(slot.id) : '',
        time: typeof slot === 'object' && slot !== null && 'start_time' in slot ? 
          format(new Date(String(slot.start_time)), 'HH:mm') : '',
        available: false, // Already booked
        start_time: typeof slot === 'object' && slot !== null && 'start_time' in slot ? String(slot.start_time) : '',
        end_time: typeof slot === 'object' && slot !== null && 'end_time' in slot ? String(slot.end_time) : '',
        professional_id: typeof slot === 'object' && slot !== null && 'professional_id' in slot ? String(slot.professional_id) : '',
        convenio_id: typeof slot === 'object' && slot !== null && 'convenio_id' in slot ? 
          (slot.convenio_id !== null ? String(slot.convenio_id) : null) : null,
        is_available: typeof slot === 'object' && slot !== null && 'is_available' in slot ? Boolean(slot.is_available) : false
      };
      
      return {
        id: appointment.id,
        professional_id: appointment.professional_id || '',
        service_id: appointment.service_id || '',
        slot_id: appointment.slot_id || '',
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        client_cpf: appointment.client_cpf || '',
        status: appointment.status as 'confirmed' | 'cancelled' | 'completed',
        created_at: appointment.created_at || '',
        updated_at: appointment.updated_at || '',
        appointment_date: appointment.appointment_date || '',
        convenio_id: appointment.convenio_id,
        convenio_nome: convenioNome,
        professionals: appointment.professionals,
        services: appointment.services,
        slots: slotData
      };
    });
  } catch (error) {
    console.error('Error in fetchAppointments:', error);
    throw error;
  }
};

export const fetchAppointmentById = async (id: string): Promise<Appointment | null> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals(*),
        services(*),
        slots:available_slots(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found error (406 Not Acceptable)
        return null;
      }
      console.error('Error fetching appointment by id:', error);
      throw new Error(error.message);
    }
    
    if (!data) return null;
    
    const slot = data.slots || {};
    
    const slotData: TimeSlot = {
      id: typeof slot === 'object' && slot !== null && 'id' in slot ? String(slot.id) : '',
      time: typeof slot === 'object' && slot !== null && 'start_time' in slot ? 
        format(new Date(String(slot.start_time)), 'HH:mm') : '',
      available: false, // Already booked
      start_time: typeof slot === 'object' && slot !== null && 'start_time' in slot ? String(slot.start_time) : '',
      end_time: typeof slot === 'object' && slot !== null && 'end_time' in slot ? String(slot.end_time) : '',
      professional_id: typeof slot === 'object' && slot !== null && 'professional_id' in slot ? String(slot.professional_id) : '',
      convenio_id: typeof slot === 'object' && slot !== null && 'convenio_id' in slot ? 
        (slot.convenio_id !== null ? String(slot.convenio_id) : null) : null,
      is_available: typeof slot === 'object' && slot !== null && 'is_available' in slot ? Boolean(slot.is_available) : false
    };
    
    return {
      id: data.id,
      professional_id: data.professional_id || '',
      service_id: data.service_id || '',
      slot_id: data.slot_id || '',
      client_name: data.client_name,
      client_phone: data.client_phone,
      client_cpf: data.client_cpf || '',
      status: data.status as 'confirmed' | 'cancelled' | 'completed',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
      appointment_date: data.appointment_date || '',
      convenio_id: data.convenio_id,
      convenio_nome: data.convenio_id ? data.convenio_nome : null,
      professionals: data.professionals,
      services: data.services,
      slots: slotData,
      convenios: null // Não temos esses dados nesta consulta
    };
  } catch (error) {
    console.error('Error in fetchAppointmentById:', error);
    throw error;
  }
};

export const fetchAppointmentsByCpf = async (cpf: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        professionals(*),
        services(*),
        slots:available_slots(*)
      `)
      .eq('client_cpf', cpf)
      .order('appointment_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching appointments by CPF:', error);
      throw new Error(error.message);
    }
    
    if (!data) return [];
    
    // Transform the data to match the Appointment interface
    return data.map(appointment => {
      const slot = appointment.slots || {};
      
      const slotData: TimeSlot = {
        id: typeof slot === 'object' && slot !== null && 'id' in slot ? String(slot.id) : '',
        time: typeof slot === 'object' && slot !== null && 'start_time' in slot ? 
          format(new Date(String(slot.start_time)), 'HH:mm') : '',
        available: false, // Already booked
        start_time: typeof slot === 'object' && slot !== null && 'start_time' in slot ? String(slot.start_time) : '',
        end_time: typeof slot === 'object' && slot !== null && 'end_time' in slot ? String(slot.end_time) : '',
        professional_id: typeof slot === 'object' && slot !== null && 'professional_id' in slot ? String(slot.professional_id) : '',
        convenio_id: typeof slot === 'object' && slot !== null && 'convenio_id' in slot ? 
          (slot.convenio_id !== null ? String(slot.convenio_id) : null) : null,
        is_available: typeof slot === 'object' && slot !== null && 'is_available' in slot ? Boolean(slot.is_available) : false
      };
      
      return {
        id: appointment.id,
        professional_id: appointment.professional_id || '',
        service_id: appointment.service_id || '',
        slot_id: appointment.slot_id || '',
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        client_cpf: appointment.client_cpf || '',
        status: appointment.status as 'confirmed' | 'cancelled' | 'completed',
        created_at: appointment.created_at || '',
        updated_at: appointment.updated_at || '',
        appointment_date: appointment.appointment_date || '',
        convenio_id: appointment.convenio_id,
        convenio_nome: appointment.convenio_id ? appointment.convenio_nome : null,
        professionals: appointment.professionals,
        services: appointment.services,
        slots: slotData,
        convenios: null // Não temos esses dados nesta consulta
      };
    });
  } catch (error) {
    console.error('Error in fetchAppointmentsByCpf:', error);
    throw error;
  }
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

  if (!data) return null;

  return {
    ...data,
    status: data.status as 'confirmed' | 'cancelled' | 'completed'
  };
};

// Function to update an appointment status
export const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<Appointment | null> => {
  const { data: appointmentData, error: fetchError } = await supabase
    .from('appointments')
    .select('slot_id, status')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching appointment:', fetchError);
    throw new Error('Failed to fetch appointment');
  }

  // Update appointment status
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment status:', error);
    return null;
  }

  // If the appointment is cancelled, make the slot available again
  if (status === 'cancelled' && appointmentData.status !== 'cancelled') {
    const { error: slotError } = await supabase
      .from('available_slots')
      .update({ is_available: true })
      .eq('id', appointmentData.slot_id);

    if (slotError) {
      console.error('Error updating slot availability:', slotError);
      // The appointment status was updated, but we failed to update the slot
      // We'll still return the appointment data and log the error
    }
  }

  if (!data) return null;

  return {
    ...data,
    status: data.status as 'confirmed' | 'cancelled' | 'completed'
  };
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

// Function to fetch company information
export const fetchCompany = async (): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }

  return data;
};

// Function to fetch company settings
export const fetchCompanySettings = async (): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }

  return data;
};

// Function to create company settings
export const createCompanySettings = async (settings: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .insert([settings])
    .select()
    .single();

  if (error) {
    console.error('Error creating company settings:', error);
    return null;
  }

  return data;
};

// Function to update company settings
export const updateCompanySettings = async (id: string, updates: Partial<Company>): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating company settings:', error);
    return null;
  }

  return data;
};

// Function to update company information
export const updateCompany = async (id: string, updates: Partial<Company>): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
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

  const users = (data || []).map(user => ({
    ...user,
    tipo_usuario: user.tipo_usuario as 'admin' | 'superadmin'
  }));

  return users;
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

  if (!data) return null;

  return {
    ...data,
    tipo_usuario: data.tipo_usuario as 'admin' | 'superadmin'
  };
};

// Function to fetch user by auth ID
export const fetchUserByAuthId = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching user by auth ID:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    tipo_usuario: data.tipo_usuario as 'admin' | 'superadmin'
  };
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

  if (!data) return null;

  return {
    ...data,
    tipo_usuario: data.tipo_usuario as 'admin' | 'superadmin'
  };
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

  if (!data) return null;

  return {
    ...data,
    tipo_usuario: data.tipo_usuario as 'admin' | 'superadmin'
  };
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

// Function to fetch all companies
export const fetchCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*');

  if (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies');
  }

  return data || [];
};

// Function to create a new company
export const createCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .insert([company])
    .select()
    .single();

  if (error) {
    console.error('Error creating company:', error);
    return null;
  }

  return data;
};

// Function to associate a professional with a service
export const associateProfessionalService = async (professionalId: string, serviceId: string): Promise<ProfessionalService | null> => {
  const { data, error } = await supabase
    .from('professional_services')
    .insert([{ professional_id: professionalId, service_id: serviceId }])
    .select()
    .single();

  if (error) {
    console.error('Error associating professional to service:', error);
    throw error;
  }

  return data;
};

// Function to dissociate a professional from a service
export const dissociateProfessionalService = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('professional_services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error dissociating professional from service:', error);
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

// Function to fetch webhook configurations
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

// Add missing webhook functions that were causing errors
export const createWebhookConfiguration = async (webhookConfig: Omit<WebhookConfiguration, 'id' | 'created_at'>): Promise<WebhookConfiguration | null> => {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .insert([webhookConfig])
    .select()
    .single();

  if (error) {
    console.error('Error creating webhook configuration:', error);
    return null;
  }

  return data;
};

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

// Function to fetch webhook logs
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

function format(date: Date, formatString: string): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

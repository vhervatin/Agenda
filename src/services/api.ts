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

// Function to fetch appointments with filters
export const fetchAppointments = async (filters?: any): Promise<Appointment[]> => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      professionals:professional_id (*),
      services:service_id (*),
      slots:slot_id (*)
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

  // Transform the data to match the Appointment type
  const appointments = data.map(appointment => {
    // Transform slots data to match TimeSlot type
    const slotData = appointment.slots || {};
    const timeSlot: TimeSlot = {
      id: slotData.id || '',
      time: slotData.start_time ? new Date(slotData.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
      available: !!slotData.is_available,
      start_time: slotData.start_time || '',
      end_time: slotData.end_time || '',
      professional_id: slotData.professional_id || '',
      convenio_id: slotData.convenio_id || null,
      is_available: !!slotData.is_available
    };

    return {
      ...appointment,
      status: appointment.status as 'confirmed' | 'cancelled' | 'completed',
      convenio_nome: appointment.convenio_nome || null,
      slots: timeSlot
    } as Appointment;
  });

  return appointments;
};

// Function to fetch an appointment by ID
export const fetchAppointmentById = async (id: string): Promise<Appointment | null> => {
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

  if (error) {
    console.error('Error fetching appointment:', error);
    return null;
  }

  if (!data) return null;

  // Transform slots data to match TimeSlot type
  const slotData = data.slots || {};
  const timeSlot: TimeSlot = {
    id: slotData.id || '',
    time: slotData.start_time ? new Date(slotData.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
    available: !!slotData.is_available,
    start_time: slotData.start_time || '',
    end_time: slotData.end_time || '',
    professional_id: slotData.professional_id || '',
    convenio_id: slotData.convenio_id || null,
    is_available: !!slotData.is_available
  };

  return {
    ...data,
    status: data.status as 'confirmed' | 'cancelled' | 'completed',
    convenio_nome: null,
    slots: timeSlot
  } as Appointment;
};

// Function to fetch appointments by CPF
export const fetchAppointmentsByCpf = async (cpf: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      professionals:professional_id (*),
      services:service_id (*),
      slots:slot_id (*)
    `)
    .eq('client_cpf', cpf)
    .order('appointment_date', { ascending: true });

  if (error) {
    console.error('Error fetching appointments by CPF:', error);
    throw new Error('Failed to fetch appointments by CPF');
  }

  // Transform the data to match the Appointment type
  const appointments = (data || []).map(appointment => {
    // Transform slots data to match TimeSlot type
    const slotData = appointment.slots || {};
    const timeSlot: TimeSlot = {
      id: slotData.id || '',
      time: slotData.start_time ? new Date(slotData.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
      available: !!slotData.is_available,
      start_time: slotData.start_time || '',
      end_time: slotData.end_time || '',
      professional_id: slotData.professional_id || '',
      convenio_id: slotData.convenio_id || null,
      is_available: !!slotData.is_available
    };

    return {
      ...appointment,
      status: appointment.status as 'confirmed' | 'cancelled' | 'completed',
      convenio_nome: null,
      slots: timeSlot
    } as Appointment;
  });

  return appointments;
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

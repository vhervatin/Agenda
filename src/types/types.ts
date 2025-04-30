export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  active: boolean;
  services?: Service; // For nested service objects from the API
}

export interface Professional {
  id: string;
  name: string;
  photo_url?: string;
  bio?: string;
  phone?: string; // Added phone field to match admin interface
  active: boolean;
  mail: string;
  professionals?: Professional; // For nested professional objects from the API
}

export interface Convenio {
  id: string;
  nome: string;
  created_at?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
  professional_id?: string;
  is_available?: boolean;
}

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_cpf: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  appointment_date: string;
  service_name: string;
  slots: TimeSlot;
  created_at: string;
  updated_at?: string;
  professionals?: Professional;
  services?: Service;
}

export interface TimeRange {
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
}

export interface DateRangeOptions {
  startDate: Date;
  endDate?: Date;
  selectedDays: number[];
}

export interface WebhookConfiguration {
  id: string;
  url: string;
  event_type: string;
  is_active: boolean;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id?: string;
  event_type: string;
  payload?: any;
  status?: string;
  attempts?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
  primary_color: string;
  secondary_color: string;
  slug: string;
  created_at: string;
  updated_at: string;
  plan?: string | null;
  plan_expiry_date?: string | null;
  plan_value?: number | null;
  is_active?: boolean | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professional';
  tipo_usuario: 'admin' | 'superadmin';
  auth_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalService {
  id: string;
  professional_id: string;
  service_id: string;
}

export interface CompanySettings {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  slug?: string;
}


export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  active: boolean;
  services?: Service; // For nested service objects from the API
}

export interface Professional {
  id: string;
  name: string;
  bio: string;
  photo_url: string;
  active: boolean;
  professionals?: Professional; // For nested professional objects from the API
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
  professional_id?: string;
}

export interface Appointment {
  id: string;
  professional_id: string;
  service_id: string;
  slot_id: string;
  client_name: string;
  client_phone: string;
  client_cpf: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  appointment_date: string;
  professionals?: Professional;
  services?: Service;
  slots?: TimeSlot;
}

export interface TimeRange {
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
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
  webhook_configuration_id: string;
  request_payload: string;
  response_status: number;
  response_body: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  slug: string;
  created_at: string;
  updated_at: string;
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

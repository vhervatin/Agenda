
export interface Professional {
  id: string;
  name: string;
  photo_url?: string;
  bio?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  start_time?: string;
  end_time?: string;
}

export interface Appointment {
  id: string;
  professional_id: string;
  service_id: string;
  slot_id: string;
  client_name: string;
  client_phone: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

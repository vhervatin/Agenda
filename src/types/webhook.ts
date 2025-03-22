
export interface WebhookConfiguration {
  id: string;
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  status: string;
  attempts: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// Extend the existing User type with the new tipo_usuario field
export interface ExtendedUser extends User {
  tipo_usuario?: string;
}

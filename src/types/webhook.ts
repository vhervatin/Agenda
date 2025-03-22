
export interface WebhookConfiguration {
  id: string;
  url: string;
  is_active: boolean;
  event_type: string;
  company_id?: string;
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
  plan?: string;
  plan_value?: number;
  plan_expiry_date?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// Extend the User type with the new tipo_usuario field
export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professional';
  tipo_usuario?: 'admin' | 'superadmin';
  auth_id?: string;
  created_at?: string;
  updated_at?: string;
}

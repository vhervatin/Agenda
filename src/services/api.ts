
// Fix only the problematic functions with type errors

// Fix the createWebhooks function to properly handle array inserts
export const createWebhooks = async (webhooks: Partial<WebhookConfiguration>[]) => {
  try {
    // Make sure each webhook has the required 'url' field
    const validWebhooks = webhooks.filter(webhook => webhook.url);
    
    if (validWebhooks.length === 0) {
      throw new Error('No valid webhooks to create');
    }
    
    const { data, error } = await supabase
      .from('webhooks')
      .insert(validWebhooks);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating webhooks:', error);
    throw error;
  }
};

// Fix the createCompanies function to properly handle array inserts
export const createCompanies = async (companies: Partial<Company>[]) => {
  try {
    // Make sure each company has the required 'name' and 'slug' fields
    const validCompanies = companies.filter(company => company.name && company.slug);
    
    if (validCompanies.length === 0) {
      throw new Error('No valid companies to create');
    }
    
    const { data, error } = await supabase
      .from('companies')
      .insert(validCompanies);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating companies:', error);
    throw error;
  }
};

// Fix the createUsers function to properly handle array inserts
export const createUsers = async (users: Partial<User>[]) => {
  try {
    // Make sure each user has the required 'email', 'name', and 'role' fields
    const validUsers = users.filter(user => user.email && user.name && user.role);
    
    if (validUsers.length === 0) {
      throw new Error('No valid users to create');
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert(validUsers);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
};

// Fix the getUserByAuth function to properly type the response
export const getUserByAuth = async (authId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No user found
      }
      throw error;
    }
    
    // Ensure tipo_usuario is correctly typed
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


export const createUserForCompany = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>, companyId: string) => {
  try {
    // First create the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Then create the company-user association - Using a custom SQL call instead
    const { data: companyUserData, error: associationError } = await supabase
      .rpc('associate_user_with_company', {
        p_company_id: companyId,
        p_user_id: userData.id
      });
    
    if (associationError) throw associationError;
    
    return userData;
  } catch (error) {
    console.error('Error creating user for company:', error);
    throw error;
  }
};

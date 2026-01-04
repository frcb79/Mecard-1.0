
import { supabase } from '../lib/supabaseClient';
import { Database } from '../lib/supabaseClient';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const authService = {
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async signUpNewUser(
    email: string, 
    password: string, 
    profileData: {
      fullName: string;
      role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'UNIT_MANAGER' | 'POS_OPERATOR' | 'STUDENT' | 'PARENT';
      schoolId: string;
      studentId?: string;
    }
  ) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) throw authError;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: email,
        full_name: profileData.fullName,
        role: profileData.role,
        school_id: profileData.schoolId,
        student_id: profileData.studentId || `TEMP_${Date.now()}`,
        grade: 'Staff',
        balance: 0
      }]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw new Error('Usuario creado pero falló la creación del perfil de base de datos.');
    }

    return authData.user;
  }
};

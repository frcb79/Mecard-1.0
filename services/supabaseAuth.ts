
import { supabase } from '../lib/supabaseClient';
import { Database } from '../lib/supabaseClient';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const authService = {
  /**
   * Obtiene el perfil completo del usuario actual (con rol y escuela)
   */
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

  /**
   * Registra un nuevo usuario y crea su perfil base
   */
  async signUpNewUser(
    email: string, 
    password: string, 
    profileData: {
      fullName: string;
      role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'UNIT_MANAGER' | 'POS_OPERATOR';
      schoolId: string;
      studentId?: string; // Opcional, solo para estudiantes
    }
  ) {
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) throw authError;

    // 2. Crear registro en tabla Profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: email,
        full_name: profileData.fullName,
        role: profileData.role,
        school_id: profileData.schoolId,
        student_id: profileData.studentId || `TEMP_${Date.now()}`, // ID temporal si no es estudiante
        grade: 'Staff', // Default para staff
        balance: 0
      }]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw new Error('Usuario creado pero falló la creación del perfil de base de datos.');
    }

    return authData.user;
  }
};

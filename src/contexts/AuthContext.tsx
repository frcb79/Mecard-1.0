// ============================================
// ARCHIVO 1: contexts/AuthContext.tsx
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, AuthUser } from '../types';

// Try to import supabase, but gracefully handle if it fails
let supabase: any = null;
try {
  const supabaseModule = require('../lib/supabase');
  supabase = supabaseModule.supabase;
} catch (e) {
  console.warn('⚠️ Supabase not initialized - running in DEMO mode');
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  isStudent: boolean;
  isParent: boolean;
  isAdmin: boolean;
  isPOSOperator: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginAsRole: (role: UserRole) => void; // Demo mode login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = !supabase; // Demo mode when supabase not available

  // Cargar usuario actual al montar
  useEffect(() => {
    checkUser();

    // Solo suscribirse a cambios si supabase está disponible
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('Auth event:', event);
          
          if (event === 'SIGNED_IN' && session) {
            await loadUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Verificar sesión actual
  async function checkUser() {
    try {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await loadUserProfile(session.user.id);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Cargar perfil completo del usuario
  async function loadUserProfile(userId: string) {
    try {
      if (!supabase) {
        // Demo mode - crear usuario simulado
        const demoUser: AuthUser = {
          id: userId,
          email: 'demo@mecard.mx',
          fullName: 'Demo User',
          role: UserRole.STUDENT,
          schoolId: 'school-001',
          campusId: undefined,
          unitId: undefined,
          photo: undefined
        };
        setUser(demoUser);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, school_id, campus_id, unit_id, full_name, photo')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const authUser: AuthUser = {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role as UserRole,
          schoolId: data.school_id,
          campusId: data.campus_id,
          unitId: data.unit_id,
          photo: data.photo
        };
        
        setUser(authUser);
      }
    } catch (error: any) {
      console.error('Error loading user profile:', error);
      if (supabase) {
        throw new Error('No se pudo cargar el perfil del usuario');
      }
    }
  }

  // Login
  async function login(email: string, password: string, role?: UserRole) {
    try {
      if (!supabase) {
        // Demo mode - simular login
        const demoUser: AuthUser = {
          id: `user-${Date.now()}`,
          email: email || 'demo@mecard.mx',
          fullName: 'Demo User',
          role: role || UserRole.STUDENT,
          schoolId: 'school-001',
          campusId: undefined,
          unitId: undefined,
          photo: undefined
        };
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
        setUser(demoUser);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  // Logout
  async function logout() {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Error al cerrar sesión');
    }
  }

  // Refrescar perfil
  async function refreshUser() {
    if (user) {
      await loadUserProfile(user.id);
    }
  }

  // Demo mode login
  function loginAsRole(role: UserRole) {
    const demoUser: AuthUser = {
      id: `demo-${role}-${Date.now()}`,
      email: `${role}@mecard.mx`,
      fullName: `Demo ${role}`,
      role: role,
      schoolId: 'school-001',
      campusId: undefined,
      unitId: role === UserRole.UNIT_MANAGER ? 'unit-001' : undefined,
      photo: undefined
    };
    setUser(demoUser);
  }

  // Computed properties
  const isAuthenticated = !!user;
  const isStudent = user?.role === UserRole.STUDENT;
  const isParent = user?.role === UserRole.PARENT;
  const isAdmin = user?.role === UserRole.SUPER_ADMIN || 
                   user?.role === UserRole.SCHOOL_ADMIN;
  const isPOSOperator = user?.role === UserRole.POS_OPERATOR || 
                         user?.role === UserRole.CAFETERIA_STAFF;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isDemoMode,
    isStudent,
    isParent,
    isAdmin,
    isPOSOperator,
    login,
    logout,
    refreshUser,
    loginAsRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

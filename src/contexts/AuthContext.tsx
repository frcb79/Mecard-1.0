// ============================================
// ARCHIVO 1: contexts/AuthContext.tsx
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole, AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isStudent: boolean;
  isParent: boolean;
  isAdmin: boolean;
  isPOSOperator: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario actual al montar
  useEffect(() => {
    checkUser();

    // Suscribirse a cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
  }, []);

  // Verificar sesión actual
  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await loadUserProfile(session.user.id);
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
      throw new Error('No se pudo cargar el perfil del usuario');
    }
  }

  // Login
  async function login(email: string, password: string) {
    try {
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
    isStudent,
    isParent,
    isAdmin,
    isPOSOperator,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

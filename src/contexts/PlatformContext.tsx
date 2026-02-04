
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { School, OperatingUnit, Settlement, User, UserRole } from '../types';
import { MOCK_SCHOOLS, MOCK_UNITS } from '../constants';

type NewSchool = Omit<School, 'id' | 'balance'> & { id?: string };

interface PlatformContextType {
  schools: School[];
  units: OperatingUnit[];
  settlements: Settlement[];
  activeSchool: School | null;
  currentUser: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  
  addSchool: (school: NewSchool) => Promise<void>;
  updateSchoolModel: (id: string, updates: any) => Promise<void>;
  impersonateSchool: (school: School | null) => void;
  runSettlement: (school: School) => Promise<void>;
  login: (email: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [units, setUnits] = useState<OperatingUnit[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        console.info("MeCard Hub: Entering Offline/Demo Mode (No API keys detected)");
        useMockData();
        return;
      }
      
      try {
        // Parallel fetch for better performance
        const [schoolsRes, unitsRes, settlementsRes] = await Promise.all([
          supabase.from('schools').select('*'),
          supabase.from('operating_units').select('*'),
          supabase.from('settlements').select('*').order('created_at', { ascending: false })
        ]);
        
        if (schoolsRes.error) throw schoolsRes.error;
        if (unitsRes.error) throw unitsRes.error;
        if (settlementsRes.error) throw settlementsRes.error;

        if (schoolsRes.data) setSchools(schoolsRes.data as any);
        if (unitsRes.data) setUnits(unitsRes.data as any);
        if (settlementsRes.data) setSettlements(settlementsRes.data as any);

        setIsDemoMode(false);
      } catch (err: any) {
        // CRITICAL FIX: Detect NetworkError or fetch failures and silently switch to Demo Mode
        // This avoids the noisy [object Object] errors in the console and UI
        const isNetworkError = 
          err.name === 'TypeError' || 
          err.message?.toLowerCase().includes('fetch') || 
          err.message?.toLowerCase().includes('network');

        if (isNetworkError) {
          console.warn("MeCard Hub: Network unreachable. Defaulting to Demo Mode.");
        } else {
          console.error("MeCard Hub: Database configuration error:", err.message || err);
        }
        useMockData();
      } finally {
        setIsLoading(false);
      }
    };

    const useMockData = () => {
      setSchools(MOCK_SCHOOLS);
      setUnits(MOCK_UNITS);
      setSettlements([]);
      setIsDemoMode(true);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const addSchool = async (school: NewSchool) => {
    if (isDemoMode) {
      const mockNew: School = { 
        ...school, 
        id: school.id || `mx_${Date.now()}`, 
        balance: 0,
        platformFeePercent: school.platformFeePercent || 4.5,
        onboardingStatus: 'PENDING'
      } as School;
      setSchools(prev => [mockNew, ...prev]);
      return;
    }

    const newId = school.id || `mx_${Date.now()}`;
    const { data, error } = await supabase
      .from('schools')
      .insert([{ ...school, id: newId, balance: 0 }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear escuela:', error.message);
    } else if (data) {
      setSchools(prev => [data as any, ...prev]);
    }
  };

  const updateSchoolModel = async (id: string, updates: any) => {
    const currentSchool = schools.find(s => s.id === id);
    if (!currentSchool) return;

    const newModel = { ...currentSchool.businessModel, ...updates };

    if (isDemoMode) {
      setSchools(prev => prev.map(s => s.id === id ? { ...s, businessModel: newModel } : s));
      return;
    }

    const { error } = await supabase
      .from('schools')
      .update({ business_model: newModel })
      .eq('id', id);

    if (!error) {
      setSchools(prev => prev.map(s => s.id === id ? { ...s, businessModel: newModel } : s));
    }
  };

  const runSettlement = async (school: School) => {
    if (isDemoMode) {
      alert("✅ Corte Generado (Modo Demo)");
      return;
    }
    // Remote logic would go here
  };

  const login = async (email: string, role: string) => {
    const mockUser: User = {
        id: 'user_123',
        name: 'Admin Usuario',
        email: email,
        role: role as UserRole,
        schoolId: 'mx_01'
    };
    setCurrentUser(mockUser);
  };

  const logout = async () => {
    setCurrentUser(null);
    setActiveSchool(null);
  };

  return (
    <PlatformContext.Provider value={{ 
      schools, units, settlements, activeSchool, currentUser, isLoading, isDemoMode,
      addSchool, updateSchoolModel, impersonateSchool: setActiveSchool, runSettlement, login, logout
    }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used within PlatformProvider");
  return context;
};

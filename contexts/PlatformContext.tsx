
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { School, OperatingUnit, Settlement, User, UserRole } from '../types';

type NewSchool = Omit<School, 'id' | 'balance'> & { id?: string };

interface PlatformContextType {
  schools: School[];
  units: OperatingUnit[];
  settlements: Settlement[];
  activeSchool: School | null;
  currentUser: User | null;
  isLoading: boolean;
  
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolsData) setSchools(schoolsData as any);
      if (schoolsError) console.error('Error cargando escuelas:', schoolsError);

      const { data: unitsData } = await supabase.from('operating_units').select('*');
      if (unitsData) setUnits(unitsData as any);

      const { data: settlementsData } = await supabase.from('settlements').select('*').order('created_at', { ascending: false });
      if (settlementsData) setSettlements(settlementsData as any);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const addSchool = async (school: NewSchool) => {
    const newId = school.id || `mx_${Date.now()}`;
    
    const { data, error } = await supabase
      .from('schools')
      .insert([{ ...school, id: newId, balance: 0 }])
      .select()
      .single();

    if (error) {
      alert(`Error al crear escuela: ${error.message}`);
    } else if (data) {
      setSchools(prev => [data as any, ...prev]);
    }
  };

  const updateSchoolModel = async (id: string, updates: any) => {
    const currentSchool = schools.find(s => s.id === id);
    if (!currentSchool) return;

    const newModel = { ...currentSchool.businessModel, ...updates };

    const { error } = await supabase
      .from('schools')
      .update({ business_model: newModel })
      .eq('id', id);

    if (!error) {
      setSchools(prev => prev.map(s => s.id === id ? { ...s, businessModel: newModel } : s));
      if (activeSchool?.id === id) {
        setActiveSchool(prev => prev ? { ...prev, businessModel: newModel } : null);
      }
    }
  };

  const runSettlement = async (school: School) => {
    const gross = Math.floor(Math.random() * 50000) + 10000;
    const commission = gross * 0.045;
    const schoolShare = gross * 0.10;
    const vendorShare = gross - commission - schoolShare;

    const newSettlement = {
      school_id: school.id,
      period_start: new Date().toISOString(),
      period_end: new Date().toISOString(),
      gross_revenue: gross,
      platform_commission: commission,
      school_share: schoolShare,
      vendor_share: vendorShare,
      status: 'PENDING',
      disbursements: [
        { recipient: 'School', amount: schoolShare, clabe: `646180${school.stpCostCenter}001` },
        { recipient: 'Vendor', amount: vendorShare, clabe: 'Generica' }
      ]
    };

    const { data, error } = await supabase
      .from('settlements')
      .insert([newSettlement])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Error generando corte");
    } else if (data) {
      setSettlements(prev => [data as any, ...prev]);
      alert("✅ Corte Guardado en Nube");
    }
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
      schools, units, settlements, activeSchool, currentUser, isLoading,
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

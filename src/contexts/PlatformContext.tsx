import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { logger } from '../lib/logger';
import { BusinessModel, ContractType, School, SchoolStatus, OperatingUnit, Settlement, User, UserRole, UserStatus } from '../types';
import { MOCK_SCHOOLS, MOCK_UNITS } from '../constants';

type NewSchool = Omit<School, 'id' | 'balance'> & { id?: string };

interface SchoolRow {
  id: string;
  name: string;
  legal_name: string | null;
  rfc: string | null;
  logo_url: string | null;
  student_count: number | null;
  balance: number | null;
  unified_balance: boolean | null;
  status: string | null;
  contract_type: string | null;
  trial_duration_months: number | null;
  onboarding_status: string | null;
  stp_cost_center: string | null;
  settlement_clabe: string | null;
  platform_fee_percent: number | null;
  address: School['address'] | null;
  contact: School['contact'] | null;
  branding: School['branding'] | null;
  business_model: BusinessModel | null;
  created_at: string;
  updated_at: string;
}

interface OperatingUnitRow {
  id: string;
  school_id: string;
  campus_id: string | null;
  name: string;
  type: OperatingUnit['type'];
  owner_type: OperatingUnit['ownerType'];
  is_active: boolean | null;
  manager_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const DEFAULT_BUSINESS_MODEL: BusinessModel = {
  setupFee: 25000,
  annualFee: 15000,
  monthlyRentFee: 5000,
  parentAppFee: 25,
  saasPerStudent: 45,
  saasPerStaff: 25,
  chargeStaffUsage: false,
  cardDepositFeePercent: 3.5,
  speiDepositFeeFixed: 8,
  cafeteriaFeePercent: 5,
  cafeteriaFeeAutoMarkup: true,
  posMethods: {
    allowQrBarcode: true,
    allowMatricula: true,
    allowAnonymous: false,
  },
  margins: {
    concessionaireMargin: 85,
    schoolMargin: 10,
    mecardMargin: 5,
  },
  settlement: {
    frequency: 'WEEKLY',
    method: 'BANK_TRANSFER',
  },
};

const mapSchoolRow = (row: SchoolRow): School => ({
  id: row.id,
  name: row.name,
  legalName: row.legal_name || undefined,
  rfc: row.rfc || undefined,
  logo: row.logo_url || '🎓',
  studentCount: row.student_count || 0,
  balance: row.balance || 0,
  unifiedBalance: row.unified_balance ?? true,
  status: (row.status as SchoolStatus) || SchoolStatus.PENDING,
  contractType: (row.contract_type as ContractType) || ContractType.TRIAL,
  trialDurationMonths: (row.trial_duration_months as School['trialDurationMonths']) || 1,
  onboardingStatus: (row.onboarding_status as School['onboardingStatus']) || 'PENDING',
  stpCostCenter: row.stp_cost_center || undefined,
  settlementCLABE: row.settlement_clabe || undefined,
  platformFeePercent: row.platform_fee_percent || 0,
  address: row.address || undefined,
  contact: row.contact || undefined,
  branding: row.branding || undefined,
  businessModel: row.business_model || DEFAULT_BUSINESS_MODEL,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapOperatingUnitRow = (row: OperatingUnitRow): OperatingUnit => ({
  id: row.id,
  schoolId: row.school_id,
  campusId: row.campus_id || undefined,
  name: row.name,
  type: row.type,
  ownerType: row.owner_type,
  managerId: row.manager_id || undefined,
  isActive: row.is_active ?? true,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
});

const toSchoolInsertPayload = (school: NewSchool | School) => ({
  id: school.id,
  name: school.name,
  legal_name: school.legalName || null,
  rfc: school.rfc || null,
  logo_url: school.logo || null,
  student_count: school.studentCount || 0,
  balance: 'balance' in school ? school.balance || 0 : 0,
  unified_balance: school.unifiedBalance ?? true,
  status: school.status,
  contract_type: school.contractType,
  trial_duration_months: school.trialDurationMonths || null,
  onboarding_status: school.onboardingStatus,
  stp_cost_center: school.stpCostCenter || null,
  settlement_clabe: school.settlementCLABE || null,
  platform_fee_percent: school.platformFeePercent,
  address: school.address || null,
  contact: school.contact || null,
  branding: school.branding || null,
  business_model: school.businessModel || DEFAULT_BUSINESS_MODEL,
});

interface PlatformContextType {
  schools: School[];
  units: OperatingUnit[];
  settlements: Settlement[];
  activeSchool: School | null;
  currentUser: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  
  addSchool: (school: NewSchool) => Promise<void>;
  saveSchool: (school: School | NewSchool) => Promise<School | null>;
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
        useMockData();
        return;
      }
      
      try {
        // Parallel fetch for better performance
        const [schoolsRes, unitsRes, settlementsRes] = await Promise.all([
          supabase.from('schools').select('*'),
          supabase.from('operating_units').select('*'),
          supabase
            .from('school_refund_settlements')
            .select('*')
            .order('settled_at', { ascending: false })
        ]);
        
        if (schoolsRes.error) throw schoolsRes.error;
        if (unitsRes.error) throw unitsRes.error;
        if (settlementsRes.error) throw settlementsRes.error;

        if (schoolsRes.data) setSchools((schoolsRes.data as SchoolRow[]).map(mapSchoolRow));
        if (unitsRes.data) setUnits((unitsRes.data as OperatingUnitRow[]).map(mapOperatingUnitRow));
        if (settlementsRes.data) setSettlements(settlementsRes.data as any);

        setIsDemoMode(false);
      } catch (err: unknown) {
        // Robustly extract error message even from Supabase error objects
        let errMsg: string;
        if (err instanceof Error) {
          errMsg = err.message;
        } else if (typeof err === 'object' && err !== null) {
          errMsg = (err as any).message || (err as any).error_description || JSON.stringify(err);
        } else {
          errMsg = String(err);
        }

        const errName = err instanceof Error ? err.name : '';
        const isNetworkError = 
          errName === 'TypeError' || 
          errMsg.toLowerCase().includes('fetch') || 
          errMsg.toLowerCase().includes('network') ||
          errMsg.toLowerCase().includes('err_name_not_resolved');

        if (isNetworkError) {
          logger.warn('platform.context', 'Network unreachable. Defaulting to demo mode.');
        } else {
          logger.warn('platform.context', 'Database error. Switching to demo mode.', { message: errMsg });
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
    await saveSchool(school);
  };

  const saveSchool = async (school: School | NewSchool) => {
    if (isDemoMode) {
      const mockNew: School = { 
        ...school, 
        id: school.id || `mx_${Date.now()}`, 
        balance: 0,
        platformFeePercent: school.platformFeePercent || 4.5,
        onboardingStatus: 'PENDING'
      } as School;
      setSchools(prev => [mockNew, ...prev.filter(item => item.id !== mockNew.id)]);
      return mockNew;
    }

    const newId = school.id || crypto.randomUUID();
    const payload = toSchoolInsertPayload({
      ...school,
      id: newId,
      balance: 'balance' in school ? school.balance : 0,
      onboardingStatus: school.onboardingStatus || 'PENDING',
      platformFeePercent: school.platformFeePercent || 4.5,
      businessModel: school.businessModel || DEFAULT_BUSINESS_MODEL,
    } as School);

    const { data, error } = await supabase
      .from('schools')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      logger.error('platform.context', 'Error saving school', error, { schoolId: newId });
      return null;
    }

    const mapped = mapSchoolRow(data as SchoolRow);
    setSchools(prev => [mapped, ...prev.filter(item => item.id !== mapped.id)]);
    return mapped;
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

    if (error) {
      logger.error('platform.context', 'Error updating school business model', error, { schoolId: id });
      return;
    }

    const { error: businessModelError } = await supabase
      .from('school_business_models')
      .upsert({
        school_id: id,
        pricing_model: 'CUSTOM',
        status: 'accepted',
        business_model: newModel,
        updated_by: currentUser?.id || null,
      });

    if (businessModelError) {
      logger.error('platform.context', 'Error syncing school_business_models', businessModelError, { schoolId: id });
      return;
    }

    setSchools(prev => prev.map(s => s.id === id ? { ...s, businessModel: newModel } : s));
  };

  const runSettlement = async (school: School) => {
    if (isDemoMode) {
      // TODO: Replace with toast notification when called from component
      return;
    }
    // Remote logic would go here
  };

  const login = async (email: string, role: string) => {
    const mockUser: User = {
        id: 'user_123',
        fullName: 'Admin Usuario',
        email: email,
        passwordHash: 'demo-hash',
        role: role as UserRole,
        status: UserStatus.ACTIVE,
        schoolId: 'mx_01',
        twoFactorEnabled: false,
        loginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    setCurrentUser(mockUser);
  };

  const logout = async () => {
    setCurrentUser(null);
    setActiveSchool(null);
  };

  const contextValue = useMemo(() => ({
    schools, units, settlements, activeSchool, currentUser, isLoading, isDemoMode,
    addSchool, saveSchool, updateSchoolModel, impersonateSchool: setActiveSchool, runSettlement, login, logout
  }), [schools, units, settlements, activeSchool, currentUser, isLoading, isDemoMode]);

  return (
    <PlatformContext.Provider value={contextValue}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used within PlatformProvider");
  return context;
};

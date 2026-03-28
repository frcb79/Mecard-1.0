import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { MOCK_STUDENT_TRANSACTIONS, MOCK_UNITS } from '../constants';
import { EntityOwner } from '../types';
import type { OperatingUnit, StudentProfile, WalletTransaction } from '../types';
import { useStudents } from './useStudents';
import { logger } from '../lib/logger';

interface OperatingUnitRow {
  id: string;
  school_id: string;
  name: string;
  type: 'CAFETERIA' | 'STATIONERY' | 'LIBRARY' | 'BOOKSTORE' | 'OTHER' | string;
  owner_type: 'SCHOOL' | 'CONCESSIONAIRE' | string;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SchoolAdminQueriesState {
  students: StudentProfile[];
  operatingUnits: OperatingUnit[];
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const normalizeUnitType = (type: OperatingUnitRow['type']): OperatingUnit['type'] => {
  if (type === 'CAFETERIA' || type === 'STATIONERY' || type === 'LIBRARY' || type === 'BOOKSTORE') {
    return type;
  }
  return 'OTHER';
};

const normalizeOwnerType = (ownerType: OperatingUnitRow['owner_type']): OperatingUnit['ownerType'] => {
  return ownerType === 'CONCESSIONAIRE' ? EntityOwner.CONCESSIONAIRE : EntityOwner.SCHOOL;
};

const mapUnit = (row: OperatingUnitRow): OperatingUnit => {
  const stamp = row.updated_at || row.created_at || new Date().toISOString();
  return {
    id: row.id,
    schoolId: row.school_id,
    name: row.name,
    type: normalizeUnitType(row.type),
    ownerType: normalizeOwnerType(row.owner_type),
    isActive: row.is_active ?? true,
    createdAt: row.created_at || stamp,
    updatedAt: stamp,
  };
};

export const useSchoolAdminQueries = (schoolId: string) => {
  const studentsHook = useStudents({ schoolId });
  const [state, setState] = useState<SchoolAdminQueriesState>({
    students: [],
    operatingUnits: [],
    transactions: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const loadUnits = useCallback(async (): Promise<OperatingUnit[]> => {
    if (!isSupabaseConfigured) {
      return MOCK_UNITS.filter((u) => u.schoolId === schoolId);
    }

    const { data, error } = await supabase
      .from('operating_units')
      .select('id, school_id, name, type, owner_type, is_active, created_at, updated_at')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data || []) as OperatingUnitRow[];
    return rows.map(mapUnit);
  }, [schoolId]);

  const loadTransactions = useCallback(async (): Promise<WalletTransaction[]> => {
    if (!isSupabaseConfigured) {
      return MOCK_STUDENT_TRANSACTIONS;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      throw error;
    }

    return (data || []) as WalletTransaction[];
  }, [schoolId]);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [operatingUnits, transactions] = await Promise.all([loadUnits(), loadTransactions()]);
      setState({
        students: studentsHook.students,
        operatingUnits,
        transactions,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err: unknown) {
      logger.error('hooks.schoolAdminQueries', 'Error loading school admin queries', err, { schoolId });
      setState((prev) => ({
        ...prev,
        students: studentsHook.students,
        loading: false,
        error: 'No se pudieron cargar todos los datos de School Admin.',
        lastUpdated: new Date().toISOString(),
      }));
    }
  }, [loadTransactions, loadUnits, schoolId, studentsHook.students]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setState((prev) => ({ ...prev, students: studentsHook.students, loading: prev.loading || studentsHook.loading }));
  }, [studentsHook.loading, studentsHook.students]);

  const totalBalance = useMemo(
    () => state.students.reduce((acc, student) => acc + student.balance, 0),
    [state.students],
  );

  return {
    ...state,
    totalBalance,
    refresh,
  };
};

export default useSchoolAdminQueries;

/**
 * useSchoolData — Centralized hook for school + operating unit data.
 *
 * Replaces direct imports of MOCK_SCHOOLS, MOCK_UNITS from constants.
 * Can also read from PlatformContext for schools.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_SCHOOLS, MOCK_UNITS } from '../constants';
import type { School, OperatingUnit } from '../types';

// ─── Types ────────────────────────────────────────────

interface SchoolDataState {
  schools: School[];
  units: OperatingUnit[];
  loading: boolean;
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────

export function useSchoolData(schoolId?: string) {
  const [state, setState] = useState<SchoolDataState>({
    schools: [],
    units: [],
    loading: true,
    error: null,
  });

  const loadData = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const schools = [...MOCK_SCHOOLS];
      let units = [...MOCK_UNITS];

      if (schoolId) {
        units = units.filter(u => u.schoolId === schoolId);
      }

      setState({ schools, units, loading: false, error: null });
    } catch (err) {
      console.error('[useSchoolData] Error loading data:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar datos de escuelas',
      }));
    }
  }, [schoolId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Convenience helpers ──

  const getSchoolById = useCallback(
    (id: string) => state.schools.find(s => s.id === id),
    [state.schools],
  );

  const getUnitsBySchool = useCallback(
    (id: string) => state.units.filter(u => u.schoolId === id),
    [state.units],
  );

  const activeSchools = useMemo(
    () => state.schools.filter(s => s.status === 'active'),
    [state.schools],
  );

  const activeUnits = useMemo(
    () => state.units.filter(u => u.isActive),
    [state.units],
  );

  const currentSchool = useMemo(
    () => (schoolId ? state.schools.find(s => s.id === schoolId) : null),
    [schoolId, state.schools],
  );

  return {
    ...state,
    currentSchool,
    activeSchools,
    activeUnits,
    refresh: loadData,
    getSchoolById,
    getUnitsBySchool,
  };
}

export default useSchoolData;

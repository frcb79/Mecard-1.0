import { useCallback, useEffect, useState } from 'react';
import { logger } from '../lib/logger';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type {
  SchoolEnabledModules,
  SchoolOperationalSettings,
  SchoolSettings,
} from '../types';

export const DEFAULT_ENABLED_MODULES: SchoolEnabledModules = {
  cafeteria: true,
  stationery: false,
  fees: true,
  refunds: true,
  collections: true,
  reports: true,
  access: false,
  announcements: true,
  trips: false,
  invoicing: true,
  rewards: true,
};

export const DEFAULT_OPERATIONAL_SETTINGS: SchoolOperationalSettings = {
  paymentMethods: ['qr', 'matricula', 'cash'],
  ownerScenarios: ['school'],
  supportEmail: '',
  supportPhone: '',
  lowBalanceThreshold: 80,
  allowCash: true,
  requireStudentIdentification: true,
  notes: '',
  demo: false,
};

export interface ResolvedSchoolSettings
  extends Omit<SchoolSettings, 'enabled_modules' | 'operational_settings' | 'onboarding_completed' | 'onboarding_completed_at' | 'is_demo_school'> {
  enabled_modules: SchoolEnabledModules;
  operational_settings: SchoolOperationalSettings;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  is_demo_school: boolean;
}

const normalizeEnabledModules = (value?: SchoolSettings['enabled_modules']): SchoolEnabledModules => ({
  ...DEFAULT_ENABLED_MODULES,
  ...(value || {}),
});

const normalizeOperationalSettings = (
  value?: SchoolSettings['operational_settings'],
): SchoolOperationalSettings => ({
  ...DEFAULT_OPERATIONAL_SETTINGS,
  ...(value || {}),
  paymentMethods: Array.isArray(value?.paymentMethods)
    ? value.paymentMethods
    : DEFAULT_OPERATIONAL_SETTINGS.paymentMethods,
  ownerScenarios: Array.isArray(value?.ownerScenarios)
    ? value.ownerScenarios
    : DEFAULT_OPERATIONAL_SETTINGS.ownerScenarios,
});

export const normalizeSchoolSettings = (
  schoolId: string,
  value?: SchoolSettings | null,
): ResolvedSchoolSettings => ({
  id: value?.id || '',
  school_id: value?.school_id || schoolId,
  pool_points_multiplier: value?.pool_points_multiplier ?? 1,
  enabled_modules: normalizeEnabledModules(value?.enabled_modules),
  operational_settings: normalizeOperationalSettings(value?.operational_settings),
  onboarding_completed: value?.onboarding_completed ?? false,
  onboarding_completed_at: value?.onboarding_completed_at || null,
  is_demo_school: value?.is_demo_school ?? false,
  created_at: value?.created_at || new Date().toISOString(),
  updated_at: value?.updated_at || new Date().toISOString(),
});

const toUpsertPayload = (settings: ResolvedSchoolSettings) => ({
  school_id: settings.school_id,
  pool_points_multiplier: settings.pool_points_multiplier,
  enabled_modules: settings.enabled_modules,
  operational_settings: settings.operational_settings,
  onboarding_completed: settings.onboarding_completed,
  onboarding_completed_at: settings.onboarding_completed_at,
  is_demo_school: settings.is_demo_school,
});

export function useSchoolSettings(schoolId?: string) {
  const [settings, setSettings] = useState<ResolvedSchoolSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!schoolId) {
      setSettings(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setSettings(normalizeSchoolSettings(schoolId));
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('school_settings')
        .select('*')
        .eq('school_id', schoolId)
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      if (!data) {
        const fallback = normalizeSchoolSettings(schoolId);
        const { data: created, error: insertError } = await supabase
          .from('school_settings')
          .upsert(toUpsertPayload(fallback), { onConflict: 'school_id' })
          .select('*')
          .single();

        if (insertError) {
          throw insertError;
        }

        setSettings(normalizeSchoolSettings(schoolId, created as SchoolSettings));
        setLoading(false);
        return;
      }

      setSettings(normalizeSchoolSettings(schoolId, data as SchoolSettings));
    } catch (err) {
      logger.error('school-settings.hook', 'Error loading school settings', err, { schoolId });
      setError('No se pudo cargar la configuración de la escuela.');
      setSettings(normalizeSchoolSettings(schoolId));
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(
    async (updates: Partial<ResolvedSchoolSettings>) => {
      if (!schoolId) {
        return null;
      }

      const merged = normalizeSchoolSettings(schoolId, {
        ...(settings || normalizeSchoolSettings(schoolId)),
        ...updates,
        enabled_modules: updates.enabled_modules ?? settings?.enabled_modules,
        operational_settings: updates.operational_settings ?? settings?.operational_settings,
        onboarding_completed: updates.onboarding_completed ?? settings?.onboarding_completed,
        onboarding_completed_at:
          updates.onboarding_completed_at !== undefined
            ? updates.onboarding_completed_at
            : settings?.onboarding_completed_at,
        is_demo_school: updates.is_demo_school ?? settings?.is_demo_school,
      });

      if (!isSupabaseConfigured) {
        setSettings(merged);
        return merged;
      }

      try {
        const { data, error: upsertError } = await supabase
          .from('school_settings')
          .upsert(toUpsertPayload(merged), { onConflict: 'school_id' })
          .select('*')
          .single();

        if (upsertError) {
          throw upsertError;
        }

        const normalized = normalizeSchoolSettings(schoolId, data as SchoolSettings);
        setSettings(normalized);
        return normalized;
      } catch (err) {
        logger.error('school-settings.hook', 'Error saving school settings', err, { schoolId });
        setError('No se pudo guardar la configuración de la escuela.');
        return null;
      }
    },
    [schoolId, settings],
  );

  return {
    settings,
    loading,
    error,
    reload: loadSettings,
    saveSettings,
  };
}
/**
 * useAccess — Hook wrapping AccessControlService for access control views.
 *
 * Provides typed state + CRUD actions for:
 * access points, events, attendance, webhooks, API keys, daily stats.
 */

import { useState, useEffect, useCallback } from 'react';
import { AccessControlService } from '../services/AccessControlService';
import type {
  AccessPoint,
  AccessEvent,
  AttendanceRecord,
  WebhookConfig,
  AccessApiKey,
  AccessDirection,
  WebhookEventType,
} from '../types';

// ─── Types ────────────────────────────────────────────

export interface DailyStats {
  totalRecords: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  earlyExit: number;
  totalEntries: number;
  totalExits: number;
  deniedAccess: number;
  currentlyInCampus: number;
  attendancePercent: number;
}

export interface AttendanceSummary {
  studentId: string;
  period: string;
  totalDays: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  earlyExit: number;
  attendancePercent: number;
}

interface AccessFilters {
  date?: string;
  accessPointId?: string;
  direction?: AccessDirection;
  studentId?: string;
}

interface AccessState {
  accessPoints: AccessPoint[];
  accessEvents: AccessEvent[];
  attendanceRecords: AttendanceRecord[];
  dailyStats: DailyStats | null;
  webhooks: WebhookConfig[];
  apiKeys: AccessApiKey[];
  loading: boolean;
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────

export function useAccess(schoolId: string, date?: string) {
  const effectiveDate = date || new Date().toISOString().slice(0, 10);

  const [state, setState] = useState<AccessState>({
    accessPoints: [],
    accessEvents: [],
    attendanceRecords: [],
    dailyStats: null,
    webhooks: [],
    apiKeys: [],
    loading: true,
    error: null,
  });

  const [eventFilters, setEventFilters] = useState<AccessFilters>({});

  // ── Load all data ──

  const loadAll = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const accessPoints = AccessControlService.getAccessPoints(schoolId);
      const accessEvents = AccessControlService.getAccessEvents(schoolId, {
        ...eventFilters,
        date: eventFilters.date || effectiveDate,
      });
      const attendanceRecords = AccessControlService.getAttendanceByDate(schoolId, effectiveDate);
      const dailyStats = AccessControlService.getDailyStats(schoolId, effectiveDate);
      const webhooks = AccessControlService.getWebhooks(schoolId);
      const apiKeys = AccessControlService.getApiKeys(schoolId);

      setState({
        accessPoints,
        accessEvents,
        attendanceRecords,
        dailyStats,
        webhooks,
        apiKeys,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('[useAccess] Error loading data:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar datos de control de acceso',
      }));
    }
  }, [schoolId, effectiveDate, eventFilters]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Access Point CRUD ──

  const createAccessPoint = useCallback(
    (point: AccessPoint) => {
      const created = AccessControlService.createAccessPoint(point);
      loadAll();
      return created;
    },
    [loadAll],
  );

  const updateAccessPoint = useCallback(
    (id: string, updates: Partial<AccessPoint>) => {
      const updated = AccessControlService.updateAccessPoint(id, updates);
      loadAll();
      return updated;
    },
    [loadAll],
  );

  const deleteAccessPoint = useCallback(
    (id: string) => {
      const result = AccessControlService.deleteAccessPoint(id);
      loadAll();
      return result;
    },
    [loadAll],
  );

  // ── Events ──

  const processAccessEvent = useCallback(
    (event: AccessEvent) => {
      const processed = AccessControlService.processAccessEvent(event);
      loadAll();
      return processed;
    },
    [loadAll],
  );

  // ── Attendance ──

  const getAttendanceByStudent = useCallback(
    (studentId: string, startDate?: string, endDate?: string) => {
      return AccessControlService.getAttendanceByStudent(studentId, startDate, endDate);
    },
    [],
  );

  const getAttendanceSummary = useCallback(
    (studentId: string, periodDays?: number): AttendanceSummary => {
      return AccessControlService.getAttendanceSummary(studentId, periodDays);
    },
    [],
  );

  const markManualAttendance = useCallback(
    (record: AttendanceRecord) => {
      const result = AccessControlService.markManualAttendance(record);
      loadAll();
      return result;
    },
    [loadAll],
  );

  // ── Webhooks CRUD ──

  const createWebhook = useCallback(
    (config: WebhookConfig) => {
      const created = AccessControlService.createWebhook(config);
      loadAll();
      return created;
    },
    [loadAll],
  );

  const updateWebhook = useCallback(
    (id: string, updates: Partial<WebhookConfig>) => {
      const updated = AccessControlService.updateWebhook(id, updates);
      loadAll();
      return updated;
    },
    [loadAll],
  );

  const deleteWebhook = useCallback(
    (id: string) => {
      const result = AccessControlService.deleteWebhook(id);
      loadAll();
      return result;
    },
    [loadAll],
  );

  const sendTestWebhook = useCallback(
    async (webhookId: string) => {
      return AccessControlService.sendTestWebhook(webhookId);
    },
    [],
  );

  // ── API Keys ──

  const createApiKey = useCallback(
    (key: AccessApiKey) => {
      const created = AccessControlService.createApiKey(key);
      loadAll();
      return created;
    },
    [loadAll],
  );

  const revokeApiKey = useCallback(
    (id: string) => {
      const result = AccessControlService.revokeApiKey(id);
      loadAll();
      return result;
    },
    [loadAll],
  );

  // ── Webhook helpers ──

  const generateSamplePayload = useCallback((eventType: WebhookEventType) => {
    return AccessControlService.generateSamplePayload(eventType);
  }, []);

  return {
    // State
    ...state,
    eventFilters,

    // Refresh
    refresh: loadAll,
    setEventFilters,

    // Access points
    createAccessPoint,
    updateAccessPoint,
    deleteAccessPoint,

    // Events
    processAccessEvent,

    // Attendance
    getAttendanceByStudent,
    getAttendanceSummary,
    markManualAttendance,

    // Webhooks
    createWebhook,
    updateWebhook,
    deleteWebhook,
    sendTestWebhook,

    // API keys
    createApiKey,
    revokeApiKey,

    // Helpers
    generateSamplePayload,
  };
}

export default useAccess;

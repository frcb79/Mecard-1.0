/**
 * AccessControlService — Sistema de Accesos, Asistencia y API/Webhooks
 * Mock implementation con localStorage
 * 
 * En producción: este servicio se conecta a dispositivos físicos (torniquetes, lectores biométricos)
 * vía webhooks entrantes y expone una API REST para consultas.
 */

import {
  AccessPoint, AccessEvent, AttendanceRecord, AttendanceStatus,
  WebhookConfig, WebhookEventType, WebhookPayload, AccessApiKey,
  AccessDirection, ScanMethod
} from '../types';
import {
  MOCK_ACCESS_POINTS, MOCK_ACCESS_EVENTS, MOCK_ATTENDANCE_RECORDS,
  MOCK_WEBHOOK_CONFIGS, MOCK_API_KEYS
} from '../constants';

const ACCESS_POINTS_KEY = 'mecard_access_points';
const ACCESS_EVENTS_KEY = 'mecard_access_events';
const ATTENDANCE_KEY = 'mecard_attendance';
const WEBHOOKS_KEY = 'mecard_webhooks';
const API_KEYS_KEY = 'mecard_api_keys';

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [...fallback];
  } catch { return [...fallback]; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const AccessControlService = {
  // ---- ACCESS POINTS ----

  getAccessPoints(schoolId: string): AccessPoint[] {
    return load<AccessPoint>(ACCESS_POINTS_KEY, MOCK_ACCESS_POINTS).filter(ap => ap.schoolId === schoolId);
  },

  createAccessPoint(point: AccessPoint): AccessPoint {
    const points = load<AccessPoint>(ACCESS_POINTS_KEY, MOCK_ACCESS_POINTS);
    points.push(point);
    save(ACCESS_POINTS_KEY, points);
    return point;
  },

  updateAccessPoint(id: string, updates: Partial<AccessPoint>): AccessPoint | null {
    const points = load<AccessPoint>(ACCESS_POINTS_KEY, MOCK_ACCESS_POINTS);
    const idx = points.findIndex(p => p.id === id);
    if (idx === -1) return null;
    points[idx] = { ...points[idx], ...updates };
    save(ACCESS_POINTS_KEY, points);
    return points[idx];
  },

  deleteAccessPoint(id: string): boolean {
    const points = load<AccessPoint>(ACCESS_POINTS_KEY, MOCK_ACCESS_POINTS);
    const filtered = points.filter(p => p.id !== id);
    if (filtered.length === points.length) return false;
    save(ACCESS_POINTS_KEY, filtered);
    return true;
  },

  // ---- ACCESS EVENTS ----

  getAccessEvents(schoolId: string, filters?: { date?: string; accessPointId?: string; direction?: AccessDirection; studentId?: string }): AccessEvent[] {
    const points = this.getAccessPoints(schoolId);
    const pointIds = new Set(points.map(p => p.id));
    let events = load<AccessEvent>(ACCESS_EVENTS_KEY, MOCK_ACCESS_EVENTS).filter(e => pointIds.has(e.accessPointId));

    if (filters?.date) events = events.filter(e => e.timestamp.startsWith(filters.date!));
    if (filters?.accessPointId) events = events.filter(e => e.accessPointId === filters.accessPointId);
    if (filters?.direction) events = events.filter(e => e.direction === filters.direction);
    if (filters?.studentId) events = events.filter(e => e.studentId === filters.studentId);

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  processAccessEvent(event: AccessEvent): AccessEvent {
    const events = load<AccessEvent>(ACCESS_EVENTS_KEY, MOCK_ACCESS_EVENTS);
    events.push(event);
    save(ACCESS_EVENTS_KEY, events);
    return event;
  },

  // ---- ATTENDANCE ----

  getAttendanceByDate(schoolId: string, date: string): AttendanceRecord[] {
    return load<AttendanceRecord>(ATTENDANCE_KEY, MOCK_ATTENDANCE_RECORDS).filter(r => r.date === date);
  },

  getAttendanceByStudent(studentId: string, startDate?: string, endDate?: string): AttendanceRecord[] {
    let records = load<AttendanceRecord>(ATTENDANCE_KEY, MOCK_ATTENDANCE_RECORDS).filter(r => r.studentId === studentId);
    if (startDate) records = records.filter(r => r.date >= startDate);
    if (endDate) records = records.filter(r => r.date <= endDate);
    return records.sort((a, b) => b.date.localeCompare(a.date));
  },

  getAttendanceSummary(studentId: string, periodDays: number = 30) {
    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - periodDays * 86400000).toISOString().slice(0, 10);
    const records = this.getAttendanceByStudent(studentId, startDate, endDate);

    return {
      studentId,
      period: `${startDate} - ${endDate}`,
      totalDays: records.length,
      present: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
      late: records.filter(r => r.status === AttendanceStatus.LATE).length,
      absent: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
      excused: records.filter(r => r.status === AttendanceStatus.EXCUSED).length,
      earlyExit: records.filter(r => r.status === AttendanceStatus.EARLY_EXIT).length,
      attendancePercent: records.length > 0
        ? Math.round(((records.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length) / records.length) * 100)
        : 0,
    };
  },

  markManualAttendance(record: AttendanceRecord): AttendanceRecord {
    const records = load<AttendanceRecord>(ATTENDANCE_KEY, MOCK_ATTENDANCE_RECORDS);
    const existing = records.findIndex(r => r.studentId === record.studentId && r.date === record.date);
    if (existing >= 0) {
      records[existing] = { ...records[existing], ...record };
    } else {
      records.push(record);
    }
    save(ATTENDANCE_KEY, records);
    return record;
  },

  getDailyStats(schoolId: string, date: string) {
    const records = this.getAttendanceByDate(schoolId, date);
    const events = this.getAccessEvents(schoolId, { date });
    
    const entries = events.filter(e => e.direction === AccessDirection.ENTRY && e.authorized);
    const exits = events.filter(e => e.direction === AccessDirection.EXIT && e.authorized);
    const denied = events.filter(e => !e.authorized);
    const uniqueInCampus = new Set(entries.map(e => e.studentId));
    exits.forEach(e => uniqueInCampus.delete(e.studentId));

    return {
      totalRecords: records.length,
      present: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
      late: records.filter(r => r.status === AttendanceStatus.LATE).length,
      absent: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
      excused: records.filter(r => r.status === AttendanceStatus.EXCUSED).length,
      earlyExit: records.filter(r => r.status === AttendanceStatus.EARLY_EXIT).length,
      totalEntries: entries.length,
      totalExits: exits.length,
      deniedAccess: denied.length,
      currentlyInCampus: uniqueInCampus.size,
      attendancePercent: records.length > 0
        ? Math.round(((records.filter(r => [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.EARLY_EXIT].includes(r.status)).length) / records.length) * 100)
        : 0,
    };
  },

  // ---- WEBHOOKS ----

  getWebhooks(schoolId: string): WebhookConfig[] {
    return load<WebhookConfig>(WEBHOOKS_KEY, MOCK_WEBHOOK_CONFIGS).filter(w => w.schoolId === schoolId);
  },

  createWebhook(config: WebhookConfig): WebhookConfig {
    const webhooks = load<WebhookConfig>(WEBHOOKS_KEY, MOCK_WEBHOOK_CONFIGS);
    webhooks.push(config);
    save(WEBHOOKS_KEY, webhooks);
    return config;
  },

  updateWebhook(id: string, updates: Partial<WebhookConfig>): WebhookConfig | null {
    const webhooks = load<WebhookConfig>(WEBHOOKS_KEY, MOCK_WEBHOOK_CONFIGS);
    const idx = webhooks.findIndex(w => w.id === id);
    if (idx === -1) return null;
    webhooks[idx] = { ...webhooks[idx], ...updates };
    save(WEBHOOKS_KEY, webhooks);
    return webhooks[idx];
  },

  deleteWebhook(id: string): boolean {
    const webhooks = load<WebhookConfig>(WEBHOOKS_KEY, MOCK_WEBHOOK_CONFIGS);
    const filtered = webhooks.filter(w => w.id !== id);
    if (filtered.length === webhooks.length) return false;
    save(WEBHOOKS_KEY, filtered);
    return true;
  },

  // Simulate sending a test webhook
  async sendTestWebhook(webhookId: string): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const webhooks = load<WebhookConfig>(WEBHOOKS_KEY, MOCK_WEBHOOK_CONFIGS);
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return { success: false, error: 'Webhook no encontrado' };
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));
    
    // 80% success rate in simulation
    const success = Math.random() > 0.2;
    if (success) {
      this.updateWebhook(webhookId, { lastDelivery: new Date().toISOString(), failCount: 0 });
      return { success: true, statusCode: 200 };
    } else {
      this.updateWebhook(webhookId, { failCount: (webhook.failCount || 0) + 1 });
      return { success: false, statusCode: 500, error: 'Connection timeout' };
    }
  },

  // ---- API KEYS ----

  getApiKeys(schoolId: string): AccessApiKey[] {
    return load<AccessApiKey>(API_KEYS_KEY, MOCK_API_KEYS).filter(k => k.schoolId === schoolId);
  },

  createApiKey(key: AccessApiKey): AccessApiKey {
    const keys = load<AccessApiKey>(API_KEYS_KEY, MOCK_API_KEYS);
    keys.push(key);
    save(API_KEYS_KEY, keys);
    return key;
  },

  revokeApiKey(id: string): boolean {
    const keys = load<AccessApiKey>(API_KEYS_KEY, MOCK_API_KEYS);
    const idx = keys.findIndex(k => k.id === id);
    if (idx === -1) return false;
    keys[idx] = { ...keys[idx], isActive: false };
    save(API_KEYS_KEY, keys);
    return true;
  },

  // ---- WEBHOOK SIGNATURE VALIDATION ----

  /**
   * Validates HMAC-SHA256 signature from external device.
   * In production, this uses crypto.subtle.sign() with the webhook secret.
   * Demo mode always returns true.
   */
  validateWebhookSignature(_payload: WebhookPayload, _secret: string): boolean {
    // In production: 
    // const encoder = new TextEncoder();
    // const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    // const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(JSON.stringify(payload.data)));
    // return btoa(String.fromCharCode(...new Uint8Array(signature))) === payload.signature;
    return true; // Demo mode
  },

  /**
   * Generate a sample webhook payload for documentation / testing
   */
  generateSamplePayload(eventType: WebhookEventType, schoolId?: string): WebhookPayload {
    const fallbackSchoolId = schoolId || MOCK_ACCESS_POINTS[0]?.schoolId || 'school_demo';
    const base = {
      eventType,
      timestamp: new Date().toISOString(),
      deviceId: 'ap_01',
      schoolId: fallbackSchoolId,
      signature: 'hmac_sha256_demo_signature',
    };

    switch (eventType) {
      case WebhookEventType.ACCESS_ENTRY:
      case WebhookEventType.ACCESS_EXIT:
        return { ...base, data: { studentId: '2024001', studentName: 'Santiago Gonzalez', credentialUsed: ScanMethod.QR_CODE, accessPointId: 'ap_01' } };
      case WebhookEventType.ACCESS_DENIED:
        return { ...base, data: { credentialUsed: ScanMethod.QR_CODE, accessPointId: 'ap_01', reason: 'Credencial bloqueada' } };
      case WebhookEventType.HEARTBEAT:
        return { ...base, data: { status: 'ONLINE', firmwareVersion: '3.2.1', uptime: 86400 } };
      case WebhookEventType.DEVICE_OFFLINE:
      case WebhookEventType.DEVICE_ONLINE:
        return { ...base, data: { accessPointId: 'ap_01', previousStatus: 'ONLINE', newStatus: 'OFFLINE' } };
      case WebhookEventType.ATTENDANCE_MARKED:
        return { ...base, data: { studentId: '2024001', date: new Date().toISOString().slice(0, 10), status: 'PRESENT', entryTime: '07:15' } };
      default:
        return { ...base, data: {} };
    }
  },
};

/**
 * SchoolAccessDashboard — Sistema de Control de Accesos
 * 4 Tabs: Monitor en Vivo | Asistencia | Puntos de Acceso | Integraciones API
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield, Activity, Users, Radio, Settings, Key, Webhook, Plus, Edit2, Trash2, X,
  CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, ArrowLeft, Eye, EyeOff,
  Copy, RefreshCw, Wifi, WifiOff, MapPin, Fingerprint, QrCode, CreditCard,
  Download, Search, ChevronDown, Play, Terminal, Code, ExternalLink, Zap
} from 'lucide-react';
import {
  AccessPoint, AccessEvent, AttendanceRecord, AccessPointType, AccessDirection,
  AccessPointStatus, ScanMethod, AttendanceStatus, WebhookConfig, AccessApiKey,
  WebhookEventType
} from '../types';
import { useAccess } from '../hooks/useAccess';
import { useToast } from './ui/Toast';

type Tab = 'live' | 'attendance' | 'points' | 'api';

const DIRECTION_ICONS: Record<string, React.ReactNode> = {
  [AccessDirection.ENTRY]: <ArrowRight size={14} className="text-emerald-500" />,
  [AccessDirection.EXIT]: <ArrowLeft size={14} className="text-blue-500" />,
  [AccessDirection.BIDIRECTIONAL]: <RefreshCw size={14} className="text-indigo-500" />,
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  [ScanMethod.QR_CODE]: <QrCode size={14} />,
  [ScanMethod.NFC]: <CreditCard size={14} />,
  [ScanMethod.FACIAL]: <Eye size={14} />,
  [ScanMethod.FINGERPRINT]: <Fingerprint size={14} />,
  [ScanMethod.BARCODE]: <CreditCard size={14} />,
  [ScanMethod.PIN]: <Key size={14} />,
  [ScanMethod.MANUAL]: <Users size={14} />,
};

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  [AccessPointStatus.ONLINE]: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  [AccessPointStatus.OFFLINE]: { dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-600' },
  [AccessPointStatus.MAINTENANCE]: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
};

const ATT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  [AttendanceStatus.PRESENT]: { label: 'Presente', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  [AttendanceStatus.LATE]: { label: 'Tarde', color: 'text-amber-600', bg: 'bg-amber-50' },
  [AttendanceStatus.ABSENT]: { label: 'Ausente', color: 'text-rose-600', bg: 'bg-rose-50' },
  [AttendanceStatus.EXCUSED]: { label: 'Justificado', color: 'text-blue-600', bg: 'bg-blue-50' },
  [AttendanceStatus.EARLY_EXIT]: { label: 'Salida temprana', color: 'text-purple-600', bg: 'bg-purple-50' },
};

const WEBHOOK_EVENT_LABELS: Record<WebhookEventType, string> = {
  [WebhookEventType.ACCESS_ENTRY]: 'access.entry',
  [WebhookEventType.ACCESS_EXIT]: 'access.exit',
  [WebhookEventType.ACCESS_DENIED]: 'access.denied',
  [WebhookEventType.HEARTBEAT]: 'device.heartbeat',
  [WebhookEventType.DEVICE_OFFLINE]: 'device.offline',
  [WebhookEventType.DEVICE_ONLINE]: 'device.online',
  [WebhookEventType.ATTENDANCE_MARKED]: 'attendance.marked',
};

export default function SchoolAccessDashboard() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('live');

  // Use the access hook for all data
  const {
    accessPoints, accessEvents, attendanceRecords, dailyStats,
    webhooks: hookWebhooks, apiKeys: hookApiKeys,
    loading: accessLoading,
    createWebhook: hookCreateWebhook, deleteWebhook: hookDeleteWebhook,
    sendTestWebhook: hookSendTestWebhook,
    createApiKey: hookCreateApiKey, revokeApiKey: hookRevokeApiKey,
    refresh: refreshAccess,
  } = useAccess('mx_01');

  const [events] = useState<AccessEvent[]>(accessEvents);
  const [attendance] = useState<AttendanceRecord[]>(attendanceRecords);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(hookWebhooks);
  const [apiKeys, setApiKeys] = useState<AccessApiKey[]>(hookApiKeys);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [keyVisibility, setKeyVisibility] = useState<Record<string, boolean>>({});
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [showApiDocs, setShowApiDocs] = useState(false);

  // Sync hook data to local state when it changes
  useEffect(() => {
    if (!accessLoading) {
      setWebhooks(hookWebhooks);
      setApiKeys(hookApiKeys);
    }
  }, [accessLoading, hookWebhooks, hookApiKeys]);

  // Live Monitor Stats
  const liveStats = useMemo(() => {
    const today = events.filter(e => e.timestamp.startsWith(new Date().toISOString().slice(0, 10)));
    const entries = today.filter(e => e.direction === AccessDirection.ENTRY && e.authorized).length;
    const exits = today.filter(e => e.direction === AccessDirection.EXIT && e.authorized).length;
    const denied = today.filter(e => !e.authorized).length;
    return { entries, exits, denied, inCampus: Math.max(0, entries - exits), total: today.length };
  }, [events]);

  // Attendance for date
  const filteredAttendance = useMemo(() => {
    let result = attendance.filter(r => r.date === dateFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.studentName.toLowerCase().includes(q) || r.grade.toLowerCase().includes(q));
    }
    return result;
  }, [attendance, dateFilter, searchQuery]);

  const attendanceSummary = useMemo(() => {
    const d = filteredAttendance;
    return {
      total: d.length,
      present: d.filter(r => r.status === AttendanceStatus.PRESENT).length,
      late: d.filter(r => r.status === AttendanceStatus.LATE).length,
      absent: d.filter(r => r.status === AttendanceStatus.ABSENT).length,
      excused: d.filter(r => r.status === AttendanceStatus.EXCUSED).length,
    };
  }, [filteredAttendance]);

  const testWebhook = (id: string) => {
    setTestingWebhook(id);
    setTimeout(() => {
      const success = Math.random() > 0.2;
      if (success) {
        setWebhooks(prev => prev.map(w => w.id === id ? { ...w, lastDelivery: new Date().toISOString(), failCount: 0 } : w));
        toast.info('Webhook OK', 'Test enviado exitosamente — 200 OK');
      } else {
        toast.warning('Webhook falló', 'Error de conexión simulado');
      }
      setTestingWebhook(null);
    }, 1500);
  };

  const revokeKey = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, isActive: false } : k));
    toast.info('Revocada', 'API key desactivada');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Copiado', 'Texto copiado al portapapeles');
  };

  const exportAttendance = () => {
    const rows = filteredAttendance.map(r => `${r.studentName},${r.grade},${r.date},${r.status},${r.entryTime || ''},${r.exitTime || ''},${r.notes || ''}`);
    const csv = `Alumno,Grado,Fecha,Estado,Entrada,Salida,Notas\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `asistencia_${dateFilter}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.info('Exportado', 'Asistencia descargada');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Shield className="w-9 h-9 text-indigo-600" /> Control de Accesos
          </h1>
          <p className="text-slate-400 font-bold text-sm mt-1">Monitor en tiempo real, asistencia, dispositivos e integraciones API</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-3 rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100 w-fit flex-wrap">
          {([
            ['live', 'Monitor', <Activity size={16} key="l" />],
            ['attendance', 'Asistencia', <Users size={16} key="a" />],
            ['points', 'Dispositivos', <Radio size={16} key="p" />],
            ['api', 'API', <Code size={16} key="i" />],
          ] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setActiveTab(id as Tab)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-black text-[11px] uppercase tracking-[2px] transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* === LIVE MONITOR === */}
        {activeTab === 'live' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Live KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-[32px] border border-indigo-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[3px] mb-1">En Campus</p>
                <p className="text-3xl font-black text-indigo-600 tracking-tighter">{liveStats.inCampus}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[3px] mb-1">Entradas</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter">{liveStats.entries}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-blue-100 shadow-sm">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[3px] mb-1">Salidas</p>
                <p className="text-3xl font-black text-blue-600 tracking-tighter">{liveStats.exits}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-rose-100 shadow-sm">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-[3px] mb-1">Denegados</p>
                <p className="text-3xl font-black text-rose-600 tracking-tighter">{liveStats.denied}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-1">Total</p>
                <p className="text-3xl font-black text-slate-700 tracking-tighter">{liveStats.total}</p>
              </div>
            </div>

            {/* Access Points Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {accessPoints.map(ap => {
                const sc = STATUS_COLORS[ap.status];
                return (
                  <div key={ap.id} className={`bg-white p-5 rounded-[28px] border border-slate-200 ring-1 ring-inset ring-slate-100`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} ${ap.status === AccessPointStatus.ONLINE ? 'animate-pulse' : ''}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${sc.text}`}>{ap.status}</span>
                    </div>
                    <p className="text-sm font-black text-slate-700 tracking-tight">{ap.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{ap.scansToday} escaneos hoy</p>
                  </div>
                );
              })}
            </div>

            {/* Live Feed */}
            <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2"><Activity size={16} className="text-indigo-600" /> Feed en Vivo</h3>
                <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" /> Tiempo Real
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {[...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map(ev => (
                  <div key={ev.id} className={`p-5 px-6 flex items-center gap-4 hover:bg-slate-50/50 transition-colors ${!ev.authorized ? 'bg-rose-50/30' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ev.authorized ? (ev.direction === AccessDirection.ENTRY ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600') : 'bg-rose-50 text-rose-600'}`}>
                      {ev.authorized ? DIRECTION_ICONS[ev.direction] : <XCircle size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${ev.authorized ? 'text-slate-700' : 'text-rose-600'}`}>{ev.studentName}</p>
                      <p className="text-[10px] text-slate-400">{ev.accessPointName} • {ev.studentGrade}</p>
                      {ev.deniedReason && <p className="text-[10px] text-rose-500 font-bold mt-0.5">{ev.deniedReason}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">{METHOD_ICONS[ev.credentialUsed]} {ev.credentialUsed.replace('_', ' ')}</span>
                      <p className="text-xs font-mono text-slate-500 mt-1">{ev.timestamp.slice(11, 16)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === ATTENDANCE === */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-indigo-100" />
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar alumno..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-indigo-100" />
              </div>
              <button onClick={exportAttendance} className="ml-auto flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
                <Download size={16} /> CSV
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Total', value: attendanceSummary.total, border: 'border-slate-100' },
                { label: 'Presentes', value: attendanceSummary.present, border: 'border-emerald-100' },
                { label: 'Tardanzas', value: attendanceSummary.late, border: 'border-amber-100' },
                { label: 'Ausentes', value: attendanceSummary.absent, border: 'border-rose-100' },
                { label: 'Justificados', value: attendanceSummary.excused, border: 'border-blue-100' },
              ].map(item => (
                <div key={item.label} className={`bg-white p-5 rounded-[28px] border ${item.border} shadow-sm text-center`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-2xl font-black text-slate-700 tracking-tighter mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="p-5">Alumno</th>
                    <th className="p-5">Grado</th>
                    <th className="p-5">Entrada</th>
                    <th className="p-5">Salida</th>
                    <th className="p-5 text-center">Estado</th>
                    <th className="p-5">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAttendance.map(r => {
                    const sc = ATT_STATUS_CONFIG[r.status];
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 font-bold text-sm text-slate-700">{r.studentName}</td>
                        <td className="p-5 text-xs text-slate-400">{r.grade}</td>
                        <td className="p-5 text-sm font-mono text-slate-600">{r.entryTime || '—'}</td>
                        <td className="p-5 text-sm font-mono text-slate-600">{r.exitTime || '—'}</td>
                        <td className="p-5 text-center">
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.color}`}>{sc.label}</span>
                        </td>
                        <td className="p-5 text-xs text-slate-400 max-w-[200px] truncate">{r.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAttendance.length === 0 && (
                <div className="p-16 text-center opacity-30"><Users size={48} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Sin registros para esta fecha</p></div>
              )}
            </div>
          </div>
        )}

        {/* === ACCESS POINTS === */}
        {activeTab === 'points' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accessPoints.map(ap => {
                const sc = STATUS_COLORS[ap.status];
                return (
                  <div key={ap.id} className={`bg-white rounded-[32px] p-8 border ${ap.status === AccessPointStatus.ONLINE ? 'border-emerald-100' : ap.status === AccessPointStatus.MAINTENANCE ? 'border-amber-100' : 'border-rose-100'} shadow-sm`}>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${sc.dot} ${ap.status === AccessPointStatus.ONLINE ? 'animate-pulse' : ''}`} />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${sc.text}`}>{ap.status}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{ap.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{ap.type.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {DIRECTION_ICONS[ap.direction]}
                        <span className="text-[10px] font-bold text-slate-400">{ap.direction}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Modelo</p>
                        <p className="text-xs font-bold text-slate-600">{ap.hardwareModel || '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IP</p>
                        <p className="text-xs font-mono text-slate-600">{ap.ipAddress || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Métodos:</p>
                      <div className="flex gap-1.5">
                        {ap.supportedMethods.map(m => (
                          <span key={m} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold">
                            {METHOD_ICONS[m]} {m.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400">
                        {ap.scansToday} escaneos hoy
                      </span>
                      <span className="text-[10px] font-bold text-slate-300">
                        Heartbeat: {ap.lastHeartbeat ? new Date(ap.lastHeartbeat).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === API INTEGRATIONS === */}
        {activeTab === 'api' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* API Keys */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2"><Key size={20} className="text-indigo-600" /> API Keys</h3>
              </div>
              <div className="space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className={`p-6 rounded-3xl border ${key.isActive ? 'border-slate-100' : 'border-slate-200 opacity-60'} bg-slate-50/50`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-slate-700">{key.name}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${key.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {key.isActive ? 'Activa' : 'Revocada'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-100">
                            {keyVisibility[key.id] ? `${key.keyPrefix}${'•'.repeat(24)}` : `${key.keyPrefix}${'•'.repeat(24)}`}
                          </code>
                          <button onClick={() => setKeyVisibility({ ...keyVisibility, [key.id]: !keyVisibility[key.id] })} className="text-slate-300 hover:text-slate-500">
                            {keyVisibility[key.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button onClick={() => copyToClipboard(key.keyPrefix)} className="text-slate-300 hover:text-indigo-600"><Copy size={14} /></button>
                        </div>
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                          <span>Creada: {key.createdAt}</span>
                          {key.expiresAt && <span>Expira: {key.expiresAt}</span>}
                          {key.lastUsed && <span>Último uso: {key.lastUsed}</span>}
                          <span>Permisos: {key.permissions.join(', ')}</span>
                        </div>
                      </div>
                      {key.isActive && (
                        <button onClick={() => revokeKey(key.id)} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">Revocar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhooks */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2"><Webhook size={20} className="text-indigo-600" /> Webhooks</h3>
              </div>
              <div className="space-y-4">
                {webhooks.map(wh => (
                  <div key={wh.id} className={`p-6 rounded-3xl border ${wh.isActive ? 'border-slate-100' : 'border-slate-200 opacity-60'} bg-slate-50/50`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-slate-700">{wh.url.split('/').pop()}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${wh.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {wh.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          {wh.failCount > 0 && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-rose-50 text-rose-500">{wh.failCount} fallos</span>
                          )}
                        </div>
                        <code className="text-xs font-mono text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-100 block w-fit mb-2">{wh.url}</code>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {wh.events.map(ev => (
                            <span key={ev} className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">{WEBHOOK_EVENT_LABELS[ev] || ev}</span>
                          ))}
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-400">
                          {wh.lastDelivery && <span>Último envío: {new Date(wh.lastDelivery).toLocaleString('es-MX')}</span>}
                          <span>Creado: {wh.createdAt}</span>
                        </div>
                      </div>
                      <button onClick={() => testWebhook(wh.id)} disabled={testingWebhook === wh.id}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50">
                        {testingWebhook === wh.id ? (
                          <><span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> Testing</>
                        ) : (
                          <><Play size={14} /> Test</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Documentation */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 ring-1 ring-inset ring-slate-100">
              <button onClick={() => setShowApiDocs(!showApiDocs)} className="w-full flex items-center justify-between text-left">
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2"><Terminal size={20} className="text-indigo-600" /> Documentación API</h3>
                <ChevronDown size={20} className={`text-slate-300 transition-transform ${showApiDocs ? 'rotate-180' : ''}`} />
              </button>

              {showApiDocs && (
                <div className="mt-6 space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-6 overflow-x-auto">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Base URL</p>
                    <code className="text-emerald-400 text-sm font-mono">https://api.mecard.mx/v1/access</code>
                  </div>

                  {/* Endpoints */}
                  {[
                    { method: 'POST', path: '/events', desc: 'Registrar evento de acceso', body: '{\n  "accessPointId": "ap_01",\n  "studentId": "2024001",\n  "credentialUsed": "QR_CODE",\n  "direction": "ENTRY",\n  "timestamp": "2026-03-01T07:15:00Z"\n}' },
                    { method: 'GET', path: '/attendance?date=2026-03-01', desc: 'Obtener asistencia por fecha', body: null },
                    { method: 'GET', path: '/events?from=2026-03-01&to=2026-03-01', desc: 'Obtener eventos de acceso', body: null },
                    { method: 'GET', path: '/points', desc: 'Listar puntos de acceso', body: null },
                    { method: 'POST', path: '/points/:id/heartbeat', desc: 'Reportar heartbeat de dispositivo', body: '{\n  "status": "ONLINE",\n  "scansToday": 186,\n  "firmwareVersion": "3.2.1"\n}' },
                  ].map((ep, i) => (
                    <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-3 p-4 bg-slate-50">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${ep.method === 'POST' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{ep.method}</span>
                        <code className="text-xs font-mono text-slate-600">{ep.path}</code>
                        <span className="text-xs text-slate-400 ml-auto">{ep.desc}</span>
                      </div>
                      {ep.body && (
                        <div className="bg-slate-900 p-4 relative">
                          <button onClick={() => copyToClipboard(ep.body!)} className="absolute top-3 right-3 text-slate-500 hover:text-white"><Copy size={14} /></button>
                          <pre className="text-xs font-mono text-emerald-400 whitespace-pre">{ep.body}</pre>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Auth Header */}
                  <div className="bg-slate-900 rounded-3xl p-6">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Autenticación</p>
                    <code className="text-amber-400 text-sm font-mono">Authorization: Bearer mk_live_xxxxxxxxxxxxxxxxxxxx</code>
                    <p className="text-[10px] text-slate-500 mt-3">Incluye tu API key en el header Authorization de cada request.</p>
                  </div>

                  {/* Webhook Payload Example */}
                  <div className="bg-slate-900 rounded-3xl p-6">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Ejemplo de Webhook Payload</p>
                    <pre className="text-xs font-mono text-emerald-400 whitespace-pre overflow-x-auto">{JSON.stringify({
                      eventType: 'student.entry',
                      schoolId: 'mx_01',
                      timestamp: '2026-03-01T07:15:00Z',
                      signature: 'sha256=abc123...',
                      data: {
                        studentId: '2024001',
                        studentName: 'Santiago Gonzalez',
                        grade: '4° Primaria - B',
                        accessPointId: 'ap_01',
                        accessPointName: 'Entrada Principal',
                        credentialUsed: 'QR_CODE',
                        direction: 'ENTRY',
                      }
                    }, null, 2)}</pre>
                  </div>

                  {/* cURL Example */}
                  <div className="bg-slate-900 rounded-3xl p-6">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">cURL Ejemplo</p>
                    <pre className="text-xs font-mono text-amber-300 whitespace-pre overflow-x-auto">{`curl -X POST https://api.mecard.mx/v1/access/events \\
  -H "Authorization: Bearer mk_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "accessPointId": "ap_01",
    "studentId": "2024001",
    "credentialUsed": "QR_CODE",
    "direction": "ENTRY"
  }'`}</pre>
                    <button onClick={() => copyToClipboard(`curl -X POST https://api.mecard.mx/v1/access/events -H "Authorization: Bearer mk_live_xxxx" -H "Content-Type: application/json" -d '{"accessPointId":"ap_01","studentId":"2024001","credentialUsed":"QR_CODE","direction":"ENTRY"}'`)}
                      className="mt-3 flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition-all"><Copy size={12} /> Copiar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

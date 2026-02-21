import React, { useState, useMemo } from 'react';
import {
  Settings, User, Lock, Eye, EyeOff, Shield, Bell, Users,
  Smartphone, Clock, Save, Edit2, Camera, Mail, Phone,
  CheckCircle2, AlertTriangle, Copy, ChevronDown, ChevronUp,
  LogOut, Monitor, Trash2, X, History, UserPlus, Link2
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { MOCK_ACTIVITY_LOG, MOCK_COPARENT } from '../constants';
import type { ActivityLogEntry } from '../types';

type TabView = 'profile' | 'security' | 'activity' | 'coparent' | 'notifications';

type ParentRelation = 'madre' | 'padre' | 'tutor' | 'abuelo_a' | 'otro';

const RELATION_OPTIONS: { value: ParentRelation; label: string; emoji: string }[] = [
  { value: 'madre', label: 'Madre', emoji: '👩' },
  { value: 'padre', label: 'Padre', emoji: '👨' },
  { value: 'tutor', label: 'Tutor Legal', emoji: '👤' },
  { value: 'abuelo_a', label: 'Abuelo/a', emoji: '👴' },
  { value: 'otro', label: 'Otro', emoji: '🧑' },
];

// Mock sessions
const MOCK_SESSIONS = [
  { id: '1', device: 'iPhone 14 Pro', browser: 'Safari', os: 'iOS 17', ip: '189.203.xx.xx', location: 'CDMX, México', lastActive: '2026-02-21T10:30:00Z', current: true },
  { id: '2', device: 'MacBook Pro', browser: 'Chrome 121', os: 'macOS Sonoma', ip: '189.203.xx.xx', location: 'CDMX, México', lastActive: '2026-02-20T18:00:00Z', current: false },
  { id: '3', device: 'Samsung Galaxy S24', browser: 'Chrome', os: 'Android 14', ip: '187.190.xx.xx', location: 'Monterrey, México', lastActive: '2026-02-19T14:00:00Z', current: false },
];

function getActionLabel(action: string): { label: string; emoji: string; color: string } {
  switch (action) {
    case 'deposit': return { label: 'Depósito', emoji: '💰', color: 'bg-emerald-50 text-emerald-700' };
    case 'limit_change': return { label: 'Cambio de límite', emoji: '🔒', color: 'bg-amber-50 text-amber-700' };
    case 'permission_create': return { label: 'Permiso creado', emoji: '📋', color: 'bg-blue-50 text-blue-700' };
    case 'trip_enroll': return { label: 'Inscripción viaje', emoji: '🗺️', color: 'bg-teal-50 text-teal-700' };
    case 'contact_add': return { label: 'Contacto agregado', emoji: '👤', color: 'bg-purple-50 text-purple-700' };
    case 'login': return { label: 'Inicio de sesión', emoji: '🔑', color: 'bg-slate-50 text-slate-600' };
    case 'password_change': return { label: 'Cambio de contraseña', emoji: '🔐', color: 'bg-red-50 text-red-600' };
    case 'profile_update': return { label: 'Perfil actualizado', emoji: '✏️', color: 'bg-indigo-50 text-indigo-600' };
    case 'notification_settings': return { label: 'Config. notificaciones', emoji: '🔔', color: 'bg-amber-50 text-amber-600' };
    case 'restriction_change': return { label: 'Restricción cambiada', emoji: '🚫', color: 'bg-rose-50 text-rose-600' };
    default: return { label: action, emoji: '📝', color: 'bg-slate-50 text-slate-600' };
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `Hace ${diffDays} día(s)`;
  return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
}

export default function ParentSettingsView() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [tabView, setTabView] = useState<TabView>('profile');

  // Profile state
  const [profileForm, setProfileForm] = useState({
    fullName: 'María González Pérez',
    email: 'maria.gonzalez@email.com',
    phone: '+52 55 1234 5678',
    relation: 'madre' as ParentRelation,
    photo: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Activity log
  const [activityLog] = useState<ActivityLogEntry[]>([
    // Add login events to the mock log
    {
      id: 'log_login_01', userId: 'parent_01', userName: 'María González',
      action: 'login', entityType: 'session', entityId: 'sess_01',
      details: 'Inició sesión desde iPhone 14 Pro',
      deviceInfo: 'iPhone 14 Pro / Safari / iOS 17', timestamp: '2026-02-21T10:30:00Z',
    },
    ...MOCK_ACTIVITY_LOG,
    {
      id: 'log_login_02', userId: 'parent_02', userName: 'Roberto González',
      action: 'login', entityType: 'session', entityId: 'sess_02',
      details: 'Inició sesión desde Samsung Galaxy S24',
      deviceInfo: 'Samsung Galaxy S24 / Chrome / Android 14', timestamp: '2026-02-19T14:00:00Z',
    },
  ]);
  const [activityFilter, setActivityFilter] = useState<'todos' | 'parent_01' | 'parent_02'>('todos');

  // Co-parent
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    emailDeposits: true,
    emailPermissions: true,
    emailTrips: true,
    emailDailyReport: false,
    pushPurchases: true,
    pushPermissions: true,
    pushLowBalance: true,
    pushCoparentActions: true,
    pushTrips: true,
  });

  const [sessions] = useState(MOCK_SESSIONS);

  const currentRelation = RELATION_OPTIONS.find(r => r.value === profileForm.relation);

  const filteredLog = useMemo(() => {
    if (activityFilter === 'todos') return activityLog;
    return activityLog.filter(l => l.userId === activityFilter);
  }, [activityLog, activityFilter]);

  function handleSaveProfile() {
    setIsEditingProfile(false);
    showToast('✅ Perfil actualizado', 'success');
  }

  function handleChangePassword() {
    if (!passwordForm.current) { showToast('Ingresa tu contraseña actual', 'error'); return; }
    if (passwordForm.newPass.length < 8) { showToast('La nueva contraseña debe tener al menos 8 caracteres', 'error'); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { showToast('Las contraseñas no coinciden', 'error'); return; }
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    showToast('🔐 Contraseña actualizada exitosamente', 'success');
  }

  function handleInviteCoparent() {
    if (!inviteEmail) { showToast('Ingresa el email del co-padre/madre', 'error'); return; }
    showToast(`📧 Invitación enviada a ${inviteEmail}`, 'success');
    setInviteEmail(''); setShowInviteForm(false);
  }

  function handleEndSession(sessionId: string) {
    showToast('Sesión cerrada', 'info');
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(MOCK_COPARENT.invitationCode);
    showToast('📋 Código copiado', 'success');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Configuración</h1>
            <p className="text-xs md:text-sm text-slate-500">Perfil, seguridad y preferencias</p>
          </div>
        </div>

        {/* Who's logged in banner */}
        <div className="mt-3 p-3 md:p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
            {currentRelation?.emoji || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm md:text-base truncate">{profileForm.fullName}</p>
            <p className="text-[10px] md:text-xs text-slate-400 flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold uppercase">{currentRelation?.label}</span>
              <span>{profileForm.email}</span>
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400">Último acceso</p>
            <p className="text-xs font-medium text-slate-600">Hoy, 10:30 AM</p>
            <p className="text-[10px] text-slate-400">iPhone 14 Pro</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'profile' as TabView, label: '👤 Mi Perfil' },
            { key: 'security' as TabView, label: '🔒 Seguridad' },
            { key: 'activity' as TabView, label: '📋 Bitácora' },
            { key: 'coparent' as TabView, label: '👥 Co-padre' },
            { key: 'notifications' as TabView, label: '🔔 Notificaciones' },
          ].map(t => (
            <button key={t.key} onClick={() => setTabView(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tabView === t.key ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* ===== PROFILE TAB ===== */}
        {tabView === 'profile' && (
          <div className="space-y-4">
            <div className="parent-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><User size={16} /> Información Personal</h3>
                {!isEditingProfile ? (
                  <button onClick={() => setIsEditingProfile(true)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-indigo-100">
                    <Edit2 size={12} /> Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Save size={12} /> Guardar</button>
                    <button onClick={() => setIsEditingProfile(false)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">Cancelar</button>
                  </div>
                )}
              </div>

              {/* Photo + Relation */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl shadow-inner border-2 border-white">
                    {currentRelation?.emoji || '👤'}
                  </div>
                  {isEditingProfile && (
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Camera size={10} /> Cambiar foto
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 block">Relación con el alumno</label>
                    {isEditingProfile ? (
                      <div className="flex flex-wrap gap-2">
                        {RELATION_OPTIONS.map(r => (
                          <button key={r.value} onClick={() => setProfileForm(f => ({ ...f, relation: r.value }))}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border-2 ${profileForm.relation === r.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-600 hover:border-slate-300'}`}>
                            <span>{r.emoji}</span> {r.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-lg">{currentRelation?.emoji}</span> {currentRelation?.label}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 block">Nombre completo</label>
                  {isEditingProfile ? (
                    <input type="text" value={profileForm.fullName} onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                  ) : (
                    <p className="text-sm text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profileForm.fullName}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 block flex items-center gap-1"><Mail size={10} /> Email</label>
                    {isEditingProfile ? (
                      <input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    ) : (
                      <p className="text-sm text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profileForm.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 block flex items-center gap-1"><Phone size={10} /> Teléfono</label>
                    {isEditingProfile ? (
                      <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    ) : (
                      <p className="text-sm text-slate-800 font-medium p-3 bg-slate-50 rounded-xl">{profileForm.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info (read-only) */}
            <div className="parent-card">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><Shield size={16} /> Información de Cuenta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ID de usuario</p>
                  <p className="text-slate-700 font-mono mt-1">{user?.id || 'parent_01'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Rol</p>
                  <p className="text-slate-700 mt-1">Padre / Tutor</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Escuela vinculada</p>
                  <p className="text-slate-700 mt-1">🏫 Colegio Springfield (mx_01)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Hijos vinculados</p>
                  <p className="text-slate-700 mt-1">👦 Santiago González, 👧 Ana García</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Cuenta creada</p>
                  <p className="text-slate-700 mt-1">15 de agosto, 2025</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Co-padre vinculado</p>
                  <p className="text-slate-700 mt-1">👨 {MOCK_COPARENT.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SECURITY TAB ===== */}
        {tabView === 'security' && (
          <div className="space-y-4">
            {/* Change Password */}
            <div className="parent-card">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Lock size={16} /> Cambiar Contraseña</h3>
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Contraseña actual</label>
                  <div className="relative">
                    <input type={showCurrent ? 'text' : 'password'} value={passwordForm.current}
                      onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))} placeholder="••••••••"
                      className="w-full p-3 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Nueva contraseña</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={passwordForm.newPass}
                      onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))} placeholder="Mínimo 8 caracteres"
                      className="w-full p-3 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.newPass && (
                    <div className="mt-2 flex gap-1">
                      {[
                        { ok: passwordForm.newPass.length >= 8, label: '8+ chars' },
                        { ok: /[A-Z]/.test(passwordForm.newPass), label: 'Mayúscula' },
                        { ok: /[0-9]/.test(passwordForm.newPass), label: 'Número' },
                        { ok: /[^A-Za-z0-9]/.test(passwordForm.newPass), label: 'Especial' },
                      ].map(r => (
                        <span key={r.label} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${r.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-400'}`}>
                          {r.ok ? '✓' : '✗'} {r.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Confirmar nueva contraseña</label>
                  <input type="password" value={passwordForm.confirm}
                    onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repite la contraseña"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                  {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Las contraseñas no coinciden</p>
                  )}
                </div>
                <button onClick={handleChangePassword}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2">
                  <Lock size={14} /> Cambiar Contraseña
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="parent-card">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Monitor size={16} /> Sesiones Activas</h3>
              <div className="space-y-3">
                {sessions.map(s => (
                  <div key={s.id} className={`p-3 md:p-4 rounded-xl border ${s.current ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.current ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                          <Smartphone size={16} className={s.current ? 'text-emerald-600' : 'text-slate-500'} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            {s.device}
                            {s.current && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold uppercase">Actual</span>}
                          </p>
                          <p className="text-[10px] text-slate-400">{s.browser} • {s.os} • {s.ip}</p>
                          <p className="text-[10px] text-slate-400">{s.location} • {timeAgo(s.lastActive)}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <button onClick={() => handleEndSession(s.id)} className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-100 flex items-center gap-1">
                          <LogOut size={10} /> Cerrar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== ACTIVITY LOG TAB ===== */}
        {tabView === 'activity' && (
          <div className="space-y-4">
            <div className="parent-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={16} /> Bitácora de Actividad</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">Registro de todas las acciones realizadas por los padres/tutores vinculados a esta cuenta familiar.</p>

              {/* Filter by user */}
              <div className="flex gap-2 mb-4">
                {[
                  { key: 'todos' as const, label: 'Todos' },
                  { key: 'parent_01' as const, label: '👩 María' },
                  { key: 'parent_02' as const, label: '👨 Roberto' },
                ].map(f => (
                  <button key={f.key} onClick={() => setActivityFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activityFilter === f.key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredLog.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">Sin actividad</p>
                ) : (
                  filteredLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => {
                    const al = getActionLabel(log.action);
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${al.color}`}>
                          {al.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${al.color}`}>{al.label}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${log.userId === 'parent_01' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                              {log.userName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1">{log.details}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1"><Clock size={9} /> {timeAgo(log.timestamp)}</span>
                            <span>•</span>
                            <span>{new Date(log.timestamp).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            {log.deviceInfo && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Smartphone size={9} /> {log.deviceInfo}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== CO-PARENT TAB ===== */}
        {tabView === 'coparent' && (
          <div className="space-y-4">
            {/* Current co-parent */}
            <div className="parent-card">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Users size={16} /> Co-padre/madre vinculado</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">👨</div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{MOCK_COPARENT.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} /> {MOCK_COPARENT.email}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10} /> {MOCK_COPARENT.phone}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} /> Vinculado
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Padre</p>
                </div>
              </div>
            </div>

            {/* Family code */}
            <div className="parent-card">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><Link2 size={16} /> Código Familiar</h3>
              <p className="text-xs text-slate-500 mb-3">Comparte este código con otro padre/tutor para que se vincule a tu familia.</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-slate-100 rounded-xl font-mono text-lg font-black text-center text-indigo-600 tracking-[6px]">
                  {MOCK_COPARENT.invitationCode}
                </div>
                <button onClick={handleCopyCode} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">El código no expira. Solo se puede vincular 1 co-padre adicional.</p>
            </div>

            {/* Invite another */}
            <div className="parent-card">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><UserPlus size={16} /> Invitar Co-padre/madre</h3>
              <p className="text-xs text-slate-500 mb-3">Envía una invitación por email para que otro padre/tutor acceda a la cuenta familiar.</p>
              {!showInviteForm ? (
                <button onClick={() => setShowInviteForm(true)}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-indigo-700">
                  <UserPlus size={14} /> Enviar Invitación
                </button>
              ) : (
                <div className="space-y-3">
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@ejemplo.com"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                  <div className="flex gap-2">
                    <button onClick={handleInviteCoparent} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                      <Mail size={14} /> Enviar
                    </button>
                    <button onClick={() => setShowInviteForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="parent-card bg-slate-50 border-dashed">
              <h4 className="font-bold text-sm text-slate-700 mb-2">¿Cómo funciona?</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2"><span className="font-bold text-indigo-600 shrink-0">1.</span> Ambos padres tienen cuentas independientes con acceso igual</li>
                <li className="flex items-start gap-2"><span className="font-bold text-indigo-600 shrink-0">2.</span> Toda acción queda registrada en la bitácora — quién hizo qué</li>
                <li className="flex items-start gap-2"><span className="font-bold text-indigo-600 shrink-0">3.</span> Notificaciones cruzadas: si uno modifica algo, el otro se entera</li>
                <li className="flex items-start gap-2"><span className="font-bold text-indigo-600 shrink-0">4.</span> Los contactos autorizados son compartidos entre ambos</li>
              </ul>
            </div>
          </div>
        )}

        {/* ===== NOTIFICATIONS TAB ===== */}
        {tabView === 'notifications' && (
          <div className="space-y-4">
            <div className="parent-card">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><Bell size={16} /> Preferencias de Notificación</h3>
              <p className="text-xs text-slate-500 mb-4">Configura qué notificaciones recibes por cada canal.</p>

              {/* Email notifications */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Mail size={10} /> Email</p>
                <div className="space-y-2">
                  {[
                    { key: 'emailDeposits' as const, label: 'Depósitos y movimientos de saldo', desc: 'Confirmación de recargas y compras' },
                    { key: 'emailPermissions' as const, label: 'Permisos de salida', desc: 'Aprobaciones, rechazos y cambios' },
                    { key: 'emailTrips' as const, label: 'Viajes y excursiones', desc: 'Inscripciones, pagos y recordatorios' },
                    { key: 'emailDailyReport' as const, label: 'Reporte diario', desc: 'Resumen de consumo del día' },
                  ].map(opt => (
                    <div key={opt.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{opt.label}</p>
                        <p className="text-[10px] text-slate-400">{opt.desc}</p>
                      </div>
                      <button onClick={() => setNotifPrefs(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifPrefs[opt.key] ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${notifPrefs[opt.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push notifications */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Smartphone size={10} /> Push / App</p>
                <div className="space-y-2">
                  {[
                    { key: 'pushPurchases' as const, label: 'Compras en tiempo real', desc: 'Notificación inmediata cuando tu hijo compra algo' },
                    { key: 'pushPermissions' as const, label: 'Permisos de salida', desc: 'Alertas de permisos pendientes y aprobados' },
                    { key: 'pushLowBalance' as const, label: 'Saldo bajo', desc: 'Aviso cuando el saldo baje de $50' },
                    { key: 'pushCoparentActions' as const, label: 'Acciones del co-padre', desc: 'Notificar cuando el co-padre modifique algo' },
                    { key: 'pushTrips' as const, label: 'Viajes y excursiones', desc: 'Fechas de pago, recordatorios y actualizaciones' },
                  ].map(opt => (
                    <div key={opt.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{opt.label}</p>
                        <p className="text-[10px] text-slate-400">{opt.desc}</p>
                      </div>
                      <button onClick={() => setNotifPrefs(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifPrefs[opt.key] ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${notifPrefs[opt.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => showToast('✅ Preferencias guardadas', 'success')}
                className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white font-black px-6 py-3 rounded-2xl transition-all uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2">
                <Save size={16} /> Guardar Preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

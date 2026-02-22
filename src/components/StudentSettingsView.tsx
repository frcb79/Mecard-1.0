import React, { useState } from 'react';
import {
  Settings, User, Lock, Eye, EyeOff, Shield, QrCode, Sliders,
  Save, Edit2, Camera, Mail, Phone, School, Users,
  Smartphone, Clock, LogOut, Monitor, AlertTriangle, Copy
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { MOCK_STUDENT, MOCK_COPARENT } from '../constants';

type TabView = 'profile' | 'credential' | 'preferences' | 'restrictions' | 'security';

const MOCK_SESSIONS = [
  { id: '1', device: 'iPad Air', browser: 'Safari', os: 'iPadOS 17', ip: '189.203.xx.xx', location: 'CDMX', lastActive: '2026-02-21T10:30:00Z', current: true },
  { id: '2', device: 'PC Laboratorio', browser: 'Chrome', os: 'Windows 11', ip: '10.0.xx.xx', location: 'Escuela', lastActive: '2026-02-20T14:00:00Z', current: false },
];

export default function StudentSettingsView() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [tabView, setTabView] = useState<TabView>('profile');

  const student = MOCK_STUDENT;

  // Password
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState({
    favoritesPublic: true,
    showBalance: true,
    notifications: true,
  });

  function handleChangePassword() {
    if (!passwordForm.current) { showToast('Ingresa tu contraseña actual', 'error'); return; }
    if (passwordForm.newPass.length < 8) { showToast('Mínimo 8 caracteres', 'error'); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { showToast('Las contraseñas no coinciden', 'error'); return; }
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    showToast('🔐 Contraseña actualizada', 'success');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Configuración</h1>
            <p className="text-xs text-slate-500">Mi perfil y preferencias</p>
          </div>
        </div>

        {/* Identity Banner */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl overflow-hidden">
            {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover" /> : '👦'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 truncate">{(student as any).name || 'Santiago González'}</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-bold">{student.grade}</span>
              <span>Matrícula: {student.id}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
          {[
            { key: 'profile' as TabView, label: '👤 Mi Perfil' },
            { key: 'credential' as TabView, label: '🪪 Credencial' },
            { key: 'preferences' as TabView, label: '⚙️ Preferencias' },
            { key: 'restrictions' as TabView, label: '🚫 Restricciones' },
            { key: 'security' as TabView, label: '🔒 Seguridad' },
          ].map(t => (
            <button key={t.key} onClick={() => setTabView(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tabView === t.key ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== PROFILE ===== */}
        {tabView === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><User size={16} /> Información Personal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Nombre completo', value: (student as any).name || 'Santiago González', icon: '👤' },
                  { label: 'Grado y Grupo', value: student.grade, icon: '🎓' },
                  { label: 'Matrícula', value: student.id, icon: '🆔' },
                  { label: 'Escuela', value: 'Colegio Cumbres México', icon: '🏫' },
                  { label: 'Email', value: user?.email || 'santiago@mecard.mx', icon: '📧' },
                  { label: 'Estado', value: student.status, icon: '✅' },
                  { label: 'Fecha de inscripción', value: new Date(student.enrollmentDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }), icon: '📅' },
                  { label: 'Ruta de camión', value: student.busRoute || 'No asignada', icon: '🚌' },
                ].map(f => (
                  <div key={f.label} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">{f.icon} {f.label}</p>
                    <p className="text-sm text-slate-700 font-medium mt-1">{f.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 italic">Para modificar información personal, contacta a tu padre/tutor o al administrador escolar.</p>
            </div>

            {/* Parents */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><Users size={16} /> Mis Padres/Tutores</h3>
              <div className="space-y-2">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <span className="text-xl">👩</span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{student.parentName}</p>
                    <p className="text-[10px] text-slate-500">Madre • Responsable principal</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold">Vinculada</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                  <span className="text-xl">👨</span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{MOCK_COPARENT.name}</p>
                    <p className="text-[10px] text-slate-500">Padre • Co-responsable</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">Vinculado</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== CREDENTIAL ===== */}
        {tabView === 'credential' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><QrCode size={16} /> Mi Credencial Digital</h3>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-40 h-40 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 flex items-center justify-center">
                <div className="text-center">
                  <QrCode size={64} className="text-emerald-600 mx-auto mb-2" />
                  <p className="text-[10px] text-emerald-600 font-bold">MECARD_{student.id}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="font-black text-lg text-slate-800">{(student as any).name || 'Santiago González'}</p>
                <p className="text-xs text-slate-500">{student.grade} • {student.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: 'Estado', value: '✅ Activa', color: 'text-emerald-600' },
                { label: 'Usos totales', value: '142', color: 'text-slate-700' },
                { label: 'Último uso', value: 'Hoy, 12:30 PM', color: 'text-slate-700' },
                { label: 'Válida hasta', value: 'Jul 2026', color: 'text-slate-700' },
              ].map(f => (
                <div key={f.label} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{f.label}</p>
                  <p className={`text-sm font-bold mt-1 ${f.color}`}>{f.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700"><strong>💡 Tip:</strong> Muestra tu QR en el POS de la cafetería para pagar. También puedes verlo en la sección "Mi Credencial" del menú.</p>
            </div>
          </div>
        )}

        {/* ===== PREFERENCES ===== */}
        {tabView === 'preferences' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Sliders size={16} /> Preferencias</h3>
            <div className="space-y-3">
              {[
                { key: 'favoritesPublic' as const, label: 'Favoritos públicos', desc: 'Tus compañeros pueden ver tus productos favoritos para regalarte', icon: '⭐' },
                { key: 'showBalance' as const, label: 'Mostrar saldo en credencial', desc: 'Tu saldo se muestra en la pantalla de credencial', icon: '💰' },
                { key: 'notifications' as const, label: 'Notificaciones push', desc: 'Recibir alertas de compras, saldo bajo y regalos', icon: '🔔' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{opt.label}</p>
                      <p className="text-[10px] text-slate-400">{opt.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => setPrefs(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${prefs[opt.key] ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${prefs[opt.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => showToast('✅ Preferencias guardadas', 'success')}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl transition-all uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2">
              <Save size={16} /> Guardar
            </button>
          </div>
        )}

        {/* ===== RESTRICTIONS (read-only) ===== */}
        {tabView === 'restrictions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2"><Shield size={16} /> Mis Restricciones</h3>
              <p className="text-xs text-slate-500 mb-4">Estas restricciones son configuradas por tus padres/tutores. No puedes modificarlas.</p>

              {/* Categories */}
              <div className="mb-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Categorías bloqueadas</p>
                {(student.restrictions?.restrictedCategories?.length || 0) > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {student.restrictions?.restrictedCategories?.map((cat: string) => (
                      <span key={cat} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold">🚫 {cat}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Ninguna categoría bloqueada</p>
                )}
              </div>

              {/* Allergens */}
              <div className="mb-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Alergias registradas</p>
                {(student.restrictions?.allergens?.length || 0) > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {student.restrictions?.allergens?.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">⚠️ {a}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Sin alergias registradas</p>
                )}
              </div>

              {/* Limits */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Límites económicos</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400">Límite diario</p>
                    <p className="text-lg font-black text-slate-800">${student.dailyLimit.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400">Gastado hoy</p>
                    <p className="text-lg font-black text-emerald-600">${student.spentToday.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <p className="text-xs text-blue-700"><strong>ℹ️ Nota:</strong> Si necesitas que se modifiquen tus restricciones, pide a tus papás que las cambien desde su portal.</p>
            </div>
          </div>
        )}

        {/* ===== SECURITY ===== */}
        {tabView === 'security' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Lock size={16} /> Cambiar Contraseña</h3>
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Contraseña actual</label>
                  <div className="relative">
                    <input type={showCurrent ? 'text' : 'password'} value={passwordForm.current}
                      onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))} placeholder="••••••••"
                      className="w-full p-3 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 outline-none" />
                    <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Nueva contraseña</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={passwordForm.newPass}
                      onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))} placeholder="Mínimo 8 caracteres"
                      className="w-full p-3 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 outline-none" />
                    <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.newPass && (
                    <div className="mt-2 flex gap-1">
                      {[
                        { ok: passwordForm.newPass.length >= 8, label: '8+ chars' },
                        { ok: /[A-Z]/.test(passwordForm.newPass), label: 'Mayúscula' },
                        { ok: /[0-9]/.test(passwordForm.newPass), label: 'Número' },
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
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 outline-none" />
                  {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> No coinciden</p>
                  )}
                </div>
                <button onClick={handleChangePassword}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2">
                  <Lock size={14} /> Cambiar Contraseña
                </button>
              </div>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Monitor size={16} /> Sesiones Activas</h3>
              <div className="space-y-2">
                {MOCK_SESSIONS.map(s => (
                  <div key={s.id} className={`p-3 rounded-xl border ${s.current ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.current ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                          <Smartphone size={16} className={s.current ? 'text-emerald-600' : 'text-slate-500'} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            {s.device}
                            {s.current && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold uppercase">Actual</span>}
                          </p>
                          <p className="text-[10px] text-slate-400">{s.browser} • {s.os} • {s.location}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <button onClick={() => showToast('Sesión cerrada', 'info')} className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-100 flex items-center gap-1">
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
      </div>
    </div>
  );
}

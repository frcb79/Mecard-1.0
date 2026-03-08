import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Clock, CheckCircle2, X, ChevronDown, ChevronUp,
  Bus, Car, Users, UserX, MapPin, Settings, Calendar,
  AlertTriangle, Bell, Filter, Download, Search, Eye,
  Save, Phone, User
} from 'lucide-react';
import { useToast } from './ui/Toast';
import {
  MOCK_EXIT_PERMISSIONS, MOCK_SCHOOL_PERMISSION_CONFIG, MOCK_BUS_ROUTES
} from '../constants';
import type { ExitPermission, PermissionStatus, SchoolPermissionConfig, PermissionTransportType } from '../types';

type TabView = 'dashboard' | 'config';

const DAYS = [
  { key: 'LUN', label: 'Lun' }, { key: 'MAR', label: 'Mar' }, { key: 'MIE', label: 'Mié' },
  { key: 'JUE', label: 'Jue' }, { key: 'VIE', label: 'Vie' }, { key: 'SAB', label: 'Sáb' },
];

function getStatusConfig(status: PermissionStatus) {
  switch (status) {
    case 'pendiente': return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' };
    case 'aprobado': return { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' };
    case 'rechazado': return { label: 'Rechazado', color: 'bg-red-100 text-red-700', dot: 'bg-red-400' };
    case 'cancelado': return { label: 'Cancelado', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' };
    case 'expirado': return { label: 'Expirado', color: 'bg-slate-100 text-slate-400', dot: 'bg-slate-300' };
  }
}

function getTransportLabel(t: PermissionTransportType) {
  switch (t) {
    case 'bus_alterno': return { label: 'Camión Alterno', icon: <Bus size={14} className="text-blue-500" /> };
    case 'auto_particular': return { label: 'Auto Particular', icon: <Car size={14} className="text-indigo-500" /> };
    case 'a_pie': return { label: 'A Pie', icon: <Users size={14} className="text-emerald-500" /> };
    case 'no_asiste': return { label: 'No Asiste', icon: <UserX size={14} className="text-red-500" /> };
    case 'otro': return { label: 'Otro', icon: <MapPin size={14} className="text-slate-500" /> };
  }
}

export default function SchoolPermissionsView() {
  const { showToast } = useToast();
  const [tabView, setTabView] = useState<TabView>('dashboard');
  const [permissions, setPermissions] = useState<ExitPermission[]>(MOCK_EXIT_PERMISSIONS);
  const [config, setConfig] = useState<SchoolPermissionConfig>(MOCK_SCHOOL_PERMISSION_CONFIG);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<PermissionStatus | 'todos'>('todos');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterTransport, setFilterTransport] = useState<PermissionTransportType | 'todos'>('todos');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Config editing
  const [editConfig, setEditConfig] = useState<SchoolPermissionConfig>(config);
  const [newRoute, setNewRoute] = useState('');

  const filtered = useMemo(() => {
    return permissions.filter(p => {
      if (filterStatus !== 'todos' && p.status !== filterStatus) return false;
      if (filterGrade && !p.childGrade?.toLowerCase().includes(filterGrade.toLowerCase())) return false;
      if (filterTransport !== 'todos' && p.transporte !== filterTransport) return false;
      if (filterDate && p.fecha !== filterDate) return false;
      if (searchQuery && !p.childName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.motivo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [permissions, filterStatus, filterGrade, filterTransport, filterDate, searchQuery]);

  const pendingCount = permissions.filter(p => p.status === 'pendiente').length;
  const noAsisteToday = permissions.filter(p => p.transporte === 'no_asiste' && p.status !== 'cancelado' &&
    p.fecha === new Date().toISOString().split('T')[0]).length;
  const todayCount = permissions.filter(p => p.fecha === new Date().toISOString().split('T')[0] && p.status !== 'cancelado').length;

  const uniqueGrades = useMemo(() => {
    const grades = new Set(permissions.map(p => p.childGrade).filter(Boolean));
    return Array.from(grades);
  }, [permissions]);

  function handleApprove(id: string) {
    setPermissions(prev => prev.map(p => p.id === id ? {
      ...p, status: 'aprobado' as PermissionStatus,
      schoolApproval: { status: 'aprobado', reviewedBy: 'admin_01', reviewedByName: 'Coordinación', reviewedAt: new Date().toISOString() }
    } : p));
    showToast('✅ Permiso aprobado', 'success');
  }

  function handleReject(id: string) {
    setPermissions(prev => prev.map(p => p.id === id ? {
      ...p, status: 'rechazado' as PermissionStatus,
      schoolApproval: { status: 'rechazado', reviewedBy: 'admin_01', reviewedByName: 'Coordinación', reviewedAt: new Date().toISOString(), motivo: 'No cumple con el procedimiento' }
    } : p));
    showToast('❌ Permiso rechazado', 'info');
  }

  function handleSaveConfig() {
    setConfig(editConfig);
    showToast('⚙️ Configuración guardada', 'success');
  }

  function handleExport() {
    const csv = [
      ['Alumno', 'Grado', 'Grupo', 'Fecha', 'Transporte', 'Motivo', 'Estado', 'Persona Autorizada'].join(','),
      ...filtered.map(p => [
        p.childName, p.childGrade, p.childGroup, p.fecha,
        getTransportLabel(p.transporte).label, `"${p.motivo}"`, p.status,
        p.personaAutorizada?.nombre || 'N/A'
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `permisos_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    showToast('📥 CSV exportado', 'success');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800">Control de Permisos</h1>
              <p className="text-xs md:text-sm text-slate-500">Gestión escolar de permisos de salida</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="max-w-6xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Pendientes</p>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Hoy</p>
          <p className="text-2xl font-black text-indigo-600">{todayCount}</p>
        </div>
        <div className={`p-4 rounded-2xl shadow-sm border ${noAsisteToday > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">No Asisten Hoy</p>
          <p className={`text-2xl font-black ${noAsisteToday > 0 ? 'text-red-600' : 'text-slate-400'}`}>{noAsisteToday}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total</p>
          <p className="text-2xl font-black text-slate-600">{permissions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6 flex gap-2">
        <button onClick={() => setTabView('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tabView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          📋 Permisos
        </button>
        <button onClick={() => { setTabView('config'); setEditConfig(config); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${tabView === 'config' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Settings size={12} /> Configuración
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ===== DASHBOARD TAB ===== */}
        {tabView === 'dashboard' && (
          <div className="space-y-4">
            {/* No-asiste alert */}
            {noAsisteToday > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0"><AlertTriangle size={16} className="text-red-500" /></div>
                <div>
                  <p className="font-bold text-sm text-red-700">⚠️ {noAsisteToday} alumno(s) no asistirán hoy</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {permissions.filter(p => p.transporte === 'no_asiste' && p.status !== 'cancelado' && p.fecha === new Date().toISOString().split('T')[0]).map(p => (
                      <span key={p.id} className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg text-[10px] font-bold text-red-600">
                        {p.childPhoto} {p.childName} ({p.childGrade})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Filter size={12} /> Filtros</p>
                <button onClick={handleExport} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-100">
                  <Download size={12} /> Exportar CSV
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar alumno..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                  className="p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-300 outline-none">
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobado">Aprobados</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="cancelado">Cancelados</option>
                </select>
                <select value={filterTransport} onChange={e => setFilterTransport(e.target.value as any)}
                  className="p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-300 outline-none">
                  <option value="todos">Todo transporte</option>
                  <option value="bus_alterno">🚌 Camión Alterno</option>
                  <option value="auto_particular">🚗 Auto Particular</option>
                  <option value="a_pie">🚶 A Pie</option>
                  <option value="no_asiste">❌ No Asiste</option>
                  <option value="otro">📍 Otro</option>
                </select>
                <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-300 outline-none">
                  <option value="">Todos los grados</option>
                  {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
            </div>

            {/* Permission Cards */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <ShieldCheck size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No hay permisos con estos filtros</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(perm => {
                  const sc = getStatusConfig(perm.status);
                  const tl = getTransportLabel(perm.transporte);
                  const isExp = expandedId === perm.id;
                  const isPending = perm.status === 'pendiente';

                  return (
                    <div key={perm.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${perm.transporte === 'no_asiste' ? 'border-red-200 bg-red-50/30' : isPending ? 'border-amber-200' : 'border-slate-100'}`}>
                      <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExp ? null : perm.id)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl">{perm.childPhoto || '👤'}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-sm">{perm.childName}</p>
                              <p className="text-xs text-slate-400">{perm.childGrade} - {perm.childGroup}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                            {isExp ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">{tl.icon} {tl.label}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(perm.fecha).toLocaleDateString('es-MX', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          {perm.horaSalida && <span className="flex items-center gap-1"><Clock size={12} /> {perm.horaSalida}</span>}
                          {perm.busOriginal && <span className="flex items-center gap-1"><Bus size={12} /> {perm.busOriginal}</span>}
                          {perm.busDestino && <span>→ {perm.busDestino}</span>}
                        </div>
                      </div>

                      {isExp && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Motivo</p>
                              <p className="text-slate-700">{perm.motivo}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Creado por</p>
                              <p className="text-slate-700">{perm.createdByName}</p>
                              <p className="text-slate-400 text-[10px]">{new Date(perm.creadoEn).toLocaleString('es-MX')}</p>
                            </div>
                          </div>
                          {perm.transporteDetalle && (
                            <div><p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Detalle transporte</p><p className="text-xs text-slate-700">{perm.transporteDetalle}</p></div>
                          )}
                          {perm.personaAutorizada && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Persona Autorizada</p>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><User size={14} className="text-indigo-600" /></div>
                                <div>
                                  <p className="font-bold text-sm text-slate-800">{perm.personaAutorizada.nombre}</p>
                                  <p className="text-xs text-slate-500">{perm.personaAutorizada.parentesco} • <Phone size={10} className="inline" /> {perm.personaAutorizada.telefono}</p>
                                  {perm.personaAutorizada.identificacion && <p className="text-[10px] text-slate-400">ID: {perm.personaAutorizada.identificacion}</p>}
                                </div>
                              </div>
                            </div>
                          )}
                          {perm.approvals && perm.approvals.length > 0 && (
                            <div>
                              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Aprobaciones de padres</p>
                              <div className="flex flex-wrap gap-2">
                                {perm.approvals.map((a, i) => (
                                  <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${a.status === 'aprobado' ? 'bg-emerald-100 text-emerald-700' : a.status === 'rechazado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {a.status === 'aprobado' ? <CheckCircle2 size={10} /> : <Clock size={10} />} {a.parentName} — {a.status}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <span className={`px-2 py-1 rounded-lg ${perm.notificationsSent.school ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>🏫 Colegio {perm.notificationsSent.school ? '✓' : '—'}</span>
                            <span className={`px-2 py-1 rounded-lg ${perm.notificationsSent.coparent ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>👥 Co-padre {perm.notificationsSent.coparent ? '✓' : '—'}</span>
                            {perm.notificationsSent.externalPerson && <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">📱 Externo ✓</span>}
                          </div>

                          {isPending && (
                            <div className="flex gap-2 pt-2">
                              <button onClick={(e) => { e.stopPropagation(); handleApprove(perm.id); }}
                                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                                <CheckCircle2 size={14} /> Aprobar
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleReject(perm.id); }}
                                className="flex-1 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                                <X size={14} /> Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== CONFIG TAB ===== */}
        {tabView === 'config' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2"><Settings size={16} /> Configuración de Permisos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anticipation hours */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">Horas de anticipación mínima</label>
                  <input type="number" value={editConfig.horasAnticipacion} onChange={e => setEditConfig(c => ({ ...c, horasAnticipacion: Number(e.target.value) }))} min={0} max={72}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                  <p className="text-[10px] text-slate-400 mt-1">¿Con cuántas horas de anticipación deben solicitar el permiso?</p>
                </div>

                {/* Time limit */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">Hora límite de solicitud</label>
                  <input type="time" value={editConfig.horaLimiteSolicitud} onChange={e => setEditConfig(c => ({ ...c, horaLimiteSolicitud: e.target.value }))}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>

                {/* Max per week */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">Máx. permisos por semana (0 = sin límite)</label>
                  <input type="number" value={editConfig.maxPermisosPorSemana} onChange={e => setEditConfig(c => ({ ...c, maxPermisosPorSemana: Number(e.target.value) }))} min={0} max={10}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>

                {/* Custom message */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">Mensaje personalizado para padres</label>
                  <input type="text" value={editConfig.mensajePersonalizado} onChange={e => setEditConfig(c => ({ ...c, mensajePersonalizado: e.target.value }))} placeholder="Ej: Favor de solicitar con anticipación"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
              </div>

              {/* Toggles */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Opciones</p>
                {[
                  { key: 'requiereDosAprobaciones' as const, label: 'Requerir aprobación de ambos padres', desc: 'Si está activo, ambos padres deben aprobar el permiso' },
                  { key: 'requiereIdentificacion' as const, label: 'Requerir identificación de persona autorizada', desc: 'Se pedirá INE o documento oficial' },
                  { key: 'permitirNoAsiste' as const, label: 'Permitir reportar inasistencias', desc: 'Los padres podrán reportar que su hijo no asistirá' },
                  { key: 'notificarDireccion' as const, label: 'Notificar a dirección', desc: 'Enviar copia de cada permiso a la dirección escolar' },
                  { key: 'requiereMotivo' as const, label: 'Requerir motivo obligatorio', desc: 'El padre debe describir el motivo del permiso' },
                  { key: 'bloqueoEnExamenes' as const, label: 'Bloquear durante exámenes', desc: 'No permitir permisos en fechas de examen' },
                  { key: 'validacionDeRuta' as const, label: 'Validación de ruta destino', desc: 'Verificar que la ruta de camión destino sea una ruta válida registrada' },
                ].map(opt => (
                  <div key={opt.key} className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{opt.label}</p>
                      <p className="text-[10px] text-slate-400">{opt.desc}</p>
                    </div>
                    <button onClick={() => setEditConfig(c => ({ ...c, [opt.key]: !c[opt.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${editConfig[opt.key] ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${editConfig[opt.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Days allowed */}
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Días permitidos</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(d => (
                    <button key={d.key} onClick={() => setEditConfig(c => ({
                      ...c,
                      diasPermitidos: c.diasPermitidos.includes(d.key)
                        ? c.diasPermitidos.filter(dd => dd !== d.key)
                        : [...c.diasPermitidos, d.key]
                    }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${editConfig.diasPermitidos.includes(d.key) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bus routes */}
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rutas de Camión</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editConfig.rutasCamion.map((r, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      <Bus size={12} /> {r}
                      <button onClick={() => setEditConfig(c => ({ ...c, rutasCamion: c.rutasCamion.filter((_, idx) => idx !== i) }))}
                        className="ml-1 hover:text-red-500"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newRoute} onChange={e => setNewRoute(e.target.value)} placeholder="Agregar nueva ruta..."
                    className="flex-1 p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-300 outline-none" />
                  <button onClick={() => {
                    if (newRoute.trim()) {
                      setEditConfig(c => ({ ...c, rutasCamion: [...c.rutasCamion, newRoute.trim()] }));
                      setNewRoute('');
                    }
                  }} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-200">+ Agregar</button>
                </div>
              </div>

              {/* Exam dates */}
              {editConfig.bloqueoEnExamenes && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fechas de Examen (bloqueadas)</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editConfig.fechasExamen.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                        {f}
                        <button onClick={() => setEditConfig(c => ({ ...c, fechasExamen: c.fechasExamen.filter((_, idx) => idx !== i) }))}
                          className="ml-1 hover:text-red-900"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <input type="date" onChange={e => {
                    if (e.target.value) setEditConfig(c => ({ ...c, fechasExamen: [...c.fechasExamen, e.target.value] }));
                  }}
                    className="p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
              )}

              <button onClick={handleSaveConfig}
                className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2">
                <Save size={16} /> Guardar Configuración
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

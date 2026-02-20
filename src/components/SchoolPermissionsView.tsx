import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, Clock, X, AlertTriangle,
  Search, Filter, Calendar, Bus, Car, Users, MapPin,
  Phone, User, Eye, ChevronDown, ChevronUp, Bell,
  Download, Check
} from 'lucide-react';
import { useToast } from './ui/Toast';

// ===== TYPES =====

type TransportType = 'bus_alterno' | 'auto_particular' | 'a_pie' | 'otro';
type PermissionStatus = 'activo' | 'pendiente' | 'expirado' | 'cancelado' | 'confirmado';

interface AuthorizedPerson {
  nombre: string;
  parentesco: string;
  telefono: string;
  identificacion: string;
}

interface ExitPermission {
  id: string;
  childId: string;
  childName: string;
  childGrade: string;
  parentName: string;
  parentPhone: string;
  fecha: string;
  horaSalida: string;
  motivo: string;
  transporte: TransportType;
  transporteDetalle: string;
  personaAutorizada: AuthorizedPerson;
  status: PermissionStatus;
  creadoEn: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

// ===== MOCK DATA =====

const MOCK_PERMISSIONS: ExitPermission[] = [
  {
    id: 'perm-001',
    childId: '2024002',
    childName: 'Ana García',
    childGrade: '2° Primaria',
    parentName: 'María García López',
    parentPhone: '+52 55 4433 2211',
    fecha: '2026-02-20',
    horaSalida: '14:30',
    motivo: 'Cumpleaños de su amiga Sofía. Irá a su casa después del colegio.',
    transporte: 'bus_alterno',
    transporteDetalle: 'Camión Ruta 5 (familia Martínez)',
    personaAutorizada: {
      nombre: 'Laura Martínez',
      parentesco: 'Mamá de Sofía',
      telefono: '+52 55 1234 5678',
      identificacion: 'INE: MARL880512',
    },
    status: 'pendiente',
    creadoEn: '2026-02-19T10:00:00',
  },
  {
    id: 'perm-002',
    childId: '2024001',
    childName: 'Santiago González',
    childGrade: '4° Primaria',
    parentName: 'Roberto González',
    parentPhone: '+52 55 1122 3344',
    fecha: '2026-02-20',
    horaSalida: '13:00',
    motivo: 'Cita médica con el dentista. Lo recogerá su abuelo.',
    transporte: 'auto_particular',
    transporteDetalle: 'Auto gris Honda CRV, placas XYZ-123',
    personaAutorizada: {
      nombre: 'Roberto González Sr.',
      parentesco: 'Abuelo paterno',
      telefono: '+52 55 9876 5432',
      identificacion: 'INE: GOSR550815',
    },
    status: 'pendiente',
    creadoEn: '2026-02-19T08:30:00',
  },
  {
    id: 'perm-003',
    childId: '2024005',
    childName: 'Valentina Ruiz',
    childGrade: '3° Primaria',
    parentName: 'Andrea Ruiz',
    parentPhone: '+52 55 7788 9900',
    fecha: '2026-02-21',
    horaSalida: '14:30',
    motivo: 'Playdate en casa de su compañera Camila después del colegio.',
    transporte: 'a_pie',
    transporteDetalle: 'Se irá caminando con la mamá de Camila',
    personaAutorizada: {
      nombre: 'Patricia Hernández',
      parentesco: 'Mamá de Camila',
      telefono: '+52 55 5566 7788',
      identificacion: 'INE: HEPA920318',
    },
    status: 'activo',
    creadoEn: '2026-02-18T15:00:00',
    confirmedBy: 'Dir. Carmen Vega',
    confirmedAt: '2026-02-18T16:30:00',
  },
  {
    id: 'perm-004',
    childId: '2024003',
    childName: 'Diego Martínez',
    childGrade: '5° Primaria',
    parentName: 'Fernando Martínez',
    parentPhone: '+52 55 3344 5566',
    fecha: '2026-02-14',
    horaSalida: '12:00',
    motivo: 'Evento familiar',
    transporte: 'auto_particular',
    transporteDetalle: 'Mamá lo recoge en auto azul Nissan',
    personaAutorizada: {
      nombre: 'Lucía Fernández de Martínez',
      parentesco: 'Madre',
      telefono: '+52 55 6677 8899',
      identificacion: 'INE: FEML870210',
    },
    status: 'expirado',
    creadoEn: '2026-02-13T09:00:00',
    confirmedBy: 'Coord. Juan López',
    confirmedAt: '2026-02-13T11:00:00',
  },
];

const TRANSPORT_ICONS: Record<TransportType, React.ReactNode> = {
  bus_alterno: <Bus size={16} />,
  auto_particular: <Car size={16} />,
  a_pie: <Users size={16} />,
  otro: <MapPin size={16} />,
};

const TRANSPORT_LABELS: Record<TransportType, string> = {
  bus_alterno: 'Camión Alterno',
  auto_particular: 'Auto Particular',
  a_pie: 'A Pie / Acompañado',
  otro: 'Otro',
};

// ===== COMPONENT =====

export default function SchoolPermissionsView() {
  const toast = useToast();

  const [permissions, setPermissions] = useState<ExitPermission[]>(MOCK_PERMISSIONS);
  const [filterStatus, setFilterStatus] = useState<'all' | PermissionStatus>('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleConfirm = (id: string) => {
    setPermissions(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: 'confirmado' as PermissionStatus, confirmedBy: 'Dir. Demo', confirmedAt: new Date().toISOString() }
          : p
      )
    );
    const perm = permissions.find(p => p.id === id);
    toast.success('Permiso Confirmado', `Permiso de ${perm?.childName} confirmado. Se notificará al padre y al personal de puerta.`);
  };

  const handleReject = (id: string) => {
    setPermissions(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'cancelado' as PermissionStatus } : p)
    );
    const perm = permissions.find(p => p.id === id);
    toast.error('Permiso Rechazado', `Se rechazó el permiso de ${perm?.childName}. El padre será notificado.`);
  };

  // Filters
  const filteredPermissions = permissions.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesDate = !filterDate || p.fecha === filterDate;
    const matchesSearch = !searchTerm ||
      p.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.personaAutorizada.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesDate && matchesSearch;
  });

  const todayPermissions = permissions.filter(p => p.fecha === '2026-02-20');
  const pendingCount = permissions.filter(p => p.status === 'pendiente').length;

  const statusConfig: Record<PermissionStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    activo: { label: 'Activo', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14} /> },
    pendiente: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={14} /> },
    confirmado: { label: 'Confirmado', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Check size={14} /> },
    expirado: { label: 'Expirado', color: 'text-slate-400', bg: 'bg-slate-50', icon: <Clock size={14} /> },
    cancelado: { label: 'Rechazado', color: 'text-red-500', bg: 'bg-red-50', icon: <X size={14} /> },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-sky-50 pb-40">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-gradient-to-br from-purple-50 to-sky-50 rounded-lg md:rounded-2xl">
                <ShieldCheck size={24} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Permisos de Salida</h1>
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Gestión de autorizaciones de padres</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <Bell size={16} className="text-amber-600" />
                <span className="font-black text-amber-700 text-sm">{pendingCount} pendiente{pendingCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar alumno, padre o persona..."
                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
            </div>
            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
            </div>
            {/* Export */}
            <button
              onClick={() => toast.info('Exportar', 'Descargando reporte de permisos... (demo)')}
              className="p-3 bg-gradient-to-r from-purple-600 to-sky-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} /> Exportar
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'pendiente', 'confirmado', 'activo', 'expirado', 'cancelado'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  filterStatus === f
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-purple-50'
                }`}
              >
                {f === 'all' ? 'Todos' : statusConfig[f].label}
                {f !== 'all' && (
                  <span className="ml-2 text-[10px]">
                    ({permissions.filter(p => p.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hoy</p>
            <p className="text-2xl md:text-3xl font-black text-purple-600">{todayPermissions.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">permisos para hoy</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pendientes</p>
            <p className="text-2xl md:text-3xl font-black text-amber-600">{pendingCount}</p>
            <p className="text-[10px] text-slate-400 mt-1">por confirmar</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirmados</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-600">{permissions.filter(p => p.status === 'confirmado' || p.status === 'activo').length}</p>
            <p className="text-[10px] text-slate-400 mt-1">aprobados</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total</p>
            <p className="text-2xl md:text-3xl font-black text-slate-700">{permissions.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">registrados</p>
          </div>
        </div>

        {/* Urgent Alert for pending TODAY permissions */}
        {todayPermissions.filter(p => p.status === 'pendiente').length > 0 && (
          <div className="parent-alert parent-alert--warning flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-black text-sm text-slate-800">¡Atención! Permisos pendientes para hoy</p>
              <p className="text-xs text-slate-500 mt-1">
                Hay {todayPermissions.filter(p => p.status === 'pendiente').length} permiso(s) de salida para el día de hoy que aún no han sido confirmados.
                Revísalos y confirma o rechaza antes de la hora de salida.
              </p>
            </div>
          </div>
        )}

        {/* Permissions List */}
        {filteredPermissions.length === 0 ? (
          <div className="parent-card text-center py-12">
            <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-black text-slate-400 text-lg">No hay permisos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPermissions.map(perm => {
              const sConf = statusConfig[perm.status];
              const isExpanded = expandedId === perm.id;
              const isToday = perm.fecha === '2026-02-20';
              const isPending = perm.status === 'pendiente';

              return (
                <div
                  key={perm.id}
                  className={`parent-card transition-all ${
                    isPending && isToday ? 'border-l-4 border-l-amber-400 ring-2 ring-amber-100' :
                    isPending ? 'border-l-4 border-l-amber-400' :
                    perm.status === 'confirmado' || perm.status === 'activo' ? 'border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : perm.id)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg">
                          👤
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-800">{perm.childName}</p>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{perm.childGrade}</span>
                          {isToday && isPending && (
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded animate-pulse">
                              ⚡ HOY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Padre: {perm.parentName}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Calendar size={12} /> {perm.fecha}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Clock size={12} /> {perm.horaSalida}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            {TRANSPORT_ICONS[perm.transporte]} {TRANSPORT_LABELS[perm.transporte]}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${sConf.color} ${sConf.bg}`}>
                            {sConf.icon} {sConf.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {/* Quick action buttons for pending */}
                      {isPending && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleConfirm(perm.id); }}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                            title="Confirmar"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(perm.id); }}
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                            title="Rechazar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      {/* Reason */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Motivo</p>
                        <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-lg">{perm.motivo}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Transport */}
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transporte</p>
                          <div className="bg-purple-50 p-3 rounded-lg space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-600">{TRANSPORT_ICONS[perm.transporte]}</span>
                              <span className="text-sm font-black text-slate-800">{TRANSPORT_LABELS[perm.transporte]}</span>
                            </div>
                            {perm.transporteDetalle && (
                              <p className="text-xs text-slate-600">{perm.transporteDetalle}</p>
                            )}
                          </div>
                        </div>

                        {/* Authorized Person */}
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Persona Autorizada</p>
                          <div className="bg-sky-50 p-3 rounded-lg space-y-1">
                            <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                              <User size={14} className="text-sky-600" /> {perm.personaAutorizada.nombre}
                            </p>
                            {perm.personaAutorizada.parentesco && (
                              <p className="text-xs text-slate-600">{perm.personaAutorizada.parentesco}</p>
                            )}
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <Phone size={10} /> {perm.personaAutorizada.telefono}
                            </p>
                            {perm.personaAutorizada.identificacion && (
                              <p className="text-xs text-slate-600 font-mono">{perm.personaAutorizada.identificacion}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Parent Contact */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contacto del padre</p>
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                          <p className="text-sm font-bold text-slate-700">{perm.parentName}</p>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone size={10} /> {perm.parentPhone}
                          </span>
                        </div>
                      </div>

                      {/* Confirmation info */}
                      {perm.confirmedBy && (
                        <div className="bg-emerald-50 p-3 rounded-lg flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">
                            Confirmado por {perm.confirmedBy} • {perm.confirmedAt ? new Date(perm.confirmedAt).toLocaleString('es-MX') : ''}
                          </span>
                        </div>
                      )}

                      {/* Created info */}
                      <p className="text-[10px] text-slate-400">
                        Creado: {new Date(perm.creadoEn).toLocaleString('es-MX')}
                      </p>

                      {/* Actions for pending */}
                      {isPending && (
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleConfirm(perm.id)}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Check size={16} /> Confirmar Permiso
                          </button>
                          <button
                            onClick={() => handleReject(perm.id)}
                            className="flex-1 py-3 bg-white border border-red-200 text-red-600 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                          >
                            <X size={16} /> Rechazar
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

        {/* Instructions for staff */}
        <div className="parent-card bg-gradient-to-br from-purple-50 to-sky-50 border border-purple-100 space-y-3">
          <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
            <AlertTriangle size={16} className="text-purple-500" /> Protocolo de Salida
          </h3>
          <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
            <li><strong>Verificar identidad</strong> de la persona autorizada con su INE/identificación</li>
            <li><strong>Confirmar</strong> el nombre del alumno y el padre que autorizó</li>
            <li><strong>Llamar al padre</strong> si hay cualquier duda o inconsistencia</li>
            <li><strong>Registrar la hora de salida</strong> en el control de puerta</li>
            <li>Si el alumno se va en camión alterno, <strong>notificar al chofer</strong> correspondiente</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Plus, Trash2, Clock, MapPin, Phone, User,
  Bus, Car, Users, PartyPopper, Calendar, CheckCircle2,
  AlertTriangle, X, ChevronDown, ChevronUp, Edit2, Send
} from 'lucide-react';
import { useToast } from './ui/Toast';

// ===== TYPES =====

type TransportType = 'bus_alterno' | 'auto_particular' | 'a_pie' | 'otro';
type PermissionStatus = 'activo' | 'pendiente' | 'expirado' | 'cancelado';

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
  fecha: string;
  horaSalida: string;
  motivo: string;
  transporte: TransportType;
  transporteDetalle: string;
  personaAutorizada: AuthorizedPerson;
  status: PermissionStatus;
  creadoEn: string;
  notificadoAlColegio: boolean;
}

// ===== CONSTANTS =====

const TRANSPORT_OPTIONS: { value: TransportType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'bus_alterno', label: 'Camión Alterno', icon: <Bus size={18} />, desc: 'Se irá en otro camión escolar' },
  { value: 'auto_particular', label: 'Auto Particular', icon: <Car size={18} />, desc: 'Lo recogerá otra persona en auto' },
  { value: 'a_pie', label: 'A Pie / Acompañado', icon: <Users size={18} />, desc: 'Se irá caminando con otra familia' },
  { value: 'otro', label: 'Otro', icon: <MapPin size={18} />, desc: 'Otro medio de transporte' },
];

const MOCK_CHILDREN = [
  { id: '2024001', name: 'Santiago González', photo: '👦', grade: '4° Primaria' },
  { id: '2024002', name: 'Ana García', photo: '👧', grade: '2° Primaria' },
];

const MOCK_PERMISSIONS: ExitPermission[] = [
  {
    id: 'perm-001',
    childId: '2024002',
    childName: 'Ana García',
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
    status: 'activo',
    creadoEn: '2026-02-17T10:00:00',
    notificadoAlColegio: true,
  },
  {
    id: 'perm-002',
    childId: '2024001',
    childName: 'Santiago González',
    fecha: '2026-02-14',
    horaSalida: '13:00',
    motivo: 'Cita médica con el dentista',
    transporte: 'auto_particular',
    transporteDetalle: 'Abuelo paterno lo recogerá en auto gris Honda CRV',
    personaAutorizada: {
      nombre: 'Roberto González Sr.',
      parentesco: 'Abuelo',
      telefono: '+52 55 9876 5432',
      identificacion: 'INE: GOSR550815',
    },
    status: 'expirado',
    creadoEn: '2026-02-12T08:30:00',
    notificadoAlColegio: true,
  },
];

// ===== COMPONENT =====

export default function ParentPermissionsView() {
  const navigate = useNavigate();
  const toast = useToast();

  const [permissions, setPermissions] = useState<ExitPermission[]>(MOCK_PERMISSIONS);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | PermissionStatus>('all');

  // Form state
  const [formChild, setFormChild] = useState(MOCK_CHILDREN[0].id);
  const [formFecha, setFormFecha] = useState('');
  const [formHora, setFormHora] = useState('14:30');
  const [formMotivo, setFormMotivo] = useState('');
  const [formTransporte, setFormTransporte] = useState<TransportType>('bus_alterno');
  const [formTransporteDetalle, setFormTransporteDetalle] = useState('');
  const [formPersona, setFormPersona] = useState<AuthorizedPerson>({
    nombre: '',
    parentesco: '',
    telefono: '',
    identificacion: '',
  });

  const resetForm = () => {
    setFormChild(MOCK_CHILDREN[0].id);
    setFormFecha('');
    setFormHora('14:30');
    setFormMotivo('');
    setFormTransporte('bus_alterno');
    setFormTransporteDetalle('');
    setFormPersona({ nombre: '', parentesco: '', telefono: '', identificacion: '' });
  };

  const handleSubmit = () => {
    if (!formFecha || !formMotivo || !formPersona.nombre || !formPersona.telefono) {
      toast.error('Campos requeridos', 'Completa todos los campos obligatorios');
      return;
    }

    const child = MOCK_CHILDREN.find(c => c.id === formChild)!;
    const newPermission: ExitPermission = {
      id: `perm-${Date.now()}`,
      childId: formChild,
      childName: child.name,
      fecha: formFecha,
      horaSalida: formHora,
      motivo: formMotivo,
      transporte: formTransporte,
      transporteDetalle: formTransporteDetalle,
      personaAutorizada: { ...formPersona },
      status: 'pendiente',
      creadoEn: new Date().toISOString(),
      notificadoAlColegio: false,
    };

    setPermissions(prev => [newPermission, ...prev]);
    resetForm();
    setShowForm(false);
    toast.success('Permiso Creado', `Se creó el permiso de salida para ${child.name}. El colegio será notificado.`);

    // Simulate school notification after 2 seconds
    setTimeout(() => {
      setPermissions(prev =>
        prev.map(p => p.id === newPermission.id ? { ...p, status: 'activo' as PermissionStatus, notificadoAlColegio: true } : p)
      );
      toast.info('Colegio Notificado', `El colegio confirmó el permiso de salida de ${child.name}`);
    }, 2000);
  };

  const handleCancel = (id: string) => {
    setPermissions(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'cancelado' as PermissionStatus } : p)
    );
    toast.info('Permiso Cancelado', 'El permiso de salida fue cancelado y el colegio fue notificado.');
  };

  const filteredPermissions = permissions.filter(p =>
    filterStatus === 'all' ? true : p.status === filterStatus
  );

  const statusConfig: Record<PermissionStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    activo: { label: 'Activo', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14} /> },
    pendiente: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={14} /> },
    expirado: { label: 'Expirado', color: 'text-slate-400', bg: 'bg-slate-50', icon: <Clock size={14} /> },
    cancelado: { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-50', icon: <X size={14} /> },
  };

  const transportLabel = (t: TransportType) => TRANSPORT_OPTIONS.find(o => o.value === t)?.label || t;

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
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Autorizaciones de transporte y acompañamiento</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-sky-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-lg transition-all"
            >
              <Plus size={16} /> Nuevo Permiso
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'activo', 'pendiente', 'expirado', 'cancelado'] as const).map(f => (
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

        {/* Alert - Info */}
        <div className="parent-alert parent-alert--info flex items-start gap-3">
          <AlertTriangle size={18} className="text-sky-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-black text-sm text-slate-800">¿Cuándo usar un permiso de salida?</p>
            <p className="text-xs text-slate-500 mt-1">
              Cuando tu hijo(a) se irá con otra familia, en otro camión, o será recogido por alguien diferente al tutor habitual.
              Ejemplo: cumpleaños de un amigo, cita médica con abuelo, etc. El colegio recibirá la notificación automáticamente.
            </p>
          </div>
        </div>

        {/* ===== NEW PERMISSION FORM ===== */}
        {showForm && (
          <div className="parent-card border-2 border-purple-200 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600 font-black text-sm">📝</div>
                Nuevo Permiso de Salida
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Select Child */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">1. ¿Para quién es el permiso?</label>
              <div className="flex gap-3">
                {MOCK_CHILDREN.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setFormChild(child.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all flex-1 ${
                      formChild === child.id
                        ? 'border-purple-400 bg-purple-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-purple-200'
                    }`}
                  >
                    <span className="text-2xl">{child.photo}</span>
                    <div className="text-left">
                      <p className="font-black text-sm text-slate-800">{child.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{child.grade}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">2. Fecha del permiso *</label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={e => setFormFecha(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hora de salida</label>
                <input
                  type="time"
                  value={formHora}
                  onChange={e => setFormHora(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Step 3: Reason */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">3. Motivo *</label>
              <textarea
                value={formMotivo}
                onChange={e => setFormMotivo(e.target.value)}
                placeholder="Ej: Cumpleaños de su amiga Sofía, irá a su casa después del colegio..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Step 4: Transport */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">4. ¿Cómo se irá?</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TRANSPORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFormTransporte(opt.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      formTransporte === opt.value
                        ? 'border-purple-400 bg-purple-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-purple-200'
                    }`}
                  >
                    <div className={`mb-2 ${formTransporte === opt.value ? 'text-purple-600' : 'text-slate-400'}`}>
                      {opt.icon}
                    </div>
                    <p className="font-black text-xs text-slate-800">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formTransporteDetalle}
                onChange={e => setFormTransporteDetalle(e.target.value)}
                placeholder="Detalle: Ej. Camión Ruta 5, auto blanco Honda Civic, placas ABC-123..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Step 5: Authorized Person */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">5. Persona autorizada para recoger / acompañar *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Nombre completo *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formPersona.nombre}
                      onChange={e => setFormPersona(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Laura Martínez"
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Parentesco / Relación</label>
                  <input
                    type="text"
                    value={formPersona.parentesco}
                    onChange={e => setFormPersona(prev => ({ ...prev, parentesco: e.target.value }))}
                    placeholder="Mamá de Sofía, Tío, Vecina..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Teléfono *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={formPersona.telefono}
                      onChange={e => setFormPersona(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="+52 55 1234 5678"
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Identificación (INE, etc.)</label>
                  <input
                    type="text"
                    value={formPersona.identificacion}
                    onChange={e => setFormPersona(prev => ({ ...prev, identificacion: e.target.value }))}
                    placeholder="INE: MARL880512"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-white border border-slate-200 rounded-lg font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-sky-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send size={16} /> Crear Permiso y Notificar al Colegio
              </button>
            </div>
          </div>
        )}

        {/* ===== PERMISSIONS LIST ===== */}
        {filteredPermissions.length === 0 ? (
          <div className="parent-card text-center py-12">
            <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-black text-slate-400 text-lg">No hay permisos {filterStatus !== 'all' ? `con estado "${statusConfig[filterStatus as PermissionStatus].label}"` : ''}</p>
            <p className="text-xs text-slate-400 mt-2">Crea un nuevo permiso de salida cuando tu hijo necesite irse con otra persona o en otro transporte.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPermissions.map(perm => {
              const sConf = statusConfig[perm.status];
              const isExpanded = expandedId === perm.id;
              return (
                <div
                  key={perm.id}
                  className={`parent-card transition-all ${perm.status === 'activo' ? 'border-l-4 border-l-emerald-500' : perm.status === 'pendiente' ? 'border-l-4 border-l-amber-400' : ''}`}
                >
                  {/* Card Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : perm.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{MOCK_CHILDREN.find(c => c.id === perm.childId)?.photo || '👤'}</span>
                      <div>
                        <p className="font-black text-slate-800">{perm.childName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Calendar size={12} /> {perm.fecha}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Clock size={12} /> {perm.horaSalida}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${sConf.color} ${sConf.bg}`}>
                            {sConf.icon} {sConf.label}
                          </span>
                          {perm.notificadoAlColegio && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black text-emerald-600 bg-emerald-50">
                              <CheckCircle2 size={12} /> Colegio notificado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Card Details (expanded) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      {/* Reason */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Motivo</p>
                        <p className="text-sm font-bold text-slate-700">{perm.motivo}</p>
                      </div>

                      {/* Transport */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transporte</p>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded bg-purple-50 text-purple-600">
                              {TRANSPORT_OPTIONS.find(o => o.value === perm.transporte)?.icon}
                            </span>
                            <span className="text-sm font-bold text-slate-700">{transportLabel(perm.transporte)}</span>
                          </div>
                          {perm.transporteDetalle && (
                            <p className="text-xs text-slate-500 mt-1">{perm.transporteDetalle}</p>
                          )}
                        </div>

                        {/* Authorized Person */}
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Persona Autorizada</p>
                          <div className="space-y-0.5">
                            <p className="text-sm font-black text-slate-800">{perm.personaAutorizada.nombre}</p>
                            {perm.personaAutorizada.parentesco && (
                              <p className="text-xs text-slate-500">{perm.personaAutorizada.parentesco}</p>
                            )}
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone size={10} /> {perm.personaAutorizada.telefono}
                            </p>
                            {perm.personaAutorizada.identificacion && (
                              <p className="text-xs text-slate-500">ID: {perm.personaAutorizada.identificacion}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {(perm.status === 'activo' || perm.status === 'pendiente') && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(perm.id); }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-red-100 transition-all"
                          >
                            <Trash2 size={14} /> Cancelar Permiso
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

        {/* Quick Scenario Cards */}
        <div className="parent-card space-y-4">
          <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
            <PartyPopper size={18} className="text-purple-500" /> Escenarios Comunes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => { resetForm(); setFormMotivo('Cumpleaños de un compañero(a). Mi hijo(a) irá a la fiesta después del colegio.'); setFormTransporte('bus_alterno'); setShowForm(true); }}
              className="p-4 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
            >
              <span className="text-2xl mb-2 block">🎂</span>
              <p className="font-black text-sm text-slate-800">Cumpleaños</p>
              <p className="text-[10px] text-slate-400 mt-1">Se irá con la familia del festejado</p>
            </button>
            <button
              onClick={() => { resetForm(); setFormMotivo('Cita médica. Lo recogerá un familiar autorizado.'); setFormTransporte('auto_particular'); setShowForm(true); }}
              className="p-4 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
            >
              <span className="text-2xl mb-2 block">🏥</span>
              <p className="font-black text-sm text-slate-800">Cita Médica</p>
              <p className="text-[10px] text-slate-400 mt-1">Lo recoge un familiar diferente</p>
            </button>
            <button
              onClick={() => { resetForm(); setFormMotivo('Playdate / visita a casa de un amigo(a) después del colegio.'); setFormTransporte('a_pie'); setShowForm(true); }}
              className="p-4 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
            >
              <span className="text-2xl mb-2 block">🏠</span>
              <p className="font-black text-sm text-slate-800">Visita a Amigo</p>
              <p className="text-[10px] text-slate-400 mt-1">Se irá caminando con otra familia</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

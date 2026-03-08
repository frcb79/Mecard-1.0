import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Plus, Trash2, Clock, Phone, User, Bus, Car, Users,
  Calendar, CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp,
  Send, UserX, MapPin, Bell, Contact, Edit2,
  Save, Star
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { useParentStudents } from '../hooks/useParentStudents';
import ParentNoStudentsState from './ParentNoStudentsState';
import {
  MOCK_EXIT_PERMISSIONS, MOCK_AUTHORIZED_CONTACTS, MOCK_SCHOOL_PERMISSION_CONFIG, MOCK_COPARENT
} from '../constants';
import type {
  ExitPermission, PermissionTransportType, PermissionStatus, AuthorizedContact
} from '../types';

// ===== LOCAL TYPES =====
type TabView = 'list' | 'create' | 'contacts';

const TRANSPORT_OPTIONS: { value: PermissionTransportType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'bus_alterno', label: 'Camión Alterno', icon: <Bus size={18} />, desc: 'Se irá en otro camión escolar' },
  { value: 'auto_particular', label: 'Auto Particular', icon: <Car size={18} />, desc: 'Lo recogerá otra persona en auto' },
  { value: 'a_pie', label: 'A Pie / Acompañado', icon: <Users size={18} />, desc: 'Se irá caminando con otra familia' },
  { value: 'no_asiste', label: 'No Asiste', icon: <UserX size={18} />, desc: 'El alumno no asistirá a clases' },
  { value: 'otro', label: 'Otro', icon: <MapPin size={18} />, desc: 'Otro medio de transporte' },
];

const QUICK_SCENARIOS = [
  { emoji: '🎂', label: 'Cumpleaños', motivo: 'Festejo de cumpleaños de compañero' },
  { emoji: '🏥', label: 'Médico', motivo: 'Cita médica programada' },
  { emoji: '🏠', label: 'Playdate', motivo: 'Playdate con compañero de clase' },
  { emoji: '👨‍👩‍👧', label: 'Familiar', motivo: 'Evento familiar' },
  { emoji: '🤒', label: 'No Asiste', motivo: 'No asistirá a clases', transport: 'no_asiste' as PermissionTransportType },
];

function getStatusConfig(status: PermissionStatus) {
  switch (status) {
    case 'pendiente': return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} /> };
    case 'aprobado': return { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={14} /> };
    case 'rechazado': return { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: <X size={14} /> };
    case 'cancelado': return { label: 'Cancelado', color: 'bg-slate-100 text-slate-500', icon: <Trash2 size={14} /> };
    case 'expirado': return { label: 'Expirado', color: 'bg-slate-100 text-slate-400', icon: <Clock size={14} /> };
  }
}

function getTransportIcon(type: PermissionTransportType) {
  switch (type) {
    case 'bus_alterno': return <Bus size={16} className="text-blue-500" />;
    case 'auto_particular': return <Car size={16} className="text-indigo-500" />;
    case 'a_pie': return <Users size={16} className="text-emerald-500" />;
    case 'no_asiste': return <UserX size={16} className="text-red-500" />;
    case 'otro': return <MapPin size={16} className="text-slate-500" />;
  }
}

export default function ParentPermissionsView() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { students: parentStudents, loading: studentsLoading } = useParentStudents();

  const children = useMemo(() => {
    return parentStudents.map((student, idx) => ({
      id: student.id,
      name: (student as any).name || student.fullName || 'Estudiante',
      photo: student.photo ? '👤' : idx % 2 === 0 ? '👦' : '👧',
      grade: student.grade,
      group: student.group || 'A',
      busRoute: student.busRoute || 'Ruta escolar',
    }));
  }, [parentStudents]);

  const [tabView, setTabView] = useState<TabView>('list');
  const [permissions, setPermissions] = useState<ExitPermission[]>(MOCK_EXIT_PERMISSIONS);
  const [contacts, setContacts] = useState<AuthorizedContact[]>(MOCK_AUTHORIZED_CONTACTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const config = MOCK_SCHOOL_PERMISSION_CONFIG;

  // Form state
  const [selectedChild, setSelectedChild] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [motivo, setMotivo] = useState('');
  const [transporte, setTransporte] = useState<PermissionTransportType | ''>('');
  const [transporteDetalle, setTransporteDetalle] = useState('');
  const [busDestino, setBusDestino] = useState('');
  const [useContact, setUseContact] = useState<'saved' | 'new'>('saved');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [newPerson, setNewPerson] = useState({ nombre: '', parentesco: '', telefono: '', email: '', identificacion: '' });

  // Contact form
  const [editingContact, setEditingContact] = useState<AuthorizedContact | null>(null);
  const [newContact, setNewContact] = useState({ nombre: '', parentesco: '', telefono: '', email: '', identificacion: '' });
  const [showContactForm, setShowContactForm] = useState(false);

  const child = children.find(c => c.id === selectedChild);
  const isNoAsiste = transporte === 'no_asiste';

  const activePermissions = useMemo(() =>
    permissions.filter(p => ['pendiente', 'aprobado'].includes(p.status)), [permissions]);
  const pastPermissions = useMemo(() =>
    permissions.filter(p => ['cancelado', 'expirado', 'rechazado'].includes(p.status)), [permissions]);

  function resetForm() {
    setSelectedChild(''); setFecha(''); setHoraSalida(''); setMotivo('');
    setTransporte(''); setTransporteDetalle(''); setBusDestino('');
    setUseContact('saved'); setSelectedContactId('');
    setNewPerson({ nombre: '', parentesco: '', telefono: '', email: '', identificacion: '' });
  }

  function handleSubmit() {
    if (!selectedChild || !fecha || !motivo || !transporte) {
      showToast('Completa todos los campos obligatorios', 'error'); return;
    }
    if (!isNoAsiste && useContact === 'saved' && !selectedContactId) {
      showToast('Selecciona una persona autorizada', 'error'); return;
    }
    if (!isNoAsiste && useContact === 'new' && !newPerson.nombre) {
      showToast('Ingresa los datos de la persona autorizada', 'error'); return;
    }

    const c = children.find(ch => ch.id === selectedChild)!;
    const contact = useContact === 'saved' ? contacts.find(ct => ct.id === selectedContactId) : null;

    const perm: ExitPermission = {
      id: `perm-${Date.now()}`,
      schoolId: 'mx_01',
      childId: selectedChild,
      childName: c.name,
      childGrade: c.grade,
      childGroup: c.group,
      childPhoto: c.photo,
      busOriginal: c.busRoute,
      busDestino: transporte === 'bus_alterno' ? busDestino : undefined,
      transporte: transporte as PermissionTransportType,
      transporteDetalle: transporteDetalle || undefined,
      fecha,
      horaSalida: isNoAsiste ? '' : horaSalida,
      motivo,
      authorizedContactId: contact?.id,
      personaAutorizada: isNoAsiste ? undefined : (contact ? {
        nombre: contact.nombre, parentesco: contact.parentesco,
        telefono: contact.telefono, email: contact.email, identificacion: contact.identificacion,
      } : { ...newPerson }),
      createdBy: user?.id || 'parent_01',
      createdByName: 'María González',
      approvals: [
        { parentId: user?.id || 'parent_01', parentName: 'María González', status: 'aprobado', timestamp: new Date().toISOString() },
        ...(config.requiereDosAprobaciones ? [{ parentId: MOCK_COPARENT.parentId, parentName: MOCK_COPARENT.name, status: 'pendiente' as const, timestamp: '' }] : []),
      ],
      status: 'pendiente',
      schoolApproval: { status: 'pendiente' },
      notificationsSent: { school: true, coparent: true, receivingFamily: false, externalPerson: !isNoAsiste },
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    setPermissions(prev => [perm, ...prev]);
    resetForm(); setTabView('list');
    showToast(isNoAsiste ? '📢 Inasistencia reportada al colegio' : '✅ Permiso enviado al colegio', 'success');

    if (!isNoAsiste) {
      setTimeout(() => {
        setPermissions(prev => prev.map(p =>
          p.id === perm.id ? { ...p, status: 'aprobado' as PermissionStatus, schoolApproval: { status: 'aprobado', reviewedBy: 'admin_01', reviewedByName: 'Coordinación', reviewedAt: new Date().toISOString() } } : p
        ));
        showToast('🏫 El colegio confirmó el permiso', 'success');
      }, 3000);
    }
  }

  function handleCancel(id: string) {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, status: 'cancelado' as PermissionStatus } : p));
    showToast('Permiso cancelado', 'info');
  }

  function handleSaveContact() {
    if (!newContact.nombre || !newContact.telefono || !newContact.identificacion) {
      showToast('Nombre, teléfono e identificación son obligatorios', 'error'); return;
    }
    if (contacts.length >= 3 && !editingContact) {
      showToast('Máximo 3 contactos permanentes', 'error'); return;
    }
    if (editingContact) {
      setContacts(prev => prev.map(ct => ct.id === editingContact.id ? { ...ct, ...newContact } : ct));
      showToast('Contacto actualizado', 'success');
    } else {
      setContacts(prev => [...prev, {
        id: `contact_${Date.now()}`, familyId: 'family_01', ...newContact,
        isDefault: contacts.length === 0, createdBy: user?.id || 'parent_01', createdAt: new Date().toISOString(),
      }]);
      showToast('Contacto agregado', 'success');
    }
    setNewContact({ nombre: '', parentesco: '', telefono: '', email: '', identificacion: '' });
    setEditingContact(null); setShowContactForm(false);
  }

  if (studentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <p className="text-slate-500 font-bold">Cargando estudiantes...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <ParentNoStudentsState
        title="Permisos de Salida"
        description="Para emitir permisos necesitas vincular al menos un estudiante en Mi Familia."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Permisos de Salida</h1>
            <p className="text-xs md:text-sm text-slate-500">Gestiona permisos e inasistencias</p>
          </div>
        </div>
        {config.mensajePersonalizado && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-start gap-2">
            <Bell size={14} className="mt-0.5 shrink-0" />
            <span>{config.mensajePersonalizado} • Se requieren <strong>{config.horasAnticipacion}h</strong> de anticipación.</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <Users size={12} />
          <span>Vinculado con: <strong className="text-slate-600">{MOCK_COPARENT.name}</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'list' as TabView, label: `📋 Mis Permisos (${activePermissions.length})` },
            { key: 'create' as TabView, label: '➕ Nuevo Permiso' },
            { key: 'contacts' as TabView, label: `👥 Autorizados (${contacts.length}/3)` },
          ].map(t => (
            <button key={t.key} onClick={() => { if (t.key === 'create') resetForm(); setTabView(t.key); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tabView === t.key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* ===== LIST TAB ===== */}
        {tabView === 'list' && (
          <div className="space-y-4">
            {activePermissions.length === 0 ? (
              <div className="parent-card text-center py-12">
                <ShieldCheck size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No hay permisos activos</p>
                <button onClick={() => setTabView('create')} className="mt-3 text-indigo-600 text-sm font-bold hover:underline">+ Crear nuevo permiso</button>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Activos / Pendientes</h3>
                {activePermissions.map(perm => {
                  const sc = getStatusConfig(perm.status);
                  const isExp = expandedId === perm.id;
                  return (
                    <div key={perm.id} className="parent-card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedId(isExp ? null : perm.id)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl">{perm.childPhoto || '👤'}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm">{perm.childName}</p>
                            <p className="text-xs text-slate-400">{perm.childGrade} - {perm.childGroup} • {new Date(perm.fecha).toLocaleDateString('es-MX', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {perm.transporte === 'no_asiste' && <span className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-[10px] font-bold">NO ASISTE</span>}
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${sc.color}`}>{sc.icon} {sc.label}</span>
                          {isExp ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">{getTransportIcon(perm.transporte)} {TRANSPORT_OPTIONS.find(t => t.value === perm.transporte)?.label}</span>
                        {perm.busOriginal && <span className="flex items-center gap-1">🚌 {perm.busOriginal}</span>}
                        {perm.busDestino && <span className="flex items-center gap-1">→ {perm.busDestino}</span>}
                        {perm.horaSalida && <span className="flex items-center gap-1"><Clock size={12} /> {perm.horaSalida}</span>}
                      </div>
                      {isExp && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div><p className="font-bold text-slate-500 uppercase tracking-wider mb-1">Motivo</p><p className="text-slate-700">{perm.motivo}</p></div>
                            {perm.transporteDetalle && <div><p className="font-bold text-slate-500 uppercase tracking-wider mb-1">Detalle transporte</p><p className="text-slate-700">{perm.transporteDetalle}</p></div>}
                          </div>
                          {perm.personaAutorizada && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Persona Autorizada</p>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><User size={14} className="text-indigo-600" /></div>
                                <div>
                                  <p className="font-bold text-sm text-slate-800">{perm.personaAutorizada.nombre}</p>
                                  <p className="text-xs text-slate-500">{perm.personaAutorizada.parentesco} • {perm.personaAutorizada.telefono}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {perm.approvals.length > 0 && (
                            <div>
                              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Aprobaciones</p>
                              <div className="flex flex-wrap gap-2">
                                {perm.approvals.map((a, i) => (
                                  <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${a.status === 'aprobado' ? 'bg-emerald-100 text-emerald-700' : a.status === 'rechazado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {a.status === 'aprobado' ? <CheckCircle2 size={10} /> : <Clock size={10} />} {a.parentName}
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
                          {perm.schoolApproval && (
                            <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${perm.schoolApproval.status === 'aprobado' ? 'bg-emerald-50 text-emerald-700' : perm.schoolApproval.status === 'rechazado' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                              {perm.schoolApproval.status === 'aprobado' ? <CheckCircle2 size={14} /> : perm.schoolApproval.status === 'rechazado' ? <X size={14} /> : <Clock size={14} />}
                              <span>Colegio: {perm.schoolApproval.status === 'aprobado' ? `Aprobado por ${perm.schoolApproval.reviewedByName}` : perm.schoolApproval.status === 'rechazado' ? 'Rechazado' : 'Pendiente de revisión'}</span>
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400">Creado por {perm.createdByName} • {new Date(perm.creadoEn).toLocaleString('es-MX')}</p>
                          {['pendiente', 'aprobado'].includes(perm.status) && (
                            <button onClick={(e) => { e.stopPropagation(); handleCancel(perm.id); }} className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
                              <Trash2 size={12} /> Cancelar permiso
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            {pastPermissions.length > 0 && (
              <>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-8">Historial</h3>
                {pastPermissions.map(perm => {
                  const sc = getStatusConfig(perm.status);
                  return (
                    <div key={perm.id} className="parent-card opacity-60">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl">{perm.childPhoto || '👤'}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-600 text-sm">{perm.childName}</p>
                            <p className="text-xs text-slate-400">{new Date(perm.fecha).toLocaleDateString('es-MX')} • {perm.motivo}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${sc.color}`}>{sc.icon} {sc.label}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ===== CREATE TAB ===== */}
        {tabView === 'create' && (
          <div className="space-y-4">
            <div className="parent-card">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Escenarios Rápidos</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SCENARIOS.map(s => (
                  <button key={s.label} onClick={() => { setMotivo(s.motivo); if (s.transport) setTransporte(s.transport); }}
                    className="px-3 py-2 bg-slate-50 hover:bg-indigo-50 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-700 transition-colors border border-slate-100 hover:border-indigo-200">
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="parent-card">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Selecciona alumno</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children.map(c => (
                  <button key={c.id} onClick={() => setSelectedChild(c.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${selectedChild === c.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.photo}</span>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.grade} - {c.group}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Bus size={10} /> {c.busRoute}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="parent-card">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Fecha y hora</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Fecha *</label>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none" />
                </div>
                {!isNoAsiste && (
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Hora de salida</label>
                    <input type="time" value={horaSalida} onChange={e => setHoraSalida(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none" />
                  </div>
                )}
              </div>
            </div>
            <div className="parent-card">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Motivo {config.requiereMotivo && '*'}</p>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Describe el motivo del permiso..." rows={2}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none resize-none" />
            </div>
            <div className="parent-card">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">4. Tipo de transporte *</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRANSPORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setTransporte(opt.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${transporte === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'} ${opt.value === 'no_asiste' ? 'sm:col-span-2 bg-red-50 border-red-100 hover:border-red-300' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${opt.value === 'no_asiste' ? 'bg-red-100' : 'bg-slate-100'}`}>{opt.icon}</div>
                    <div>
                      <p className="font-bold text-xs text-slate-800">{opt.label}</p>
                      <p className="text-[10px] text-slate-500">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {transporte === 'bus_alterno' && child && (
              <div className="parent-card">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🚌 Rutas de camión</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Camión original</label>
                    <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-700 font-medium">{child.busRoute}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Se sube al camión *</label>
                    <select value={busDestino} onChange={e => setBusDestino(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none">
                      <option value="">Selecciona ruta...</option>
                      {config.rutasCamion.filter(r => r !== child.busRoute).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-slate-500 mb-1 block">Detalle adicional</label>
                  <input type="text" value={transporteDetalle} onChange={e => setTransporteDetalle(e.target.value)} placeholder="Ej: Se va con su amigo Mateo"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none" />
                </div>
              </div>
            )}
            {transporte && transporte !== 'bus_alterno' && transporte !== 'no_asiste' && (
              <div className="parent-card">
                <label className="text-xs text-slate-500 mb-1 block">Detalle de transporte</label>
                <input type="text" value={transporteDetalle} onChange={e => setTransporteDetalle(e.target.value)} placeholder="Ej: Toyota Corolla rojo, placas ABC-123"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none" />
              </div>
            )}
            {transporte && transporte !== 'no_asiste' && (
              <div className="parent-card">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">5. Persona autorizada *</p>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setUseContact('saved')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${useContact === 'saved' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>📋 Guardados ({contacts.length})</button>
                  <button onClick={() => setUseContact('new')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${useContact === 'new' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>✍️ Otra persona</button>
                </div>
                {useContact === 'saved' && (
                  <div className="space-y-2">
                    {contacts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No hay contactos. <button onClick={() => setTabView('contacts')} className="text-indigo-600 font-bold">Agregar</button></p>
                    ) : contacts.map(ct => (
                      <button key={ct.id} onClick={() => setSelectedContactId(ct.id)}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${selectedContactId === ct.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><User size={14} className="text-indigo-600" /></div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-800">{ct.nombre}</p>
                          <p className="text-xs text-slate-500">{ct.parentesco} • {ct.telefono}</p>
                        </div>
                        {ct.isDefault && <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">★</span>}
                      </button>
                    ))}
                  </div>
                )}
                {useContact === 'new' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" value={newPerson.nombre} onChange={e => setNewPerson(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre completo *"
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                      <input type="text" value={newPerson.parentesco} onChange={e => setNewPerson(p => ({ ...p, parentesco: e.target.value }))} placeholder="Parentesco"
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="tel" value={newPerson.telefono} onChange={e => setNewPerson(p => ({ ...p, telefono: e.target.value }))} placeholder="Teléfono *"
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                      <input type="email" value={newPerson.email} onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))} placeholder="Email (opcional)"
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    </div>
                    <input type="text" value={newPerson.identificacion} onChange={e => setNewPerson(p => ({ ...p, identificacion: e.target.value }))} placeholder="No. Identificación (INE) *"
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                  </div>
                )}
              </div>
            )}
            <button onClick={handleSubmit} disabled={!selectedChild || !fecha || !motivo || !transporte}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black px-6 py-3 md:py-4 rounded-2xl transition-all shadow-lg uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2">
              <Send size={16} /> {isNoAsiste ? 'Reportar Inasistencia' : 'Enviar Permiso al Colegio'}
            </button>
          </div>
        )}

        {/* ===== CONTACTS TAB ===== */}
        {tabView === 'contacts' && (
          <div className="space-y-4">
            <div className="parent-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-800">Directorio de Autorizados</p>
                  <p className="text-xs text-slate-500">Hasta 3 personas permanentes. Compartido con tu co-padre.</p>
                </div>
                {contacts.length < 3 && (
                  <button onClick={() => { setShowContactForm(true); setEditingContact(null); setNewContact({ nombre: '', parentesco: '', telefono: '', email: '', identificacion: '' }); }}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Plus size={14} /> Agregar</button>
                )}
              </div>
              {contacts.length === 0 ? (
                <div className="text-center py-8"><Contact size={40} className="mx-auto text-slate-300 mb-2" /><p className="text-slate-400 text-sm">No hay contactos guardados</p></div>
              ) : (
                <div className="space-y-3">
                  {contacts.map(ct => (
                    <div key={ct.id} className="p-4 bg-slate-50 rounded-xl flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"><User size={18} className="text-indigo-600" /></div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 flex items-center gap-2">{ct.nombre} {ct.isDefault && <Star size={12} className="text-amber-500" />}</p>
                          <p className="text-xs text-slate-500">{ct.parentesco}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={10} /> {ct.telefono}</p>
                          {ct.email && <p className="text-xs text-slate-400">{ct.email}</p>}
                          <p className="text-[10px] text-slate-300 mt-1">ID: {ct.identificacion}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingContact(ct); setNewContact({ nombre: ct.nombre, parentesco: ct.parentesco, telefono: ct.telefono, email: ct.email || '', identificacion: ct.identificacion }); setShowContactForm(true); }}
                          className="p-2 hover:bg-white rounded-lg transition-colors"><Edit2 size={14} className="text-slate-400" /></button>
                        <button onClick={() => { setContacts(prev => prev.filter(c => c.id !== ct.id)); showToast('Contacto eliminado', 'info'); }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showContactForm && (
              <div className="parent-card border-2 border-indigo-200">
                <p className="font-bold text-sm text-slate-800 mb-3">{editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={newContact.nombre} onChange={e => setNewContact(c => ({ ...c, nombre: e.target.value }))} placeholder="Nombre completo *"
                      className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    <input type="text" value={newContact.parentesco} onChange={e => setNewContact(c => ({ ...c, parentesco: e.target.value }))} placeholder="Parentesco *"
                      className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="tel" value={newContact.telefono} onChange={e => setNewContact(c => ({ ...c, telefono: e.target.value }))} placeholder="Teléfono *"
                      className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    <input type="email" value={newContact.email} onChange={e => setNewContact(c => ({ ...c, email: e.target.value }))} placeholder="Email (opcional)"
                      className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                  </div>
                  <input type="text" value={newContact.identificacion} onChange={e => setNewContact(c => ({ ...c, identificacion: e.target.value }))} placeholder="No. Identificación (INE) *"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveContact} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Save size={14} /> {editingContact ? 'Guardar' : 'Agregar'}</button>
                    <button onClick={() => { setShowContactForm(false); setEditingContact(null); }} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

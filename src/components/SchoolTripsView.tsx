import React, { useState, useMemo } from 'react';
import {
  MapPin, Calendar, DollarSign, Users, FileText, Clock,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  Plus, Edit2, Trash2, Download, Search, Filter,
  Send, Eye, X, Save, CreditCard, Bus, Bell, Megaphone
} from 'lucide-react';
import { useToast } from './ui/Toast';
import {
  MOCK_TRIPS, MOCK_TRIP_ENROLLMENTS, MOCK_TRIP_PAYMENTS, MOCK_TRIP_REMINDERS
} from '../constants';
import type { SchoolTrip, TripEnrollment, TripPayment, TripReminder, TripStatus, EnrollmentStatus, TripPaymentStatus } from '../types';

type TabView = 'trips' | 'enrollments' | 'reminders' | 'create';

function getTripStatusConfig(status: TripStatus) {
  switch (status) {
    case 'abierto': return { label: 'Abierto', color: 'bg-emerald-100 text-emerald-700' };
    case 'cerrado': return { label: 'Cerrado', color: 'bg-red-100 text-red-700' };
    case 'borrador': return { label: 'Borrador', color: 'bg-slate-100 text-slate-500' };
    case 'completado': return { label: 'Completado', color: 'bg-blue-100 text-blue-700' };
    case 'cancelado': return { label: 'Cancelado', color: 'bg-red-100 text-red-700' };
  }
}

function getEnrollmentBadge(status: EnrollmentStatus) {
  switch (status) {
    case 'inscrito': return { label: 'Inscrito', color: 'bg-blue-100 text-blue-700' };
    case 'pagado_parcial': return { label: 'Parcial', color: 'bg-amber-100 text-amber-700' };
    case 'pagado': return { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' };
    case 'cancelado': return { label: 'Cancelado', color: 'bg-red-100 text-red-700' };
    case 'lista_espera': return { label: 'Espera', color: 'bg-purple-100 text-purple-700' };
  }
}

function formatMoney(n: number) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

const EMOJIS = ['🏕️', '🏛️', '⚽', '🎭', '🏖️', '🏔️', '🎵', '🔬', '🎨', '📚'];

const INITIAL_FORM: Omit<SchoolTrip, 'id' | 'creadoPor' | 'creadoEn' | 'actualizadoEn'> = {
  schoolId: 'mx_01',
  nombre: '', destino: '', descripcion: '',
  fechaSalida: '', fechaRegreso: '',
  costoTotal: 0, costoPorAlumno: 0,
  cupoMaximo: 40, cupoDisponible: 40,
  gradosPermitidos: [],
  status: 'borrador',
  fechaLimitePago: '', fechaLimiteInscripcion: '',
  permiteParcialidades: false, numeroParcialidades: 1,
  requiereDocumentos: false, documentosRequeridos: [],
  contactoEmergencia: '', imageEmoji: '🏕️',
};

const GRADES = ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'];

export default function SchoolTripsView() {
  const { showToast } = useToast();
  const [tabView, setTabView] = useState<TabView>('trips');
  const [trips, setTrips] = useState<SchoolTrip[]>(MOCK_TRIPS);
  const [enrollments] = useState<TripEnrollment[]>(MOCK_TRIP_ENROLLMENTS);
  const [payments] = useState<TripPayment[]>(MOCK_TRIP_PAYMENTS);
  const [reminders, setReminders] = useState<TripReminder[]>(MOCK_TRIP_REMINDERS);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TripStatus | 'todos'>('todos');

  // Create/Edit form
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState('');

  // Reminder form
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderForm, setReminderForm] = useState({ tripId: '', tipo: 'general' as TripReminder['tipo'], mensaje: '', fechaEnvio: '' });

  const filtered = useMemo(() => {
    return trips.filter(t => {
      if (filterStatus !== 'todos' && t.status !== filterStatus) return false;
      if (searchQuery && !t.nombre.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !t.destino.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [trips, filterStatus, searchQuery]);

  // Stats
  const totalInscritos = enrollments.length;
  const totalRecaudado = payments.filter(p => p.status === 'confirmado').reduce((s, p) => s + p.monto, 0);
  const totalPendiente = payments.filter(p => p.status === 'pendiente').reduce((s, p) => s + p.monto, 0);

  function handleSaveTrip() {
    if (!form.nombre || !form.destino || !form.fechaSalida) {
      showToast('Completa nombre, destino y fecha de salida', 'error'); return;
    }

    if (editingId) {
      setTrips(prev => prev.map(t => t.id === editingId ? {
        ...t, ...form, actualizadoEn: new Date().toISOString(),
      } : t));
      showToast('✅ Viaje actualizado', 'success');
    } else {
      const newTrip: SchoolTrip = {
        ...form,
        id: `trip_${Date.now()}`,
        cupoDisponible: form.cupoMaximo,
        creadoPor: 'admin_01',
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
      };
      setTrips(prev => [newTrip, ...prev]);
      showToast('✅ Viaje creado', 'success');
    }

    setForm(INITIAL_FORM); setEditingId(null); setTabView('trips');
  }

  function handleEdit(trip: SchoolTrip) {
    setForm({
      schoolId: trip.schoolId, nombre: trip.nombre, destino: trip.destino, descripcion: trip.descripcion,
      fechaSalida: trip.fechaSalida, fechaRegreso: trip.fechaRegreso,
      costoTotal: trip.costoTotal, costoPorAlumno: trip.costoPorAlumno,
      cupoMaximo: trip.cupoMaximo, cupoDisponible: trip.cupoDisponible,
      gradosPermitidos: trip.gradosPermitidos, status: trip.status,
      fechaLimitePago: trip.fechaLimitePago, fechaLimiteInscripcion: trip.fechaLimiteInscripcion,
      permiteParcialidades: trip.permiteParcialidades, numeroParcialidades: trip.numeroParcialidades,
      requiereDocumentos: trip.requiereDocumentos, documentosRequeridos: [...trip.documentosRequeridos],
      contactoEmergencia: trip.contactoEmergencia, imageEmoji: trip.imageEmoji,
      itinerario: trip.itinerario, notas: trip.notas,
    });
    setEditingId(trip.id); setTabView('create');
  }

  function handleDelete(id: string) {
    setTrips(prev => prev.filter(t => t.id !== id));
    showToast('Viaje eliminado', 'info');
  }

  function handlePublish(id: string) {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'abierto' as TripStatus, actualizadoEn: new Date().toISOString() } : t));
    showToast('🚀 Viaje publicado y abierto a inscripciones', 'success');
  }

  function handleClose(id: string) {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'cerrado' as TripStatus, actualizadoEn: new Date().toISOString() } : t));
    showToast('Inscripciones cerradas', 'info');
  }

  function handleExport() {
    const csv = [
      ['Viaje', 'Alumno', 'Grado', 'Estado', 'Pagado', 'Saldo', 'Docs Entregados'].join(','),
      ...enrollments.map(e => {
        const trip = trips.find(t => t.id === e.tripId);
        return [trip?.nombre, e.studentName, e.studentGrade, e.status, e.totalPagado, e.saldoPendiente, e.documentosEntregados.join('; ')].join(',');
      })
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inscripciones_viajes_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    showToast('📥 CSV exportado', 'success');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white">
              <MapPin size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800">Gestión de Viajes</h1>
              <p className="text-xs md:text-sm text-slate-500">Crea, administra y da seguimiento a excursiones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Viajes Activos</p>
          <p className="text-2xl font-black text-indigo-600">{trips.filter(t => t.status === 'abierto').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Inscritos</p>
          <p className="text-2xl font-black text-teal-600">{totalInscritos}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Recaudado</p>
          <p className="text-2xl font-black text-emerald-600">{formatMoney(totalRecaudado)}</p>
        </div>
        <div className={`p-4 rounded-2xl shadow-sm border ${totalPendiente > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Por cobrar</p>
          <p className={`text-2xl font-black ${totalPendiente > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{formatMoney(totalPendiente)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setTabView('trips')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tabView === 'trips' ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          🗺️ Viajes ({trips.length})
        </button>
        <button onClick={() => setTabView('enrollments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tabView === 'enrollments' ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          📝 Inscripciones ({enrollments.length})
        </button>
        <button onClick={() => setTabView('reminders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${tabView === 'reminders' ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          🔔 Recordatorios ({reminders.length})
        </button>
        <button onClick={() => { setTabView('create'); if (!editingId) { setForm(INITIAL_FORM); } }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${tabView === 'create' ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Plus size={12} /> {editingId ? 'Editando...' : 'Nuevo Viaje'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ===== TRIPS LIST ===== */}
        {tabView === 'trips' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar viaje..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-300 outline-none" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-300 outline-none">
                <option value="todos">Todos</option>
                <option value="borrador">Borradores</option>
                <option value="abierto">Abiertos</option>
                <option value="cerrado">Cerrados</option>
                <option value="completado">Completados</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <MapPin size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No hay viajes</p>
                <button onClick={() => setTabView('create')} className="mt-3 text-teal-600 text-sm font-bold hover:underline">+ Crear viaje</button>
              </div>
            ) : (
              filtered.map(trip => {
                const sc = getTripStatusConfig(trip.status);
                const isExp = expandedTrip === trip.id;
                const tripEnrollments = enrollments.filter(e => e.tripId === trip.id);
                const tripPayments = payments.filter(p => p.tripId === trip.id);
                const recaudado = tripPayments.filter(p => p.status === 'confirmado').reduce((s, p) => s + p.monto, 0);

                return (
                  <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="p-4 cursor-pointer" onClick={() => setExpandedTrip(isExp ? null : trip.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-3xl">{trip.imageEmoji || '🗺️'}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800">{trip.nombre}</p>
                            <p className="text-xs text-slate-500">{trip.destino}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(trip.fechaSalida).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                              {trip.fechaSalida !== trip.fechaRegreso && <> — {new Date(trip.fechaRegreso).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                          <span className="text-sm font-bold text-slate-700">{formatMoney(trip.costoPorAlumno)}/alumno</span>
                          {isExp ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                        <span className="px-2 py-1 bg-slate-50 rounded-lg"><Users size={10} className="inline" /> {tripEnrollments.length}/{trip.cupoMaximo} inscritos</span>
                        <span className="px-2 py-1 bg-emerald-50 rounded-lg text-emerald-700"><DollarSign size={10} className="inline" /> {formatMoney(recaudado)} recaudado</span>
                        <span className="px-2 py-1 bg-slate-50 rounded-lg">{trip.gradosPermitidos.join(', ')}</span>
                        {trip.permiteParcialidades && <span className="px-2 py-1 bg-indigo-50 rounded-lg text-indigo-600">{trip.numeroParcialidades} parcialidades</span>}
                      </div>
                    </div>

                    {isExp && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                        <p className="text-xs text-slate-600">{trip.descripcion}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Costo total</p><p className="font-bold">{formatMoney(trip.costoTotal)}</p></div>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Cupo</p><p className="font-bold">{trip.cupoDisponible} disponibles</p></div>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Lím. inscripción</p><p className="font-bold">{new Date(trip.fechaLimiteInscripcion).toLocaleDateString('es-MX')}</p></div>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Lím. pago</p><p className="font-bold">{new Date(trip.fechaLimitePago).toLocaleDateString('es-MX')}</p></div>
                        </div>

                        {trip.itinerario && (
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Itinerario</p><p className="text-xs text-slate-600 whitespace-pre-line">{trip.itinerario}</p></div>
                        )}

                        <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Contacto emergencia</p><p className="text-xs text-slate-600">{trip.contactoEmergencia}</p></div>

                        {trip.requiereDocumentos && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Documentos requeridos</p>
                            <div className="flex flex-wrap gap-1">{trip.documentosRequeridos.map(d => <span key={d} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px]">📄 {d}</span>)}</div>
                          </div>
                        )}

                        {/* Enrolled students summary */}
                        {tripEnrollments.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Alumnos inscritos ({tripEnrollments.length})</p>
                            <div className="space-y-1">
                              {tripEnrollments.map(e => {
                                const eb = getEnrollmentBadge(e.status);
                                return (
                                  <div key={e.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                                    <div>
                                      <span className="font-bold text-slate-700">{e.studentName}</span>
                                      <span className="text-slate-400 ml-2">{e.studentGrade}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-600">{formatMoney(e.totalPagado)}/{formatMoney(e.totalPagado + e.saldoPendiente)}</span>
                                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${eb.color}`}>{eb.label}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(trip); }}
                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-slate-200">
                            <Edit2 size={12} /> Editar
                          </button>
                          {trip.status === 'borrador' && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); handlePublish(trip.id); }}
                                className="px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-teal-700">
                                <Send size={12} /> Publicar
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(trip.id); }}
                                className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-red-100">
                                <Trash2 size={12} /> Eliminar
                              </button>
                            </>
                          )}
                          {trip.status === 'abierto' && (
                            <button onClick={(e) => { e.stopPropagation(); handleClose(trip.id); }}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-red-200">
                                <X size={12} /> Cerrar inscripciones
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== ENROLLMENTS TAB ===== */}
        {tabView === 'enrollments' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={handleExport} className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-100">
                <Download size={12} /> Exportar Inscripciones
              </button>
            </div>
            {enrollments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <Users size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No hay inscripciones</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Alumno</th>
                        <th className="text-left p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Viaje</th>
                        <th className="text-left p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Grado</th>
                        <th className="text-left p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Pagado</th>
                        <th className="text-left p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Saldo</th>
                        <th className="text-left p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Docs</th>
                        <th className="text-left p-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {enrollments.map(e => {
                        const trip = trips.find(t => t.id === e.tripId);
                        const eb = getEnrollmentBadge(e.status);
                        const docTotal = trip?.documentosRequeridos.length || 0;
                        return (
                          <tr key={e.id} className="hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-700">{e.studentName}</td>
                            <td className="p-3 text-slate-600">{trip?.nombre}</td>
                            <td className="p-3 text-slate-500">{e.studentGrade}</td>
                            <td className="p-3 font-bold text-emerald-600">{formatMoney(e.totalPagado)}</td>
                            <td className={`p-3 font-bold ${e.saldoPendiente > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{formatMoney(e.saldoPendiente)}</td>
                            <td className="p-3 text-slate-500">{e.documentosEntregados.length}/{docTotal}</td>
                            <td className="p-3"><span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${eb.color}`}>{eb.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== REMINDERS TAB ===== */}
        {tabView === 'reminders' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowReminderForm(!showReminderForm)}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-teal-700">
                <Plus size={12} /> Nuevo Recordatorio
              </button>
            </div>

            {/* Reminder creation form */}
            {showReminderForm && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-teal-200 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Megaphone size={16} className="text-teal-600" /> Crear Recordatorio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Viaje *</label>
                    <select value={reminderForm.tripId} onChange={e => setReminderForm(f => ({ ...f, tripId: e.target.value }))}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none">
                      <option value="">Seleccionar viaje...</option>
                      {trips.filter(t => t.status === 'abierto' || t.status === 'cerrado').map(t => (
                        <option key={t.id} value={t.id}>{t.imageEmoji} {t.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Tipo *</label>
                    <select value={reminderForm.tipo} onChange={e => setReminderForm(f => ({ ...f, tipo: e.target.value as TripReminder['tipo'] }))}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none">
                      <option value="pago">💰 Pago</option>
                      <option value="documento">📄 Documento</option>
                      <option value="inscripcion">📝 Inscripción</option>
                      <option value="general">📢 General</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Mensaje *</label>
                  <textarea value={reminderForm.mensaje} onChange={e => setReminderForm(f => ({ ...f, mensaje: e.target.value }))}
                    placeholder="Escribe el mensaje del recordatorio..." rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none resize-none" />
                </div>
                <div className="sm:w-1/2">
                  <label className="text-xs text-slate-500 mb-1 block">Fecha de envío</label>
                  <input type="datetime-local" value={reminderForm.fechaEnvio} onChange={e => setReminderForm(f => ({ ...f, fechaEnvio: e.target.value }))}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (!reminderForm.tripId || !reminderForm.mensaje.trim()) {
                      showToast('Selecciona un viaje y escribe un mensaje', 'error'); return;
                    }
                    const trip = trips.find(t => t.id === reminderForm.tripId)!;
                    const tripEnrolled = enrollments.filter(e => e.tripId === reminderForm.tripId);
                    const newReminder: TripReminder = {
                      id: `rem_${Date.now()}`,
                      tripId: reminderForm.tripId,
                      tripName: trip.nombre,
                      tipo: reminderForm.tipo,
                      mensaje: reminderForm.mensaje,
                      destinatarios: tripEnrolled.map(e => e.parentId),
                      fechaEnvio: reminderForm.fechaEnvio || new Date().toISOString(),
                      enviado: false,
                      createdAt: new Date().toISOString(),
                    };
                    setReminders(prev => [newReminder, ...prev]);
                    setReminderForm({ tripId: '', tipo: 'general', mensaje: '', fechaEnvio: '' });
                    setShowReminderForm(false);
                    showToast('✅ Recordatorio creado', 'success');
                  }} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1">
                    <Save size={14} /> Crear Recordatorio
                  </button>
                  <button onClick={() => setShowReminderForm(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">Cancelar</button>
                </div>
              </div>
            )}

            {/* Reminders list */}
            {reminders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <Bell size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No hay recordatorios</p>
                <button onClick={() => setShowReminderForm(true)} className="mt-3 text-teal-600 text-sm font-bold hover:underline">+ Crear recordatorio</button>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map(rem => {
                  const typeConfig: Record<string, { label: string; emoji: string; color: string }> = {
                    pago: { label: 'Pago', emoji: '💰', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                    documento: { label: 'Documento', emoji: '📄', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    inscripcion: { label: 'Inscripción', emoji: '📝', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                    general: { label: 'General', emoji: '📢', color: 'bg-slate-50 text-slate-700 border-slate-200' },
                  };
                  const tc = typeConfig[rem.tipo] || typeConfig.general;
                  return (
                    <div key={rem.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${rem.enviado ? 'border-slate-100 opacity-70' : 'border-slate-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${tc.color}`}>{tc.emoji} {tc.label}</span>
                            <span className="text-xs text-slate-500">{rem.tripName}</span>
                            {rem.enviado ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Enviado</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold flex items-center gap-1"><Clock size={10} /> Programado</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{rem.mensaje}</p>
                          <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                            <span><Users size={10} className="inline" /> {rem.destinatarios.length} destinatario{rem.destinatarios.length !== 1 ? 's' : ''}</span>
                            <span><Calendar size={10} className="inline" /> {new Date(rem.fechaEnvio).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!rem.enviado && (
                            <button onClick={() => {
                              setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, enviado: true, fechaEnvio: new Date().toISOString() } : r));
                              showToast(`📤 Recordatorio enviado a ${rem.destinatarios.length} padre(s)`, 'success');
                            }} className="px-3 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-bold hover:bg-teal-700 flex items-center gap-1">
                              <Send size={12} /> Enviar ahora
                            </button>
                          )}
                          <button onClick={() => {
                            setReminders(prev => prev.filter(r => r.id !== rem.id));
                            showToast('Recordatorio eliminado', 'info');
                          }} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== CREATE / EDIT TAB ===== */}
        {tabView === 'create' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">{editingId ? 'Editar Viaje' : 'Nuevo Viaje'}</h3>

              {/* Emoji picker & name */}
              <div className="flex gap-3 items-start mb-4">
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">Ícono</p>
                  <div className="flex flex-wrap gap-1 w-36">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setForm(f => ({ ...f, imageEmoji: e }))}
                        className={`text-xl p-1 rounded-lg transition-all ${form.imageEmoji === e ? 'bg-teal-100 ring-2 ring-teal-400' : 'hover:bg-slate-100'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Nombre del viaje *</label>
                    <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Campamento Sierra Gorda"
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Destino *</label>
                    <input type="text" value={form.destino} onChange={e => setForm(f => ({ ...f, destino: e.target.value }))} placeholder="Ej: Sierra Gorda, Querétaro"
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Descripción</label>
                  <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Describe el viaje..." rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none resize-none" />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-500 mb-1 block">Fecha salida *</label>
                    <input type="date" value={form.fechaSalida} onChange={e => setForm(f => ({ ...f, fechaSalida: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Fecha regreso</label>
                    <input type="date" value={form.fechaRegreso} onChange={e => setForm(f => ({ ...f, fechaRegreso: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Lím. inscripción</label>
                    <input type="date" value={form.fechaLimiteInscripcion} onChange={e => setForm(f => ({ ...f, fechaLimiteInscripcion: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Lím. pago</label>
                    <input type="date" value={form.fechaLimitePago} onChange={e => setForm(f => ({ ...f, fechaLimitePago: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
                </div>

                {/* Costs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><label className="text-xs text-slate-500 mb-1 block">Costo por alumno</label>
                    <input type="number" value={form.costoPorAlumno} onChange={e => setForm(f => ({ ...f, costoPorAlumno: Number(e.target.value) }))} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Cupo máximo</label>
                    <input type="number" value={form.cupoMaximo} onChange={e => setForm(f => ({ ...f, cupoMaximo: Number(e.target.value) }))} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Costo total estimado</label>
                    <input type="number" value={form.costoTotal} onChange={e => setForm(f => ({ ...f, costoTotal: Number(e.target.value) }))} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
                </div>

                {/* Grades */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">Grados permitidos</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADES.map(g => (
                      <button key={g} onClick={() => setForm(f => ({
                        ...f,
                        gradosPermitidos: f.gradosPermitidos.includes(g) ? f.gradosPermitidos.filter(gg => gg !== g) : [...f.gradosPermitidos, g],
                      }))} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${form.gradosPermitidos.includes(g) ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Installments toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">Permitir parcialidades</p><p className="text-[10px] text-slate-400">Los padres podrán pagar en plazos</p></div>
                  <button onClick={() => setForm(f => ({ ...f, permiteParcialidades: !f.permiteParcialidades }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.permiteParcialidades ? 'bg-teal-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${form.permiteParcialidades ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {form.permiteParcialidades && (
                  <div><label className="text-xs text-slate-500 mb-1 block">Número de parcialidades</label>
                    <input type="number" value={form.numeroParcialidades} min={2} max={12} onChange={e => setForm(f => ({ ...f, numeroParcialidades: Number(e.target.value) }))}
                      className="w-24 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
                )}

                {/* Documents */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">Requerir documentos</p><p className="text-[10px] text-slate-400">Carta responsiva, INE, etc.</p></div>
                  <button onClick={() => setForm(f => ({ ...f, requiereDocumentos: !f.requiereDocumentos }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.requiereDocumentos ? 'bg-teal-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${form.requiereDocumentos ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {form.requiereDocumentos && (
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {form.documentosRequeridos.map((d, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs">
                          📄 {d} <button onClick={() => setForm(f => ({ ...f, documentosRequeridos: f.documentosRequeridos.filter((_, idx) => idx !== i) }))}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newDoc} onChange={e => setNewDoc(e.target.value)} placeholder="Ej: Carta responsiva"
                        className="flex-1 p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-300 outline-none" />
                      <button onClick={() => { if (newDoc.trim()) { setForm(f => ({ ...f, documentosRequeridos: [...f.documentosRequeridos, newDoc.trim()] })); setNewDoc(''); } }}
                        className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold">+ Agregar</button>
                    </div>
                  </div>
                )}

                {/* Itinerary */}
                <div><label className="text-xs text-slate-500 mb-1 block">Itinerario</label>
                  <textarea value={form.itinerario || ''} onChange={e => setForm(f => ({ ...f, itinerario: e.target.value }))} placeholder="Describe el itinerario día a día..." rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none resize-none" /></div>

                {/* Emergency contact */}
                <div><label className="text-xs text-slate-500 mb-1 block">Contacto de emergencia</label>
                  <input type="text" value={form.contactoEmergencia} onChange={e => setForm(f => ({ ...f, contactoEmergencia: e.target.value }))} placeholder="Nombre y teléfono"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300 outline-none" /></div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveTrip}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2">
                  <Save size={16} /> {editingId ? 'Guardar Cambios' : 'Crear como Borrador'}
                </button>
                <button onClick={() => { setTabView('trips'); setEditingId(null); setForm(INITIAL_FORM); }}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

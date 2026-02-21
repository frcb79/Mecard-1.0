import React, { useState, useMemo } from 'react';
import {
  MapPin, Calendar, DollarSign, Users, FileText, Clock,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  CreditCard, Download, Star, Bus, ChevronRight, X
} from 'lucide-react';
import { useToast } from './ui/Toast';
import {
  MOCK_TRIPS, MOCK_TRIP_ENROLLMENTS, MOCK_TRIP_PAYMENTS
} from '../constants';
import type { SchoolTrip, TripEnrollment, TripPayment, EnrollmentStatus, TripPaymentStatus } from '../types';

type TabView = 'available' | 'enrolled' | 'payments';

const MOCK_CHILDREN = [
  { id: '2024001', name: 'Santiago González', photo: '👦', grade: '4° Primaria' },
  { id: '2024002', name: 'Ana García', photo: '👧', grade: '2° Primaria' },
];

function getTripStatusConfig(status: string) {
  switch (status) {
    case 'abierto': return { label: 'Inscripciones Abiertas', color: 'bg-emerald-100 text-emerald-700' };
    case 'cerrado': return { label: 'Cerrado', color: 'bg-red-100 text-red-700' };
    case 'borrador': return { label: 'Próximamente', color: 'bg-slate-100 text-slate-500' };
    case 'completado': return { label: 'Completado', color: 'bg-blue-100 text-blue-700' };
    case 'cancelado': return { label: 'Cancelado', color: 'bg-red-100 text-red-700' };
    default: return { label: status, color: 'bg-slate-100 text-slate-500' };
  }
}

function getEnrollmentBadge(status: EnrollmentStatus) {
  switch (status) {
    case 'inscrito': return { label: 'Inscrito', color: 'bg-blue-100 text-blue-700' };
    case 'pagado_parcial': return { label: 'Pago Parcial', color: 'bg-amber-100 text-amber-700' };
    case 'pagado': return { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' };
    case 'cancelado': return { label: 'Cancelado', color: 'bg-red-100 text-red-700' };
    case 'lista_espera': return { label: 'Lista de Espera', color: 'bg-purple-100 text-purple-700' };
  }
}

function getPaymentBadge(status: TripPaymentStatus) {
  switch (status) {
    case 'pendiente': return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' };
    case 'confirmado': return { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' };
    case 'rechazado': return { label: 'Rechazado', color: 'bg-red-100 text-red-700' };
  }
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatMoney(n: number) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

export default function ParentTripsView() {
  const { showToast } = useToast();
  const [tabView, setTabView] = useState<TabView>('available');
  const [trips] = useState<SchoolTrip[]>(MOCK_TRIPS);
  const [enrollments, setEnrollments] = useState<TripEnrollment[]>(MOCK_TRIP_ENROLLMENTS);
  const [payments, setPayments] = useState<TripPayment[]>(MOCK_TRIP_PAYMENTS);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [enrollingTrip, setEnrollingTrip] = useState<string | null>(null);
  const [enrollChild, setEnrollChild] = useState('');
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState('SPEI');

  const myEnrollments = useMemo(() => enrollments.filter(e => e.parentId === 'parent_01'), [enrollments]);
  const enrolledTripIds = useMemo(() => new Set(myEnrollments.map(e => e.tripId)), [myEnrollments]);

  const availableTrips = useMemo(() => trips.filter(t => t.status === 'abierto' || t.status === 'borrador'), [trips]);

  const pendingPayments = useMemo(() => payments.filter(p => p.status === 'pendiente'), [payments]);

  function handleEnroll(tripId: string) {
    if (!enrollChild) { showToast('Selecciona un alumno', 'error'); return; }
    const trip = trips.find(t => t.id === tripId)!;
    const child = MOCK_CHILDREN.find(c => c.id === enrollChild)!;

    if (!trip.gradosPermitidos.includes(child.grade)) {
      showToast(`${child.name} no está en los grados permitidos`, 'error'); return;
    }

    const enrollment: TripEnrollment = {
      id: `enroll_${Date.now()}`,
      tripId, studentId: child.id, studentName: child.name, studentGrade: child.grade,
      parentId: 'parent_01', parentName: 'María González',
      status: 'inscrito', totalPagado: 0, saldoPendiente: trip.costoPorAlumno,
      documentosEntregados: [], approvedByParent: true, approvalDate: new Date().toISOString(),
      inscritoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString(),
    };

    setEnrollments(prev => [...prev, enrollment]);

    // Generate installment payment records
    if (trip.permiteParcialidades && trip.numeroParcialidades > 1) {
      const montoParcialidad = Math.ceil(trip.costoPorAlumno / trip.numeroParcialidades);
      const newPayments: TripPayment[] = Array.from({ length: trip.numeroParcialidades }, (_, i) => ({
        id: `pay_${Date.now()}_${i}`, enrollmentId: enrollment.id, tripId, studentId: child.id, studentName: child.name,
        monto: montoParcialidad, parcialidad: i + 1, totalParcialidades: trip.numeroParcialidades,
        metodoPago: '', status: 'pendiente' as TripPaymentStatus,
        fechaPago: '', fechaLimite: trip.fechaLimitePago, createdAt: new Date().toISOString(),
      }));
      setPayments(prev => [...prev, ...newPayments]);
    } else {
      setPayments(prev => [...prev, {
        id: `pay_${Date.now()}`, enrollmentId: enrollment.id, tripId, studentId: child.id, studentName: child.name,
        monto: trip.costoPorAlumno, parcialidad: 1, totalParcialidades: 1,
        metodoPago: '', status: 'pendiente' as TripPaymentStatus,
        fechaPago: '', fechaLimite: trip.fechaLimitePago, createdAt: new Date().toISOString(),
      }]);
    }

    setEnrollingTrip(null); setEnrollChild('');
    showToast(`✅ ${child.name} inscrito en ${trip.nombre}`, 'success');
    setTabView('enrolled');
  }

  function handlePay(paymentId: string) {
    setPayments(prev => prev.map(p =>
      p.id === paymentId ? {
        ...p, status: 'confirmado' as TripPaymentStatus, metodoPago: payMethod, fechaPago: new Date().toISOString(),
      } : p
    ));

    const payment = payments.find(p => p.id === paymentId)!;
    setEnrollments(prev => prev.map(e => {
      if (e.id === payment.enrollmentId) {
        const newPagado = e.totalPagado + payment.monto;
        const newSaldo = e.saldoPendiente - payment.monto;
        const trip = trips.find(t => t.id === e.tripId)!;
        return {
          ...e, totalPagado: newPagado, saldoPendiente: Math.max(0, newSaldo),
          status: newSaldo <= 0 ? 'pagado' as EnrollmentStatus : 'pagado_parcial' as EnrollmentStatus,
          actualizadoEn: new Date().toISOString(),
        };
      }
      return e;
    }));

    setShowPayModal(null);
    showToast('💳 Pago registrado exitosamente', 'success');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white">
            <MapPin size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Viajes y Excursiones</h1>
            <p className="text-xs md:text-sm text-slate-500">Inscripciones, pagos y documentos</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {pendingPayments.length > 0 && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Tienes <strong>{pendingPayments.length} pago(s) pendiente(s)</strong> por un total de <strong>{formatMoney(pendingPayments.reduce((s, p) => s + p.monto, 0))}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'available' as TabView, label: `🗺️ Viajes (${availableTrips.length})` },
            { key: 'enrolled' as TabView, label: `📝 Mis Inscripciones (${myEnrollments.length})` },
            { key: 'payments' as TabView, label: `💳 Pagos (${pendingPayments.length} pend.)` },
          ].map(t => (
            <button key={t.key} onClick={() => setTabView(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tabView === t.key ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* ===== AVAILABLE TRIPS ===== */}
        {tabView === 'available' && (
          <div className="space-y-4">
            {availableTrips.length === 0 ? (
              <div className="parent-card text-center py-12">
                <MapPin size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No hay viajes disponibles</p>
              </div>
            ) : (
              availableTrips.map(trip => {
                const sc = getTripStatusConfig(trip.status);
                const isExp = expandedTrip === trip.id;
                const isEnrolled = enrolledTripIds.has(trip.id);
                const daysLeft = daysUntil(trip.fechaLimiteInscripcion);
                const isBorrador = trip.status === 'borrador';

                return (
                  <div key={trip.id} className={`parent-card hover:shadow-md transition-shadow ${isBorrador ? 'opacity-70' : ''}`}>
                    <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedTrip(isExp ? null : trip.id)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl">{trip.imageEmoji || '🗺️'}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800">{trip.nombre}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {trip.destino}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={10} /> {new Date(trip.fechaSalida).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                            {trip.fechaSalida !== trip.fechaRegreso && <> — {new Date(trip.fechaRegreso).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</>}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                        <span className="text-lg font-black text-slate-700">{formatMoney(trip.costoPorAlumno)}</span>
                        {isExp ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Quick info strip */}
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                      <span className="px-2 py-1 bg-slate-50 rounded-lg text-slate-600 flex items-center gap-1"><Users size={10} /> {trip.cupoMaximo - trip.cupoDisponible}/{trip.cupoMaximo}</span>
                      {trip.permiteParcialidades && <span className="px-2 py-1 bg-indigo-50 rounded-lg text-indigo-600 flex items-center gap-1"><CreditCard size={10} /> {trip.numeroParcialidades} parcialidades</span>}
                      {trip.requiereDocumentos && <span className="px-2 py-1 bg-amber-50 rounded-lg text-amber-600 flex items-center gap-1"><FileText size={10} /> {trip.documentosRequeridos.length} docs</span>}
                      <span className="px-2 py-1 bg-slate-50 rounded-lg text-slate-500">Grados: {trip.gradosPermitidos.join(', ')}</span>
                      {!isBorrador && daysLeft > 0 && <span className={`px-2 py-1 rounded-lg font-bold ${daysLeft <= 7 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}><Clock size={10} className="inline" /> {daysLeft} días para inscribirse</span>}
                    </div>

                    {isEnrolled && <div className="mt-2 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 size={10} /> Ya inscrito</div>}

                    {isExp && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        <p className="text-xs text-slate-600">{trip.descripcion}</p>
                        {trip.itinerario && (
                          <div><p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Itinerario</p><p className="text-xs text-slate-600 whitespace-pre-line">{trip.itinerario}</p></div>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Fecha límite inscripción</p><p className="text-slate-700">{new Date(trip.fechaLimiteInscripcion).toLocaleDateString('es-MX')}</p></div>
                          <div><p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Fecha límite pago</p><p className="text-slate-700">{new Date(trip.fechaLimitePago).toLocaleDateString('es-MX')}</p></div>
                          <div><p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Contacto emergencia</p><p className="text-slate-700">{trip.contactoEmergencia}</p></div>
                          <div><p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Cupo disponible</p><p className="text-slate-700">{trip.cupoDisponible} lugares</p></div>
                        </div>
                        {trip.requiereDocumentos && (
                          <div>
                            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Documentos requeridos</p>
                            <div className="flex flex-wrap gap-1">
                              {trip.documentosRequeridos.map(d => <span key={d} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px]">📄 {d}</span>)}
                            </div>
                          </div>
                        )}

                        {!isEnrolled && !isBorrador && (
                          enrollingTrip === trip.id ? (
                            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
                              <p className="font-bold text-sm text-teal-800">Inscribir alumno</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {MOCK_CHILDREN.map(c => (
                                  <button key={c.id} onClick={() => setEnrollChild(c.id)}
                                    className={`p-3 rounded-xl border-2 text-left flex items-center gap-2 transition-all ${enrollChild === c.id ? 'border-teal-500 bg-teal-100' : 'border-slate-200 hover:border-slate-300 bg-white'} ${!trip.gradosPermitidos.includes(c.grade) ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    disabled={!trip.gradosPermitidos.includes(c.grade)}>
                                    <span className="text-xl">{c.photo}</span>
                                    <div>
                                      <p className="font-bold text-xs text-slate-800">{c.name}</p>
                                      <p className="text-[10px] text-slate-500">{c.grade}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEnroll(trip.id)} disabled={!enrollChild}
                                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-colors">
                                  Confirmar Inscripción
                                </button>
                                <button onClick={() => { setEnrollingTrip(null); setEnrollChild(''); }}
                                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setEnrollingTrip(trip.id)}
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                              <ChevronRight size={16} /> Inscribir a mi hijo
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== ENROLLED TAB ===== */}
        {tabView === 'enrolled' && (
          <div className="space-y-4">
            {myEnrollments.length === 0 ? (
              <div className="parent-card text-center py-12">
                <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No hay inscripciones</p>
                <button onClick={() => setTabView('available')} className="mt-3 text-teal-600 text-sm font-bold hover:underline">Ver viajes disponibles</button>
              </div>
            ) : (
              myEnrollments.map(enrollment => {
                const trip = trips.find(t => t.id === enrollment.tripId);
                if (!trip) return null;
                const eb = getEnrollmentBadge(enrollment.status);
                const ePayments = payments.filter(p => p.enrollmentId === enrollment.id);
                const payProgress = trip.costoPorAlumno > 0 ? (enrollment.totalPagado / trip.costoPorAlumno) * 100 : 0;
                const docProgress = trip.documentosRequeridos.length > 0 ? (enrollment.documentosEntregados.length / trip.documentosRequeridos.length) * 100 : 100;

                return (
                  <div key={enrollment.id} className="parent-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{trip.imageEmoji || '🗺️'}</span>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{trip.nombre}</p>
                          <p className="text-xs text-slate-500">{enrollment.studentName} • {enrollment.studentGrade}</p>
                          <p className="text-xs text-slate-400">{new Date(trip.fechaSalida).toLocaleDateString('es-MX', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${eb.color}`}>{eb.label}</span>
                    </div>

                    {/* Payment progress */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">💰 Pago</span>
                        <span className="font-bold text-slate-700">{formatMoney(enrollment.totalPagado)} / {formatMoney(trip.costoPorAlumno)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${payProgress >= 100 ? 'bg-emerald-400' : payProgress > 0 ? 'bg-amber-400' : 'bg-slate-200'}`}
                          style={{ width: `${Math.min(payProgress, 100)}%` }} />
                      </div>
                    </div>

                    {/* Documents progress */}
                    {trip.requiereDocumentos && trip.documentosRequeridos.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">📄 Documentos</span>
                          <span className="font-bold text-slate-700">{enrollment.documentosEntregados.length} / {trip.documentosRequeridos.length}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${docProgress >= 100 ? 'bg-emerald-400' : docProgress > 0 ? 'bg-amber-400' : 'bg-slate-200'}`}
                            style={{ width: `${Math.min(docProgress, 100)}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {trip.documentosRequeridos.map(doc => {
                            const delivered = enrollment.documentosEntregados.includes(doc);
                            return (
                              <span key={doc} className={`px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 ${delivered ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                {delivered ? <CheckCircle2 size={10} /> : <X size={10} />} {doc}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Installment breakdown */}
                    {ePayments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parcialidades</p>
                        <div className="space-y-1">
                          {ePayments.map(pay => {
                            const pb = getPaymentBadge(pay.status);
                            return (
                              <div key={pay.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-medium text-slate-600">#{pay.parcialidad}/{pay.totalParcialidades}</span>
                                  <span className="text-slate-700 font-bold">{formatMoney(pay.monto)}</span>
                                  {pay.metodoPago && <span className="text-slate-400">({pay.metodoPago})</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${pb.color}`}>{pb.label}</span>
                                  {pay.status === 'pendiente' && (
                                    <button onClick={() => { setShowPayModal(pay.id); setPayMethod('SPEI'); }}
                                      className="px-2 py-1 bg-teal-600 text-white rounded-lg text-[10px] font-bold hover:bg-teal-700">
                                      Pagar
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== PAYMENTS TAB ===== */}
        {tabView === 'payments' && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="parent-card text-center py-12">
                <CreditCard size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No hay pagos registrados</p>
              </div>
            ) : (
              <>
                {pendingPayments.length > 0 && (
                  <>
                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider">Pendientes</h3>
                    {pendingPayments.map(pay => {
                      const trip = trips.find(t => t.id === pay.tripId);
                      const dLeft = daysUntil(pay.fechaLimite);
                      return (
                        <div key={pay.id} className={`parent-card border-l-4 ${dLeft <= 3 ? 'border-l-red-400' : 'border-l-amber-400'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-sm text-slate-800">{trip?.nombre || 'Viaje'}</p>
                              <p className="text-xs text-slate-500">{pay.studentName} • Parcialidad {pay.parcialidad}/{pay.totalParcialidades}</p>
                              <p className="text-xs text-slate-400">Vence: {new Date(pay.fechaLimite).toLocaleDateString('es-MX')} {dLeft > 0 ? `(${dLeft} días)` : <span className="text-red-500 font-bold">¡VENCIDO!</span>}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-slate-800">{formatMoney(pay.monto)}</p>
                              <button onClick={() => { setShowPayModal(pay.id); setPayMethod('SPEI'); }}
                                className="mt-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-[10px] font-bold hover:bg-teal-700">
                                Pagar ahora
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {payments.filter(p => p.status === 'confirmado').length > 0 && (
                  <>
                    <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mt-6">Confirmados</h3>
                    {payments.filter(p => p.status === 'confirmado').map(pay => {
                      const trip = trips.find(t => t.id === pay.tripId);
                      return (
                        <div key={pay.id} className="parent-card opacity-75">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 size={20} className="text-emerald-500" />
                              <div>
                                <p className="font-bold text-sm text-slate-700">{trip?.nombre}</p>
                                <p className="text-xs text-slate-500">{pay.studentName} • #{pay.parcialidad}/{pay.totalParcialidades} • {pay.metodoPago}</p>
                                <p className="text-[10px] text-slate-400">{new Date(pay.fechaPago).toLocaleDateString('es-MX')}</p>
                              </div>
                            </div>
                            <p className="font-bold text-emerald-700">{formatMoney(pay.monto)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ===== PAY MODAL ===== */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800">Registrar Pago</h3>
              <button onClick={() => setShowPayModal(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            </div>
            {(() => {
              const pay = payments.find(p => p.id === showPayModal);
              if (!pay) return null;
              return (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Monto a pagar</p>
                    <p className="text-3xl font-black text-slate-800">{formatMoney(pay.monto)}</p>
                    <p className="text-xs text-slate-400">Parcialidad {pay.parcialidad} de {pay.totalParcialidades}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-2 block font-medium">Método de pago</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['SPEI', 'Tarjeta', 'Efectivo'].map(m => (
                        <button key={m} onClick={() => setPayMethod(m)}
                          className={`p-2 rounded-xl text-xs font-bold border-2 transition-all ${payMethod === m ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handlePay(pay.id)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <CreditCard size={16} /> Confirmar Pago
                  </button>
                  <p className="text-[10px] text-center text-slate-400">En producción esto se conectará a tu banco o pasarela de pago</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Users, DollarSign, FileText, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { MOCK_TRIPS, MOCK_TRIP_ENROLLMENTS, MOCK_TRIP_PAYMENTS } from '../constants';

type Filter = 'all' | 'enrolled' | 'available';

export default function StudentTripsView() {
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const studentId = '2024001'; // Santiago
  const studentGrade = '4° Primaria';

  // Trips the student is enrolled in
  const myEnrollments = MOCK_TRIP_ENROLLMENTS.filter(e => e.studentId === studentId);
  const enrolledTripIds = new Set(myEnrollments.map(e => e.tripId));

  // Only show trips open/published for the student's grade
  const visibleTrips = MOCK_TRIPS.filter(t =>
    t.status !== 'borrador' && t.gradosPermitidos.includes(studentGrade)
  );

  const filtered = filter === 'all' ? visibleTrips
    : filter === 'enrolled' ? visibleTrips.filter(t => enrolledTripIds.has(t.id))
    : visibleTrips.filter(t => !enrolledTripIds.has(t.id));

  const statusBadge = (enrollment?: typeof myEnrollments[0]) => {
    if (!enrollment) return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">No inscrito</span>;
    const map: Record<string, { bg: string; text: string; label: string }> = {
      inscrito: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Inscrito' },
      pagado_parcial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pago parcial' },
      pagado_completo: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pagado' },
      cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
    };
    const s = map[enrollment.status] || map.inscrito;
    return <span className={`px-2 py-0.5 rounded-full ${s.bg} ${s.text} text-[10px] font-bold`}>{s.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
            <MapPin size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Mis Viajes</h1>
            <p className="text-xs text-slate-500">Excursiones y salidas del colegio</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {([
            { id: 'all' as Filter, label: 'Todos' },
            { id: 'enrolled' as Filter, label: 'Inscritos' },
            { id: 'available' as Filter, label: 'Disponibles' },
          ]).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Trip Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <MapPin className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm text-slate-500 font-bold">No hay viajes en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(trip => {
              const enrollment = myEnrollments.find(e => e.tripId === trip.id);
              const payments = MOCK_TRIP_PAYMENTS.filter(p => p.tripId === trip.id && p.studentId === studentId);
              const expanded = expandedId === trip.id;
              const isMultiDay = trip.fechaSalida !== trip.fechaRegreso;

              return (
                <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Card Header */}
                  <div className="p-4 md:p-5 cursor-pointer" onClick={() => setExpandedId(expanded ? null : trip.id)}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{trip.imageEmoji || '🗺️'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-800">{trip.nombre}</h3>
                          {statusBadge(enrollment)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin size={12} /> {trip.destino}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(trip.fechaSalida).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                            {isMultiDay && ` - ${new Date(trip.fechaRegreso).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}`}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <DollarSign size={12} /> ${(trip.costoPorAlumno / 100).toFixed(0)}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users size={12} /> {trip.cupoDisponible} lugares
                          </span>
                        </div>
                      </div>
                      {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-slate-100 pt-4">
                      <p className="text-sm text-slate-600 mb-4">{trip.descripcion}</p>

                      {trip.itinerario && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1"><Clock size={12} /> Itinerario</h4>
                          <p className="text-xs text-slate-500">{trip.itinerario}</p>
                        </div>
                      )}

                      {/* Enrollment Info */}
                      {enrollment && (
                        <div className="bg-emerald-50 rounded-xl p-3 mb-4 border border-emerald-100">
                          <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1"><CheckCircle size={12} /> Mi Inscripción</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-emerald-600 font-bold">Pagado</p>
                              <p className="text-sm font-black text-emerald-800">${(enrollment.totalPagado / 100).toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-emerald-600 font-bold">Pendiente</p>
                              <p className="text-sm font-black text-emerald-800">${(enrollment.saldoPendiente / 100).toFixed(0)}</p>
                            </div>
                          </div>

                          {/* Docs */}
                          {trip.requiereDocumentos && (
                            <div className="mt-3 pt-3 border-t border-emerald-200">
                              <p className="text-[10px] font-bold text-emerald-700 mb-1">📄 Documentos</p>
                              {trip.documentosRequeridos?.map(doc => {
                                const delivered = enrollment.documentosEntregados.includes(doc);
                                return (
                                  <div key={doc} className="flex items-center gap-1.5 text-xs">
                                    {delivered ? <CheckCircle size={10} className="text-emerald-600" /> : <AlertCircle size={10} className="text-amber-500" />}
                                    <span className={delivered ? 'text-emerald-700' : 'text-amber-600'}>{doc}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Payment History */}
                          {payments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-emerald-200">
                              <p className="text-[10px] font-bold text-emerald-700 mb-1">💰 Pagos</p>
                              {payments.map(p => (
                                <div key={p.id} className="flex items-center justify-between text-xs py-1">
                                  <span className="text-emerald-700">Parcialidad {p.parcialidad}/{p.totalParcialidades}</span>
                                  <span className={`font-bold ${p.status === 'confirmado' ? 'text-emerald-700' : 'text-amber-600'}`}>
                                    ${(p.monto / 100).toFixed(0)} • {p.status === 'confirmado' ? '✓' : '⏳'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Not enrolled info */}
                      {!enrollment && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={14} className="text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-slate-600">No estás inscrito</p>
                              <p className="text-[10px] text-slate-400">Tu papá o mamá puede inscribirte desde su portal.</p>
                              <p className="text-[10px] text-slate-400 mt-1">Fecha límite: {new Date(trip.fechaLimiteInscripcion).toLocaleDateString('es-MX', { month: 'long', day: 'numeric' })}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      {trip.contactoEmergencia && (
                        <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">📞 Emergencia: {trip.contactoEmergencia}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Demo Banner */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-700 font-bold">🎮 Modo Demo — Solo lectura. Tu papá/mamá te inscribe desde su portal.</p>
        </div>
      </div>
    </div>
  );
}

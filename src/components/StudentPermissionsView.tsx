import React, { useState } from 'react';
import { ShieldCheck, Calendar, Clock, Car, Bus, UserCheck, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { MOCK_EXIT_PERMISSIONS } from '../constants';

type Filter = 'all' | 'active' | 'past';

export default function StudentPermissionsView() {
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const studentId = '2024001'; // Santiago
  const myPerms = MOCK_EXIT_PERMISSIONS.filter(p => p.childId === studentId);

  const now = new Date();
  const filtered = filter === 'all' ? myPerms
    : filter === 'active' ? myPerms.filter(p => new Date(p.fecha) >= now)
    : myPerms.filter(p => new Date(p.fecha) < now);

  const statusConfig: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
    aprobado: { icon: <CheckCircle size={12} />, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aprobado' },
    pendiente: { icon: <AlertCircle size={12} />, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
    rechazado: { icon: <XCircle size={12} />, bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' },
    cancelado: { icon: <XCircle size={12} />, bg: 'bg-slate-100', text: 'text-slate-500', label: 'Cancelado' },
  };

  const transportIcons: Record<string, { icon: React.ReactNode; label: string }> = {
    bus_alterno: { icon: <Bus size={14} />, label: 'Camión alterno' },
    auto_particular: { icon: <Car size={14} />, label: 'Auto particular' },
    no_asiste: { icon: <XCircle size={14} />, label: 'No asiste' },
    caminando: { icon: <UserCheck size={14} />, label: 'Caminando' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Mis Permisos</h1>
            <p className="text-xs text-slate-500">Permisos de salida creados por mis papás</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {([
            { id: 'all' as Filter, label: 'Todos' },
            { id: 'active' as Filter, label: 'Próximos' },
            { id: 'past' as Filter, label: 'Pasados' },
          ]).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Permissions List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <ShieldCheck className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm text-slate-500 font-bold">No hay permisos en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(perm => {
              const st = statusConfig[perm.status] || statusConfig.pendiente;
              const transport = transportIcons[perm.transporte] || { icon: <Car size={14} />, label: perm.transporte };
              const expanded = expandedId === perm.id;

              return (
                <div key={perm.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : perm.id)}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.bg}`}>
                        <span className={st.text}>{st.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-800">{perm.motivo}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(perm.fecha).toLocaleDateString('es-MX', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          {perm.horaSalida && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={12} /> {perm.horaSalida}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            {transport.icon} {transport.label}
                          </span>
                        </div>
                      </div>
                      {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                      {/* Created By */}
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-600">Creado por: <span className="font-bold">{perm.createdByName}</span></span>
                      </div>

                      {/* Transport Details */}
                      {perm.transporteDetalle && (
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                          <p className="text-xs text-teal-700 flex items-center gap-1">
                            {transport.icon} {perm.transporteDetalle}
                          </p>
                        </div>
                      )}

                      {/* Bus change */}
                      {perm.transporte === 'bus_alterno' && perm.busDestino && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <p className="text-[10px] text-blue-600 font-bold mb-1">Cambio de Ruta</p>
                          <div className="flex items-center gap-2 text-xs text-blue-700">
                            <span>{perm.busOriginal}</span>
                            <span className="text-blue-400">→</span>
                            <span className="font-bold">{perm.busDestino}</span>
                          </div>
                        </div>
                      )}

                      {/* Authorized Person */}
                      {perm.personaAutorizada && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <p className="text-[10px] text-slate-600 font-bold mb-1">👤 Persona Autorizada</p>
                          <p className="text-xs font-bold text-slate-800">{perm.personaAutorizada.nombre}</p>
                          <p className="text-[10px] text-slate-500">{perm.personaAutorizada.parentesco}</p>
                        </div>
                      )}

                      {/* Approval status */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 mb-1">Aprobaciones:</p>
                        <div className="flex flex-wrap gap-2">
                          {perm.approvals.map((a, i) => {
                            const as2 = statusConfig[a.status] || statusConfig.pendiente;
                            return (
                              <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${as2.bg} ${as2.text}`}>
                                {a.parentName}: {as2.label}
                              </span>
                            );
                          })}
                          {perm.schoolApproval && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig[perm.schoolApproval.status]?.bg || 'bg-slate-100'} ${statusConfig[perm.schoolApproval.status]?.text || 'text-slate-500'}`}>
                              Colegio: {statusConfig[perm.schoolApproval.status]?.label || perm.schoolApproval.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Demo Banner */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-700 font-bold">🎮 Modo Demo — Solo lectura. Tus papás crean permisos desde su portal.</p>
        </div>
      </div>
    </div>
  );
}

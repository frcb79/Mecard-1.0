/**
 * SUPERADMIN SCHOOL BLOCKING MANAGEMENT
 * Panel para gestionar escuelas bloqueadas por impago
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertTriangle,
  Clock,
  DollarSign,
  Unlock,
  RefreshCw,
  Scale,
  FileText,
} from 'lucide-react';
import { Button } from '../Button';
import {
  checkAndApplyBlockingRules,
  getBlockedSchools,
  getBlockingDetails,
  unblockSchool,
  formatCurrency,
  getSchoolInvoices,
} from '../../services/BillingService';
import type {
  BlockingDetails,
} from '../../services/BillingService';
import type { Invoice } from '../../types';

interface BlockedSchoolDetail extends BlockingDetails {
  schoolId: string;
}

export default function SchoolBlockingManagement() {
  const [blockedSchools, setBlockedSchools] = useState<BlockedSchoolDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<BlockedSchoolDetail | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedSchools();
  }, []);

  const loadBlockedSchools = async () => {
    setLoading(true);
    try {
      const blocked = await getBlockedSchools();
      const details = await Promise.all(
        blocked.map(async (rule) => ({
          ...await getBlockingDetails(rule.schoolId),
          schoolId: rule.schoolId,
        }))
      );
      setBlockedSchools(details);
      setLastCheck(new Date().toLocaleTimeString('es-MX'));
    } catch (error) {
      console.error('Error loading blocked schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAndApplyRules = async () => {
    setExecuting(true);
    try {
      const applied = await checkAndApplyBlockingRules();
      setMessage({
        type: 'success',
        text: `✅ Verificación completada. ${applied.length} escuela(s) bloqueadas.`,
      });
      await loadBlockedSchools();
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error en verificación: ${error}`,
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleUnblockSchool = async (schoolId: string) => {
    try {
      const success = await unblockSchool(schoolId);
      if (success) {
        setMessage({
          type: 'success',
          text: `✅ Escuela ${schoolId} desbloqueada.`,
        });
        setSelectedSchool(null);
        await loadBlockedSchools();
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error desbloqueando escuela: ${error}`,
      });
    }
  };

  const getEscalationColor = (daysUntilLegal: number) => {
    if (daysUntilLegal <= 0) return 'bg-rose-100 text-rose-700 border border-rose-200';
    if (daysUntilLegal <= 7) return 'bg-rose-50 text-rose-700 border border-rose-200';
    if (daysUntilLegal <= 14) return 'bg-orange-50 text-orange-700 border border-orange-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600 font-medium">Cargando escuelas bloqueadas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-rose-600 p-3 rounded-xl">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900">Gestión de Bloqueos</h1>
                <p className="text-slate-500 text-sm font-medium">
                  Escuelas suspendidas por impago automático ({blockedSchools.length})
                </p>
              </div>
            </div>

            <Button
              onClick={handleCheckAndApplyRules}
              disabled={executing}
              className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Verificar Ahora
                </>
              )}
            </Button>
          </div>

          {lastCheck && (
            <p className="text-slate-400 text-xs font-medium">
              Última verificación: {lastCheck}
            </p>
          )}
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-6 rounded-[32px] p-4 border-2 flex items-center gap-3 animate-in slide-in-from-top ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className={`font-bold ${message.type === 'success' ? 'text-emerald-900' : 'text-red-900'}`}>
              {message.text}
            </div>
          </div>
        )}

        {/* ALERT BOX */}
        <div className="bg-rose-50 border border-rose-200 rounded-[32px] p-6 mb-8 text-rose-700">
          <p className="font-bold text-sm">
            🚨 <strong>Acción Automática:</strong> Estas escuelas están bloqueadas. Sus estudiantes NO
            pueden hacer depósitos, compras, ni acceder al sistema. Después de 60 días se escala a
            cobranzas legales.
          </p>
        </div>

        {/* NO BLOCKED SCHOOLS */}
        {blockedSchools.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-slate-200 ring-1 ring-inset ring-slate-100">
            <Lock className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              ¡Excelente!
            </h2>
            <p className="text-slate-600 font-medium">
              No hay escuelas bloqueadas en este momento. Todos los pagos están al día.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedSchools.map((school) => (
              <div
                key={school.schoolId}
                className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
                onClick={() => setSelectedSchool(school)}
              >
                <div className="p-6 border-l-4 border-red-600 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  {/* School ID & Status */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-2">
                      Escuela
                    </p>
                    <p className="text-lg font-black text-slate-900">{school.schoolId}</p>
                  </div>

                  {/* Days Overdue */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-2">
                      Días Vencida
                    </p>
                    <p className={`text-2xl font-black ${school.rule?.overdueDays && school.rule.overdueDays > 30 ? 'text-red-600' : 'text-orange-600'}`}>
                      {school.rule?.overdueDays || 0}
                    </p>
                  </div>

                  {/* Total Owed */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-2">
                      Monto Adeudado
                    </p>
                    <p className="text-lg font-black text-red-600">
                      {formatCurrency(school.totalOwed)}
                    </p>
                  </div>

                  {/* Invoices Count */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-2">
                      Invoices Vencidas
                    </p>
                    <p className="text-2xl font-black text-slate-700">
                      {school.overdueInvoices.length}
                    </p>
                  </div>

                  {/* Days Until Legal */}
                  <div className={`rounded-2xl p-4 text-center ${getEscalationColor(school.daysUntilLegalAction)}`}>
                    <p className="text-[10px] font-black uppercase tracking-[1px] mb-1">
                      Días para Legal
                    </p>
                    <p className="text-2xl font-black">
                      {school.daysUntilLegalAction}
                    </p>
                  </div>

                  {/* Blocked Status */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 rounded-xl">
                      <Lock className="w-5 h-5 text-red-600" />
                      <span className="font-black text-red-700">BLOQUEADA</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAIL MODAL */}
        {selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[32px] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-[32px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Lock className="w-6 h-6" />
                    Detalles de Bloqueo - {selectedSchool.schoolId}
                  </h2>
                  <button
                    onClick={() => setSelectedSchool(null)}
                    className="text-xl font-bold hover:bg-red-800 w-8 h-8 flex items-center justify-center rounded-full"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* ALERT */}
                {selectedSchool.daysUntilLegalAction <= 7 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-[20px] p-4 flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-black text-red-900 mb-1">
                        ⚠️ Escalación Legal Inminente
                      </p>
                      <p className="text-red-800 font-medium text-sm">
                        Quedan {selectedSchool.daysUntilLegalAction} días antes de escalar a cobranzas legales.
                        Contacta a la escuela inmediatamente.
                      </p>
                    </div>
                  </div>
                )}

                {/* KEY METRICS */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[1px] mb-2">
                      Días Vencida
                    </p>
                    <p className="text-3xl font-black text-red-700">
                      {selectedSchool.rule?.overdueDays || 0}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[1px] mb-2">
                      Monto Adeudado
                    </p>
                    <p className="text-2xl font-black text-amber-700">
                      {formatCurrency(selectedSchool.totalOwed)}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-[1px] mb-2">
                      Días para Legal
                    </p>
                    <p className="text-3xl font-black text-orange-700">
                      {selectedSchool.daysUntilLegalAction}
                    </p>
                  </div>
                </div>

                {/* BLOCKING REASON */}
                {selectedSchool.rule && (
                  <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[1px] mb-3">
                      Razón del Bloqueo
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">
                        Motivo:{' '}
                        {selectedSchool.rule.blockedReason === 'OVERDUE_INVOICE'
                          ? 'Facturas Vencidas'
                          : selectedSchool.rule.blockedReason === 'MANUAL_SUSPENSION'
                          ? 'Suspensión Manual'
                          : 'Violación de Política'}
                      </p>
                      <p className="text-sm text-slate-700">
                        Bloqueada desde:{' '}
                        {new Date(selectedSchool.rule.blockedAt).toLocaleDateString('es-MX')}
                      </p>
                      <p className="text-sm text-slate-700">
                        Legal eligible:{' '}
                        {selectedSchool.rule.legalEscalationEligible ? '✓ Sí' : '✗ No'}
                      </p>
                    </div>
                  </div>
                )}

                {/* OVERDUE INVOICES */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    Facturas Vencidas ({selectedSchool.overdueInvoices.length})
                  </h3>

                  {selectedSchool.overdueInvoices.length === 0 ? (
                    <p className="text-slate-600 font-medium">No hay facturas vencidas.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSchool.overdueInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="bg-red-50 border-l-4 border-red-600 rounded-xl p-4 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{inv.invoiceNumber}</p>
                            <p className="text-sm text-slate-600">
                              Vencimiento:{' '}
                              {new Date(inv.dueDate).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                          <p className="font-black text-red-700">{formatCurrency(inv.total)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ESCALATION TIMELINE */}
                <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[1px] mb-4">
                    Escalation Timeline
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Día 10: Vencimiento</p>
                        <p className="text-xs text-slate-600">Invoice vencida, comienza grace period</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          Día {10 + (selectedSchool.rule?.overdueDays || 0)}: Bloqueo Automático
                        </p>
                        <p className="text-xs text-slate-600">Plataforma bloqueada sin posibilidad de transacciones</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Scale className="w-5 h-5 text-red-600 mt-1 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Día 70: Acción Legal</p>
                        <p className="text-xs text-slate-600">
                          Caso escalado a cobranzas/abogados
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="sticky bottom-0 bg-slate-50 p-6 border-t-2 border-slate-200 rounded-b-[32px] flex gap-3">
                <Button
                  onClick={() => setSelectedSchool(null)}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-black px-6 py-3 rounded-[20px] transition-all uppercase text-[10px] tracking-[1px]"
                >
                  Cerrar
                </Button>

                <Button
                  onClick={() => {
                    if (selectedSchool.schoolId) {
                      handleUnblockSchool(selectedSchool.schoolId);
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-[20px] transition-all shadow-lg uppercase text-[10px] tracking-[1px] flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Desbloquear (Pago Confirmado)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SUPERADMIN BILLING OPERATIONS PANEL
 * Permite ejecutar cron jobs, generar invoices, y ver el estado del sistema de billing
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Zap, CheckCircle, AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '../Button';
import {
  executeMonthlyBillingCycle,
  getSchoolInvoices,
  formatCurrency,
} from '../../services/BillingService';
import { Invoice } from '../../types';

interface BillingOperationResult {
  success: boolean;
  message: string;
  generatedInvoices: Invoice[];
  timestamp: string;
}

export default function BillingOperationsPanel() {
  const [executing, setExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState<BillingOperationResult | null>(null);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllInvoices();
  }, []);

  const loadAllInvoices = async () => {
    setLoading(true);
    try {
      // Mock: cargar invoices de ambas escuelas
      const invoices1 = await getSchoolInvoices('school-001');
      const invoices2 = await getSchoolInvoices('school-002');
      setAllInvoices([...invoices1, ...invoices2]);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBillingCycle = async () => {
    setExecuting(true);
    try {
      const generated = await executeMonthlyBillingCycle();

      const result: BillingOperationResult = {
        success: true,
        message: `✅ Ciclo de billing ejecutado correctamente. ${generated.length} facturas generadas.`,
        generatedInvoices: generated,
        timestamp: new Date().toISOString(),
      };

      setLastExecution(result);
      await loadAllInvoices();
    } catch (error) {
      const result: BillingOperationResult = {
        success: false,
        message: `❌ Error ejecutando ciclo de billing: ${error}`,
        generatedInvoices: [],
        timestamp: new Date().toISOString(),
      };
      setLastExecution(result);
    } finally {
      setExecuting(false);
    }
  };

  const stats = {
    totalInvoices: allInvoices.length,
    issued: allInvoices.filter(i => i.status === 'ISSUED').length,
    paid: allInvoices.filter(i => i.status === 'PAID').length,
    overdue: allInvoices.filter(i => i.status === 'OVERDUE').length,
    totalAmount: allInvoices.reduce((sum, i) => sum + i.total, 0),
    totalPaid: allInvoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + i.total, 0),
  };

  const nextBillingDate = new Date();
  nextBillingDate.setDate(1);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500 p-3 rounded-[16px]">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Operaciones de Billing</h1>
              <p className="text-blue-200">
                Control administrativo del sistema de facturas y cobros
              </p>
            </div>
          </div>
        </div>

        {/* ALERT BOX */}
        <div className="bg-amber-900 border-2 border-amber-700 rounded-[24px] p-6 mb-8">
          <p className="text-amber-100 font-bold text-sm">
            ⚠️ <strong>Panel Administrativo Crítico:</strong> Las acciones aquí ejecutan procesos
            de billing en PRODUCCIÓN. Úsalo solo en horarios permitidos (fines de mes).
          </p>
        </div>

        {/* MAIN ACTION: EXECUTE BILLING CYCLE */}
        <div className="bg-white rounded-[32px] shadow-2xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: ACTION */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  Ejecutar Ciclo Mensual
                </h2>
                <p className="text-slate-600 font-medium mb-6">
                  Genera facturas automáticas para todas las escuelas por el período actual.
                  <br />
                  <strong>Próxima ejecución programada:</strong>{' '}
                  {nextBillingDate.toLocaleDateString('es-MX')}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      Período: {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">Sistema en línea y operativo</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {allInvoices.length} facturas existentes en el sistema
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleExecuteBillingCycle}
                disabled={executing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black px-8 py-4 rounded-[24px] transition-all shadow-lg uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2"
              >
                {executing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Ejecutar Ahora
                  </>
                )}
              </Button>
            </div>

            {/* RIGHT: LAST EXECUTION RESULT */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-[24px] p-6 border-2 border-slate-200">
              <h3 className="text-lg font-black text-slate-900 mb-4">Última Ejecución</h3>

              {lastExecution ? (
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-3 p-4 rounded-[16px] ${
                      lastExecution.success
                        ? 'bg-emerald-50 border-2 border-emerald-200'
                        : 'bg-red-50 border-2 border-red-200'
                    }`}
                  >
                    {lastExecution.success ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                    )}
                    <p
                      className={`font-bold text-sm ${
                        lastExecution.success ? 'text-emerald-900' : 'text-red-900'
                      }`}
                    >
                      {lastExecution.message}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600">
                      <strong>Timestamp:</strong>{' '}
                      {new Date(lastExecution.timestamp).toLocaleString('es-MX')}
                    </p>
                    {lastExecution.generatedInvoices.length > 0 && (
                      <div>
                        <p className="font-bold text-slate-900 mb-2">
                          Facturas Generadas: {lastExecution.generatedInvoices.length}
                        </p>
                        <div className="space-y-1">
                          {lastExecution.generatedInvoices.map(inv => (
                            <p key={inv.id} className="text-slate-700 ml-2">
                              • {inv.invoiceNumber} ({inv.schoolId}): {formatCurrency(inv.total)}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 font-medium">
                  No hay ejecuciones registradas. Ejecuta el ciclo para ver resultados aquí.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-[20px] p-6 border-2 border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">
              Total Facturas
            </p>
            <p className="text-3xl font-black text-slate-900">{stats.totalInvoices}</p>
          </div>

          <div className="bg-white rounded-[20px] p-6 border-2 border-blue-200 shadow-sm">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[2px] mb-3">
              Emitidas
            </p>
            <p className="text-3xl font-black text-blue-600">{stats.issued}</p>
          </div>

          <div className="bg-white rounded-[20px] p-6 border-2 border-emerald-200 shadow-sm">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[2px] mb-3">
              Pagadas
            </p>
            <p className="text-3xl font-black text-emerald-600">{stats.paid}</p>
          </div>

          <div className="bg-white rounded-[20px] p-6 border-2 border-red-200 shadow-sm">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[2px] mb-3">
              Vencidas
            </p>
            <p className="text-3xl font-black text-red-600">{stats.overdue}</p>
          </div>

          <div className="bg-white rounded-[20px] p-6 border-2 border-purple-200 shadow-sm">
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-[2px] mb-3">
              Monto Total
            </p>
            <p className="text-2xl font-black text-purple-600">{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>

        {/* ALL INVOICES TABLE */}
        <div className="bg-white rounded-[24px] shadow-xl overflow-hidden">
          <div className="p-6 border-b-2 border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              Historial de Facturas
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 font-medium">Cargando facturas...</p>
            </div>
          ) : allInvoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 font-medium">
                No hay facturas. Ejecuta el ciclo de billing para generarlas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                      Factura
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                      Escuela
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                      Emitida
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                      Vencimiento
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allInvoices
                    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                    .map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-900">{invoice.invoiceNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700">{invoice.schoolId}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">
                            {new Date(invoice.issueDate).toLocaleDateString('es-MX')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">
                            {new Date(invoice.dueDate).toLocaleDateString('es-MX')}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-black text-slate-900">{formatCurrency(invoice.total)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.5px] ${
                              invoice.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700'
                                : invoice.status === 'OVERDUE'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {invoice.status === 'PAID'
                              ? 'Pagada'
                              : invoice.status === 'OVERDUE'
                              ? 'Vencida'
                              : 'Emitida'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-[24px] p-6">
          <p className="text-blue-900 font-medium text-sm">
            💡 <strong>Nota sobre cron jobs:</strong> En producción, este ciclo se ejecuta
            automáticamente el último día de cada mes a las 23:59. Aquí puedes simularlo para
            testing.
          </p>
        </div>
      </div>
    </div>
  );
}

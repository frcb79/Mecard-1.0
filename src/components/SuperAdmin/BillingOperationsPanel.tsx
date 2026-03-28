/**
 * SUPERADMIN BILLING OPERATIONS PANEL
 * Permite ejecutar cron jobs, generar invoices, y ver el estado del sistema de billing
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Zap, CheckCircle, AlertCircle, Loader2, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button } from '../Button';
import {
  executeMonthlyBillingCycle,
  formatCurrency,
} from '../../services/BillingService';
import { Invoice, InvoiceStatus } from '../../types';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { logger } from '../../lib/logger';

interface BillingOperationResult {
  success: boolean;
  message: string;
  generatedInvoices: Invoice[];
  timestamp: string;
}

interface InvoiceRow {
  id: string;
  school_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  taxes: number;
  total: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  payment_method: string | null;
  paid_at: string | null;
  line_items: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const mapInvoiceRow = (row: InvoiceRow): Invoice => ({
  id: row.id,
  schoolId: row.school_id,
  invoiceNumber: row.invoice_number,
  issueDate: row.issue_date,
  dueDate: row.due_date,
  subtotal: Number(row.subtotal || 0),
  taxes: Number(row.taxes || 0),
  total: Number(row.total || 0),
  status: InvoiceStatus[row.status as keyof typeof InvoiceStatus] || InvoiceStatus.ISSUED,
  paymentMethod: row.payment_method || undefined,
  paidAt: row.paid_at || undefined,
  lineItems: Array.isArray(row.line_items) ? (row.line_items as Invoice['lineItems']) : [],
  notes: row.notes || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

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
      if (!isSupabaseConfigured) {
        // Keep legacy behavior for local mock mode
        setAllInvoices([]);
        return;
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('id, school_id, invoice_number, issue_date, due_date, subtotal, taxes, total, status, payment_method, paid_at, line_items, notes, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      const rows = (data || []) as InvoiceRow[];
      setAllInvoices(rows.map(mapInvoiceRow));
    } catch (error: unknown) {
      logger.error('superAdmin.billingOperations', 'Error loading invoices', error);
      setAllInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBillingCycle = async () => {
    setExecuting(true);
    try {
      if (isSupabaseConfigured) {
        const result: BillingOperationResult = {
          success: false,
          message: 'Ejecución manual no conectada aún a un job de backend. Usa tu scheduler/edge function de billing.',
          generatedInvoices: [],
          timestamp: new Date().toISOString(),
        };
        setLastExecution(result);
        setExecuting(false);
        return;
      }

      const generated = await executeMonthlyBillingCycle();

      const result: BillingOperationResult = {
        success: true,
        message: `Ciclo de billing ejecutado correctamente. ${generated.length} facturas generadas.`,
        generatedInvoices: generated,
        timestamp: new Date().toISOString(),
      };

      setLastExecution(result);
      await loadAllInvoices();
    } catch (error) {
      const result: BillingOperationResult = {
        success: false,
        message: `Error ejecutando ciclo de billing: ${error}`,
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
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-600 p-2.5 rounded-xl">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Operaciones de Billing</h1>
            </div>
            <p className="text-slate-500 font-medium">Control administrativo del motor de facturacion y cobranza</p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Sistema Sincronizado</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 ring-1 ring-inset ring-amber-100">
          <p className="text-amber-900 font-semibold text-sm">
            <strong>Panel administrativo critico:</strong> este modulo ejecuta procesos de billing para toda la red.
            Usalo unicamente en ventanas operativas controladas.
          </p>
          {isSupabaseConfigured && (
            <p className="text-amber-800 text-xs mt-2 font-medium">
              Modo productivo detectado: la ejecución manual está protegida hasta conectar el cron/edge function oficial.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 ring-1 ring-inset ring-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Facturacion Total</p>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">{formatCurrency(stats.totalAmount)}</p>
            <p className="mt-2 text-xs font-bold text-slate-500">{stats.totalInvoices} facturas registradas</p>
          </div>

          <div className="rounded-[32px] border border-emerald-100 bg-emerald-50/50 p-6 ring-1 ring-inset ring-emerald-100">
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[2px] mb-2">Cobrado</p>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-emerald-700">{formatCurrency(stats.totalPaid)}</p>
            <p className="mt-2 text-xs font-bold text-emerald-700/80">{stats.paid} facturas pagadas</p>
          </div>

          <div className="rounded-[32px] border border-indigo-100 bg-indigo-50/60 p-6 ring-1 ring-inset ring-indigo-100">
            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[2px] mb-2">Pendiente de Cobro</p>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-indigo-700">{formatCurrency(Math.max(stats.totalAmount - stats.totalPaid, 0))}</p>
            <p className="mt-2 text-xs font-bold text-indigo-700/80">{stats.issued} emitidas · {stats.overdue} vencidas</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-2">
                  Motor de Billing Mensual
                </h2>
                <p className="text-slate-600 font-medium mb-6">
                  Genera facturas automaticas para todas las escuelas por el periodo actual.
                  <br />
                  <strong>Proxima ejecucion programada:</strong>{' '}
                  {nextBillingDate.toLocaleDateString('es-MX')}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium">
                      Periodo: {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">Sistema operativo y disponible</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium">
                      {allInvoices.length} facturas existentes en el sistema
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleExecuteBillingCycle}
                disabled={executing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-black px-8 py-4 rounded-xl transition-all duration-300 uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2"
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

            <div className="bg-slate-50/70 rounded-[24px] p-6 border border-slate-200 ring-1 ring-inset ring-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-4">Ultima Ejecucion</h3>

              {lastExecution ? (
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border ${
                      lastExecution.success
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
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
                          Facturas generadas: {lastExecution.generatedInvoices.length}
                        </p>
                        <div className="space-y-1">
                          {lastExecution.generatedInvoices.map(inv => (
                            <p key={inv.id} className="text-slate-700 ml-2">
                              - {inv.invoiceNumber} ({inv.schoolId}): {formatCurrency(inv.total)}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 font-medium">
                  No hay ejecuciones registradas. Ejecuta el ciclo para ver resultados aqui.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 ring-1 ring-inset ring-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
              Total Facturas
            </p>
            <p className="text-3xl font-black tracking-tight text-slate-900">{stats.totalInvoices}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-indigo-100 ring-1 ring-inset ring-indigo-100">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px] mb-2">
              Emitidas
            </p>
            <p className="text-3xl font-black tracking-tight text-indigo-700">{stats.issued}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-100 ring-1 ring-inset ring-emerald-100">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[2px] mb-2">
              Pagadas
            </p>
            <p className="text-3xl font-black tracking-tight text-emerald-700">{stats.paid}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-red-100 ring-1 ring-inset ring-red-100">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[2px] mb-2">
              Vencidas
            </p>
            <p className="text-3xl font-black tracking-tight text-red-700">{stats.overdue}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 ring-1 ring-inset ring-slate-100 col-span-2 md:col-span-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2">
              Monto Total
            </p>
            <p className="text-xl md:text-2xl font-black tracking-tight text-slate-800">{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-600" />
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
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[1.5px]">
                      Factura
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[1.5px]">
                      Escuela
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[1.5px]">
                      Emitida
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[1.5px]">
                      Vencimiento
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[1.5px]">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[1.5px]">
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
                        className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <p className="font-black text-slate-900">{invoice.invoiceNumber}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-700">{invoice.schoolId}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-600">
                            {new Date(invoice.issueDate).toLocaleDateString('es-MX')}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-600">
                            {new Date(invoice.dueDate).toLocaleDateString('es-MX')}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="font-black text-slate-900">{formatCurrency(invoice.total)}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-xl border font-black text-[10px] uppercase tracking-[0.5px] ${
                              invoice.status === 'PAID'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : invoice.status === 'OVERDUE'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
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

        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 ring-1 ring-inset ring-indigo-100">
          <p className="text-indigo-900 font-medium text-sm">
            <strong>Nota de operacion:</strong> en produccion este ciclo se ejecuta automaticamente el ultimo dia de cada mes a las 23:59.
            Desde este panel puedes correrlo manualmente para pruebas controladas.
          </p>
        </div>
      </div>
    </div>
  );
}

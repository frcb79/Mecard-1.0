/**
 * SCHOOL INVOICE DASHBOARD
 * Permite a escuelas ver sus facturas mensuales, desglose y pagar
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertCircle,
  Check,
  Clock,
  DollarSign,
  Download,
  Eye,
  Filter,
} from 'lucide-react';
import { Button } from './Button';
import {
  getSchoolInvoices,
  updateInvoiceStatus,
  formatCurrency,
} from '../services/BillingService';
import { Invoice, InvoiceStatus } from '../types';

interface SchoolInvoiceDashboardProps {
  schoolId: string;
  schoolName?: string;
}

export default function SchoolInvoiceDashboard({
  schoolId,
  schoolName = 'Mi Escuela',
}: SchoolInvoiceDashboardProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [schoolId]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const schoolInvoices = await getSchoolInvoices(schoolId);
      setInvoices(schoolInvoices.sort((a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      ));
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    setPaymentProcessing(true);
    try {
      // Simular procesamiento de pago SPEI
      // En real: integración con STP o gateway de pagos
      const updated = await updateInvoiceStatus(
        invoice.id,
        InvoiceStatus.PAID,
        'SPEI'
      );

      if (updated) {
        setPaymentMessage({
          type: 'success',
          text: `Pago de ${formatCurrency(invoice.total)} registrado. Referencia: SPEI-${invoice.invoiceNumber}`,
        });
        await loadInvoices();
        setSelectedInvoice(null);
        setTimeout(() => setPaymentMessage(null), 5000);
      }
    } catch (error) {
      setPaymentMessage({
        type: 'error',
        text: 'Error procesando pago. Intenta más tarde.',
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const filteredInvoices = invoices.filter(
    inv => filterStatus === 'ALL' || inv.status === filterStatus
  );

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === InvoiceStatus.ISSUED).length,
    paid: invoices.filter(i => i.status === InvoiceStatus.PAID).length,
    overdue: invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length,
    totalOwed: invoices
      .filter(i => i.status === InvoiceStatus.ISSUED || i.status === InvoiceStatus.OVERDUE)
      .reduce((sum, i) => sum + i.total, 0),
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'bg-emerald-50 border-emerald-200';
      case InvoiceStatus.ISSUED:
        return 'bg-blue-50 border-blue-200';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-50 border-red-200';
      case InvoiceStatus.CANCELLED:
        return 'bg-slate-50 border-slate-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return <Check className="w-5 h-5 text-emerald-600" />;
      case InvoiceStatus.OVERDUE:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case InvoiceStatus.ISSUED:
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'Pagada';
      case InvoiceStatus.ISSUED:
        return 'Emitida';
      case InvoiceStatus.OVERDUE:
        return 'Vencida';
      case InvoiceStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600 font-medium">Cargando facturas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-black text-slate-900">Mis Facturas</h1>
          </div>
          <p className="text-slate-500 font-medium">{schoolName}</p>
        </div>

        {/* PAYMENT MESSAGE */}
        {paymentMessage && (
          <div
            className={`mb-6 rounded-[24px] p-4 flex items-center gap-3 animate-in slide-in-from-top ${
              paymentMessage.type === 'success'
                ? 'bg-emerald-50 border-2 border-emerald-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}
          >
            {paymentMessage.type === 'success' ? (
              <Check className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            )}
            <p
              className={`font-bold ${
                paymentMessage.type === 'success'
                  ? 'text-emerald-900'
                  : 'text-red-900'
              }`}
            >
              {paymentMessage.text}
            </p>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-[20px] p-6 border-2 border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
              Total Facturas
            </p>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-[20px] p-6 border-2 border-blue-100 shadow-sm">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[2px] mb-2">
              Por Pagar
            </p>
            <p className="text-3xl font-black text-blue-600">{stats.pending}</p>
            <p className="text-sm text-blue-700 font-bold mt-2">
              {formatCurrency(stats.totalOwed)}
            </p>
          </div>

          <div className="bg-white rounded-[20px] p-6 border-2 border-emerald-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[2px] mb-2">
              Pagadas
            </p>
            <p className="text-3xl font-black text-emerald-600">{stats.paid}</p>
          </div>

          <div className="bg-white rounded-[20px] p-6 border-2 border-red-100 shadow-sm">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[2px] mb-2">
              Vencidas
            </p>
            <p className="text-3xl font-black text-red-600">{stats.overdue}</p>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['ALL', InvoiceStatus.ISSUED, InvoiceStatus.PAID, InvoiceStatus.OVERDUE] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-[16px] font-black text-[10px] uppercase tracking-[1px] transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Filter className="w-3 h-3 inline mr-2" />
                {status === 'ALL' ? 'Todas' : getStatusText(status as InvoiceStatus)}
              </button>
            )
          )}
        </div>

        {/* INVOICES LIST */}
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-[24px] p-8 border-2 border-slate-100 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No hay facturas para mostrar</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className={`border-2 rounded-[24px] p-6 transition-all cursor-pointer hover:shadow-md ${getStatusColor(
                  invoice.status
                )}`}
                onClick={() => setSelectedInvoice(invoice)}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px]">
                        Factura
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-1">
                      Emitida
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(invoice.issueDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-1">
                      Vencimiento
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(invoice.dueDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-1">
                      Total
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-4 py-2 rounded-[12px] font-black text-[10px] uppercase tracking-[1px] ${
                        invoice.status === InvoiceStatus.PAID
                          ? 'bg-emerald-100 text-emerald-700'
                          : invoice.status === InvoiceStatus.OVERDUE
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* INVOICE DETAIL MODAL */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-[32px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black">
                    Factura {selectedInvoice.invoiceNumber}
                  </h2>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-xl font-bold hover:bg-blue-800 w-8 h-8 flex items-center justify-center rounded-full"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-blue-100 font-medium">
                  {schoolName} • Período: {new Date(selectedInvoice.issueDate).toLocaleDateString('es-MX')}
                </p>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* DATES */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-[16px] p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-2">
                      Fecha de Emisión
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {new Date(selectedInvoice.issueDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-[16px] p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-2">
                      Fecha de Vencimiento
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {new Date(selectedInvoice.dueDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>

                {/* LINE ITEMS */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-4">Desglose</h3>
                  <div className="space-y-3">
                    {selectedInvoice.lineItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start p-4 bg-slate-50 rounded-[16px]"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{item.description}</p>
                          {item.quantity && item.quantity > 1 && (
                            <p className="text-sm text-slate-600">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          )}
                        </div>
                        <p className="font-black text-slate-900 text-right">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TOTALS */}
                <div className="border-t-2 border-slate-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-700">Subtotal:</p>
                    <p className="font-bold text-slate-900">
                      {formatCurrency(selectedInvoice.subtotal)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-700">IVA (16%):</p>
                    <p className="font-bold text-slate-900">
                      {formatCurrency(selectedInvoice.taxes)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-4 rounded-[16px]">
                    <p className="font-black text-lg text-blue-900">Total a Pagar:</p>
                    <p className="font-black text-2xl text-blue-600">
                      {formatCurrency(selectedInvoice.total)}
                    </p>
                  </div>
                </div>

                {/* PAYMENT INSTRUCTIONS */}
                {selectedInvoice.status === InvoiceStatus.ISSUED ||
                selectedInvoice.status === InvoiceStatus.OVERDUE ? (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-[20px] p-4">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[1px] mb-3">
                      Instrucciones de Pago
                    </p>
                    <div className="space-y-2 text-sm text-amber-900 font-medium">
                      <p>
                        📍 <strong>Referencia SPEI:</strong> {selectedInvoice.invoiceNumber}
                      </p>
                      <p>
                        📍 <strong>Concepto:</strong> Pago de servicios MeCard
                      </p>
                      <p className="text-xs text-amber-700">
                        El pago se procesará automáticamente dentro de 2 horas.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* PAID CONFIRMATION */}
                {selectedInvoice.status === InvoiceStatus.PAID ? (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[20px] p-4 flex items-center gap-3">
                    <Check className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-900">Factura Pagada</p>
                      <p className="text-sm text-emerald-700">
                        {selectedInvoice.paidAt &&
                          `Pagada el ${new Date(selectedInvoice.paidAt).toLocaleDateString('es-MX')}`}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 p-6 border-t-2 border-slate-200 rounded-b-[32px] flex gap-3">
                <Button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-black px-6 py-3 rounded-[20px] transition-all uppercase text-[10px] tracking-[1px]"
                >
                  Cerrar
                </Button>

                {(selectedInvoice.status === InvoiceStatus.ISSUED ||
                  selectedInvoice.status === InvoiceStatus.OVERDUE) && (
                  <Button
                    onClick={() => handlePayInvoice(selectedInvoice)}
                    disabled={paymentProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black px-6 py-3 rounded-[20px] transition-all shadow-lg uppercase text-[10px] tracking-[1px] flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    {paymentProcessing ? 'Procesando...' : 'Pagar Ahora'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

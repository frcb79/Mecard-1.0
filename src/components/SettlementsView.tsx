/**
 * SettlementsView Component (Refactored)
 * Gestión de liquidaciones automáticas a concesionarios
 * Usa MockSettlementService para persistencia en localStorage
 */

import React, { useState, useEffect } from 'react';
import { Banknote, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { useSettlementService, usePaymentService } from '../contexts/ServiceContext';
import { Settlement, Disbursement } from '../services/types';
import { Button } from './Button';
import { useToast } from './ui/Toast';

export default function SettlementsView() {
  const settlementService = useSettlementService();
  const paymentService = usePaymentService();
  const toast = useToast();
  
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [expandedSettlement, setExpandedSettlement] = useState<string | null>(null);
  const [processingDisbursement, setProcessingDisbursement] = useState<string | null>(null);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    setIsLoading(true);
    try {
      const data = await settlementService.getSettlements();
      setSettlements(data);
    } catch (error) {
      console.error('Error loading settlements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSettlement = async () => {
    setIsGenerating(true);
    try {
      // Get recent transactions for this period
      const allTransactions = (paymentService as any).getAllTransactions?.() || [];
      
      // For demo, create a settlement for current month
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const settlement = await settlementService.generateSettlement({
        period: { start: periodStart, end: periodEnd },
        transactions: allTransactions.filter(
          (t: { type: string; timestamp: string }) => t.type === 'sale' && new Date(t.timestamp) >= periodStart &&  new Date(t.timestamp) <= periodEnd
        ),
      });

      setSettlements((prev) => [settlement, ...prev]);
    } catch (error) {
      console.error('Error generating settlement:', error);
      toast.error('Error', 'Error al generar liquidación: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const processDisbursement = async (disbursement: Disbursement) => {
    setProcessingDisbursement(disbursement.id);
    try {
      const result = await paymentService.executeDisbursement(disbursement);
      
      // Update settlement with completed disbursement
      setSettlements((prev) =>
        prev.map((s) => ({
          ...s,
          disbursements: s.disbursements.map((d) =>
            d.id === disbursement.id ? result : d
          ),
          status: s.disbursements.every((d) => d.id === disbursement.id ? result.status === 'completed' : d.status === 'completed') ? 'completed' : 'processing',
        }))
      );

      // Record in settlement service
      await settlementService.recordDisbursement(result);
    } catch (error) {
      console.error('Error processing disbursement:', error);
      toast.error('Error', (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessingDisbursement(null);
    }
  };

  const filteredSettlements = settlements.filter((s) => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-600';
      case 'pending':
      case 'processing':
        return 'bg-amber-100 text-amber-600';
      case 'failed':
        return 'bg-rose-100 text-rose-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  const totalSales = filteredSettlements.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalDisbursed = filteredSettlements.reduce((acc, s) => 
    acc + s.disbursements.reduce((dAcc, d) => dAcc + (d.status === 'completed' ? d.amount : 0), 0), 0
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 flex items-center gap-3">
              <Banknote className="w-8 h-8 text-purple-600" />
              Liquidaciones
            </h1>
            <p className="text-slate-500 font-medium">
              Historial y estado de dispersión de fondos a concesionarios
            </p>
          </div>
          
          <Button 
            onClick={generateSettlement}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-purple-600 text-white py-3 px-6 rounded-[20px] font-black hover:bg-purple-700"
          >
            {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isGenerating ? 'Generando...' : 'Generar Liquidación'}
          </Button>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-[28px] shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FILTRO DE ESTADO */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[16px] outline-none focus:border-purple-600 transition-all font-medium"
              >
                <option value="all">Todos los Estados</option>
                <option value="completed">Completado</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="failed">Fallido</option>
              </select>
            </div>

            {/* REFRESH BTN */}
            <div className="flex items-end">
              <button
                onClick={loadSettlements}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[16px] font-bold flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                {isLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-transparent rounded-[16px]">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-[2px]">
                Ventas Totales
              </p>
              <p className="text-2xl font-black text-purple-600 mt-2">
                ${totalSales.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-transparent rounded-[16px]">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px]">
                Dispersados
              </p>
              <p className="text-2xl font-black text-emerald-600 mt-2">
                ${totalDisbursed.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* SETTLEMENTS LIST */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-[28px] shadow-lg p-12 text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Cargando liquidaciones...</p>
            </div>
          ) : filteredSettlements.length === 0 ? (
            <div className="bg-white rounded-[28px] shadow-lg p-12 text-center">
              <Banknote className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg">No hay liquidaciones</p>
              <p className="text-slate-400 text-sm mt-2">Genera una nueva liquidación para comenzar</p>
            </div>
          ) : (
            filteredSettlements.map((settlement) => (
              <div
                key={settlement.id}
                className="bg-white rounded-[28px] shadow-lg overflow-hidden"
              >
                <div
                  className="p-6 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-center"
                  onClick={() =>
                    setExpandedSettlement(
                      expandedSettlement === settlement.id ? null : settlement.id
                    )
                  }
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-slate-900">
                        Liquidación {settlement.id}
                      </h3>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black ${getStatusColor(settlement.status)}`}
                      >
                        {getStatusIcon(settlement.status)}
                        {getStatusLabel(settlement.status)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(settlement.periodStart).toLocaleDateString()} -{' '}
                      {new Date(settlement.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                      Total
                    </p>
                    <p className="text-3xl font-black text-purple-600">
                      ${settlement.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {expandedSettlement === settlement.id && (
                  <div className="p-6  space-y-4">
                    {settlement.disbursements.map((disburse) => (
                      <div
                        key={disburse.id}
                        className="border border-slate-200 rounded-[20px] p-4 hover:border-slate-300 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-black text-slate-900">
                              {disburse.recipientName}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                              CLABE: {disburse.recipientCLABE}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black ${getStatusColor(disburse.status)}`}
                          >
                            {getStatusIcon(disburse.status)}
                            {getStatusLabel(disburse.status)}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                              Monto
                            </p>
                            <p className="text-2xl font-black text-slate-900">
                              ${disburse.amount.toFixed(2)}
                            </p>
                          </div>
                          {disburse.speiReference && (
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">
                                SPEI Ref
                              </p>
                              <p className="text-sm font-mono text-slate-600">
                                {disburse.speiReference}
                              </p>
                            </div>
                          )}
                        </div>

                        {disburse.status === 'pending' && (
                          <Button
                            onClick={() => processDisbursement(disburse)}
                            disabled={processingDisbursement === disburse.id}
                            className="w-full bg-indigo-600 text-white py-2 rounded-[16px] font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                          >
                            {processingDisbursement === disburse.id ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4" />
                                Procesando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Procesar Dispersión
                              </>
                            )}
                          </Button>
                        )}

                        {disburse.errorMessage && (
                          <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-[12px] font-bold mt-3">
                            {disburse.errorMessage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

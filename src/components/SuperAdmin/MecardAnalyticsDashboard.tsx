/**
 * MECARD ANALYTICS & RECONCILIATION DASHBOARD
 * Dashboard ejecutivo para MeCard con insights de revenue, cobranza y salud financiera
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Button } from './Button';
import {
  generateRevenueAnalytics,
  generateReconciliationReport,
  formatCurrency,
} from '../services/BillingService';
import type { RevenueAnalytics, ReconciliationReport, SchoolMetrics } from '../services/BillingService';

export default function MecardAnalyticsDashboard() {
  const [period, setPeriod] = useState(
    new Date().toISOString().split('T')[0].substring(0, 7) + '-01'
  );
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const analyticsData = generateRevenueAnalytics(period);
      const reconciliationData = generateReconciliationReport(period);

      setAnalytics(analyticsData);
      setReconciliation(reconciliationData);
      setLastRefresh(new Date().toLocaleTimeString('es-MX'));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL') => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-emerald-100 text-emerald-700';
      case 'AT_RISK':
        return 'bg-amber-100 text-amber-700';
      case 'CRITICAL':
        return 'bg-red-100 text-red-700';
    }
  };

  if (loading || !analytics || !reconciliation) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600 font-medium">Cargando analytics...</p>
      </div>
    );
  }

  const previousMonthDate = new Date(period);
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousPeriod = previousMonthDate.toISOString().split('T')[0].substring(0, 7) + '-01';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-[16px]">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">Analytics MeCard</h1>
                <p className="text-blue-200 text-sm font-medium">
                  Dashboard de revenue, cobranza y salud financiera
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="month"
                value={period.substring(0, 7)}
                onChange={(e) => setPeriod(e.target.value + '-01')}
                className="px-4 py-2 rounded-[12px] border-2 border-blue-700 bg-blue-900 text-white font-bold"
              />
              <Button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[12px] font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {lastRefresh && (
            <p className="text-blue-300 text-xs font-medium">
              Última actualización: {lastRefresh}
            </p>
          )}
        </div>

        {/* TOP KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[24px] p-6 text-white shadow-xl border-2 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[2px] text-blue-100">
                Total Revenue
              </p>
              <DollarSign className="w-6 h-6 text-blue-200" />
            </div>
            <p className="text-3xl font-black mb-2">{formatCurrency(analytics.totalRevenue)}</p>
            <p className="text-blue-100 text-xs font-medium">Ingresos pagados este mes</p>
          </div>

          {/* Payment Rate */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[24px] p-6 text-white shadow-xl border-2 border-emerald-500">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[2px] text-emerald-100">
                Tasa de Cobranza
              </p>
              <TrendingUp className="w-6 h-6 text-emerald-200" />
            </div>
            <p className="text-3xl font-black mb-2">{analytics.overallPaymentRate.toFixed(1)}%</p>
            <p className="text-emerald-100 text-xs font-medium">De invoices pagadas</p>
          </div>

          {/* Health Score */}
          <div className={`bg-gradient-to-br from-purple-600 to-purple-700 rounded-[24px] p-6 text-white shadow-xl border-2 border-purple-500`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[2px] text-purple-100">
                Health Score
              </p>
              <CheckCircle className="w-6 h-6 text-purple-200" />
            </div>
            <p className={`text-3xl font-black mb-2 ${getHealthColor(analytics.paymentHealthScore)}`}>
              {analytics.paymentHealthScore}
            </p>
            <p className="text-purple-100 text-xs font-medium">Salud del sistema (0-100)</p>
          </div>

          {/* Net Cash Flow */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[24px] p-6 text-white shadow-xl border-2 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[2px] text-indigo-100">
                Net Flow
              </p>
              <TrendingDown className="w-6 h-6 text-indigo-200" />
            </div>
            <p className={`text-3xl font-black mb-2 ${reconciliation.netCashFlow > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {formatCurrency(reconciliation.netCashFlow)}
            </p>
            <p className="text-indigo-100 text-xs font-medium">Flujo neto de caja</p>
          </div>
        </div>

        {/* REVENUE BREAKDOWN + RECONCILIATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by Category */}
          <div className="bg-white rounded-[24px] shadow-xl p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <PieChart className="w-6 h-6 text-blue-600" />
              Revenue por Categoría
            </h2>

            <div className="space-y-4">
              {Object.entries(analytics.revenueByCategory).map(([category, amount]) => {
                const percentage = (amount / analytics.totalRevenue) * 100;
                const colors = {
                  DEPOSIT_FEE: 'bg-blue-500',
                  CARD_EMISSION: 'bg-purple-500',
                  MONTHLY_RENT: 'bg-emerald-500',
                  POS_COMMISSION: 'bg-amber-500',
                };

                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-slate-700">
                        {category === 'DEPOSIT_FEE' && 'Comisión de Depósitos'}
                        {category === 'CARD_EMISSION' && 'Emisión de Tarjetas'}
                        {category === 'MONTHLY_RENT' && 'Renta Mensual'}
                        {category === 'POS_COMMISSION' && 'Comisión POS'}
                      </p>
                      <p className="font-black text-slate-900">{formatCurrency(amount)}</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${colors[category as keyof typeof colors]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reconciliation: Money In/Out */}
          <div className="bg-white rounded-[24px] shadow-xl p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              Reconciliación Mensual
            </h2>

            <div className="space-y-6">
              {/* Money In */}
              <div className="border-2 border-emerald-200 rounded-[16px] p-4 bg-emerald-50">
                <p className="font-black text-emerald-900 text-sm mb-3">
                  💰 DINERO QUE ENTRA
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-emerald-700">Depósitos de Padres:</span>
                    <span className="font-bold text-emerald-900">
                      {formatCurrency(reconciliation.moneyIn.parentDeposits)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-emerald-700">Pagos de Escuelas:</span>
                    <span className="font-bold text-emerald-900">
                      {formatCurrency(reconciliation.moneyIn.schoolPayments)}
                    </span>
                  </div>
                  <div className="border-t-2 border-emerald-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-emerald-900">TOTAL INGRESOS:</span>
                    <span className="text-lg font-black text-emerald-600">
                      {formatCurrency(reconciliation.moneyIn.totalIncome)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Money Out */}
              <div className="border-2 border-red-200 rounded-[16px] p-4 bg-red-50">
                <p className="font-black text-red-900 text-sm mb-3">
                  💸 DINERO QUE SALE
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Liquidación a Escuelas:</span>
                    <span className="font-bold text-red-900">
                      {formatCurrency(reconciliation.moneyOut.schoolLiquidations)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Comisión MeCard:</span>
                    <span className="font-bold text-red-900">
                      {formatCurrency(reconciliation.moneyOut.platformFees)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">Gastos Operacionales:</span>
                    <span className="font-bold text-red-900">
                      {formatCurrency(reconciliation.moneyOut.otherExpenses)}
                    </span>
                  </div>
                  <div className="border-t-2 border-red-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-red-900">TOTAL EGRESOS:</span>
                    <span className="text-lg font-black text-red-600">
                      {formatCurrency(reconciliation.moneyOut.totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SCHOOL METRICS TABLE */}
        <div className="bg-white rounded-[24px] shadow-xl overflow-hidden">
          <div className="p-8 border-b-2 border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              Salud de Cobranza por Escuela
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                    Escuela
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                    Facturado
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                    Pagado
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                    Tasa Cobranza
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                    Días Pago Promedio
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-[1px]">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.schoolMetrics.map((school: SchoolMetrics) => (
                  <tr
                    key={school.schoolId}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{school.schoolId}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-slate-700">{formatCurrency(school.totalInvoiced)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-emerald-600">{formatCurrency(school.totalPaid)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`font-black ${school.paymentRate >= 80 ? 'text-emerald-600' : school.paymentRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {school.paymentRate.toFixed(1)}%
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-slate-700">{school.avgPaymentDays} días</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.5px] ${getStatusBadge(school.status)}`}>
                        {school.status === 'HEALTHY' && 'Sana'}
                        {school.status === 'AT_RISK' && 'En Riesgo'}
                        {school.status === 'CRITICAL' && 'Crítica'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RISK ALERTS */}
        {reconciliation.metrics.delayedPayments > 0 && (
          <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-[24px] p-6 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-black text-red-900 text-lg mb-2">⚠️ Alertas de Riesgo</h3>
              <ul className="space-y-2 text-red-800 font-medium text-sm">
                <li>
                  • {reconciliation.metrics.delayedPayments} factura(s) vencida(s) - Riesgo de pago: {reconciliation.metrics.paymentRiskScore}%
                </li>
                {analytics.schoolMetrics.filter(s => s.status === 'CRITICAL').length > 0 && (
                  <li>
                    • {analytics.schoolMetrics.filter(s => s.status === 'CRITICAL').length} escuela(s) en estado CRÍTICO
                  </li>
                )}
                {analytics.schoolMetrics.filter(s => s.status === 'AT_RISK').length > 0 && (
                  <li>
                    • {analytics.schoolMetrics.filter(s => s.status === 'AT_RISK').length} escuela(s) EN RIESGO
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* INFO BOX */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-[24px] p-6">
          <p className="text-blue-900 font-medium text-sm">
            💡 <strong>Nota sobre datos:</strong> Este dashboard usa datos simulados para demostración. En producción, los datos
            se cargarán desde Supabase (tablas: invoices, revenue_tracking, school_blocking_rules).
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ReportsView Component
 * Componente reutilizable de reportes para diferentes roles
 * Admins, Gerentes, Escuelas - pueden generar reportes de ventas, transacciones, etc.
 */

import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp } from 'lucide-react';
import { useToast } from './ui/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_STUDENT_TRANSACTIONS, PRODUCTS } from '../constants';
import { Category, TransactionType } from '../types';

// Category labels for Spanish display
const CATEGORY_LABELS: Record<string, string> = {
  [Category.HOT_MEALS]: 'Comidas',
  [Category.COMBO_MEALS]: 'Combos',
  [Category.SNACKS]: 'Snacks',
  [Category.DRINKS]: 'Bebidas',
  [Category.SUPPLIES]: 'Papelería',
  [Category.UNIFORMS]: 'Uniformes',
  [Category.BOOKS]: 'Libros',
  [Category.TECH]: 'Tecnología',
};

export default function ReportsView() {
  const toast = useToast();
  const [reportType, setReportType] = useState<'sales' | 'transactions' | 'inventory'>('sales');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Derived data from real mock transactions ──
  const purchases = useMemo(() =>
    MOCK_STUDENT_TRANSACTIONS.filter(t => t.type === TransactionType.PURCHASE),
    []
  );

  const totalPurchaseAmount = useMemo(() =>
    purchases.reduce((s, t) => s + Math.abs(t.amount), 0),
    [purchases]
  );

  // Average daily spend (base for scaling to other periods)
  const uniqueDays = useMemo(() => {
    const days = new Set(purchases.map(t => t.date.slice(0, 10)));
    return Math.max(days.size, 1);
  }, [purchases]);

  const dailyAvg = totalPurchaseAmount / uniqueDays;

  // Period multiplier: how many school-days in the period
  const periodDays = period === 'week' ? 5 : period === 'month' ? 22 : period === 'quarter' ? 66 : 220;

  // Sales trend data — group by the period's time units
  const salesData = useMemo(() => {
    const labels: Record<string, string[]> = {
      week: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      month: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      quarter: ['Ene', 'Feb', 'Mar'],
      year: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    };
    const slots = labels[period] || labels.month;
    const daysPerSlot = periodDays / slots.length;

    return slots.map((date, i) => {
      // Distribute total proportionally with slight variance per slot
      const variance = 0.85 + (((i * 7 + 3) % 5) / 5) * 0.3; // 0.85–1.15
      const slotSales = Math.round(dailyAvg * daysPerSlot * variance);
      const slotUnits = Math.round((purchases.length / uniqueDays) * daysPerSlot * variance);
      return { date, sales: slotSales, units: slotUnits };
    });
  }, [period, periodDays, dailyAvg, purchases.length, uniqueDays]);

  // Transaction breakdown by product category
  const transactionData = useMemo(() => {
    // Map product descriptions to categories using PRODUCTS
    const catTotals: Record<string, { count: number; revenue: number }> = {};
    purchases.forEach(tx => {
      // Match by description substring to find the product
      const product = PRODUCTS.find(p => tx.description.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
      const catKey = product ? (CATEGORY_LABELS[product.category] || product.category) : 'Otros';
      if (!catTotals[catKey]) catTotals[catKey] = { count: 0, revenue: 0 };
      catTotals[catKey].count += 1;
      catTotals[catKey].revenue += Math.abs(tx.amount);
    });

    // Scale to the selected period
    const scale = periodDays / uniqueDays;
    return Object.entries(catTotals).map(([name, data]) => ({
      name,
      count: Math.round(data.count * scale),
      revenue: Math.round(data.revenue * scale),
    }));
  }, [purchases, periodDays, uniqueDays]);

  // Inventory data from PRODUCTS catalog
  const inventoryData = useMemo(() => {
    const categories = ['HOT_MEALS', 'DRINKS', 'SNACKS', 'UNIFORMS'] as const;
    return categories.map(cat => {
      const categoryProducts = PRODUCTS.filter(p => p.category === cat);
      const label = CATEGORY_LABELS[cat] || cat;
      const totalStock = categoryProducts.length * 50; // Simulated base stock per item
      const sold = Math.round((purchases.filter(tx => {
        const prod = PRODUCTS.find(p => tx.description.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
        return prod?.category === cat;
      }).length / uniqueDays) * periodDays);
      const avgPrice = categoryProducts.length > 0
        ? categoryProducts.reduce((s, p) => s + p.price, 0) / categoryProducts.length
        : 40;
      return {
        product: label,
        stock: totalStock,
        sold,
        value: Math.round(sold * avgPrice),
      };
    });
  }, [purchases, periodDays, uniqueDays]);

  const totalRevenue = useMemo(() => transactionData.reduce((s, t) => s + t.revenue, 0), [transactionData]);
  const totalTx = useMemo(() => transactionData.reduce((s, t) => s + t.count, 0), [transactionData]);
  const avgTicket = totalTx > 0 ? totalRevenue / totalTx : 0;
  const totalUnits = useMemo(() => inventoryData.reduce((s, i) => s + i.sold, 0), [inventoryData]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Reporte listo', 'Reporte generado exitosamente — modo demo');
    } catch (error) {
      toast.error('Error', 'Error generando reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const datasets: Record<string, any[]> = {
      sales: salesData,
      transactions: transactionData,
      inventory: inventoryData,
    };
    const data = datasets[reportType] || salesData;
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(r => Object.values(r).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${reportType}_${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV descargado', `${data.length} filas exportadas`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-600" />
            Reportes y Análisis
          </h1>
          <p className="text-slate-500 font-medium">
            Visualiza datos de ventas, transacciones e inventario con detalle
          </p>
        </div>

        {/* CONTROLES */}
        <div className="bg-white rounded-[28px] shadow-lg p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* TIPO DE REPORTE */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
                Tipo de Reporte
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[16px] outline-none focus:border-cyan-600 transition-all font-medium"
              >
                <option value="sales">Ventas Diarias</option>
                <option value="transactions">Por Categoría</option>
                <option value="inventory">Inventario</option>
              </select>
            </div>

            {/* PERÍODO */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
                Período
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[16px] outline-none focus:border-cyan-600 transition-all font-medium"
              >
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="quarter">Este Trimestre</option>
                <option value="year">Este Año</option>
              </select>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-2 items-end">
              <button
                onClick={handleExportCSV}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-black px-4 py-3 rounded-[16px] transition-all text-[10px] uppercase tracking-[1px]"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-black px-4 py-3 rounded-[16px] transition-all text-[10px] uppercase tracking-[1px] shadow-lg"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generando...' : 'PDF'}
              </button>
            </div>
          </div>

          {/* FILTROS ADICIONALES */}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-600 font-black rounded-[14px] text-[9px] uppercase tracking-[1px]">
              <Filter className="w-4 h-4" /> Unitaria
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-black rounded-[14px] text-[9px] uppercase tracking-[1px] hover:bg-slate-200 transition-all">
              <Calendar className="w-4 h-4" /> Fecha Custom
            </button>
          </div>
        </div>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* GRÁFICO 1 */}
          <div className="bg-white rounded-[28px] shadow-lg p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
              Ventas Diarias - {period === 'month' ? 'Febrero 2026' : 'Período Seleccionado'}
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICO 2 */}
          <div className="bg-white rounded-[28px] shadow-lg p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">
              Transacciones por Categoría
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    radius={[8, 8, 0, 0]}
                    name="Cantidad"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TABLA DE DETALLES */}
        <div className="bg-white rounded-[28px] shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-900">Detalles de Inventario</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                    Stock Actual
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                    Vendidas (Hoy)
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                    Valor Total
                  </th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                    Rotación
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item, idx) => {
                  const rotationPercent = Math.round(
                    (item.sold / (item.stock + item.sold)) * 100
                  );
                  return (
                    <tr
                      key={item.product}
                      className={`border-b border-slate-100 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4 font-black text-slate-900">
                        {item.product}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {item.stock} unidades
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-cyan-600">
                        {item.sold} unidades
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">
                        ${item.value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full"
                              style={{ width: `${rotationPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-900">
                            {rotationPercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-cyan-50 to-transparent rounded-[24px] p-6 border-2 border-cyan-100">
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[2px] mb-2">
              Ingresos Totales
            </p>
            <p className="text-3xl font-black text-cyan-600">${totalRevenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
            <p className="text-[9px] text-cyan-500 font-bold mt-2">Período: {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : period === 'quarter' ? 'Trimestre' : 'Año'}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-transparent rounded-[24px] p-6 border-2 border-emerald-100">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px] mb-2">
              Transacciones
            </p>
            <p className="text-3xl font-black text-emerald-600">{totalTx.toLocaleString()}</p>
            <p className="text-[9px] text-emerald-500 font-bold mt-2">Operaciones procesadas</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-transparent rounded-[24px] p-6 border-2 border-amber-100">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[2px] mb-2">
              Ticket Promedio
            </p>
            <p className="text-3xl font-black text-amber-600">${avgTicket.toFixed(2)}</p>
            <p className="text-[9px] text-amber-500 font-bold mt-2">Por transacción</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-transparent rounded-[24px] p-6 border-2 border-purple-100">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-[2px] mb-2">
              Unidades Vendidas
            </p>
            <p className="text-3xl font-black text-purple-600">{totalUnits.toLocaleString()}</p>
            <p className="text-[9px] text-purple-500 font-bold mt-2">Artículos despachados</p>
          </div>
        </div>
      </div>
    </div>
  );
}

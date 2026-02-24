/**
 * ReportsView Component
 * Componente reutilizable de reportes para diferentes roles
 * Admins, Gerentes, Escuelas - pueden generar reportes de ventas, transacciones, etc.
 */

import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp } from 'lucide-react';
import { useToast } from './ui/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Seed-based pseudo-random for consistent per-period data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export default function ReportsView() {
  const toast = useToast();
  const [reportType, setReportType] = useState<'sales' | 'transactions' | 'inventory'>('sales');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate period-dynamic data
  const periodMultiplier = period === 'week' ? 1 : period === 'month' ? 4.2 : period === 'quarter' ? 13 : 52;
  const periodSeed = period === 'week' ? 7 : period === 'month' ? 28 : period === 'quarter' ? 90 : 365;

  const salesData = useMemo(() => {
    const labels: Record<string, string[]> = {
      week: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      month: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      quarter: ['Ene', 'Feb', 'Mar'],
      year: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    };
    return (labels[period] || labels.month).map((date, i) => ({
      date,
      sales: Math.round(1800 + seededRandom(periodSeed + i) * 2200),
      units: Math.round(150 + seededRandom(periodSeed + i + 100) * 250),
    }));
  }, [period, periodSeed]);

  const transactionData = useMemo(() => [
    { name: 'Cafetería', count: Math.round(1240 * periodMultiplier / 4.2), revenue: Math.round(45000 * periodMultiplier / 4.2) },
    { name: 'Papelería', count: Math.round(890 * periodMultiplier / 4.2), revenue: Math.round(28000 * periodMultiplier / 4.2) },
    { name: 'Uniforme', count: Math.round(340 * periodMultiplier / 4.2), revenue: Math.round(18000 * periodMultiplier / 4.2) },
    { name: 'Otros', count: Math.round(520 * periodMultiplier / 4.2), revenue: Math.round(15000 * periodMultiplier / 4.2) },
  ], [periodMultiplier]);

  const inventoryData = useMemo(() => [
    { product: 'Comidas', stock: 450, sold: Math.round(240 * periodMultiplier / 4.2), value: Math.round(15600 * periodMultiplier / 4.2) },
    { product: 'Bebidas', stock: 890, sold: Math.round(680 * periodMultiplier / 4.2), value: Math.round(8500 * periodMultiplier / 4.2) },
    { product: 'Snacks', stock: 340, sold: Math.round(210 * periodMultiplier / 4.2), value: Math.round(4200 * periodMultiplier / 4.2) },
    { product: 'Uniformes', stock: 120, sold: Math.round(45 * periodMultiplier / 4.2), value: Math.round(7200 * periodMultiplier / 4.2) },
  ], [periodMultiplier]);

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

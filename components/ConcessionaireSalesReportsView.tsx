import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Download } from 'lucide-react';
import { Transaction, Product } from '../types';

interface ConcessionaireSalesReportsViewProps {
  unitId: string;
  transactions: Transaction[];
  products: Product[];
  onNavigate?: (view: string) => void;
}

export const ConcessionaireSalesReportsView: React.FC<ConcessionaireSalesReportsViewProps> = ({
  unitId,
  transactions,
  products,
  onNavigate
}) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [comparison, setComparison] = useState(true);

  // Filter transactions for this unit
  const unitTransactions = useMemo(() => {
    return transactions.filter(t => t.unitId === unitId && t.type === 'purchase');
  }, [transactions, unitId]);

  // Get date range based on period
  const getDateRange = (p: 'day' | 'week' | 'month') => {
    const now = new Date();
    const start = new Date();
    
    if (p === 'day') start.setDate(now.getDate() - 1);
    if (p === 'week') start.setDate(now.getDate() - 7);
    if (p === 'month') start.setMonth(now.getMonth() - 1);

    return { start, end: now };
  };

  // Current period transactions
  const currentPeriodData = useMemo(() => {
    const range = getDateRange(period);
    return unitTransactions.filter(t => {
      const date = new Date(t.date);
      return date >= range.start && date <= range.end;
    });
  }, [unitTransactions, period]);

  // Previous period transactions for comparison
  const previousPeriodData = useMemo(() => {
    if (!comparison) return [];
    
    const range = getDateRange(period);
    const periodMs = range.end.getTime() - range.start.getTime();
    const previousStart = new Date(range.start.getTime() - periodMs);
    const previousEnd = new Date(range.start.getTime());

    return unitTransactions.filter(t => {
      const date = new Date(t.date);
      return date >= previousStart && date <= previousEnd;
    });
  }, [unitTransactions, period, comparison]);

  // Sales by product
  const salesByProduct = useMemo(() => {
    const sales: { [key: string]: number } = {};
    currentPeriodData.forEach(t => {
      sales[t.item] = (sales[t.item] || 0) + t.amount;
    });

    return Object.entries(sales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [currentPeriodData]);

  // Hourly trend
  const hourlyTrend = useMemo(() => {
    const hours: { [key: number]: number } = {};
    currentPeriodData.forEach(t => {
      const hour = new Date(t.date).getHours();
      hours[hour] = (hours[hour] || 0) + t.amount;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      amount: hours[i] || 0
    }));
  }, [currentPeriodData]);

  // Daily trend for comparison
  const dailyTrend = useMemo(() => {
    const currentDaily: { [key: string]: number } = {};
    const previousDaily: { [key: string]: number } = {};

    currentPeriodData.forEach(t => {
      const day = new Date(t.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
      currentDaily[day] = (currentDaily[day] || 0) + t.amount;
    });

    previousPeriodData.forEach(t => {
      const day = new Date(t.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
      previousDaily[day] = (previousDaily[day] || 0) + t.amount;
    });

    const allDays = new Set([...Object.keys(currentDaily), ...Object.keys(previousDaily)]);
    return Array.from(allDays).map(day => ({
      day,
      current: currentDaily[day] || 0,
      previous: comparison ? previousDaily[day] || 0 : 0
    }));
  }, [currentPeriodData, previousPeriodData, comparison]);

  // Summary statistics
  const stats = {
    current: {
      total: currentPeriodData.reduce((sum, t) => sum + t.amount, 0),
      transactions: currentPeriodData.length,
      average: currentPeriodData.length > 0 
        ? currentPeriodData.reduce((sum, t) => sum + t.amount, 0) / currentPeriodData.length 
        : 0
    },
    previous: {
      total: previousPeriodData.reduce((sum, t) => sum + t.amount, 0),
      transactions: previousPeriodData.length
    }
  };

  const percentChange = stats.previous.total > 0 
    ? ((stats.current.total - stats.previous.total) / stats.previous.total) * 100 
    : 0;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  const periodLabels = {
    day: 'hoy',
    week: 'esta semana',
    month: 'este mes'
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Reportes de Ventas</h1>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('day')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'day' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'week' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'month' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Este Mes
            </button>
          </div>

          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={comparison}
                onChange={(e) => setComparison(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-medium">Comparar con período anterior</span>
            </label>
            <button className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition">
              <Download className="w-5 h-5" />
              Descargar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Total de Ventas</p>
            <p className="text-2xl font-bold text-gray-900">${stats.current.total.toFixed(2)}</p>
            {comparison && stats.previous.total > 0 && (
              <p className={`text-sm font-medium ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}% vs período anterior
              </p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Número de Transacciones</p>
            <p className="text-2xl font-bold text-gray-900">{stats.current.transactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Venta Promedio</p>
            <p className="text-2xl font-bold text-gray-900">${stats.current.average.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Período</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{periodLabels[period]}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Productos Vendidos</h3>
            {salesByProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByProduct}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">Sin ventas en este período</p>
            )}
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Hora del Día</h3>
            {hourlyTrend.some(h => h.amount > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">Sin datos de venditas por hora</p>
            )}
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ventas Diarias</h3>
          {dailyTrend.some(d => d.current > 0 || d.previous > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="current" fill="#10b981" name="Período Actual" />
                {comparison && <Bar dataKey="previous" fill="#cbd5e1" name="Período Anterior" />}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">Sin datos disponibles</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate?.('UNIT_MANAGER_DASHBOARD')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

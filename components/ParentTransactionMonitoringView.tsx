import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Filter, Download, TrendingUp } from 'lucide-react';
import { Transaction, Category } from '../types';

interface ParentTransactionMonitoringViewProps {
  children: string[];
  transactions: Transaction[];
  onNavigate?: (view: string) => void;
  initialSelectedChildId?: string | null;
}

export const ParentTransactionMonitoringView: React.FC<ParentTransactionMonitoringViewProps> = ({
  children,
  transactions,
  onNavigate,
  initialSelectedChildId,
}) => {
  const [selectedChild, setSelectedChild] = useState<string>(initialSelectedChildId || children[0] || '');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('month');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(10000);

  // Filter transactions by selected child and date range
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => t.studentId === selectedChild && t.type === 'purchase');

    // Date range filter
    const now = new Date();
    const rangeStart = new Date();
    if (dateRange === 'week') rangeStart.setDate(now.getDate() - 7);
    if (dateRange === 'month') rangeStart.setMonth(now.getMonth() - 1);

    if (dateRange !== 'all') {
      filtered = filtered.filter(t => new Date(t.date) >= rangeStart);
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Amount range filter
    filtered = filtered.filter(t => t.amount >= minAmount && t.amount <= maxAmount);

    return filtered;
  }, [transactions, selectedChild, dateRange, categoryFilter, minAmount, maxAmount]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return { total: 0, average: 0, max: 0, count: 0 };
    }

    const amounts = filteredTransactions.map(t => t.amount);
    const total = amounts.reduce((a, b) => a + b, 0);
    const average = total / amounts.length;
    const max = Math.max(...amounts);

    return {
      total,
      average,
      max,
      count: amounts.length
    };
  }, [filteredTransactions]);

  // Category breakdown for pie chart
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      const category = t.category || 'Otros';
      breakdown[category] = (breakdown[category] || 0) + t.amount;
    });

    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // Daily spending trend
  const dailyTrend = useMemo(() => {
    const trend: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
      trend[date] = (trend[date] || 0) + t.amount;
    });

    return Object.entries(trend)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, amount]) => ({ date, amount }));
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Monitoreo de Transacciones</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Child selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hijo/a</label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {children.map(child => (
                  <option key={child} value={child}>{`Hijo ${child}`}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mes</option>
                <option value="all">Todo el Tiempo</option>
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todas</option>
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Amount range (visual indicator) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Monto (MXN)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Total Gastado</p>
            <p className="text-2xl font-bold text-gray-900">${stats.total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Promedio por Compra</p>
            <p className="text-2xl font-bold text-gray-900">${stats.average.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Compra Máxima</p>
            <p className="text-2xl font-bold text-gray-900">${stats.max.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Número de Compras</p>
            <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Gasto</h3>
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">Sin transacciones en este período</p>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gasto por Categoría</h3>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">Sin transacciones en este período</p>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Historial Detallado</h3>
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Producto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoría</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ubicación</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.item}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.category || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.location}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                        ${transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No hay transacciones que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => onNavigate?.('PARENT_DASHBOARD')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

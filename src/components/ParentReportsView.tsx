import React, { useState } from 'react';
import { BarChart3, Download, Filter, Calendar } from 'lucide-react';
import '../styles/parentTheme.css';

export default function ParentReportsView() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedStudent, setSelectedStudent] = useState('all');

  const mockTransactions = [
    { date: '2026-02-16', description: 'Comida en cafetería', category: 'Meals', amount: 45.50 },
    { date: '2026-02-16', description: 'Bebida', category: 'Drinks', amount: 15.00 },
    { date: '2026-02-15', description: 'Snacks', category: 'Snacks', amount: 25.00 },
    { date: '2026-02-15', description: 'Comida en cafetería', category: 'Meals', amount: 50.00 },
    { date: '2026-02-14', description: 'Papelería', category: 'Supplies', amount: 120.00 },
  ];

  const mockStats = {
    totalSpent: 255.50,
    transactions: 5,
    average: 51.10,
    categories: {
      'Meals': 95.50,
      'Drinks': 15.00,
      'Snacks': 25.00,
      'Supplies': 120.00,
    }
  };

  const students = ['Juan García', 'María García'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-sky-50 pb-40">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4 mb-6">
            <div className="p-3 md:p-4 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-lg md:rounded-2xl">
              <BarChart3 size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Reportes de Consumo</h1>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Análisis detallado de gastos</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Period Filter */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Período</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            {/* Student Filter */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estudiante</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              >
                <option value="all">Todos los hijos</option>
                {students.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest invisible">Export</label>
              <button className="w-full p-3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Download size={16} /> Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Gastado</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-600">${mockStats.totalSpent.toFixed(2)}</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transacciones</p>
            <p className="text-2xl md:text-3xl font-black text-sky-600">{mockStats.transactions}</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Promedio</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-600">${mockStats.average.toFixed(2)}</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Período</p>
            <p className="text-lg md:text-2xl font-black text-slate-800 uppercase">
              {reportType === 'daily' ? 'Hoy' : reportType === 'weekly' ? 'Esta Semana' : 'Este Mes'}
            </p>
          </div>
        </div>

        {/* Gasto por Categoría */}
        <div className="parent-card space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">📊</div>
            Gasto por Categoría
          </h2>
          <div className="space-y-3">
            {Object.entries(mockStats.categories).map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-700">{category}</span>
                  <span className="font-black text-slate-900">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-sky-600"
                    style={{ width: `${(amount / mockStats.totalSpent) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transacciones Detalladas */}
        <div className="parent-card space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center text-sky-600 font-black text-sm">📝</div>
            Transacciones Detalladas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">Fecha</th>
                  <th className="text-left py-3 px-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">Descripción</th>
                  <th className="text-left py-3 px-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">Categoría</th>
                  <th className="text-right py-3 px-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">Monto</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                    <td className="py-4 px-3">
                      <span className="text-xs font-bold text-slate-700">{tx.date}</span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-sm font-bold text-slate-800">{tx.description}</span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-block px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-black">{tx.category}</span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <span className="font-black text-slate-900">${tx.amount.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Section */}
        <div className="parent-card bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-black text-slate-900 text-base md:text-lg">Exportar Reporte Completo</p>
            <p className="text-[10px] md:text-xs text-slate-500 mt-1">Descarga un PDF o CSV con todos los detalles</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-6 py-3 bg-white border border-emerald-200 rounded-lg font-black text-xs uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-all">PDF</button>
            <button className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-lg font-black text-xs uppercase tracking-widest text-white hover:shadow-lg transition-all">CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}

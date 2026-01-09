import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportingService, SchoolReport } from '../services/reportingService';
import { financialService } from '../services/financialService';

interface AnalyticsDashboardProps {
  schoolId: bigint;
}

interface DashboardData {
  schoolReport: SchoolReport | null;
  topProductsData: any[];
  topUnitsData: any[];
  revenueByDay: any[];
  studentSpendingData: any[];
  loading: boolean;
  error: string | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ schoolId }) => {
  const [data, setData] = useState<DashboardData>({
    schoolReport: null,
    topProductsData: [],
    topUnitsData: [],
    revenueByDay: [],
    studentSpendingData: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadDashboardData();
  }, [schoolId]);

  const loadDashboardData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      // Obtener reporte de escuela
      const schoolReport = await reportingService.getSchoolReport(schoolId, 30);

      if (!schoolReport) {
        throw new Error('Failed to load school report');
      }

      // Procesar datos para gráficos
      const topProductsData = schoolReport.topProducts.map((p) => ({
        name: p.name,
        revenue: p.revenue,
        quantity: p.quantity,
      }));

      const topUnitsData = schoolReport.topOperatingUnits.map((u) => ({
        name: u.name,
        revenue: u.revenue,
      }));

      setData((prev) => ({
        ...prev,
        schoolReport,
        topProductsData,
        topUnitsData,
        loading: false,
      }));
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setData((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false,
      }));
    }
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {data.error}
      </div>
    );
  }

  const report = data.schoolReport;

  if (!report) {
    return <div>No data available</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card: Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Total Ingresos</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            ${report.totalRevenue.toFixed(2)}
          </div>
          <div className="text-gray-400 text-xs mt-1">Últimos 30 días</div>
        </div>

        {/* Card: Total Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Total Transacciones</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {report.totalTransactions}
          </div>
          <div className="text-gray-400 text-xs mt-1">Últimos 30 días</div>
        </div>

        {/* Card: Active Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Estudiantes Activos</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {report.studentCount}
          </div>
          <div className="text-gray-400 text-xs mt-1">Total en escuela</div>
        </div>

        {/* Card: Average Spend */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Gasto Promedio/Estudiante</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            ${report.averageSpendPerStudent.toFixed(2)}
          </div>
          <div className="text-gray-400 text-xs mt-1">Por periodo</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProductsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos ($)" />
              <Bar dataKey="quantity" fill="#10b981" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Operating Units */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos por Concesionaria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.topUnitsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, revenue }) => `${name}: $${revenue}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {data.topUnitsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Resumen de Productos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cantidad</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ingresos</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.topProducts.map((product, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.quantity}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    ${product.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    ${(product.revenue / product.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={loadDashboardData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Actualizar Datos
        </button>
        <button
          onClick={() => {
            // Export to CSV
            const csv = generateCSVReport(report);
            downloadCSV(csv, 'reporte_escuela.csv');
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Descargar Reporte
        </button>
      </div>
    </div>
  );
};

// Helper functions
function generateCSVReport(report: SchoolReport): string {
  const lines = [
    ['Reporte Financiero - ' + report.period],
    [],
    ['Métrica', 'Valor'],
    ['Estudiantes Activos', report.studentCount],
    ['Total Transacciones', report.totalTransactions],
    ['Ingresos Totales', '$' + report.totalRevenue.toFixed(2)],
    ['Gasto Promedio/Estudiante', '$' + report.averageSpendPerStudent.toFixed(2)],
    [],
    ['Productos Más Vendidos'],
    ['Nombre', 'Cantidad', 'Ingresos'],
    ...report.topProducts.map((p) => [p.name, p.quantity, '$' + p.revenue.toFixed(2)]),
  ];

  return lines.map((line) => line.join(',')).join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

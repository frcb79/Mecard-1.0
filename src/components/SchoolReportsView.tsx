/**
 * SchoolReportsView — Reportes Escolares (Financieros + Operacionales)
 * Secciones: Resumen, Financieros, Operacionales, Exportar
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, Download, Calendar, DollarSign, Users, GraduationCap,
  PieChart as PieIcon, ArrowUpRight, ArrowDownRight, FileSpreadsheet, Receipt, ShieldCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { ParentPaymentStatus, AttendanceStatus } from '../types';
import { MOCK_PARENT_PAYMENTS, MOCK_SCHOOL_FEES, MOCK_ATTENDANCE_RECORDS, MOCK_STUDENTS_LIST } from '../constants';
import { useToast } from './ui/Toast';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type Period = '7d' | '30d' | '90d' | 'year';
type Section = 'overview' | 'financial' | 'operational';

export default function SchoolReportsView() {
  const toast = useToast();
  const [period, setPeriod] = useState<Period>('30d');
  const [section, setSection] = useState<Section>('overview');

  // Financial data
  const financialStats = useMemo(() => {
    const payments = MOCK_PARENT_PAYMENTS;
    const totalExpected = payments.reduce((s, p) => s + p.amount, 0);
    const paid = payments.filter(p => p.status === ParentPaymentStatus.PAID);
    const totalPaid = paid.reduce((s, p) => s + (p.paidAmount || p.amount), 0);
    const pending = payments.filter(p => p.status === ParentPaymentStatus.PENDING).reduce((s, p) => s + p.amount, 0);
    const overdue = payments.filter(p => p.status === ParentPaymentStatus.OVERDUE).reduce((s, p) => s + p.amount, 0);
    const rate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;
    return { totalExpected, totalPaid, pending, overdue, rate };
  }, []);

  // Revenue by month chart data
  const revenueByMonth = useMemo(() => {
    const months: Record<string, { month: string; cobrado: number; pendiente: number }> = {};
    MOCK_PARENT_PAYMENTS.forEach(p => {
      const m = p.dueDate.slice(0, 7);
      if (!months[m]) months[m] = { month: m, cobrado: 0, pendiente: 0 };
      if (p.status === ParentPaymentStatus.PAID) months[m].cobrado += p.paidAmount || p.amount;
      else months[m].pendiente += p.amount - (p.paidAmount || 0);
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  // Revenue by fee type pie
  const revenueByFeeType = useMemo(() => {
    const types: Record<string, number> = {};
    MOCK_PARENT_PAYMENTS.filter(p => p.status === ParentPaymentStatus.PAID).forEach(p => {
      const fee = MOCK_SCHOOL_FEES.find(f => f.id === p.feeId);
      const label = fee?.name || 'Otro';
      types[label] = (types[label] || 0) + (p.paidAmount || p.amount);
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, []);

  // Payment status pie
  const paymentStatusPie = useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_PARENT_PAYMENTS.forEach(p => {
      const label = p.status === ParentPaymentStatus.PAID ? 'Pagado' : p.status === ParentPaymentStatus.PENDING ? 'Pendiente' : p.status === ParentPaymentStatus.OVERDUE ? 'Vencido' : p.status === ParentPaymentStatus.PARTIAL ? 'Parcial' : 'Cancelado';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const records = MOCK_ATTENDANCE_RECORDS;
    const total = records.length;
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const late = records.filter(r => r.status === AttendanceStatus.LATE).length;
    const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const excused = records.filter(r => r.status === AttendanceStatus.EXCUSED).length;
    return { total, present, late, absent, excused, attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0 };
  }, []);

  // Attendance by day chart
  const attendanceByDay = useMemo(() => {
    const days: Record<string, { date: string; presentes: number; tardanzas: number; ausentes: number }> = {};
    MOCK_ATTENDANCE_RECORDS.forEach(r => {
      if (!days[r.date]) days[r.date] = { date: r.date, presentes: 0, tardanzas: 0, ausentes: 0 };
      if (r.status === AttendanceStatus.PRESENT) days[r.date].presentes++;
      else if (r.status === AttendanceStatus.LATE) days[r.date].tardanzas++;
      else if (r.status === AttendanceStatus.ABSENT) days[r.date].ausentes++;
    });
    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const exportReport = (type: string) => {
    let csv = '';
    if (type === 'financial') {
      const rows = MOCK_PARENT_PAYMENTS.map(p => `${p.studentName},${p.feeName},${p.amount},${p.status},${p.dueDate},${p.paidAt || ''},${p.paymentMethod || ''}`);
      csv = `Alumno,Concepto,Monto,Estado,Vencimiento,Pagado,Método\n${rows.join('\n')}`;
    } else {
      const rows = MOCK_ATTENDANCE_RECORDS.map(r => `${r.studentName},${r.grade},${r.date},${r.status},${r.entryTime || ''},${r.exitTime || ''},${r.notes || ''}`);
      csv = `Alumno,Grado,Fecha,Estado,Entrada,Salida,Notas\n${rows.join('\n')}`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `reporte_${type}_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.info('Exportado', `Reporte ${type} descargado`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <BarChart3 className="w-9 h-9 text-indigo-600" /> Reportes Escolares
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1">Finanzas, asistencia y métricas operacionales</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportReport('financial')} className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
              <FileSpreadsheet size={16} /> Exportar Finanzas
            </button>
            <button onClick={() => exportReport('attendance')} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all">
              <Download size={16} /> Exportar Asistencia
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 bg-white p-3 rounded-[28px] border border-slate-100 shadow-sm w-fit">
          {([['overview', 'Resumen', <TrendingUp size={16} key="o"/>], ['financial', 'Financiero', <DollarSign size={16} key="f"/>], ['operational', 'Operacional', <Users size={16} key="a"/>]] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setSection(id as Section)}
              className={`px-8 py-3 rounded-[22px] flex items-center gap-2 font-black text-[11px] uppercase tracking-[2px] transition-all ${section === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {section === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-indigo-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[3px] mb-2">Cobranza</p>
                <p className="text-3xl font-black text-indigo-600 tracking-tighter">{financialStats.rate}%</p>
                <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-2"><ArrowUpRight size={12} /> +5% vs mes anterior</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-emerald-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[3px] mb-2">Cobrado</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter">${financialStats.totalPaid.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Asistencia</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{attendanceStats.attendanceRate}%</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2">{attendanceStats.present + attendanceStats.late + attendanceStats.absent} registros</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Alumnos</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{MOCK_STUDENTS_LIST.length}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2">Activos en el plantel</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Cobranza por Mes</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip />
                    <Bar dataKey="cobrado" fill="#6366f1" radius={[8, 8, 0, 0]} name="Cobrado" />
                    <Bar dataKey="pendiente" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pendiente" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Asistencia por Día</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={attendanceByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="presentes" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Presentes" />
                    <Line type="monotone" dataKey="tardanzas" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Tardanzas" />
                    <Line type="monotone" dataKey="ausentes" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Ausentes" />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* FINANCIAL */}
        {section === 'financial' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Financial KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Total Esperado</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">${financialStats.totalExpected.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-emerald-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[3px] mb-2">Total Cobrado</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter">${financialStats.totalPaid.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-amber-100 shadow-sm">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-[3px] mb-2">Pendiente</p>
                <p className="text-3xl font-black text-amber-600 tracking-tighter">${financialStats.pending.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-rose-100 shadow-sm">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-[3px] mb-2">Vencido</p>
                <p className="text-3xl font-black text-rose-600 tracking-tighter">${financialStats.overdue.toLocaleString('es-MX')}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Ingresos por Concepto</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={revenueByFeeType} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {revenueByFeeType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => `$${val.toLocaleString('es-MX')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Estado de Pagos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={paymentStatusPie} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {paymentStatusPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Tendencia de Cobranza Mensual</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val: number) => `$${val.toLocaleString('es-MX')}`} />
                  <Legend />
                  <Bar dataKey="cobrado" fill="#6366f1" radius={[8, 8, 0, 0]} name="Cobrado" />
                  <Bar dataKey="pendiente" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pendiente" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* OPERATIONAL */}
        {section === 'operational' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Attendance KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { label: 'Asistencia', value: `${attendanceStats.attendanceRate}%`, color: 'indigo' },
                { label: 'Presentes', value: attendanceStats.present, color: 'emerald' },
                { label: 'Tardanzas', value: attendanceStats.late, color: 'amber' },
                { label: 'Ausentes', value: attendanceStats.absent, color: 'rose' },
                { label: 'Justificados', value: attendanceStats.excused, color: 'blue' },
              ].map(item => (
                <div key={item.label} className={`bg-white p-6 rounded-[32px] border border-${item.color}-100 shadow-sm`}>
                  <p className={`text-[10px] font-black text-${item.color}-400 uppercase tracking-[3px] mb-2`}>{item.label}</p>
                  <p className={`text-2xl font-black text-${item.color}-600 tracking-tighter`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Attendance Chart */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Asistencia Diaria</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={attendanceByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="presentes" fill="#10b981" radius={[6, 6, 0, 0]} name="Presentes" stackId="a" />
                  <Bar dataKey="tardanzas" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Tardanzas" stackId="a" />
                  <Bar dataKey="ausentes" fill="#ef4444" radius={[6, 6, 0, 0]} name="Ausentes" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-6">Detalle de Asistencia Reciente</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="p-4 rounded-l-xl">Alumno</th>
                      <th className="p-4">Grado</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Entrada</th>
                      <th className="p-4">Salida</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 rounded-r-xl">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MOCK_ATTENDANCE_RECORDS.slice(0, 15).map(r => {
                      const statusColors: Record<string, string> = {
                        [AttendanceStatus.PRESENT]: 'bg-emerald-50 text-emerald-600',
                        [AttendanceStatus.LATE]: 'bg-amber-50 text-amber-600',
                        [AttendanceStatus.ABSENT]: 'bg-rose-50 text-rose-600',
                        [AttendanceStatus.EXCUSED]: 'bg-blue-50 text-blue-600',
                        [AttendanceStatus.EARLY_EXIT]: 'bg-purple-50 text-purple-600',
                      };
                      const statusLabels: Record<string, string> = {
                        [AttendanceStatus.PRESENT]: 'Presente',
                        [AttendanceStatus.LATE]: 'Tarde',
                        [AttendanceStatus.ABSENT]: 'Ausente',
                        [AttendanceStatus.EXCUSED]: 'Justificado',
                        [AttendanceStatus.EARLY_EXIT]: 'Salida temprana',
                      };
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-sm text-slate-700">{r.studentName}</td>
                          <td className="p-4 text-xs text-slate-400">{r.grade}</td>
                          <td className="p-4 text-xs font-mono text-slate-400">{r.date}</td>
                          <td className="p-4 text-xs font-mono text-slate-600">{r.entryTime || '—'}</td>
                          <td className="p-4 text-xs font-mono text-slate-600">{r.exitTime || '—'}</td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                          </td>
                          <td className="p-4 text-xs text-slate-400">{r.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

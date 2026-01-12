import React, { useMemo } from 'react';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  ArrowLeft,
  Receipt,
  PieChart,
  Filter
} from 'lucide-react';
import { AppView, Transaction, StudentProfile, RecentDocument } from '../types';

interface ParentReportsViewProps {
  students: StudentProfile[];
  transactions: Transaction[];
  onNavigate: (view: AppView) => void;
  onNavigateWithStudent: (view: AppView, studentId: string) => void;
  recentDocuments?: RecentDocument[];
}

export const ParentReportsView: React.FC<ParentReportsViewProps> = ({ 
  students, 
  transactions, 
  onNavigate, 
  onNavigateWithStudent, 
  recentDocuments = [] 
}) => {
  
  // Resumen rápido de gastos por alumno
  const studentReports = useMemo(() => {
    // Verificación de seguridad para evitar errores si las props no están listas
    if (!students || !transactions) return [];

    return students.map(student => {
      const studentTx = transactions.filter(t => t.student_id === student.id);
      const totalSpent = studentTx.reduce((sum, t) => sum + (t.type === 'PURCHASE' ? t.amount : 0), 0);
      return {
        ...student,
        totalSpent,
        txCount: studentTx.length
      };
    });
  }, [students, transactions]);

  const handleStudentCardClick = (studentId: string) => {
    onNavigateWithStudent(AppView.PARENT_MONITORING, studentId);
  };

  const handleDownloadStatement = (studentId: string) => {
    console.log(`TODO: Iniciar descarga de estado de cuenta para el alumno: ${studentId}`);
    // Aquí iría la lógica para llamar a un servicio que genere y descargue el PDF.
  };

  const handleFilterPeriod = () => {
    console.log("TODO: Abrir modal o controles para filtrar por período de tiempo.");
  };

  const handleExportAll = () => {
    console.log("TODO: Iniciar exportación de todos los datos consolidados (CSV, Excel, etc.)");
  };

  const handleDownloadDocument = (doc: RecentDocument) => {
    console.log(`TODO: Descargar documento desde ${doc.url}`);
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">Reportes y Estados de Cuenta</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px] mt-4">Historial consolidado de la familia</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleFilterPeriod}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
            <Filter size={14}/> Filtrar Periodo
          </button>
          <button 
            onClick={handleExportAll}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Download size={14}/> Exportar Todo
          </button>
        </div>
      </header>

      {/* Grid de Reportes por Alumno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {studentReports.map(report => (
          <div 
            key={report.id} 
            className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
            onClick={() => handleStudentCardClick(report.id)}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center font-black text-xl">
                  {report.name ? report.name.charAt(0) : '?'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 leading-none">{report.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{report.grade}</p>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                Balance: ${report.balance.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Gasto Acumulado</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">${report.totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Operaciones</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{report.txCount}</p>
              </div>
            </div>

            <button 
              className="w-full py-4 flex items-center justify-between px-6 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[3px] group-hover:bg-indigo-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // Evita que el click se propague a la tarjeta principal
                handleDownloadStatement(report.id);
              }}
            >
              Descargar Estado de Cuenta
              <Download size={16} />
            </button>
          </div>
        ))}
        {studentReports.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[48px] border border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold italic uppercase tracking-widest">No hay datos de alumnos vinculados</p>
          </div>
        )}
      </div>

      {/* Sección de Facturación */}
      <section className="bg-indigo-50 rounded-[56px] p-12 border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
          <Receipt size={180} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-indigo-900 tracking-tight italic uppercase mb-2">Facturación Fiscal</h3>
            <p className="text-indigo-700/70 text-sm font-medium max-w-md">
              Genera facturas CFDI de tus recargas y consumos en cafetería de forma automática.
            </p>
          </div>
          <button 
            onClick={() => onNavigate(AppView.PARENT_BILLING_SETTINGS)}
            className="px-10 py-5 bg-white text-indigo-600 rounded-[28px] font-black text-[11px] uppercase tracking-[4px] shadow-xl shadow-indigo-200/50 hover:scale-105 transition-all">
            Configurar Datos Fiscales
          </button>
        </div>
      </section>

      {/* Historial de Documentos */}
      <div className="bg-white rounded-[56px] border border-slate-100 p-10">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-8 px-2">Documentos Recientes</h4>
        <div className="space-y-4">
          {recentDocuments.length > 0 ? recentDocuments.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-6 hover:bg-slate-50 rounded-[32px] transition-all border border-transparent hover:border-slate-100 group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{doc.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {new Date(doc.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })} • {doc.type}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleDownloadDocument(doc)}
                className="p-4 text-slate-300 hover:text-indigo-600 transition-colors"
              >
                <Download size={20} />
              </button>
            </div>
          )) : (
            <div className="text-center py-10">
              <p className="text-slate-400 font-medium">No hay documentos recientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Exportación por defecto para asegurar compatibilidad con imports directos
export default ParentReportsView;
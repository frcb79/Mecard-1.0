
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Download, Upload, Plus, Edit2, Trash2, 
  Power, PowerOff, Eye, Mail, Phone, Calendar, AlertCircle,
  CheckCircle, XCircle, Users, FileText, RefreshCw, X
} from 'lucide-react';
import { StudentProfile, Category } from '../types';
import { Button } from './Button';
import Papa from 'papaparse';

interface SchoolAdminStudentsViewProps {
  schoolId: string;
  students: StudentProfile[];
  onUpdateStudent: (id: string, data: Partial<StudentProfile>) => void;
  onAddStudent: (student: StudentProfile) => void;
  onDeleteStudent: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const SchoolAdminStudentsView: React.FC<SchoolAdminStudentsViewProps> = ({
  schoolId,
  students,
  onUpdateStudent,
  onAddStudent,
  onDeleteStudent,
  onToggleStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;
      
      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [students, searchTerm, statusFilter, gradeFilter]);

  const uniqueGrades = useMemo(() => {
    return Array.from(new Set(students.map(s => s.grade))).sort();
  }, [students]);

  const handleExportCSV = () => {
    const csvData = filteredStudents.map(s => ({
      ID: s.id,
      Nombre: s.name,
      Grado: s.grade,
      Tutor: s.parentName,
      Saldo: s.balance,
      Estatus: s.status,
      Registro: s.enrollmentDate
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alumnos_${schoolId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
            <input
              type="text"
              placeholder="Buscar por nombre, ID o tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-3xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none"
            >
              <option value="all">Estatus</option>
              <option value="Active">Activos</option>
              <option value="Inactive">Inactivos</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none"
            >
              <option value="all">Grados</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>

            <div className="flex gap-2 ml-auto">
              <button onClick={handleExportCSV} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all" title="Exportar CSV"><Download size={20}/></button>
              <button onClick={() => setShowImportModal(true)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all" title="Importar Masivamente"><Upload size={20}/></button>
              <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-3 ml-2"><Plus size={18} /> Nuevo Alumno</button>
            </div>
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="p-8">Alumno</th>
              <th className="p-8">Grado</th>
              <th className="p-8">Tutor</th>
              <th className="p-8 text-right">Saldo</th>
              <th className="p-8 text-center">Estatus</th>
              <th className="p-8 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-8">
                  <div className="flex items-center gap-5">
                    <img src={student.photo} alt={student.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                    <div>
                      <p className="font-black text-slate-800 text-lg leading-none mb-1">{student.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">ID: {student.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{student.grade}</span>
                </td>
                <td className="p-8">
                  <p className="text-sm font-bold text-slate-600">{student.parentName}</p>
                </td>
                <td className="p-8 text-right">
                  <p className={`text-2xl font-black tracking-tighter ${student.balance < 50 ? 'text-rose-500' : 'text-indigo-600'}`}>${student.balance.toFixed(2)}</p>
                </td>
                <td className="p-8 text-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${student.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    {student.status === 'Active' ? 'Vigente' : 'Suspendido'}
                  </span>
                </td>
                <td className="p-8">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setSelectedStudent(student); setShowEditModal(true); }} className="p-3 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all" title="Editar"><Edit2 size={18} /></button>
                    <button onClick={() => onToggleStatus(student.id)} className={`p-3 rounded-xl transition-all ${student.status === 'Active' ? 'hover:bg-rose-50 text-rose-500' : 'hover:bg-emerald-50 text-emerald-500'}`} title={student.status === 'Active' ? 'Desactivar' : 'Activar'}>{student.status === 'Active' ? <PowerOff size={18} /> : <Power size={18} />}</button>
                    <button onClick={() => { if (window.confirm(`¿Eliminar a ${student.name}?`)) onDeleteStudent(student.id); }} className="p-3 hover:bg-rose-50 text-rose-500 rounded-xl transition-all" title="Eliminar"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal logic (Simulated here for brevity, standard implementation) */}
      {showAddModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6"><div className="bg-white rounded-[56px] p-12 w-full max-w-xl shadow-2xl relative"><button onClick={() => setShowAddModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800"><X size={32}/></button><h3 className="text-3xl font-black mb-8 tracking-tighter">Registrar Alumno</h3><div className="space-y-6"><input placeholder="Nombre Completo" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold" /><input placeholder="Grado" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold" /><Button onClick={() => setShowAddModal(false)} className="w-full py-6 rounded-3xl bg-indigo-600 font-black uppercase">Crear Perfil Estudiantil</Button></div></div></div>}
      
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-2xl p-12 animate-in zoom-in duration-300">
            <button onClick={() => setShowImportModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800"><X size={32}/></button>
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 mx-auto mb-6"><Upload size={40}/></div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Importar Base CSV</h2>
                <p className="text-slate-400 font-medium mt-2">Sincroniza tu base de datos escolar masivamente.</p>
            </div>
            <div className="border-4 border-dashed border-slate-100 rounded-[40px] p-16 text-center hover:border-indigo-400 transition-all bg-slate-50/50 mb-10 group cursor-pointer">
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs group-hover:text-indigo-600 transition-colors">Selecciona o arrastra tu archivo .CSV</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowImportModal(false)} variant="secondary" className="flex-1 py-6 rounded-3xl font-black uppercase text-[10px]">Cancelar</Button>
              <Button onClick={() => setShowImportModal(false)} className="flex-[2] py-6 rounded-3xl bg-indigo-600 font-black uppercase text-[10px] tracking-widest">Iniciar Procesamiento</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

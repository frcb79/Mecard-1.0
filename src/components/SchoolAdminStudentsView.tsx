
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Download, Upload, Plus, Edit2, Trash2, 
  Power, PowerOff, Eye, Mail, Phone, Calendar, AlertCircle,
  CheckCircle, XCircle, Users, FileText, RefreshCw, X, AlertTriangle
} from 'lucide-react';
import { StudentProfile, Category } from '../types';
import { Button } from './Button';
import { useToast } from './ui/Toast';
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
  const [deleteConfirm, setDeleteConfirm] = useState<StudentProfile | null>(null);
  const [addForm, setAddForm] = useState({ name: '', grade: '', parentName: '' });
  const [editForm, setEditForm] = useState({ name: '', grade: '', parentName: '' });
  const toast = useToast();

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
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100">
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
      <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 overflow-hidden">
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
                    <button onClick={() => setDeleteConfirm(student)} className="p-3 hover:bg-rose-50 text-rose-500 rounded-xl transition-all" title="Eliminar"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-12 w-full max-w-xl shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800"><X size={32}/></button>
            <h3 className="text-3xl font-black mb-8 tracking-tighter">Registrar Alumno</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre Completo *</label>
                <input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Nombre Completo" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Grado *</label>
                <input value={addForm.grade} onChange={e => setAddForm({ ...addForm, grade: e.target.value })} placeholder="3-A" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre del Tutor</label>
                <input value={addForm.parentName} onChange={e => setAddForm({ ...addForm, parentName: e.target.value })} placeholder="Nombre del tutor" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
              </div>
              <Button onClick={() => {
                if (!addForm.name.trim() || !addForm.grade.trim()) { toast.warning('Requerido', 'Nombre y grado son obligatorios'); return; }
                onAddStudent({ id: `stu_${Date.now()}`, name: addForm.name.trim(), grade: addForm.grade.trim(), parentName: addForm.parentName.trim() || 'Sin tutor', balance: 0, status: 'Active', enrollmentDate: new Date().toISOString().split('T')[0], photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(addForm.name)}`, allergies: [], spendingLimit: 500 } as StudentProfile);
                setAddForm({ name: '', grade: '', parentName: '' }); setShowAddModal(false);
                toast.info('Registrado', `${addForm.name} fue agregado exitosamente`);
              }} className="w-full py-6 rounded-3xl bg-indigo-600 font-black uppercase">Crear Perfil Estudiantil</Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-12 w-full max-w-xl shadow-2xl relative">
            <button onClick={() => { setShowEditModal(false); setSelectedStudent(null); }} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800"><X size={32}/></button>
            <h3 className="text-3xl font-black mb-8 tracking-tighter">Editar Alumno</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre Completo</label>
                <input defaultValue={selectedStudent.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Grado</label>
                <input defaultValue={selectedStudent.grade} onChange={e => setEditForm(f => ({ ...f, grade: e.target.value }))} className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tutor</label>
                <input defaultValue={selectedStudent.parentName} onChange={e => setEditForm(f => ({ ...f, parentName: e.target.value }))} className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-bold" />
              </div>
              <Button onClick={() => {
                onUpdateStudent(selectedStudent.id, { name: editForm.name || selectedStudent.name, grade: editForm.grade || selectedStudent.grade, parentName: editForm.parentName || selectedStudent.parentName });
                setShowEditModal(false); setSelectedStudent(null);
                toast.info('Actualizado', 'Datos del alumno guardados');
              }} className="w-full py-6 rounded-3xl bg-indigo-600 font-black uppercase">Guardar Cambios</Button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL — redirects to dedicated import wizard */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-12 animate-in zoom-in duration-300 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 mx-auto mb-6"><Upload size={40}/></div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-3">Importar Base CSV</h2>
            <p className="text-slate-400 font-medium text-sm mb-8">Para importaciones masivas utiliza el wizard dedicado con validación completa de CURPs y formato.</p>
            <div className="flex gap-4">
              <Button onClick={() => setShowImportModal(false)} variant="secondary" className="flex-1 py-5 rounded-3xl font-black uppercase text-[10px]">Cancelar</Button>
              <Button onClick={() => { setShowImportModal(false); window.location.hash = '/school/import'; }} className="flex-[2] py-5 rounded-3xl bg-indigo-600 font-black uppercase text-[10px] tracking-widest">Ir al Wizard</Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-10 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} className="text-rose-500" /></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">¿Eliminar a {deleteConfirm.name}?</h3>
            <p className="text-sm text-slate-500 mb-8">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs">Cancelar</button>
              <button onClick={() => { onDeleteStudent(deleteConfirm.id); setDeleteConfirm(null); toast.info('Eliminado', `${deleteConfirm.name} fue removido`); }} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SchoolAdminStudentsView;

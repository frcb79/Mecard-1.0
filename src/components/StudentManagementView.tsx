/**
 * StudentManagementView Component
 * Vista mejorada para administradores de escuela
 * CRUD completo de estudiantes (crear, leer, actualizar, eliminar)
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, MoreVertical, Users, X, AlertTriangle, GraduationCap } from 'lucide-react';
import { useToast } from './ui/Toast';

const ITEMS_PER_PAGE = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURP_RE = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const maskPII = (value: string, visibleEnd = 4) => value.length > visibleEnd ? '•'.repeat(value.length - visibleEnd) + value.slice(-visibleEnd) : value;

export default function StudentManagementView() {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    curp: '',
    phone: '',
    balance: 0,
    clabe: '',
    grade: '',
  });

  // MOCK: Lista de estudiantes
  const [students, setStudents] = useState([
    {
      id: '1',
      name: 'Juan Carlos López',
      email: 'juan.lopez@escuela.mx',
      curp: 'LOJC980415HDFRNN09',
      phone: '5551234567',
      balance: 850.00,
      status: 'active' as const,
      clabe: '002341234567890123',
      grade: '3-A',
      createdAt: '2026-01-15'
    },
    {
      id: '2',
      name: 'María Elena García',
      email: 'maria.garcia@escuela.mx',
      curp: 'GAGM991020HDFRNN12',
      phone: '5559876543',
      balance: 1200.50,
      status: 'active' as const,
      clabe: '002341234567890124',
      grade: '2-B',
      createdAt: '2026-01-10'
    },
    {
      id: '3',
      name: 'Pedro Rodríguez Sánchez',
      email: 'pedro.rodriguez@escuela.mx',
      curp: 'ROSS890512HDFRNN05',
      phone: '5554569999',
      balance: 0,
      status: 'inactive' as const,
      clabe: '002341234567890125',
      grade: '1-C',
      createdAt: '2025-11-20'
    },
  ]);

  // Filtrar y buscar
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.curp.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || student.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, students]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const handleAddStudent = () => {
    setFormData({ name: '', email: '', curp: '', phone: '', balance: 0, clabe: '', grade: '' });
    setModalMode('add');
    setSelectedStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        curp: student.curp,
        phone: student.phone,
        balance: student.balance,
        clabe: student.clabe,
        grade: student.grade || '',
      });
      setSelectedStudent(id);
      setModalMode('edit');
      setShowModal(true);
    }
  };

  const handleSaveStudent = () => {
    if (!formData.name || !formData.email || !formData.curp) {
      toast.warning('Campos requeridos', 'Nombre, email y CURP son obligatorios');
      return;
    }
    if (!EMAIL_RE.test(formData.email)) {
      toast.warning('Email inválido', 'Ingresa un email con formato válido');
      return;
    }
    if (!CURP_RE.test(formData.curp)) {
      toast.warning('CURP inválido', 'El CURP debe tener 18 caracteres alfanuméricos válidos');
      return;
    }
    if (formData.clabe && formData.clabe.length !== 18) {
      toast.warning('CLABE inválida', 'La CLABE debe tener exactamente 18 dígitos');
      return;
    }

    if (modalMode === 'add') {
      const newStudent = {
        id: Date.now().toString(),
        ...formData,
        status: 'active' as const,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setStudents([...students, newStudent]);
    } else if (modalMode === 'edit' && selectedStudent) {
      setStudents(
        students.map(s =>
          s.id === selectedStudent ? { ...s, ...formData } : s
        )
      );
    }

    setShowModal(false);
  };

  const handleDeleteStudent = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setStudents(students.filter(s => s.id !== deleteConfirm));
      toast.info('Eliminado', 'El estudiante fue removido');
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setStudents(
      students.map(s =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Gestión de Estudiantes
            </h1>
            <p className="text-slate-500 font-medium">
              Administra registro, saldos y credenciales de estudiantes
            </p>
          </div>
          <button
            onClick={handleAddStudent}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-4 rounded-[24px] transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Estudiante
          </button>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-[28px] shadow-lg p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* BÚSQUEDA */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="student-search"
                  type="text"
                  placeholder="Buscar por nombre, email o CURP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar por nombre, email o CURP"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[16px] outline-none focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* FILTRO DE ESTADO */}
            <div>
              <select
                id="student-filter-status"
                aria-label="Filtrar por estado"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[16px] outline-none focus:border-blue-600 transition-all font-medium"
              >
                <option value="all">Todos los Estados</option>
                <option value="active">Solo Activos</option>
                <option value="inactive">Solo Inactivos</option>
              </select>
            </div>
          </div>

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Total</p>
              <p className="text-2xl font-black text-slate-900">{students.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px]">Activos</p>
              <p className="text-2xl font-black text-emerald-600">
                {students.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Saldo Total</p>
              <p className="text-2xl font-black text-slate-900">
                ${students.reduce((acc, s) => acc + s.balance, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-[28px] shadow-lg overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg">No hay estudiantes que coincidan</p>
              <p className="text-slate-400 text-sm mt-1">Intenta cambiar tus filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-100">
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                      CURP
                    </th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                      Saldo
                    </th>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[2px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-all ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900">{student.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{student.status === 'active' ? '✓ Activo' : '✗ Inactivo'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium font-mono" title="Dato protegido">
                        {maskPII(student.curp)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900">
                          ${student.balance.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(student.id)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[1px] transition-all ${
                            student.status === 'active'
                              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {student.status === 'active' ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditStudent(student.id)}
                            className="p-2 hover:bg-blue-100 rounded-[12px] transition-all text-blue-600"
                            title="Editar"
                            aria-label={`Editar ${student.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 hover:bg-rose-100 rounded-[12px] transition-all text-rose-600"
                            title="Eliminar"
                            aria-label={`Eliminar ${student.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINACIÓN */}
        {filteredStudents.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredStudents.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} de {filteredStudents.length} estudiantes
            </p>
            <div className="flex gap-2">
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-[12px] font-black text-[10px] uppercase transition-all">Anterior</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-[12px] font-black text-[10px] uppercase transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>{i + 1}</button>
              ))}
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-[12px] font-black text-[10px] uppercase transition-all">Siguiente</button>
            </div>
          </div>
        )}

        {/* INFO BOX */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-100 rounded-[24px] p-6">
          <p className="text-sm text-blue-900 font-bold">
            💡 <strong>Consejo:</strong> Usa la búsqueda para encontrar estudiantes rápidamente. Los cambios se guardan automáticamente.
          </p>
        </div>

        {/* MODAL PARA AGREGAR/EDITAR ESTUDIANTE */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div role="dialog" aria-modal="true" aria-label={modalMode === 'add' ? 'Agregar Estudiante' : 'Editar Estudiante'} className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">
                  {modalMode === 'add' ? 'Agregar Estudiante' : 'Editar Estudiante'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  aria-label="Cerrar formulario"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="student-name" className="block text-sm font-black text-slate-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Carlos López"
                    className="w-full px-4 py-2 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="student-email" className="block text-sm font-black text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="estudiante@escuela.mx"
                    className="w-full px-4 py-2 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* CURP */}
                <div>
                  <label htmlFor="student-curp" className="block text-sm font-black text-slate-700 mb-1">
                    CURP *
                  </label>
                  <input
                    id="student-curp"
                    type="text"
                    value={formData.curp}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                    placeholder="LOJC980415HDFRNN09"
                    maxLength={18}
                    className="w-full px-4 py-2 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="student-phone" className="block text-sm font-black text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    id="student-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="5551234567"
                    className="w-full px-4 py-2 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* CLABE */}
                <div>
                  <label htmlFor="student-clabe" className="block text-sm font-black text-slate-700 mb-1">
                    CLABE (18 dígitos)
                  </label>
                  <input
                    id="student-clabe"
                    type="text"
                    value={formData.clabe}
                    onChange={(e) => setFormData({ ...formData, clabe: e.target.value })}
                    placeholder="002341234567890123"
                    maxLength={18}
                    className="w-full px-4 py-2 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>

                {/* Grado / Grupo */}
                <div>
                  <label htmlFor="student-grade" className="block text-sm font-black text-slate-700 mb-1">
                    Grado / Grupo
                  </label>
                  <input
                    id="student-grade"
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="3-A"
                    className="w-full px-4 py-2 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Saldo Inicial */}
                <div>
                  <label htmlFor="student-balance" className="block text-sm font-black text-slate-700 mb-1">
                    Saldo Inicial
                  </label>
                  <input
                    id="student-balance"
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-black rounded-[16px] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveStudent}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[16px] transition-all"
                >
                  {modalMode === 'add' ? 'Agregar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* DELETE CONFIRMATION DIALOG */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
            <div className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">¿Eliminar alumno?</h3>
              <p className="text-sm text-slate-500 mb-8">Esta acción no se puede deshacer. El alumno será removido del sistema.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 transition-all">Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { UserPlus, UserX, ShieldCheck, Mail, Building2, Briefcase, Filter, Search, X, Check, Users, Edit2, AlertTriangle } from 'lucide-react';
import { UserRole, EntityOwner, OperatingUnit } from '../types';
import { MOCK_UNITS } from '../constants';
import { Button } from './Button';
import { useToast } from './ui/Toast';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unitId?: string;
}

interface SmartStaffManagerProps {
  currentUserRole?: UserRole;
  operatingUnits?: OperatingUnit[];
  ownerScope?: EntityOwner;
}

export const SmartStaffManager: React.FC<SmartStaffManagerProps> = ({ 
  currentUserRole = UserRole.SCHOOL_ADMIN, 
  operatingUnits = MOCK_UNITS,
  ownerScope = EntityOwner.SCHOOL 
}) => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: 's1', name: 'Juan Perez', email: 'juan@cafecumbres.mx', role: UserRole.CAFETERIA_STAFF, unitId: 'unit_01' },
    { id: 's2', name: 'Maria Lopez', email: 'maria@pos.mx', role: UserRole.POS_OPERATOR, unitId: 'unit_01' },
    { id: 's3', name: 'Ana Torres', email: 'ana@papeleria.mx', role: UserRole.STATIONERY_STAFF, unitId: 'unit_02' }
  ]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    if (editingMember) {
      // Edit mode
      setStaff(staff.map(s => s.id === editingMember.id ? {
        ...s,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as any,
        unitId: formData.get('unitId') as string
      } : s));
      toast.info('Actualizado', `${formData.get('name')} fue actualizado`);
      setEditingMember(null);
    } else {
      const newMember: StaffMember = {
        id: `s_${Date.now()}`,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as any,
        unitId: formData.get('unitId') as string
      };
      setStaff([newMember, ...staff]);
      toast.info('Registrado', `${newMember.name} ahora tiene acceso al sistema`);
    }
    setShowAddModal(false);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingMember(member);
    setShowAddModal(true);
  };

  const removeStaff = (id: string) => {
    setRemoveConfirm(id);
  };

  const confirmRemove = () => {
    if (removeConfirm) {
      const member = staff.find(s => s.id === removeConfirm);
      setStaff(staff.filter(s => s.id !== removeConfirm));
      toast.info('Dado de baja', `${member?.name ?? 'Colaborador'} fue removido`);
      setRemoveConfirm(null);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm p-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Mi Personal</h2>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[4px] mt-2">Cajeros y Staff de {operatingUnits[0]?.name}</p>
        </div>
        <Button onClick={() => { setEditingMember(null); setShowAddModal(true); }} className="bg-indigo-600 rounded-[24px] px-8 py-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-100">
          <UserPlus size={18}/> Alta de Personal
        </Button>
      </div>

      <div className="flex gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
          <input 
            placeholder="Busca por nombre o correo..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[28px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStaff.map(member => (
          <div key={member.id} className="flex items-center justify-between p-8 bg-slate-50/50 border border-slate-100 rounded-[40px] hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500 relative">
                <ShieldCheck size={32}/>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              <div>
                <p className="font-black text-slate-800 text-xl leading-none mb-2">{member.name}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.email}</p>
                <div className="flex gap-2 mt-3">
                   <span className="bg-white px-3 py-1 rounded-lg text-[8px] font-black text-indigo-600 border border-indigo-50 uppercase tracking-widest">{member.role}</span>
                </div>
              </div>
            </div>
            <button onClick={() => removeStaff(member.id)} className="p-4 text-slate-300 hover:text-rose-500 bg-white rounded-2xl shadow-sm opacity-0 group-hover:opacity-100 transition-all" title="Dar de baja">
              <UserX size={20}/>
            </button>
            <button onClick={() => handleEditStaff(member)} className="p-4 text-slate-300 hover:text-indigo-500 bg-white rounded-2xl shadow-sm opacity-0 group-hover:opacity-100 transition-all" title="Editar">
              <Edit2 size={20}/>
            </button>
          </div>
        ))}
        {/* Fix: Imported and added missing 'Users' icon for the empty state UI */}
        {filteredStaff.length === 0 && (
          <div className="col-span-full p-20 text-center opacity-20 flex flex-col items-center grayscale">
             <Users size={64} className="mb-4" />
             <p className="font-black uppercase tracking-[5px]">Sin Personal Registrado</p>
          </div>
        )}
      </div>

      {/* MODAL ALTA PERSONAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
           <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-xl p-16 relative animate-in zoom-in duration-300">
              <button onClick={() => { setShowAddModal(false); setEditingMember(null); }} className="absolute top-12 right-12 text-slate-300 hover:text-slate-800 transition-all"><X size={32}/></button>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-10">{editingMember ? 'Editar Miembro' : 'Nuevo Miembro de Staff'}</h3>
              <form onSubmit={handleAddStaff} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
                    <input name="name" required defaultValue={editingMember?.name ?? ''} placeholder="Ej. Pedro Picapiedra" className="w-full p-6 bg-slate-50 rounded-3xl border-none outline-none font-black text-slate-700 text-lg shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Correo de Acceso</label>
                    <input name="email" type="email" required defaultValue={editingMember?.email ?? ''} placeholder="pedro@cafeteria.mx" className="w-full p-6 bg-slate-50 rounded-3xl border-none outline-none font-black text-slate-700 text-lg shadow-inner" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rol en Sistema</label>
                        <select name="role" defaultValue={editingMember?.role ?? UserRole.CAFETERIA_STAFF} className="w-full p-6 bg-slate-50 rounded-3xl border-none outline-none font-black text-slate-700 text-sm shadow-inner appearance-none">
                           <option value={UserRole.CAFETERIA_STAFF}>Cajero Cafetería</option>
                           <option value={UserRole.POS_OPERATOR}>Operador POS</option>
                           <option value={UserRole.CASHIER}>Cajero General</option>
                           <option value={UserRole.STATIONERY_STAFF}>Staff Papelería</option>
                           <option value={UserRole.UNIT_MANAGER}>Gerente de Unidad</option>
                           <option value={UserRole.SCHOOL_FINANCE}>Finanzas Escolar</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unidad Asignada</label>
                        <select name="unitId" defaultValue={editingMember?.unitId ?? operatingUnits[0]?.id} className="w-full p-6 bg-slate-50 rounded-3xl border-none outline-none font-black text-slate-700 text-sm shadow-inner appearance-none">
                           {operatingUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                 </div>
                 <Button type="submit" className="w-full py-8 bg-indigo-600 rounded-[32px] text-white font-black uppercase tracking-[4px] shadow-2xl shadow-indigo-100">{editingMember ? 'Guardar Cambios' : 'Registrar y Generar Acceso'}</Button>
              </form>
           </div>
        </div>
      )}

      {/* REMOVE CONFIRMATION DIALOG */}
      {removeConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">¿Dar de baja?</h3>
            <p className="text-sm text-slate-500 mb-8">El colaborador perderá acceso inmediato a la plataforma.</p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs">Cancelar</button>
              <button onClick={confirmRemove} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 transition-all">Confirmar Baja</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SmartStaffManager;

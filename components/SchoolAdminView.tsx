
import React, { useState, useMemo } from 'react';
import { 
  Users, BookOpen, Utensils, AlertCircle, Plus, Wallet, Search, Filter, 
  ShieldCheck, ShieldAlert, Download, Upload, X, UserPlus, UserX, 
  UserCheck, Save, Landmark, Coffee, Store, HeartPulse, FileText,
  ChefHat, PenTool, Book, LayoutGrid, CheckCircle2, MoreVertical
} from 'lucide-react';
import { StudentProfile, OperatingUnit } from '../types';
import { Button } from './Button';
import { StudentImportWizard } from './StudentImportWizard';

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center space-x-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <div className={`p-6 rounded-3xl ${color} bg-opacity-10 text-white flex items-center justify-center`}>
      <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div className="flex-1">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[2px]">{title}</p>
      <h3 className="text-4xl font-black text-slate-800 mt-1">{value}</h3>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>}
      {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg mt-2 inline-block">{trend}</span>}
    </div>
  </div>
);

export const SchoolAdminView: React.FC<{
  onUpdateStudent: (data: Partial<StudentProfile>) => void;
  currentStudent: StudentProfile;
  allStudents: StudentProfile[];
  onBulkAddStudents: (newStudents: StudentProfile[]) => void;
  operatingUnits: OperatingUnit[];
  onAddUnit: (unit: OperatingUnit) => void;
  onUpdateUnit: (id: string, updates: Partial<OperatingUnit>) => void;
  onDeleteUnit: (id: string) => void;
}> = ({ onUpdateStudent, currentStudent, allStudents, onBulkAddStudents, operatingUnits, onAddUnit, onUpdateUnit, onDeleteUnit }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'entities'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm));
  }, [allStudents, searchTerm]);

  const handleWizardComplete = (newStudents: StudentProfile[]) => {
    onBulkAddStudents(newStudents);
    setShowWizard(false);
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Administración de Campus</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[3px] mt-1">MeCard School Manager • v2.1</p>
            </div>
            <div className="flex bg-white p-2 rounded-[28px] shadow-sm border border-slate-100">
                <button onClick={() => setActiveTab('dashboard')} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}>Resumen</button>
                <button onClick={() => setActiveTab('students')} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}>Alumnos</button>
            </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard title="Total Alumnos" value={allStudents.length} icon={Users} color="bg-indigo-600" trend="+ Importando..." />
              <StatCard title="Saldo Red" value={`$${(allStudents.reduce((a,b)=>a+b.balance,0)).toLocaleString()}`} icon={Landmark} color="bg-emerald-500" />
              <StatCard title="Operaciones Hoy" value="245" icon={Utensils} color="bg-orange-600" />
              <StatCard title="Alertas Médicas" value={allStudents.filter(s=>s.allergies.length>0).length} icon={HeartPulse} color="bg-rose-500" />
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={24}/>
                    <input placeholder="Busca por nombre o matrícula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-20 pr-8 py-6 rounded-[32px] bg-slate-50 border-none outline-none font-black text-slate-700 text-lg shadow-inner" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowWizard(true)} className="bg-indigo-600 text-white px-10 py-6 rounded-[32px] text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-transform hover:scale-105">
                    <Upload size={20}/> Importar Masivamente
                  </button>
                </div>
            </div>
            
            <div className="bg-white rounded-[56px] overflow-hidden border border-slate-100 shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="p-10">Alumno</th>
                        <th className="p-10">Estado Red</th>
                        <th className="p-10 text-right">Saldo MeCard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-10 flex items-center gap-6">
                              <img src={s.photo} className="w-16 h-16 rounded-[24px] object-cover" />
                              <div>
                                <p className="font-black text-slate-800 text-xl tracking-tight">{s.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.grade}</p>
                              </div>
                          </td>
                          <td className="p-10">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase ${s.status === 'Active' ? 'text-emerald-600' : 'text-rose-500'}`}>{s.status}</span>
                            </div>
                          </td>
                          <td className="p-10 text-right font-black text-2xl text-indigo-600">${s.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
            </div>
          </div>
        )}

        {showWizard && (
          <StudentImportWizard 
            schoolId="mx_01" 
            stpCostCenter="123"
            existingStudents={allStudents}
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        )}
    </div>
  );
};

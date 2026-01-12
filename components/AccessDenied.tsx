import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import { UserRole, AppView } from '../types';

interface AccessDeniedProps {
  role: UserRole;
  view: AppView;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ role, view }) => {
  // Validaciones de seguridad para evitar errores "undefined" o de tipo objeto
  const displayRole = typeof role === 'string' 
    ? role.replace(/_/g, ' ') 
    : 'Usuario';
    
  const displayView = typeof view === 'string' 
    ? view.replace(/_/g, ' ') 
    : 'esta sección';

  return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-rose-100/50">
        <Lock size={40} />
      </div>
      
      <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
        Acceso Restringido
      </h2>
      
      <p className="text-slate-500 mt-4 max-w-md font-medium text-sm">
        Tu perfil de <span className="text-indigo-600 font-black">{displayRole}</span> no tiene permisos para visualizar <span className="font-bold text-slate-700">{displayView}</span>.
      </p>
      
      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
        <ShieldAlert className="text-amber-500" size={18} />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
          Este incidente ha sido registrado por el sistema de seguridad
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;

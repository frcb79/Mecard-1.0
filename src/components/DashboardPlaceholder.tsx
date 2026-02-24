import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { LayoutGrid, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardPlaceholderProps {
  title: string;
  role: UserRole;
}

/**
 * Placeholder dashboard component for testing routes
 * Premium/Bento design language
 */
export const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({ title, role }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Administrador',
      [UserRole.SCHOOL_ADMIN]: 'Administrador Escolar',
      [UserRole.SCHOOL_FINANCE]: 'Finanzas Escolar',
      [UserRole.UNIT_MANAGER]: 'Gestor de Unidad',
      [UserRole.POS_OPERATOR]: 'Operador POS',
      [UserRole.CAFETERIA_STAFF]: 'Personal Cafetería',
      [UserRole.STATIONERY_STAFF]: 'Personal Papelería',
      [UserRole.CASHIER]: 'Cajero',
      [UserRole.PARENT]: 'Padre/Tutor',
      [UserRole.STUDENT]: 'Estudiante',
    };
    return roleNames[role] || 'Usuario';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-[56px] shadow-sm border border-slate-100 p-14 max-w-lg w-full space-y-8">
        <div className="flex items-center justify-center">
          <div className="bg-indigo-50 w-20 h-20 rounded-[32px] flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
            {title}
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Bienvenido, {getRoleDisplayName(role)}
          </p>
        </div>

        <div className="bg-indigo-50/60 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">Autenticación exitosa</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">Rol: {role}</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">Sistema de routing activo</span>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs font-medium leading-relaxed px-4">
          El dashboard está siendo cargado. Los componentes específicos de esta sección se integrarán pronto.
        </p>

        <button
          onClick={handleLogout}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;

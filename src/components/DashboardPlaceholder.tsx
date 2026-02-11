import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../types';
import { LayoutGrid, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardPlaceholderProps {
  title: string;
  role: UserRole;
}

/**
 * Placeholder dashboard component for testing routes
 * Shows basic welcome message and navigation
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <LayoutGrid className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
          {title}
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          Bienvenido, <span className="font-semibold">{getRoleDisplayName(role)}</span>
        </p>

        <div className="bg-indigo-50 border border-indigo-200 rounded p-4 mb-6">
          <p className="text-sm text-indigo-800">
            ✓ Autenticación exitosa
          </p>
          <p className="text-sm text-indigo-800">
            ✓ Rol: <span className="font-semibold">{role}</span>
          </p>
          <p className="text-sm text-indigo-800">
            ✓ Sistema de routing activo
          </p>
        </div>

        <p className="text-center text-gray-500 text-sm mb-6">
          El dashboard está siendo cargado. Los componentes específicos de esta sección se integrarán pronto.
        </p>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;

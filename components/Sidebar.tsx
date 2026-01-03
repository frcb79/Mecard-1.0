
import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Settings, LogOut, 
  Wallet, Ban, Building2, PenTool, UserCircle, QrCode, CalendarDays, 
  GraduationCap, Banknote, Zap, History, Users, MessageSquare, ChefHat 
} from 'lucide-react';
import { AppView, UserRole } from '../types';
import { NotificationCenter } from './NotificationCenter';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userRole: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, userRole, onLogout }) => {
  const navItemClass = (view: AppView) => `
    flex items-center w-full px-4 py-3 mb-2 rounded-xl transition-all duration-200
    ${currentView === view ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
  `;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-10 shadow-sm">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-md">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-800 tracking-tight block leading-none">MeCard Hub</span>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mexico v2.1</span>
          </div>
        </div>
        <NotificationCenter userId={userRole === UserRole.PARENT ? 'p_01' : 'staff_01'} />
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {userRole === UserRole.SCHOOL_ADMIN && (
          <>
            <div className="mb-2 px-4 text-xs font-bold text-indigo-500 uppercase tracking-wider">Administración</div>
            <button onClick={() => onNavigate(AppView.SCHOOL_ADMIN_DASHBOARD)} className={navItemClass(AppView.SCHOOL_ADMIN_DASHBOARD)}>
              <GraduationCap className="w-5 h-5 mr-3" /> Directorio Alumnos
            </button>
            <button onClick={() => onNavigate(AppView.SCHOOL_ADMIN_STAFF)} className={navItemClass(AppView.SCHOOL_ADMIN_STAFF)}>
              <Users className="w-5 h-5 mr-3" /> Gestión Personal
            </button>
          </>
        )}

        {userRole === UserRole.UNIT_MANAGER && (
          <>
            <div className="mb-2 px-4 text-xs font-bold text-orange-500 uppercase tracking-wider">Concesionario</div>
            <button onClick={() => onNavigate(AppView.UNIT_MANAGER_DASHBOARD)} className={navItemClass(AppView.UNIT_MANAGER_DASHBOARD)}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard Ventas
            </button>
            <button onClick={() => onNavigate(AppView.POS_CAFETERIA)} className={navItemClass(AppView.POS_CAFETERIA)}>
              <ChefHat className="w-5 h-5 mr-3" /> Abrir POS
            </button>
          </>
        )}

        {userRole === UserRole.CASHIER && (
          <>
            <div className="mb-2 px-4 text-xs font-bold text-emerald-500 uppercase tracking-wider">Ventanilla</div>
            <button onClick={() => onNavigate(AppView.CASHIER_VIEW)} className={navItemClass(AppView.CASHIER_VIEW)}>
              <Banknote className="w-5 h-5 mr-3" /> Recargas
            </button>
          </>
        )}

        {userRole === UserRole.PARENT && (
          <>
            <div className="mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Padre de Familia</div>
            <button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)} className={navItemClass(AppView.PARENT_DASHBOARD)}>
              <UserCircle className="w-5 h-5 mr-3" /> Mi Familia
            </button>
            <button onClick={() => onNavigate(AppView.PARENT_WALLET)} className={navItemClass(AppView.PARENT_WALLET)}>
              <Wallet className="w-5 h-5 mr-3" /> Recargas Online
            </button>
            <button onClick={() => onNavigate(AppView.PARENT_SETTINGS)} className={navItemClass(AppView.PARENT_SETTINGS)}>
              <Ban className="w-5 h-5 mr-3" /> Límites y Bloqueos
            </button>
          </>
        )}

        {userRole === UserRole.STUDENT && (
          <>
            <div className="mb-2 px-4 text-xs font-bold text-indigo-500 uppercase tracking-wider">Mi Portal</div>
            <button onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)} className={navItemClass(AppView.STUDENT_DASHBOARD)}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Inicio
            </button>
            <button onClick={() => onNavigate(AppView.STUDENT_ID)} className={navItemClass(AppView.STUDENT_ID)}>
              <QrCode className="w-5 h-5 mr-3" /> Mi Credencial
            </button>
            <button onClick={() => onNavigate(AppView.STUDENT_HISTORY)} className={navItemClass(AppView.STUDENT_HISTORY)}>
              <History className="w-5 h-5 mr-3" /> Mi Consumo
            </button>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button onClick={onLogout} className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

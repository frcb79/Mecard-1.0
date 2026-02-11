
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Settings, LogOut, 
  Wallet, Ban, Building2, PenTool, UserCircle, QrCode, CalendarDays, 
  GraduationCap, Banknote, Zap, History, Users, MessageSquare, ChefHat,
  ShieldCheck, Globe, Rocket, HelpCircle, Gift, Layers, Terminal, PieChart
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from './NotificationCenter';

/**
 * Sidebar Component - Navegación dinámica por rol
 * Usa React Router v7 para navegación
 * Se adapta automáticamente según UserRole en AuthContext
 */
export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const userRole = user?.role || UserRole.STUDENT;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

  /**
   * Ruta activa basada en pathname
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  /**
   * Clases dinámicas para items de navegación
   */
  const navItemClass = (path: string) => `
    flex items-center w-full px-5 py-3.5 mb-2 rounded-[20px] transition-all duration-300 group
    ${isActive(path)
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-black scale-[1.02]' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}
  `;

  /**
   * Manejar logout
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-[100] shadow-sm font-sans overflow-hidden">
      {/* HEADER */}
      <div className="p-8 border-b border-slate-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-[14px] shadow-lg shadow-indigo-200 rotate-3 group">
            <Zap className="w-6 h-6 text-white group-hover:animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter block leading-none">
              MeCard<span className="text-indigo-600">.</span>
            </span>
            <span className="text-[8px] uppercase font-black text-slate-300 tracking-[3px] mt-1 block">
              Network Hub
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
        {/* ========== SUPER ADMIN SECTION ========== */}
        {isSuperAdmin && (
          <div className="space-y-6">
            {/* Gestión Global */}
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-indigo-400 uppercase tracking-[4px] flex items-center gap-2">
                <ShieldCheck size={10}/> Gestión Global
              </div>
              <button 
                onClick={() => navigate('/admin')} 
                className={navItemClass('/admin')}
              >
                <Globe className="w-5 h-5 mr-3" /> Dashboard
              </button>
              <button 
                onClick={() => navigate('/admin/schools')} 
                className={navItemClass('/admin/schools')}
              >
                <Building2 className="w-5 h-5 mr-3" /> Escuelas
              </button>
              <button 
                onClick={() => navigate('/admin/settlement')} 
                className={navItemClass('/admin/settlement')}
              >
                <Banknote className="w-5 h-5 mr-3" /> Settlement
              </button>
              <button 
                onClick={() => navigate('/admin/reports')} 
                className={navItemClass('/admin/reports')}
              >
                <PieChart className="w-5 h-5 mr-3" /> Reportes
              </button>
              <button 
                onClick={() => navigate('/admin/config')} 
                className={navItemClass('/admin/config')}
              >
                <Settings className="w-5 h-5 mr-3" /> Configuración
              </button>
            </div>

            {/* Módulos de Escuela */}
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-slate-400 uppercase tracking-[4px]">
                Demostración de Módulos
              </div>
              <button 
                onClick={() => navigate('/school')} 
                className={navItemClass('/school')}
              >
                <GraduationCap className="w-5 h-5 mr-3" /> Admin Escuela
              </button>
              <button 
                onClick={() => navigate('/unit')} 
                className={navItemClass('/unit')}
              >
                <ChefHat className="w-5 h-5 mr-3" /> Gerente Unidad
              </button>
            </div>

            {/* Operación POS */}
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-slate-400 uppercase tracking-[4px]">
                Operación POS
              </div>
              <button 
                onClick={() => navigate('/pos')} 
                className={navItemClass('/pos')}
              >
                <Terminal className="w-5 h-5 mr-3" /> Venta Cafetería
              </button>
              <button 
                onClick={() => navigate('/pos/stationery')} 
                className={navItemClass('/pos/stationery')}
              >
                <PenTool className="w-5 h-5 mr-3" /> Venta Papelería
              </button>
              <button 
                onClick={() => navigate('/cashier')} 
                className={navItemClass('/cashier')}
              >
                <Wallet className="w-5 h-5 mr-3" /> Caja Recargas
              </button>
            </div>

            {/* Portales de Usuario */}
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-slate-400 uppercase tracking-[4px]">
                Portales de Usuario
              </div>
              <button 
                onClick={() => navigate('/parent')} 
                className={navItemClass('/parent')}
              >
                <UserCircle className="w-5 h-5 mr-3" /> Portal Padres
              </button>
              <button 
                onClick={() => navigate('/student')} 
                className={navItemClass('/student')}
              >
                <Users className="w-5 h-5 mr-3" /> Portal Estudiante
              </button>
            </div>
          </div>
        )}

        {/* ========== SCHOOL ADMIN SECTION ========== */}
        {userRole === UserRole.SCHOOL_ADMIN && (
          <div className="space-y-6">
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-indigo-400 uppercase tracking-[4px]">
                <ShieldCheck size={10} className="inline mr-2"/> Mi Escuela
              </div>
              <button 
                onClick={() => navigate('/school')} 
                className={navItemClass('/school')}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
              </button>
              <button 
                onClick={() => navigate('/school/students')} 
                className={navItemClass('/school/students')}
              >
                <Users className="w-5 h-5 mr-3" /> Estudiantes
              </button>
              <button 
                onClick={() => navigate('/school/staff')} 
                className={navItemClass('/school/staff')}
              >
                <UserCircle className="w-5 h-5 mr-3" /> Personal
              </button>
              <button 
                onClick={() => navigate('/school/import')} 
                className={navItemClass('/school/import')}
              >
                <Layers className="w-5 h-5 mr-3" /> Importar
              </button>
              <button 
                onClick={() => navigate('/school/config')} 
                className={navItemClass('/school/config')}
              >
                <Settings className="w-5 h-5 mr-3" /> Configuración
              </button>
            </div>
          </div>
        )}

        {/* ========== UNIT MANAGER SECTION ========== */}
        {userRole === UserRole.UNIT_MANAGER && (
          <div className="space-y-6">
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-indigo-400 uppercase tracking-[4px]">
                Mi Unidad
              </div>
              <button 
                onClick={() => navigate('/unit')} 
                className={navItemClass('/unit')}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
              </button>
              <button 
                onClick={() => navigate('/unit/inventory')} 
                className={navItemClass('/unit/inventory')}
              >
                <ShoppingCart className="w-5 h-5 mr-3" /> Inventario
              </button>
              <button 
                onClick={() => navigate('/unit/staff')} 
                className={navItemClass('/unit/staff')}
              >
                <Users className="w-5 h-5 mr-3" /> Personal
              </button>
            </div>
          </div>
        )}

        {/* ========== POS OPERATOR SECTION ========== */}
        {[UserRole.POS_OPERATOR, UserRole.CAFETERIA_STAFF, UserRole.CASHIER].includes(userRole) && (
          <div className="space-y-6">
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-indigo-400 uppercase tracking-[4px]">
                Operación
              </div>
              <button 
                onClick={() => navigate('/pos')} 
                className={navItemClass('/pos')}
              >
                <Terminal className="w-5 h-5 mr-3" /> Punto de Venta
              </button>
              <button 
                onClick={() => navigate('/cashier')} 
                className={navItemClass('/cashier')}
              >
                <Banknote className="w-5 h-5 mr-3" /> Caja
              </button>
            </div>
          </div>
        )}

        {/* ========== PARENT SECTION ========== */}
        {userRole === UserRole.PARENT && (
          <div className="space-y-6">
            <div>
              <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">
                Portal Familiar
              </div>
              <button 
                onClick={() => navigate('/parent')} 
                className={navItemClass('/parent')}
              >
                <UserCircle className="w-5 h-5 mr-3" /> Mi Familia
              </button>
              <button 
                onClick={() => navigate('/parent/wallet')} 
                className={navItemClass('/parent/wallet')}
              >
                <Wallet className="w-5 h-5 mr-3" /> Billetera
              </button>
            </div>
          </div>
        )}

        {/* ========== STUDENT SECTION ========== */}
        {userRole === UserRole.STUDENT && (
          <div className="space-y-6">
            <div>
              <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">
                Mi Cuenta
              </div>
              <button 
                onClick={() => navigate('/student')} 
                className={navItemClass('/student')}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" /> Inicio
              </button>
              <button 
                onClick={() => navigate('/student/id')} 
                className={navItemClass('/student/id')}
              >
                <QrCode className="w-5 h-5 mr-3" /> Mi Credencial
              </button>
              <button 
                onClick={() => navigate('/student/history')} 
                className={navItemClass('/student/history')}
              >
                <History className="w-5 h-5 mr-3" /> Historial
              </button>
              <button 
                onClick={() => navigate('/student/menu')} 
                className={navItemClass('/student/menu')}
              >
                <UtensilsCrossed className="w-5 h-5 mr-3" /> Menú
              </button>
              <button 
                onClick={() => navigate('/student/social')} 
                className={navItemClass('/student/social')}
              >
                <MessageSquare className="w-5 h-5 mr-3" /> Social
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* NOTIFICATIONS & LOGOUT */}
      <div className="p-4 shrink-0 border-t border-slate-100">
        <NotificationCenter />
      </div>
      
      <div className="p-6 shrink-0 bg-slate-50/50 border-t border-slate-100">
        <button 
          onClick={handleLogout} 
          className="flex items-center w-full px-6 py-4 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-[20px] transition-all uppercase tracking-[2px]"
        >
          <LogOut className="w-4 h-4 mr-3" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};


export default Sidebar;


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
    flex items-center w-full px-5 py-4 mb-3 rounded-[24px] transition-all duration-300 group
    ${currentView === view 
      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-black' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}
  `;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-[100] shadow-sm font-sans">
      <div className="p-8 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-[14px] shadow-lg shadow-indigo-200 rotate-3 group">
            <Zap className="w-6 h-6 text-white group-hover:animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter block leading-none">MeCard<span className="text-indigo-600">.</span></span>
            <span className="text-[9px] uppercase font-black text-slate-300 tracking-[3px] mt-1 block">Network Hub</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto scrollbar-hide">
        {userRole === UserRole.SCHOOL_ADMIN && (
          <>
            <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Gestión de Campus</div>
            <button onClick={() => onNavigate(AppView.SCHOOL_ADMIN_DASHBOARD)} className={navItemClass(AppView.SCHOOL_ADMIN_DASHBOARD)}>
              <GraduationCap className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.SCHOOL_ADMIN_DASHBOARD ? '' : 'group-hover:scale-110'}`} /> Directorio
            </button>
            <button onClick={() => onNavigate(AppView.SCHOOL_ADMIN_STAFF)} className={navItemClass(AppView.SCHOOL_ADMIN_STAFF)}>
              <Users className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.SCHOOL_ADMIN_STAFF ? '' : 'group-hover:scale-110'}`} /> Personal
            </button>
          </>
        )}

        {userRole === UserRole.UNIT_MANAGER && (
          <>
            <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Concesionario</div>
            <button onClick={() => onNavigate(AppView.UNIT_MANAGER_DASHBOARD)} className={navItemClass(AppView.UNIT_MANAGER_DASHBOARD)}>
              <LayoutDashboard className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.UNIT_MANAGER_DASHBOARD ? '' : 'group-hover:scale-110'}`} /> Dashboard
            </button>
            <button onClick={() => onNavigate(AppView.POS_CAFETERIA)} className={navItemClass(AppView.POS_CAFETERIA)}>
              <ChefHat className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.POS_CAFETERIA ? '' : 'group-hover:scale-110'}`} /> Terminal POS
            </button>
          </>
        )}

        {userRole === UserRole.CASHIER && (
          <>
            <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Terminal de Cobro</div>
            <button onClick={() => onNavigate(AppView.CASHIER_VIEW)} className={navItemClass(AppView.CASHIER_VIEW)}>
              <Banknote className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.CASHIER_VIEW ? '' : 'group-hover:scale-110'}`} /> Ventanilla
            </button>
          </>
        )}

        {userRole === UserRole.PARENT && (
          <>
            <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Portal Familiar</div>
            <button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)} className={navItemClass(AppView.PARENT_DASHBOARD)}>
              <UserCircle className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.PARENT_DASHBOARD ? '' : 'group-hover:scale-110'}`} /> Mi Familia
            </button>
            <button onClick={() => onNavigate(AppView.PARENT_WALLET)} className={navItemClass(AppView.PARENT_WALLET)}>
              <Wallet className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.PARENT_WALLET ? '' : 'group-hover:scale-110'}`} /> Billetera
            </button>
            <button onClick={() => onNavigate(AppView.PARENT_SETTINGS)} className={navItemClass(AppView.PARENT_SETTINGS)}>
              <Ban className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.PARENT_SETTINGS ? '' : 'group-hover:scale-110'}`} /> Seguridad
            </button>
          </>
        )}

        {userRole === UserRole.STUDENT && (
          <>
            <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Student Hub</div>
            <button onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)} className={navItemClass(AppView.STUDENT_DASHBOARD)}>
              <LayoutDashboard className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.STUDENT_DASHBOARD ? '' : 'group-hover:scale-110'}`} /> Inicio
            </button>
            <button onClick={() => onNavigate(AppView.STUDENT_ID)} className={navItemClass(AppView.STUDENT_ID)}>
              <QrCode className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.STUDENT_ID ? '' : 'group-hover:scale-110'}`} /> Mi Card
            </button>
            <button onClick={() => onNavigate(AppView.STUDENT_HISTORY)} className={navItemClass(AppView.STUDENT_HISTORY)}>
              <History className={`w-5 h-5 mr-3 transition-transform ${currentView === AppView.STUDENT_HISTORY ? '' : 'group-hover:scale-110'}`} /> Consumo
            </button>
          </>
        )}
      </nav>

      <div className="p-6">
        <button onClick={onLogout} className="flex items-center w-full px-6 py-4 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-[20px] transition-all uppercase tracking-[2px]">
            <LogOut className="w-4 h-4 mr-3" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

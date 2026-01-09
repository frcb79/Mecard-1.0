
import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Settings, LogOut, 
  Wallet, Ban, Building2, PenTool, UserCircle, QrCode, CalendarDays, 
  GraduationCap, Banknote, Zap, History, Users, MessageSquare, ChefHat,
  ShieldCheck, Globe, Rocket, HelpCircle, Gift, Layers, Terminal, Bell, TrendingUp, BarChart3
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
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

  const navItemClass = (view: AppView) => `
    flex items-center w-full px-5 py-3.5 mb-2 rounded-[20px] transition-all duration-300 group
    ${currentView === view 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-black scale-[1.02]' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}
  `;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-[100] shadow-sm font-sans overflow-hidden">
      <div className="p-8 border-b border-slate-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-[14px] shadow-lg shadow-indigo-200 rotate-3 group">
            <Zap className="w-6 h-6 text-white group-hover:animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter block leading-none">MeCard<span className="text-indigo-600">.</span></span>
            <span className="text-[8px] uppercase font-black text-slate-300 tracking-[3px] mt-1 block">Network Hub</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
        {/* SECCIÓN MASTER PARA SUPER ADMIN (VISIBILIDAD TOTAL) */}
        {isSuperAdmin && (
          <div className="space-y-6">
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-indigo-400 uppercase tracking-[4px] flex items-center gap-2">
                <ShieldCheck size={10}/> Gestión Global
              </div>
              <button onClick={() => onNavigate(AppView.SUPER_ADMIN_DASHBOARD)} className={navItemClass(AppView.SUPER_ADMIN_DASHBOARD)}>
                <Globe className="w-5 h-5 mr-3" /> Infraestructura
              </button>
            </div>

            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-slate-400 uppercase tracking-[4px]">Modulos de Escuela</div>
              <button onClick={() => onNavigate(AppView.SCHOOL_ADMIN_DASHBOARD)} className={navItemClass(AppView.SCHOOL_ADMIN_DASHBOARD)}>
                <GraduationCap className="w-5 h-5 mr-3" /> Campus Admin
              </button>
              <button onClick={() => onNavigate(AppView.ANALYTICS_DASHBOARD)} className={navItemClass(AppView.ANALYTICS_DASHBOARD)}>
                <TrendingUp className="w-5 h-5 mr-3" /> Analytics
              </button>
              <button onClick={() => onNavigate(AppView.STUDENT_MONITORING)} className={navItemClass(AppView.STUDENT_MONITORING)}>
                <Bell className="w-5 h-5 mr-3" /> Monitoreo
              </button>
              <button onClick={() => onNavigate(AppView.UNIT_MANAGER_DASHBOARD)} className={navItemClass(AppView.UNIT_MANAGER_DASHBOARD)}>
                <ChefHat className="w-5 h-5 mr-3" /> Concesionarios
              </button>
              <button onClick={() => onNavigate(AppView.CONCESSIONAIRE_SALES)} className={navItemClass(AppView.CONCESSIONAIRE_SALES)}>
                <BarChart3 className="w-5 h-5 mr-3" /> Reportes de Ventas
              </button>
            </div>

            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-slate-400 uppercase tracking-[4px]">Operación POS</div>
              <button onClick={() => onNavigate(AppView.POS_CAFETERIA)} className={navItemClass(AppView.POS_CAFETERIA)}>
                <Terminal className="w-5 h-5 mr-3" /> Terminal Venta
              </button>
              <button onClick={() => onNavigate(AppView.CASHIER_VIEW)} className={navItemClass(AppView.CASHIER_VIEW)}>
                <Banknote className="w-5 h-5 mr-3" /> Caja Recargas
              </button>
              <button onClick={() => onNavigate(AppView.POS_GIFT_REDEEM)} className={navItemClass(AppView.POS_GIFT_REDEEM)}>
                <Gift className="w-5 h-5 mr-3" /> Canje Regalos
              </button>
            </div>

            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-slate-400 uppercase tracking-[4px]">Portales de Usuario</div>
              <button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)} className={navItemClass(AppView.PARENT_DASHBOARD)}>
                <UserCircle className="w-5 h-5 mr-3" /> Portal Padres
              </button>
              <button onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)} className={navItemClass(AppView.STUDENT_DASHBOARD)}>
                <Users className="w-5 h-5 mr-3" /> Student Hub
              </button>
            </div>
            
            <div>
              <div className="mb-4 px-5 text-[8px] font-black text-slate-400 uppercase tracking-[4px]">Soporte</div>
              <button onClick={() => onNavigate(AppView.HELP_DESK)} className={navItemClass(AppView.HELP_DESK)}>
                <MessageSquare className="w-5 h-5 mr-3" /> Help Desk
              </button>
            </div>
          </div>
        )}

        {/* VISTAS ESPECÍFICAS PARA ROLES NO ADMIN (FALLBACK) */}
        {!isSuperAdmin && userRole === UserRole.PARENT && (
          <>
            <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Portal Familiar</div>
            <button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)} className={navItemClass(AppView.PARENT_DASHBOARD)}>
              <UserCircle className="w-5 h-5 mr-3" /> Mi Familia
            </button>
            <button onClick={() => onNavigate(AppView.PARENT_WALLET)} className={navItemClass(AppView.PARENT_WALLET)}>
              <Wallet className="w-5 h-5 mr-3" /> Billetera
            </button>
            <button onClick={() => onNavigate(AppView.PARENT_ALERTS)} className={navItemClass(AppView.PARENT_ALERTS)}>
              <Bell className="w-5 h-5 mr-3" /> Alertas y Notificaciones
            </button>
            <button onClick={() => onNavigate(AppView.PARENT_MONITORING)} className={navItemClass(AppView.PARENT_MONITORING)}>
              <TrendingUp className="w-5 h-5 mr-3" /> Monitoreo Avanzado
            </button>
            <button onClick={() => onNavigate(AppView.PARENT_SETTINGS)} className={navItemClass(AppView.PARENT_SETTINGS)}>
              <Ban className="w-5 h-5 mr-3" /> Seguridad
            </button>
          </>
        )}

        {!isSuperAdmin && userRole === UserRole.STUDENT && (
          <>
            <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Student Hub</div>
            <button onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)} className={navItemClass(AppView.STUDENT_DASHBOARD)}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Inicio
            </button>
            <button onClick={() => onNavigate(AppView.STUDENT_ID)} className={navItemClass(AppView.STUDENT_ID)}>
              <QrCode className="w-5 h-5 mr-3" /> Mi Card
            </button>
            <button onClick={() => onNavigate(AppView.STUDENT_HISTORY)} className={navItemClass(AppView.STUDENT_HISTORY)}>
              <History className="w-5 h-5 mr-3" /> Consumo
            </button>
          </>
        )}
      </nav>

      <div className="p-6 shrink-0 bg-slate-50/50">
        <button onClick={onLogout} className="flex items-center w-full px-6 py-4 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-[20px] transition-all uppercase tracking-[2px]">
            <LogOut className="w-4 h-4 mr-3" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

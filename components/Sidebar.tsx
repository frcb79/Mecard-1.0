import React from 'react';
import { 
  LayoutDashboard, Users, Wallet, ShoppingBag, CreditCard, 
  Settings, LogOut, Activity, BarChart3, HelpCircle, 
  FileText, ShieldCheck, Zap, Store, UserPlus, RefreshCw
} from 'lucide-react';
import { AppView, UserRole } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userRole: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, userRole, onLogout }) => {
  
  // Definición de Secciones por Rol (Paso 2 del Plan)
  const renderRoleSections = () => {
    switch(userRole) {
      case UserRole.SUPER_ADMIN:
        return (
          <>
            <SectionHeader label="Plataforma SaaS" />
            <NavItem view={AppView.SUPER_ADMIN_DASHBOARD} icon={<ShieldCheck size={18}/>} label="Super Admin" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.ANALYTICS_DASHBOARD} icon={<BarChart3 size={18}/>} label="Análisis Global" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.HELP_DESK} icon={<HelpCircle size={18}/>} label="Tickets Soporte" current={currentView} onClick={onNavigate} />
          </>
        );

      case UserRole.SCHOOL_ADMIN:
        return (
          <>
            <SectionHeader label="Gestión Escolar" />
            <NavItem view={AppView.SCHOOL_ADMIN_DASHBOARD} icon={<Activity size={18}/>} label="Dashboard Escuela" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.STUDENT_MONITORING} icon={<Users size={18}/>} label="Monitoreo Alumnos" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.ANALYTICS_DASHBOARD} icon={<BarChart3 size={18}/>} label="Reportes" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.HELP_DESK} icon={<HelpCircle size={18}/>} label="Mesa de Ayuda" current={currentView} onClick={onNavigate} />
          </>
        );

      case UserRole.UNIT_MANAGER:
        return (
          <>
            <SectionHeader label="Mi Concesión" />
            <NavItem view={AppView.UNIT_MANAGER_DASHBOARD} icon={<Store size={18}/>} label="Dashboard POS" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.CONCESSIONAIRE_SALES} icon={<BarChart3 size={18}/>} label="Mis Ventas" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.HELP_DESK} icon={<HelpCircle size={18}/>} label="Soporte Técnico" current={currentView} onClick={onNavigate} />
          </>
        );

      case UserRole.PARENT:
        return (
          <>
            <SectionHeader label="Centro Familiar" />
            <NavItem view={AppView.PARENT_DASHBOARD} icon={<Users size={18}/>} label="Mi Familia" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.PARENT_WALLET} icon={<Wallet size={18}/>} label="Mi Billetera" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.PARENT_REPORTS} icon={<FileText size={18}/>} label="Estados de Cuenta" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.PARENT_SETTINGS} icon={<Settings size={18}/>} label="Configuración" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.HELP_DESK} icon={<HelpCircle size={18}/>} label="Ayuda" current={currentView} onClick={onNavigate} />
          </>
        );

      case UserRole.STUDENT:
        return (
          <>
            <SectionHeader label="Mi Cuenta" />
            <NavItem view={AppView.STUDENT_DASHBOARD} icon={<CreditCard size={18}/>} label="Mi Tarjeta" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.STUDENT_HISTORY} icon={<Activity size={18}/>} label="Mi Consumo" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.HELP_DESK} icon={<HelpCircle size={18}/>} label="Soporte" current={currentView} onClick={onNavigate} />
          </>
        );

      case UserRole.CASHIER:
      case UserRole.POS_OPERATOR:
        return (
          <>
            <SectionHeader label="Terminal Punto de Venta" />
            <NavItem view={AppView.POS_CAFETERIA} icon={<ShoppingBag size={18}/>} label="Cobro Cafetería" current={currentView} onClick={onNavigate} />
            <NavItem view={AppView.POS_GIFT_REDEEM} icon={<Zap size={18}/>} label="Canje Regalos" current={currentView} onClick={onNavigate} />
            {userRole === UserRole.CASHIER && (
              <NavItem view={AppView.CASHIER_VIEW} icon={<RefreshCw size={18}/>} label="Recarga de Saldo" current={currentView} onClick={onNavigate} />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-slate-900 h-full flex flex-col shrink-0 fixed left-0 top-0 text-white z-50 shadow-2xl">
      <div className="p-8 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap size={20} className="fill-white" />
        </div>
        <span className="font-black italic text-xl tracking-tighter uppercase">MeCard<span className="text-indigo-500">.</span></span>
      </div>
      
      <div className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
        {renderRoleSections()}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1 tracking-widest">Rol Activo</p>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">{userRole?.replace('_', ' ')}</p>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 font-bold text-sm transition-all group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

const SectionHeader = ({ label }: { label: string }) => (
  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mb-4 mt-6 px-2">{label}</p>
);

const NavItem = ({ view, icon, label, current, onClick }: any) => (
  <button
    onClick={() => onClick(view)}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${current === view ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
    {label}
  </button>
);
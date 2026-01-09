
import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Settings, LogOut, 
  Wallet, Ban, Building2, PenTool, UserCircle, QrCode, CalendarDays, 
  GraduationCap, Banknote, Zap, History, Users, MessageSquare, ChefHat,
  ShieldCheck, Globe, Rocket, HelpCircle, Gift, Layers, Terminal, Bell, TrendingUp, BarChart3
} from 'lucide-react';
import { AppView, UserRole } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { canAccessView } from '../lib/rolePermissions';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userRole: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, userRole, onLogout }) => {
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-[100] shadow-sm font-sans overflow-hidden">
      {/* HEADER */}
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

      {/* NAVEGACIÓN */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
        
        {/* ========== SUPER ADMIN ========== */}
        {isSuperAdmin && (
          <>
            <SidebarSection title="🛡️ Gestión Global">
              <SidebarButton
                icon={<Globe className="w-5 h-5" />}
                label="Infraestructura"
                active={currentView === AppView.SUPER_ADMIN_DASHBOARD}
                onClick={() => onNavigate(AppView.SUPER_ADMIN_DASHBOARD)}
              />
            </SidebarSection>

            <SidebarSection title="🏫 Módulos de Escuela">
              <SidebarButton
                icon={<GraduationCap className="w-5 h-5" />}
                label="Campus Admin"
                active={currentView === AppView.SCHOOL_ADMIN_DASHBOARD}
                onClick={() => onNavigate(AppView.SCHOOL_ADMIN_DASHBOARD)}
              />
              <SidebarButton
                icon={<TrendingUp className="w-5 h-5" />}
                label="Analytics"
                active={currentView === AppView.ANALYTICS_DASHBOARD}
                onClick={() => onNavigate(AppView.ANALYTICS_DASHBOARD)}
              />
              <SidebarButton
                icon={<Bell className="w-5 h-5" />}
                label="Monitoreo"
                active={currentView === AppView.STUDENT_MONITORING}
                onClick={() => onNavigate(AppView.STUDENT_MONITORING)}
              />
              <SidebarButton
                icon={<ChefHat className="w-5 h-5" />}
                label="Concesionarios"
                active={currentView === AppView.UNIT_MANAGER_DASHBOARD}
                onClick={() => onNavigate(AppView.UNIT_MANAGER_DASHBOARD)}
              />
              <SidebarButton
                icon={<BarChart3 className="w-5 h-5" />}
                label="Reportes Ventas"
                active={currentView === AppView.CONCESSIONAIRE_SALES}
                onClick={() => onNavigate(AppView.CONCESSIONAIRE_SALES)}
              />
            </SidebarSection>

            <SidebarSection title="💳 Operación POS">
              <SidebarButton
                icon={<Terminal className="w-5 h-5" />}
                label="Terminal Venta"
                active={currentView === AppView.POS_CAFETERIA}
                onClick={() => onNavigate(AppView.POS_CAFETERIA)}
              />
              <SidebarButton
                icon={<Banknote className="w-5 h-5" />}
                label="Caja Recargas"
                active={currentView === AppView.CASHIER_VIEW}
                onClick={() => onNavigate(AppView.CASHIER_VIEW)}
              />
              <SidebarButton
                icon={<Gift className="w-5 h-5" />}
                label="Canje Regalos"
                active={currentView === AppView.POS_GIFT_REDEEM}
                onClick={() => onNavigate(AppView.POS_GIFT_REDEEM)}
              />
            </SidebarSection>

            <SidebarSection title="👥 Portales de Usuario">
              <SidebarButton
                icon={<UserCircle className="w-5 h-5" />}
                label="Portal Padres"
                active={currentView === AppView.PARENT_DASHBOARD}
                onClick={() => onNavigate(AppView.PARENT_DASHBOARD)}
              />
              <SidebarButton
                icon={<Users className="w-5 h-5" />}
                label="Student Hub"
                active={currentView === AppView.STUDENT_DASHBOARD}
                onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)}
              />
            </SidebarSection>

            <SidebarSection title="🆘 Soporte">
              <SidebarButton
                icon={<MessageSquare className="w-5 h-5" />}
                label="Help Desk"
                active={currentView === AppView.HELP_DESK}
                onClick={() => onNavigate(AppView.HELP_DESK)}
              />
            </SidebarSection>
          </>
        )}

        {/* ========== SCHOOL ADMIN ========== */}
        {!isSuperAdmin && userRole === UserRole.SCHOOL_ADMIN && (
          <SidebarSection title="🏢 Administración">
            <SidebarButton
              icon={<Users className="w-5 h-5" />}
              label="Estudiantes"
              active={currentView === AppView.SCHOOL_ADMIN_DASHBOARD}
              onClick={() => onNavigate(AppView.SCHOOL_ADMIN_DASHBOARD)}
            />
            <SidebarButton
              icon={<Building2 className="w-5 h-5" />}
              label="Personal"
              active={currentView === AppView.SCHOOL_ADMIN_STAFF}
              onClick={() => onNavigate(AppView.SCHOOL_ADMIN_STAFF)}
            />
            <SidebarButton
              icon={<TrendingUp className="w-5 h-5" />}
              label="Analytics"
              active={currentView === AppView.ANALYTICS_DASHBOARD}
              onClick={() => onNavigate(AppView.ANALYTICS_DASHBOARD)}
            />
            <SidebarButton
              icon={<Bell className="w-5 h-5" />}
              label="Monitoreo"
              active={currentView === AppView.STUDENT_MONITORING}
              onClick={() => onNavigate(AppView.STUDENT_MONITORING)}
            />
            <SidebarButton
              icon={<MessageSquare className="w-5 h-5" />}
              label="Help Desk"
              active={currentView === AppView.HELP_DESK}
              onClick={() => onNavigate(AppView.HELP_DESK)}
            />
          </SidebarSection>
        )}

        {/* ========== UNIT MANAGER ========== */}
        {!isSuperAdmin && userRole === UserRole.UNIT_MANAGER && (
          <SidebarSection title="🏪 Operación">
            <SidebarButton
              icon={<ChefHat className="w-5 h-5" />}
              label="Dashboard Unidad"
              active={currentView === AppView.UNIT_MANAGER_DASHBOARD}
              onClick={() => onNavigate(AppView.UNIT_MANAGER_DASHBOARD)}
            />
            <SidebarButton
              icon={<Users className="w-5 h-5" />}
              label="Personal"
              active={currentView === AppView.UNIT_MANAGER_STAFF}
              onClick={() => onNavigate(AppView.UNIT_MANAGER_STAFF)}
            />
            <SidebarButton
              icon={<BarChart3 className="w-5 h-5" />}
              label="Reportes Ventas"
              active={currentView === AppView.CONCESSIONAIRE_SALES}
              onClick={() => onNavigate(AppView.CONCESSIONAIRE_SALES)}
            />
          </SidebarSection>
        )}

        {/* ========== CASHIER ========== */}
        {!isSuperAdmin && userRole === UserRole.CASHIER && (
          <SidebarSection title="💰 Caja">
            <SidebarButton
              icon={<Banknote className="w-5 h-5" />}
              label="Recargas y Pagos"
              active={currentView === AppView.CASHIER_VIEW}
              onClick={() => onNavigate(AppView.CASHIER_VIEW)}
            />
          </SidebarSection>
        )}

        {/* ========== POS OPERATOR / CAFETERIA_STAFF / STATIONERY_STAFF ========== */}
        {!isSuperAdmin && (userRole === UserRole.POS_OPERATOR || userRole === UserRole.CAFETERIA_STAFF || userRole === UserRole.STATIONERY_STAFF) && (
          <SidebarSection title="🛒 Punto de Venta">
            {(userRole === UserRole.POS_OPERATOR || userRole === UserRole.CAFETERIA_STAFF) && (
              <SidebarButton
                icon={<UtensilsCrossed className="w-5 h-5" />}
                label="Terminal Cafetería"
                active={currentView === AppView.POS_CAFETERIA}
                onClick={() => onNavigate(AppView.POS_CAFETERIA)}
              />
            )}
            {(userRole === UserRole.POS_OPERATOR || userRole === UserRole.STATIONERY_STAFF) && (
              <SidebarButton
                icon={<ShoppingCart className="w-5 h-5" />}
                label="Terminal Papelería"
                active={currentView === AppView.POS_STATIONERY}
                onClick={() => onNavigate(AppView.POS_STATIONERY)}
              />
            )}
            {userRole === UserRole.POS_OPERATOR && (
              <SidebarButton
                icon={<Gift className="w-5 h-5" />}
                label="Canje Regalos"
                active={currentView === AppView.POS_GIFT_REDEEM}
                onClick={() => onNavigate(AppView.POS_GIFT_REDEEM)}
              />
            )}
          </SidebarSection>
        )}

        {/* ========== PARENT ========== */}
        {!isSuperAdmin && userRole === UserRole.PARENT && (
          <SidebarSection title="👨‍👩‍👧 Portal Familiar">
            <SidebarButton
              icon={<UserCircle className="w-5 h-5" />}
              label="Mi Familia"
              active={currentView === AppView.PARENT_DASHBOARD}
              onClick={() => onNavigate(AppView.PARENT_DASHBOARD)}
            />
            <SidebarButton
              icon={<Wallet className="w-5 h-5" />}
              label="Billetera"
              active={currentView === AppView.PARENT_WALLET}
              onClick={() => onNavigate(AppView.PARENT_WALLET)}
            />
            <SidebarButton
              icon={<Bell className="w-5 h-5" />}
              label="Alertas"
              active={currentView === AppView.PARENT_ALERTS}
              onClick={() => onNavigate(AppView.PARENT_ALERTS)}
            />
            <SidebarButton
              icon={<TrendingUp className="w-5 h-5" />}
              label="Monitoreo"
              active={currentView === AppView.PARENT_MONITORING}
              onClick={() => onNavigate(AppView.PARENT_MONITORING)}
            />
            <SidebarButton
              icon={<Settings className="w-5 h-5" />}
              label="Seguridad"
              active={currentView === AppView.PARENT_SETTINGS}
              onClick={() => onNavigate(AppView.PARENT_SETTINGS)}
            />
          </SidebarSection>
        )}

        {/* ========== STUDENT ========== */}
        {!isSuperAdmin && userRole === UserRole.STUDENT && (
          <SidebarSection title="🎓 Student Hub">
            <SidebarButton
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Inicio"
              active={currentView === AppView.STUDENT_DASHBOARD}
              onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)}
            />
            <SidebarButton
              icon={<QrCode className="w-5 h-5" />}
              label="Mi Card"
              active={currentView === AppView.STUDENT_ID}
              onClick={() => onNavigate(AppView.STUDENT_ID)}
            />
            <SidebarButton
              icon={<History className="w-5 h-5" />}
              label="Consumo"
              active={currentView === AppView.STUDENT_HISTORY}
              onClick={() => onNavigate(AppView.STUDENT_HISTORY)}
            />
          </SidebarSection>
        )}
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="p-6 shrink-0 bg-slate-50/50">
        <button onClick={onLogout} className="flex items-center w-full px-6 py-4 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-[20px] transition-all uppercase tracking-[2px]">
            <LogOut className="w-4 h-4 mr-3" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

// ========== COMPONENTES HELPER PARA REUTILIZACIÓN ==========

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

/**
 * Componente SidebarSection
 * Agrupa botones bajo un título de sección
 */
const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => (
  <div className="space-y-1 mb-4">
    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
      {title}
    </h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

/**
 * Componente SidebarButton
 * Botón individual con estado activo/inactivo
 */
const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300
      ${active
        ? 'bg-indigo-600 text-white font-semibold shadow-md'
        : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
      }
    `}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
  </button>
);

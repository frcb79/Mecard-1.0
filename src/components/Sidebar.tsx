
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Settings, LogOut,
  Wallet, Building2, PenTool, UserCircle, QrCode,
  GraduationCap, Banknote, Zap, History, Users, MessageSquare, ChefHat,
  ShieldCheck, Globe, Terminal, PieChart, UtensilsCrossed, Layers,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { NotificationCenter } from './NotificationCenter';

// =============================================
// NAV CONFIGURATION — data-driven navigation
// =============================================

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  icon?: React.ReactNode;
  items: NavItem[];
}

function getNavSections(role: UserRole): NavSection[] {
  if (role === UserRole.SUPER_ADMIN) {
    return [
      {
        label: 'Gestión Global',
        icon: <ShieldCheck size={10} />,
        items: [
          { path: '/admin', label: 'Dashboard', icon: <Globe size={18} /> },
          { path: '/admin/schools', label: 'Escuelas', icon: <Building2 size={18} /> },
          { path: '/admin/settlement', label: 'Settlement', icon: <Banknote size={18} /> },
          { path: '/admin/reports', label: 'Reportes', icon: <PieChart size={18} /> },
          { path: '/admin/config', label: 'Configuración', icon: <Settings size={18} /> },
        ],
      },
      {
        label: 'Demo — Módulos',
        items: [
          { path: '/school', label: 'Admin Escuela', icon: <GraduationCap size={18} /> },
          { path: '/unit', label: 'Gerente Unidad', icon: <ChefHat size={18} /> },
        ],
      },
      {
        label: 'Operación POS',
        items: [
          { path: '/pos', label: 'Cafetería', icon: <Terminal size={18} /> },
          { path: '/pos/stationery', label: 'Papelería', icon: <PenTool size={18} /> },
          { path: '/cashier', label: 'Caja Recargas', icon: <Wallet size={18} /> },
        ],
      },
      {
        label: 'Portales',
        items: [
          { path: '/parent', label: 'Portal Padres', icon: <UserCircle size={18} /> },
          { path: '/student', label: 'Portal Estudiante', icon: <Users size={18} /> },
        ],
      },
    ];
  }

  if (role === UserRole.SCHOOL_ADMIN) {
    return [{
      label: 'Mi Escuela',
      icon: <ShieldCheck size={10} />,
      items: [
        { path: '/school', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/school/students', label: 'Estudiantes', icon: <Users size={18} /> },
        { path: '/school/staff', label: 'Personal', icon: <UserCircle size={18} /> },
        { path: '/school/import', label: 'Importar', icon: <Layers size={18} /> },
        { path: '/school/config', label: 'Configuración', icon: <Settings size={18} /> },
      ],
    }];
  }

  if (role === UserRole.UNIT_MANAGER) {
    return [{
      label: 'Mi Unidad',
      items: [
        { path: '/unit', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/unit/inventory', label: 'Inventario', icon: <ShoppingCart size={18} /> },
        { path: '/unit/staff', label: 'Personal', icon: <Users size={18} /> },
      ],
    }];
  }

  if ([UserRole.POS_OPERATOR, UserRole.CAFETERIA_STAFF, UserRole.CASHIER].includes(role)) {
    return [{
      label: 'Operación',
      items: [
        { path: '/pos', label: 'Punto de Venta', icon: <Terminal size={18} /> },
        { path: '/cashier', label: 'Caja', icon: <Banknote size={18} /> },
      ],
    }];
  }

  if (role === UserRole.PARENT) {
    return [{
      label: 'Portal Familiar',
      items: [
        { path: '/parent', label: 'Mi Familia', icon: <UserCircle size={18} /> },
        { path: '/parent/wallet', label: 'Billetera', icon: <Wallet size={18} /> },
      ],
    }];
  }

  // STUDENT default
  return [{
    label: 'Mi Cuenta',
    items: [
      { path: '/student', label: 'Inicio', icon: <LayoutDashboard size={18} /> },
      { path: '/student/id', label: 'Mi Credencial', icon: <QrCode size={18} /> },
      { path: '/student/history', label: 'Historial', icon: <History size={18} /> },
      { path: '/student/menu', label: 'Menú', icon: <UtensilsCrossed size={18} /> },
      { path: '/student/social', label: 'Social', icon: <MessageSquare size={18} /> },
    ],
  }];
}

// =============================================
// SIDEBAR COMPONENT
// =============================================

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const userRole = user?.role || UserRole.STUDENT;
  const sections = getNavSections(userRole);

  const isActive = (path: string): boolean =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 bg-white border-r border-surface-100 flex flex-col h-screen fixed left-0 top-0 z-[100] shadow-xs">
      {/* ─── Header ─── */}
      <div className="px-5 py-5 border-b border-surface-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-500 p-2 rounded-xl shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none">
            <span className="text-lg font-extrabold text-surface-800 tracking-tight block">
              MeCard<span className="text-brand-500">.</span>
            </span>
            <span className="text-[9px] font-semibold text-surface-300 uppercase tracking-widest">
              Network Hub
            </span>
          </div>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide space-y-5" role="navigation" aria-label="Menú principal">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-surface-300 uppercase tracking-wider flex items-center gap-1.5">
              {section.icon} {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group
                      ${active
                        ? 'bg-brand-50 text-brand-600 font-semibold shadow-xs'
                        : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                      }`}
                  >
                    <span className={`mr-2.5 transition-colors ${active ? 'text-brand-500' : 'text-surface-300 group-hover:text-surface-500'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {active && <ChevronRight size={14} className="ml-auto text-brand-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Notifications ─── */}
      <div className="px-3 py-2 shrink-0 border-t border-surface-100">
        <NotificationCenter />
      </div>

      {/* ─── Logout ─── */}
      <div className="px-3 py-3 shrink-0 border-t border-surface-100 bg-surface-50/60">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2.5" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

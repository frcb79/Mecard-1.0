
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Settings, LogOut,
  Wallet, Building2, PenTool, UserCircle, QrCode,
  GraduationCap, Banknote, Zap, History, Users, MessageSquare, ChefHat,
  ShieldCheck, Globe, Terminal, PieChart, UtensilsCrossed, Layers,
  ChevronRight, Gift, Star, Menu, X, MapPin, Briefcase,
  Receipt, BarChart3, Ban, Rocket, Trophy, HeadphonesIcon, FileText,
  Shield, Megaphone, TrendingUp, HandCoins, Calculator, Cake, Heart
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
          { path: '/admin/onboarding', label: 'Onboarding', icon: <Rocket size={18} /> },
          { path: '/admin/schools-directory', label: 'Directorio', icon: <Layers size={18} /> },
          { path: '/admin/settlement', label: 'Settlement', icon: <Banknote size={18} /> },
          { path: '/admin/reports', label: 'Reportes', icon: <PieChart size={18} /> },
          { path: '/admin/rewards-config', label: 'Rewards Config', icon: <Trophy size={18} /> },
          { path: '/admin/support', label: 'Soporte', icon: <HeadphonesIcon size={18} /> },
          { path: '/admin/config', label: 'Configuración', icon: <Settings size={18} /> },
        ],
      },
      {
        label: 'Facturación',
        icon: <Receipt size={10} />,
        items: [
          { path: '/admin/billing/config', label: 'Config Billing', icon: <Settings size={18} /> },
          { path: '/admin/billing/operations', label: 'Operaciones', icon: <FileText size={18} /> },
          { path: '/admin/billing/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
          { path: '/admin/billing/blocking', label: 'Bloqueos', icon: <Ban size={18} /> },
          { path: '/admin/billing/collections', label: 'Cobros', icon: <HandCoins size={18} /> },
        ],
      },
      {
        label: 'Ventas',
        icon: <TrendingUp size={10} />,
        items: [
          { path: '/admin/sales/simulator', label: 'Simulador', icon: <Calculator size={18} /> },
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
          { path: '/pos/preorders', label: 'Pre-Órdenes', icon: <ChefHat size={18} /> },
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

  if (role === UserRole.SCHOOL_FINANCE) {
    return [{
      label: 'Finanzas Escuela',
      items: [
        { path: '/school', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/school/students', label: 'Estudiantes', icon: <Users size={18} /> },
        { path: '/school/fees', label: 'Colegiaturas', icon: <Receipt size={18} /> },
        { path: '/school/collections', label: 'Cobranza', icon: <HandCoins size={18} /> },
        { path: '/school/reports', label: 'Reportes', icon: <BarChart3 size={18} /> },
        { path: '/school/invoices', label: 'Facturas', icon: <FileText size={18} /> },
      ],
    }];
  }

  if (role === UserRole.SCHOOL_ADMIN) {
    return [{
      label: 'Mi Escuela',
      icon: <ShieldCheck size={10} />,
      items: [
        { path: '/school', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/school/students', label: 'Estudiantes', icon: <Users size={18} /> },
        { path: '/school/staff', label: 'Personal', icon: <UserCircle size={18} /> },
        { path: '/school/roles', label: 'Roles', icon: <Shield size={18} /> },
        { path: '/school/fees', label: 'Colegiaturas', icon: <Receipt size={18} /> },
        { path: '/school/collections', label: 'Cobranza', icon: <HandCoins size={18} /> },
        { path: '/school/announcements', label: 'Circulares', icon: <Megaphone size={18} /> },
        { path: '/school/reports', label: 'Reportes', icon: <BarChart3 size={18} /> },
        { path: '/school/access', label: 'Accesos', icon: <Shield size={18} /> },
        { path: '/school/import', label: 'Importar', icon: <Layers size={18} /> },
        { path: '/school/config', label: 'Configuración', icon: <Settings size={18} /> },
        { path: '/school/permissions', label: 'Permisos Salida', icon: <ShieldCheck size={18} /> },
        { path: '/school/trips', label: 'Viajes', icon: <MapPin size={18} /> },
        { path: '/school/invoices', label: 'Facturas', icon: <FileText size={18} /> },
      ],
    }];
  }

  if (role === UserRole.UNIT_MANAGER) {
    return [{
      label: 'Mi Unidad',
      items: [
        { path: '/unit', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/unit/inventory', label: 'Inventario', icon: <ShoppingCart size={18} /> },
        { path: '/unit/demand', label: 'Predicción Demanda', icon: <TrendingUp size={18} /> },
        { path: '/unit/staff', label: 'Personal', icon: <Users size={18} /> },
      ],
    }];
  }

  if ([UserRole.POS_OPERATOR, UserRole.CAFETERIA_STAFF, UserRole.CASHIER, UserRole.STATIONERY_STAFF].includes(role)) {
    return [{
      label: 'Operación',
      items: [
        { path: '/pos', label: 'Punto de Venta', icon: <Terminal size={18} /> },
        { path: '/pos/preorders', label: 'Pre-Órdenes', icon: <ChefHat size={18} /> },
        ...(role === UserRole.STATIONERY_STAFF ? [{ path: '/pos/stationery', label: 'Papelería', icon: <Briefcase size={18} /> }] : []),
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
        { path: '/parent/fees', label: 'Colegiaturas', icon: <Receipt size={18} /> },
        { path: '/parent/limits', label: 'Límites', icon: <Zap size={18} /> },
        { path: '/parent/reports', label: 'Reportes', icon: <PieChart size={18} /> },
        { path: '/parent/notifications', label: 'Notificaciones', icon: <MessageSquare size={18} /> },
        { path: '/parent/permissions', label: 'Permisos de Salida', icon: <ShieldCheck size={18} /> },
        { path: '/parent/gifts', label: 'Regalos', icon: <Gift size={18} /> },
        { path: '/parent/birthday', label: 'Cumpleaños', icon: <Cake size={18} /> },
        { path: '/parent/rewards', label: 'Premios', icon: <Star size={18} /> },
        { path: '/parent/trips', label: 'Viajes', icon: <MapPin size={18} /> },
        { path: '/parent/settings', label: 'Configuración', icon: <Settings size={18} /> },
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
      { path: '/student/preorder', label: 'Pre-Orden', icon: <ShoppingCart size={18} /> },
      { path: '/student/gifts', label: 'Regalos', icon: <Gift size={18} /> },
      { path: '/student/birthday', label: 'Cumpleaños', icon: <Cake size={18} /> },
      { path: '/student/favorites', label: 'Favoritos', icon: <Heart size={18} /> },
      { path: '/student/rewards', label: 'Premios', icon: <Star size={18} /> },
      { path: '/student/notifications', label: 'Notificaciones', icon: <MessageSquare size={18} /> },
      { path: '/student/reports', label: 'Reportes', icon: <PieChart size={18} /> },
      { path: '/student/trips', label: 'Viajes', icon: <MapPin size={18} /> },
      { path: '/student/permissions', label: 'Permisos', icon: <ShieldCheck size={18} /> },
      { path: '/student/settings', label: 'Configuración', icon: <Settings size={18} /> },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = user?.role || UserRole.STUDENT;
  const sections = getNavSections(userRole);

  const isActive = (path: string): boolean => {
    if (location.pathname === path) return true;
    // Index routes like /parent, /school, /admin etc. should only match exactly
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 1) return false;
    return location.pathname.startsWith(path + '/');
  };

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* ─── Header ─── */}
      <div className="px-4 md:px-5 py-4 md:py-5 border-b border-surface-100 shrink-0 flex items-center justify-between">
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
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-2 rounded-lg hover:bg-surface-100 text-surface-400 transition-all"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 py-3 md:py-4 overflow-y-auto scrollbar-hide space-y-4 md:space-y-5" role="navigation" aria-label="Menú principal">
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
                    onClick={() => handleNavClick(item.path)}
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
    </>
  );

  return (
    <>
      {/* Mobile hamburger button — fixed top-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-[110] p-2.5 bg-white border border-surface-200 rounded-xl shadow-lg text-surface-600 hover:bg-surface-50 transition-all"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, slide-in when open */}
      <aside
        className={`
          w-64 md:w-60 bg-white border-r border-surface-100 flex flex-col h-screen fixed left-0 top-0 z-[130] shadow-xs
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:z-[100]
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Home, CreditCard, AlertCircle, 
  BarChart3, Bell, Settings, LogOut, Menu, X
} from 'lucide-react';

interface ParentSidebarProps {
  onNavigate: (view: string) => void;
  activeView: string;
  onLogout: () => void;
}

export const ParentSidebar: React.FC<ParentSidebarProps> = ({
  onNavigate,
  activeView,
  onLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Mi Familia', icon: Home, view: 'parent_dashboard' },
    { id: 'wallet', label: 'Billetera', icon: CreditCard, view: 'parent_wallet' },
    { id: 'limits', label: 'Límites', icon: AlertCircle, view: 'parent_limits' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, view: 'parent_reports' },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, view: 'parent_notifications' },
    { id: 'settings', label: 'Configuración', icon: Settings, view: 'parent_settings' },
  ];

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsMobileOpen(false); // Cerrar sidebar en mobile
  };

  return (
    <>
      {/* Mobile Toggle Button - Visible only on small screens */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-[60] md:hidden bg-white p-2 rounded-lg shadow-md border border-slate-100"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[45] bg-slate-900/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`parent-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 md:transition-all`}
      >
        {/* Header */}
        <div className="parent-sidebar__header">
          <div className="parent-sidebar__header-logo">
            <div className="parent-sidebar__logo-icon">
              <span>₱</span>
            </div>
            <div className="parent-sidebar__logo-text">
              Me<span>Card</span>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="parent-sidebar__toggle-btn hidden md:flex"
            title={isCollapsed ? 'Expandir' : 'Contraer'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="parent-sidebar__nav">
          <div className="parent-sidebar__nav-group">
            <div className="parent-sidebar__nav-label">Panel Principal</div>
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.view)}
                  className={`parent-sidebar__nav-item ${
                    isActive ? 'active' : ''
                  }`}
                  title={item.label}
                >
                  <Icon size={20} className="parent-sidebar__nav-item-icon" />
                  <span className="parent-sidebar__nav-item-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="parent-sidebar__nav-group">
            <div className="parent-sidebar__nav-label">Gestión</div>
            {navItems.slice(2, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.view)}
                  className={`parent-sidebar__nav-item ${
                    isActive ? 'active' : ''
                  }`}
                  title={item.label}
                >
                  <Icon size={20} className="parent-sidebar__nav-item-icon" />
                  <span className="parent-sidebar__nav-item-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="parent-sidebar__nav-group">
            <div className="parent-sidebar__nav-label">Sistema</div>
            {navItems.slice(5).map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.view)}
                  className={`parent-sidebar__nav-item ${
                    isActive ? 'active' : ''
                  }`}
                  title={item.label}
                >
                  <Icon size={20} className="parent-sidebar__nav-item-icon" />
                  <span className="parent-sidebar__nav-item-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="parent-sidebar__footer">
          <button
            onClick={onLogout}
            className="parent-sidebar__nav-item"
            title="Cerrar sesión"
          >
            <LogOut size={20} className="parent-sidebar__nav-item-icon" />
            <span className="parent-sidebar__nav-item-label">Salir</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ParentSidebar;

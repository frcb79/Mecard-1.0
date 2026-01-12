import React, { useState, useEffect, useContext } from 'react';
import { UserRole, AppView } from './types';
import { usePlatform } from './contexts/PlatformContext';
import { Sidebar } from './components/Sidebar';
import AccessDenied from './components/AccessDenied';
import { getAllowedViews, isAuthorized } from './lib/rolePermissions';
import { 
  ShieldAlert, 
  Lock, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Menu,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  BarChart3,
  HelpCircle,
  FileText
} from 'lucide-react';

// --- COMPONENTES DE VISTA (PLACEHOLDERS PARA DEMO) ---

const PlaceholderView = ({ title, desc }: { title: string; desc: string }) => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center">
    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
      <LayoutDashboard size={32} />
    </div>
    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">{title}</h2>
    <p className="text-slate-500 mt-2 max-w-sm">{desc}</p>
  </div>
);

const LoginView = ({ onLogin }: { onLogin: (role: UserRole) => void }) => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
    <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
          <Zap size={32} className="text-white fill-white" />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">MeCard Staging</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[3px] mt-2">Selecciona un rol para simular acceso</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {Object.values(UserRole).map(role => (
          <button
            key={role}
            onClick={() => onLogin(role)}
            className="w-full py-4 px-6 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 transition-all text-left flex justify-between items-center group"
          >
            {role.replace('_', ' ')}
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL APP CONTENT ---

export default function MeCardPlatform() {
  const { activeSchool } = usePlatform();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.SUPER_ADMIN_DASHBOARD);
  
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    const allowedViews = getAllowedViews(role);
    if (allowedViews && allowedViews.length > 0) {
      setCurrentView(allowedViews[0]);
    }
  };

  const handleLogout = () => { 
    setIsLoggedIn(false); 
    setUserRole(null); 
  };

  const renderCurrentView = () => {
    if (!isLoggedIn || !userRole) return <LoginView onLogin={handleLogin} />;

    if (!isAuthorized(currentView, userRole)) {
      return <AccessDenied role={userRole} view={currentView} />;
    }

    switch(currentView) {
      case AppView.SUPER_ADMIN_DASHBOARD:
        return <PlaceholderView title="Consola Super Admin" desc="Gestión global de instituciones, finanzas SaaS y liquidaciones STP." />;
      case AppView.SCHOOL_ADMIN_DASHBOARD:
        return <PlaceholderView title="Dashboard Escuela" desc="Gestión de alumnos, staff y monitoreo institucional." />;
      case AppView.ANALYTICS_DASHBOARD:
        return <PlaceholderView title="Analítica Avanzada" desc="Reportes detallados de consumo, recargas y comportamiento financiero." />;
      case AppView.STUDENT_DASHBOARD:
        return <PlaceholderView title="App del Estudiante" desc="Billetera digital, red social de amigos y lista de deseos." />;
      case AppView.PARENT_DASHBOARD:
        return <PlaceholderView title="Portal Familiar" desc="Control parental, límites de gasto y monitoreo en tiempo real." />;
      case AppView.PARENT_REPORTS:
        return <PlaceholderView title="Reportes Familiares" desc="Estados de cuenta detallados, facturas y análisis de consumo por alumno." />;
      case AppView.POS_CAFETERIA:
        return <PlaceholderView title="Terminal POS" desc="Interfaz de cobro para cafeterías y papelerías escolares." />;
      case AppView.HELP_DESK:
        return <PlaceholderView title="Soporte y Help Desk" desc="Sistema de tickets y atención al cliente." />;
      default:
        return <PlaceholderView title="Vista en Desarrollo" desc="Esta sección se encuentra en construcción o no tiene un placeholder definido." />;
    }
  };

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        userRole={userRole!} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 h-full relative ml-64 overflow-hidden bg-white">
        <header className="h-20 border-b border-slate-100 flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Menu className="text-slate-300 md:hidden" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[5px]">
              {activeSchool?.name || 'Cargando...'} / <span className="text-indigo-600">{currentView}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white font-black text-xs">
              {userRole?.charAt(0)}
            </div>
          </div>
        </header>
        <div className="h-[calc(100%-80px)] overflow-y-auto">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}
# 📄 CÓDIGO ACTUAL COMPLETO - MeCard Staging

## ARCHIVO 1: App.tsx (Main Router)

```typescript
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/PosView';
import { ParentPortal } from './components/ParentPortal';
import StudentDashboard from './components/StudentDashboard';
import { SchoolAdminStudentsView } from './components/SchoolAdminStudentsView';
import { SchoolAdminView } from './components/SchoolAdminView';
import { CashierView } from './components/CashierView';
import { ConcessionaireDashboard } from './components/ConcessionaireDashboard';
import { ParentAlertsConfigView } from './components/ParentAlertsConfigView';
import { ParentTransactionMonitoringView } from './components/ParentTransactionMonitoringView';
import { ConcessionaireSalesReportsView } from './components/ConcessionaireSalesReportsView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { StudentMonitoring } from './components/StudentMonitoring';
import MeCardPlatform from './MeCardPlatform';
import { LoginView } from './components/LoginView';
import { SupportSystem } from './components/SupportSystem';
import { GiftRedemptionView } from './components/GiftRedemptionView';
import { AppView, CartItem, Product, UserRole, Transaction, StudentProfile, SupportTicket, OperatingUnit, School } from './types';
import { MOCK_STUDENT, MOCK_TRANSACTIONS, MOCK_TICKETS, MOCK_UNITS, MOCK_STUDENTS_LIST, PRODUCTS } from './constants';
import { PlatformProvider, usePlatform } from './contexts/PlatformContext';

function AppContent() {
  const { activeSchool, currentUser } = usePlatform();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.SUPER_ADMIN_DASHBOARD);
  
  const STORAGE_KEY_STUDENTS = 'mecard_students_v3';
  const [myStudents, setMyStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    return saved ? JSON.parse(saved) : MOCK_STUDENTS_LIST;
  });

  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const student = myStudents[activeStudentIndex] || MOCK_STUDENT;
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(myStudents)); }, [myStudents]);

  const handleUpdateStudent = (id: string, updatedData: Partial<StudentProfile>) => {
    setMyStudents(prev => prev.map((s) => s.id === id ? { ...s, ...updatedData } : s));
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    switch(role) {
        case UserRole.SUPER_ADMIN: setCurrentView(AppView.SUPER_ADMIN_DASHBOARD); break;
        case UserRole.SCHOOL_ADMIN: setCurrentView(AppView.SCHOOL_ADMIN_DASHBOARD); break;
        case UserRole.STUDENT: setCurrentView(AppView.STUDENT_DASHBOARD); break;
        case UserRole.PARENT: setCurrentView(AppView.PARENT_DASHBOARD); break;
        case UserRole.CASHIER: setCurrentView(AppView.CASHIER_VIEW); break;
        case UserRole.UNIT_MANAGER: setCurrentView(AppView.UNIT_MANAGER_DASHBOARD); break;
        case UserRole.POS_OPERATOR: setCurrentView(AppView.POS_CAFETERIA); break;
        default: setCurrentView(AppView.PARENT_DASHBOARD);
    }
  };

  const handleLogout = () => { setIsLoggedIn(false); setUserRole(null); };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;
  
  const isSuperAdminMode = userRole === UserRole.SUPER_ADMIN;

  const renderCurrentView = () => {
    if (isSuperAdminMode && currentView === AppView.SUPER_ADMIN_DASHBOARD) {
        return <MeCardPlatform onLogout={handleLogout} />;
    }

    if (currentView === 'ANALYTICS_DASHBOARD') {
      return <AnalyticsDashboard schoolId={activeSchool?.id ? BigInt(typeof activeSchool.id === 'string' ? parseInt(activeSchool.id) : activeSchool.id) : BigInt(1)} />;
    }

    if (currentView === 'STUDENT_MONITORING') {
      return <StudentMonitoring schoolId={activeSchool?.id ? BigInt(typeof activeSchool.id === 'string' ? parseInt(activeSchool.id) : activeSchool.id) : BigInt(1)} />;
    }

    switch(currentView) {
      case AppView.STUDENT_DASHBOARD:
      case AppView.STUDENT_ID:
      case AppView.STUDENT_HISTORY:
        return <StudentDashboard userId={student.id} schoolId={student.schoolId} transactions={transactions} />;
      
      case AppView.PARENT_DASHBOARD:
      case AppView.PARENT_WALLET:
      case AppView.PARENT_SETTINGS:
        return (
          <ParentPortal 
            view={currentView} onNavigate={setCurrentView} students={myStudents} 
            activeStudentIndex={activeStudentIndex} onSwitchStudent={setActiveStudentIndex}
            onLinkStudent={(s) => setMyStudents(p => [...p, s])} 
            transactions={transactions} onUpdateStudent={(data) => handleUpdateStudent(student.id, data)}
            onDeposit={(amt) => handleUpdateStudent(student.id, { balance: student.balance + amt })}
          />
        );

      case AppView.PARENT_ALERTS:
        return (
          <ParentAlertsConfigView 
            parentId={currentUser?.id || 'parent_1'} 
            schoolId={activeSchool?.id || 'school_1'}
            onNavigate={setCurrentView}
          />
        );

      case AppView.PARENT_MONITORING:
        return (
          <ParentTransactionMonitoringView 
            children={myStudents.map(s => s.id)} 
            transactions={transactions}
            onNavigate={setCurrentView}
          />
        );

      case AppView.SCHOOL_ADMIN_DASHBOARD:
        return (
          <SchoolAdminView 
            allStudents={myStudents} 
            onUpdateStudent={handleUpdateStudent}
            onBulkAddStudents={(news) => setMyStudents(p => [...news, ...p])}
            operatingUnits={MOCK_UNITS as OperatingUnit[]}
            onAddUnit={() => {}}
            onUpdateUnit={() => {}}
            onDeleteUnit={() => {}}
          />
        );

      case AppView.UNIT_MANAGER_DASHBOARD:
        return <ConcessionaireDashboard unit={MOCK_UNITS[0] as OperatingUnit} />;

      case AppView.CONCESSIONAIRE_SALES:
        return (
          <ConcessionaireSalesReportsView 
            unitId={MOCK_UNITS[0].id} 
            transactions={transactions}
            products={PRODUCTS}
            onNavigate={setCurrentView}
          />
        );

      case AppView.CASHIER_VIEW:
        return <CashierView student={student} onDeposit={(amt) => handleUpdateStudent(student.id, { balance: student.balance + amt })} />;

      case AppView.POS_CAFETERIA:
      case AppView.POS_STATIONERY:
        return (
          <PosView 
            mode={currentView === AppView.POS_STATIONERY ? 'stationery' : 'cafeteria'}
            cart={cart} student={student} addToCart={addToCart} removeFromCart={removeFromCart}
            clearCart={() => setCart([])}
            onPurchase={(total) => {
              handleUpdateStudent(student.id, { balance: student.balance - total, spentToday: student.spentToday + total });
              setCart([]);
            }}
            onNavigate={setCurrentView}
          />
        );

      case AppView.POS_GIFT_REDEEM:
        return <GiftRedemptionView unitId={MOCK_UNITS[0].id} onBack={() => setCurrentView(AppView.POS_CAFETERIA)} />;

      case AppView.HELP_DESK:
        return <SupportSystem tickets={MOCK_TICKETS} isAdmin={userRole === UserRole.SCHOOL_ADMIN || isSuperAdminMode} />;

      default:
        return <MeCardPlatform onLogout={handleLogout} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} userRole={userRole!} onLogout={handleLogout} />
      
      <main className="flex-1 h-full relative ml-64 overflow-hidden bg-white">
        {renderCurrentView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <PlatformProvider>
      <AppContent />
    </PlatformProvider>
  );
}

export default App;
```

---

## ARCHIVO 2: types.ts (Type Definitions)

```typescript
export enum Category {
  HOT_MEALS = 'Hot Meals',
  COMBO_MEALS = 'Comidas Completas',
  SNACKS = 'Snacks',
  DRINKS = 'Drinks',
  SUPPLIES = 'School Supplies',
  UNIFORMS = 'Uniforms',
  BOOKS = 'Books & Rentals',
  TECH = 'Tech Accessories'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  SCHOOL_FINANCE = 'SCHOOL_FINANCE',
  UNIT_MANAGER = 'UNIT_MANAGER',
  CAFETERIA_STAFF = 'CAFETERIA_STAFF',
  STATIONERY_STAFF = 'STATIONERY_STAFF',
  CASHIER = 'CASHIER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
  POS_OPERATOR = 'POS_OPERATOR'
}

export enum AppView {
  SUPER_ADMIN_DASHBOARD = 'SUPER_ADMIN_DASHBOARD',
  SCHOOL_ADMIN_DASHBOARD = 'SCHOOL_ADMIN_DASHBOARD',
  SCHOOL_ADMIN_STAFF = 'SCHOOL_ADMIN_STAFF',
  SCHOOL_ONBOARDING = 'SCHOOL_ONBOARDING',
  UNIT_MANAGER_DASHBOARD = 'UNIT_MANAGER_DASHBOARD',
  UNIT_MANAGER_STAFF = 'UNIT_MANAGER_STAFF',
  POS_CAFETERIA = 'POS_CAFETERIA',
  POS_STATIONERY = 'POS_STATIONERY',
  CASHIER_VIEW = 'CASHIER_VIEW',
  PARENT_DASHBOARD = 'PARENT_DASHBOARD',
  PARENT_WALLET = 'PARENT_WALLET',
  PARENT_ALERTS = 'PARENT_ALERTS',
  PARENT_MONITORING = 'PARENT_MONITORING',
  PARENT_SETTINGS = 'PARENT_SETTINGS',
  PARENT_MENU = 'PARENT_MENU',
  STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',
  STUDENT_ID = 'STUDENT_ID',
  STUDENT_HISTORY = 'STUDENT_HISTORY',
  STUDENT_MENU = 'STUDENT_MENU',
  CONCESSIONAIRE_SALES = 'CONCESSIONAIRE_SALES',
  HELP_DESK = 'HELP_DESK',
  POS_GIFT_REDEEM = 'POS_GIFT_REDEEM',
  ANALYTICS_DASHBOARD = 'ANALYTICS_DASHBOARD',
  STUDENT_MONITORING = 'STUDENT_MONITORING'
}

// [CONTINÚA CON EL RESTO DE INTERFACES Y TIPOS...]
```

---

## ARCHIVO 3: Sidebar.tsx (Navigation Component)

```typescript
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
        {/* SUPER ADMIN TIENE ACCESO A TODO */}
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

        {/* PARENT - FALTA IMPLEMENTAR COMPLETAMENTE */}
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

        {/* STUDENT - FALTA IMPLEMENTAR COMPLETAMENTE */}
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

        {/* ❌ FALTAN: SCHOOL_ADMIN, UNIT_MANAGER, CASHIER, POS_OPERATOR */}
      </nav>

      <div className="p-6 shrink-0 bg-slate-50/50">
        <button onClick={onLogout} className="flex items-center w-full px-6 py-4 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-[20px] transition-all uppercase tracking-[2px]">
            <LogOut className="w-4 h-4 mr-3" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
```

---

## ARCHIVO 4: PlatformContext.tsx (Global State)

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { School, OperatingUnit, Settlement, User, UserRole } from '../types';
import { MOCK_SCHOOLS, MOCK_UNITS } from '../constants';

type NewSchool = Omit<School, 'id' | 'balance'> & { id?: string };

interface PlatformContextType {
  schools: School[];
  units: OperatingUnit[];
  settlements: Settlement[];
  activeSchool: School | null;
  currentUser: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  
  addSchool: (school: NewSchool) => Promise<void>;
  updateSchoolModel: (id: string, updates: any) => Promise<void>;
  impersonateSchool: (school: School | null) => void;
  runSettlement: (school: School) => Promise<void>;
  login: (email: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [units, setUnits] = useState<OperatingUnit[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        console.info("MeCard Hub: Entering Offline/Demo Mode (No API keys detected)");
        useMockData();
        return;
      }
      
      try {
        const [schoolsRes, unitsRes, settlementsRes] = await Promise.all([
          supabase.from('schools').select('*'),
          supabase.from('operating_units').select('*'),
          supabase.from('settlements').select('*').order('created_at', { ascending: false })
        ]);
        
        if (schoolsRes.error) throw schoolsRes.error;
        if (unitsRes.error) throw unitsRes.error;
        if (settlementsRes.error) throw settlementsRes.error;

        if (schoolsRes.data) setSchools(schoolsRes.data as any);
        if (unitsRes.data) setUnits(unitsRes.data as any);
        if (settlementsRes.data) setSettlements(settlementsRes.data as any);

        setIsDemoMode(false);
      } catch (err: any) {
        const isNetworkError = 
          err.name === 'TypeError' || 
          err.message?.toLowerCase().includes('fetch') || 
          err.message?.toLowerCase().includes('network');

        if (isNetworkError) {
          console.warn("MeCard Hub: Network unreachable. Defaulting to Demo Mode.");
        } else {
          console.error("MeCard Hub: Database configuration error:", err.message || err);
        }
        useMockData();
      } finally {
        setIsLoading(false);
      }
    };

    const useMockData = () => {
      setSchools(MOCK_SCHOOLS);
      setUnits(MOCK_UNITS);
      setSettlements([]);
      setIsDemoMode(true);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const addSchool = async (school: NewSchool) => {
    if (isDemoMode) {
      const mockNew: School = { 
        ...school, 
        id: school.id || `mx_${Date.now()}`, 
        balance: 0,
        platformFeePercent: school.platformFeePercent || 4.5,
        onboardingStatus: 'PENDING'
      } as School;
      setSchools(prev => [mockNew, ...prev]);
      return;
    }

    const newId = school.id || `mx_${Date.now()}`;
    const { data, error } = await supabase
      .from('schools')
      .insert([{ ...school, id: newId, balance: 0 }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear escuela:', error.message);
    } else if (data) {
      setSchools(prev => [data as any, ...prev]);
    }
  };

  const updateSchoolModel = async (id: string, updates: any) => {
    const currentSchool = schools.find(s => s.id === id);
    if (!currentSchool) return;

    const newModel = { ...currentSchool.businessModel, ...updates };

    if (isDemoMode) {
      setSchools(prev => prev.map(s => s.id === id ? { ...s, businessModel: newModel } : s));
      return;
    }

    const { error } = await supabase
      .from('schools')
      .update({ business_model: newModel })
      .eq('id', id);

    if (!error) {
      setSchools(prev => prev.map(s => s.id === id ? { ...s, businessModel: newModel } : s));
    }
  };

  const runSettlement = async (school: School) => {
    if (isDemoMode) {
      alert("✅ Corte Generado (Modo Demo)");
      return;
    }
  };

  const login = async (email: string, role: string) => {
    const mockUser: User = {
        id: 'user_123',
        name: 'Admin Usuario',
        email: email,
        role: role as UserRole,
        schoolId: 'mx_01'
    };
    setCurrentUser(mockUser);
  };

  const logout = async () => {
    setCurrentUser(null);
    setActiveSchool(null);
  };

  return (
    <PlatformContext.Provider value={{ 
      schools, units, settlements, activeSchool, currentUser, isLoading, isDemoMode,
      addSchool, updateSchoolModel, impersonateSchool: setActiveSchool, runSettlement, login, logout
    }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used within PlatformProvider");
  return context;
};
```

---

## COMPONENTES QUE EXISTEN EN /components

```
✅ AnalyticsDashboard.tsx           - Nuevo (Phase B)
✅ Button.tsx                      - Componente base
✅ CafeteriaMenu.tsx               - Menú de cafetería
✅ CashierView.tsx                 - Vista de cajero
✅ ConcessionaireDashboard.tsx      - Dashboard de concessionaire
✅ ConcessionaireSalesReportsView.tsx - Reportes de ventas
✅ DashboardView.tsx               - Vista general
✅ GiftRedemptionView.tsx           - Canje de regalos
✅ InventoryManagementView.tsx      - Gestión de inventario
✅ LoginView.tsx                    - Pantalla de login
✅ MeCardPlatform.tsx              - Plataforma principal
✅ MeCardSocial.tsx                - Aspectos sociales
✅ MenuView.tsx                    - Vista de menú
✅ NotificationCenter.tsx          - Centro de notificaciones
✅ ParentAlertsConfigView.tsx       - Configuración de alertas para padres
✅ ParentChildrenManagementView.tsx - Gestión de hijos
✅ ParentLimitsView.tsx            - Límites de gasto
✅ ParentPortal.tsx                - Portal de padres
✅ ParentTransactionMonitoringView.tsx - Monitoreo de transacciones
✅ ParentWalletView.tsx            - Vista de billetera
✅ PosView.tsx                     - Terminal POS
✅ ProductCard.tsx                 - Tarjeta de producto
✅ SchoolAdminStudentsView.tsx      - Gestión de estudiantes
✅ SchoolAdminView.tsx             - Admin de escuela
✅ SchoolOnboardingDashboard.tsx    - Onboarding de escuela
✅ Sidebar.tsx                     - Barra lateral de navegación
✅ SmartStaffManager.tsx           - Gestión de personal
✅ StudentDashboard.tsx            - Dashboard de estudiante
✅ StudentImportWizard.tsx         - Asistente de importación
✅ StudentMonitoring.tsx           - Nuevo (Phase B)
✅ StudentPortal.tsx               - Portal de estudiantes
✅ StudentTransactionHistoryView.tsx - Historial de transacciones
✅ SuperAdminView.tsx              - Vista de super admin
✅ SupportSystem.tsx               - Sistema de soporte
✅ ToggleSwitch.tsx                - Componente toggle
```

---

## RESUMEN DE CAMBIOS RECIENTES

### Última modificación (Commit cd0da6f):
- Agregó imports para AnalyticsDashboard y StudentMonitoring en App.tsx
- Agregó rutas en renderCurrentView() para estas 2 vistas
- Agregó 2 botones en Sidebar.tsx para SUPER_ADMIN
- Creó archivo .env.local para Supabase local

### Problemas Identificados:
1. **No hay validación de rol en renderCurrentView()** - Permite que cualquier rol acceda a cualquier vista
2. **Sidebar solo implementa SUPER_ADMIN, PARENT, STUDENT** - Faltan SCHOOL_ADMIN, UNIT_MANAGER, CASHIER, POS_OPERATOR
3. **No hay manejo de roles intermedios** - Muchos enums de roles sin secciones en sidebar
4. **Acceso a vistas sin validación** - El switch statement no valida permisos

---

## INSTRUCCIONES PARA OTRA IA

Usa este documento como referencia completa del código actual. Compáralo con:
1. Tu versión anterior del proyecto
2. Los cambios específicos que ocurrieron
3. Las pantallas que desaparecieron
4. Por qué un SCHOOL_ADMIN ve pantallas de PARENT
5. Por qué un STUDENT no ve nada

El diagnóstico completo está en DIAGNOSTIC_REPORT_CURRENT_STATE.md

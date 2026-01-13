
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/PosView';
import { ParentPortal } from './components/ParentPortal';
import StudentDashboard from './components/StudentDashboard';
import { SchoolAdminStudentsView } from './components/SchoolAdminStudentsView';
import { SchoolAdminView } from './components/SchoolAdminView';
import { CashierView } from './components/CashierView';
import { ConcessionaireDashboard } from './components/ConcessionaireDashboard';
import { LoginView } from './components/LoginView';
import { SupportSystem } from './components/SupportSystem';
import { GiftRedemptionView } from './components/GiftRedemptionView';
import { BusinessModelConfiguration } from './components/BusinessModelConfiguration';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AppView, CartItem, Product, UserRole, Transaction, StudentProfile, SupportTicket, OperatingUnit, School } from './types';
import { MOCK_STUDENT, MOCK_TRANSACTIONS, MOCK_TICKETS, MOCK_UNITS, MOCK_STUDENTS_LIST, PRODUCTS, MOCK_SCHOOLS } from './constants';
import { PlatformProvider, usePlatform } from './contexts/PlatformContext';

function AppContent() {
  const { schools, activeSchool, updateSchoolModel } = usePlatform();
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
        return <SuperAdminDashboard />;
    }

    switch(currentView) {
      case AppView.BUSINESS_MODEL_CONFIG:
        return (
            <BusinessModelConfiguration 
                schoolId={activeSchool?.id}
                schoolName={activeSchool?.name}
                onSave={(newModel) => {
                    if (activeSchool) {
                        updateSchoolModel(activeSchool.id, {
                            cafeteriaFeePercent: newModel.margins.schoolMargin
                        });
                    }
                    setCurrentView(AppView.SUPER_ADMIN_DASHBOARD);
                }}
                onCancel={() => setCurrentView(AppView.SUPER_ADMIN_DASHBOARD)}
            />
        );

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
        return <SuperAdminDashboard />;
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

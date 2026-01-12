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
import { ParentReportsView } from './components/ParentReportsView';
import { 
  AppView, 
  UserRole, 
  Transaction, 
  StudentProfile, 
  OperatingUnit 
} from './types';
import { 
  MOCK_STUDENT, 
  MOCK_TRANSACTIONS, 
  MOCK_TICKETS, 
  MOCK_UNITS, 
  MOCK_STUDENTS_LIST, 
  PRODUCTS,
  MOCK_DOCUMENTS
} from './constants';
import { PlatformProvider, usePlatform } from './contexts/PlatformContext';
import { isAuthorized, getAllowedViews } from './lib/rolePermissions';
import AccessDenied from './components/AccessDenied';

function AppContent() {
  const { activeSchool, currentUser } = usePlatform();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(UserRole.PARENT);
  const [currentView, setCurrentView] = useState<AppView>(AppView.PARENT_REPORTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Persistencia de estados locales (Staging)
  const STORAGE_KEY_STUDENTS = 'mecard_students_v3';
  const [myStudents, setMyStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    return saved ? JSON.parse(saved) : MOCK_STUDENTS_LIST;
  });

  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const student = myStudents[activeStudentIndex] || MOCK_STUDENT;
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => { 
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(myStudents)); 
  }, [myStudents]);

  const handleUpdateStudent = (id: string, updatedData: Partial<StudentProfile>) => {
    setMyStudents(prev => prev.map((s) => s.id === id ? { ...s, ...updatedData } : s));
  };

  const handleNavigateWithStudent = (view: AppView, studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView(view);
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    // Redirección inteligente al login según permisos del rol
    const allowedViews = getAllowedViews(role);
    if (allowedViews && allowedViews.length > 0) {
      setCurrentView(allowedViews[0]);
    }
  };

  const handleLogout = () => { 
    setIsLoggedIn(false); 
    setUserRole(null); 
  };

  /**
   * ROUTER CON GUARDIA DE PERMISOS
   */
  const renderCurrentView = () => {
    if (!isLoggedIn || !userRole) return <LoginView onLogin={handleLogin} />;

    // BLOQUEO DE SEGURIDAD: Validamos contra la matriz ROLE_PERMISSIONS
    if (!isAuthorized(currentView, userRole)) {
      return <AccessDenied role={userRole} view={currentView} />;
    }

    // Lógica para Super Admin Dashboard (Finanzas SaaS)
    if (userRole === UserRole.SUPER_ADMIN && currentView === AppView.SUPER_ADMIN_DASHBOARD) {
        return <MeCardPlatform onLogout={handleLogout} />;
    }

    // Switch de renderizado modular
    switch(currentView) {
      case AppView.ANALYTICS_DASHBOARD:
        return <AnalyticsDashboard schoolId={BigInt(1)} />;

      case AppView.STUDENT_MONITORING:
        return <StudentMonitoring schoolId={BigInt(1)} />;

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
        return <ParentAlertsConfigView parentId={currentUser?.id || 'parent_1'} schoolId={activeSchool?.id || 'school_1'} onNavigate={setCurrentView} />;

      case AppView.PARENT_MONITORING:
        return <ParentTransactionMonitoringView 
                  children={myStudents.map(s => s.id)} 
                  transactions={transactions} 
                  onNavigate={setCurrentView}
                  initialSelectedChildId={selectedStudentId}
                />;

      case AppView.PARENT_REPORTS:
        return <ParentReportsView 
                  students={myStudents}
                  transactions={transactions}
                  onNavigate={setCurrentView}
                  onNavigateWithStudent={handleNavigateWithStudent}
                  recentDocuments={MOCK_DOCUMENTS}
                />;

      case AppView.SCHOOL_ADMIN_DASHBOARD:
        return (
          <SchoolAdminView 
            allStudents={myStudents} 
            onUpdateStudent={handleUpdateStudent}
            onBulkAddStudents={(news) => setMyStudents(p => [...news, ...p])}
            operatingUnits={MOCK_UNITS as OperatingUnit[]}
            onAddUnit={() => {}} onUpdateUnit={() => {}} onDeleteUnit={() => {}}
          />
        );

      case AppView.UNIT_MANAGER_DASHBOARD:
        return <ConcessionaireDashboard unit={MOCK_UNITS[0] as OperatingUnit} />;

      case AppView.CONCESSIONAIRE_SALES:
        return <ConcessionaireSalesReportsView unitId={MOCK_UNITS[0].id} transactions={transactions} products={PRODUCTS} onNavigate={setCurrentView} />;

      case AppView.CASHIER_VIEW:
        return <CashierView student={student} onDeposit={(amt) => handleUpdateStudent(student.id, { balance: student.balance + amt })} />;

      case AppView.POS_CAFETERIA:
      case AppView.POS_STATIONERY:
        return (
          <PosView 
            mode={currentView === AppView.POS_STATIONERY ? 'stationery' : 'cafeteria'}
            cart={cart} student={student} addToCart={(p) => setCart([...cart, p])} removeFromCart={(id) => setCart(cart.filter(i => i.id !== id))}
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
        return <SupportSystem tickets={MOCK_TICKETS} isAdmin={userRole === UserRole.SCHOOL_ADMIN || userRole === UserRole.SUPER_ADMIN} />;

      default:
        return <LoginView onLogin={handleLogin} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        userRole={userRole!} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 h-full relative ml-64 overflow-hidden bg-white">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PlatformProvider>
      <AppContent />
    </PlatformProvider>
  );
}
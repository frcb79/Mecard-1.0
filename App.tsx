
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/PosView';
import { ParentPortal } from './components/ParentPortal';
import StudentDashboard from './components/StudentDashboard';
import { SchoolAdminStudentsView } from './components/SchoolAdminStudentsView';
import { CashierView } from './components/CashierView';
import { ConcessionaireDashboard } from './components/ConcessionaireDashboard';
import MeCardPlatform from './MeCardPlatform';
import { LoginView } from './components/LoginView';
import { SupportSystem } from './components/SupportSystem';
import { MeCardSocial } from './components/MeCardSocial';
import { GiftRedemptionView } from './components/GiftRedemptionView';
import { AppView, CartItem, Product, UserRole, Transaction, StudentProfile, SupportTicket, OperatingUnit, School } from './types';
import { MOCK_STUDENT, MOCK_TRANSACTIONS, MOCK_TICKETS, MOCK_UNITS, MOCK_STUDENTS_LIST, PRODUCTS } from './constants';
import { PlatformProvider, usePlatform } from './contexts/PlatformContext';

function AppContent() {
  const { activeSchool, currentUser } = usePlatform();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.PARENT_DASHBOARD);
  
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

  const handleSendGift = (recipientId: string, productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    if (student.balance < product.price) {
        alert("Saldo insuficiente para enviar este regalo.");
        return;
    }
    
    handleUpdateStudent(student.id, { balance: student.balance - product.price });
    const recipient = myStudents.find(s => s.id === recipientId);
    if (recipient) {
      handleUpdateStudent(recipientId, { balance: recipient.balance + product.price });
    }
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
  if (userRole === UserRole.SUPER_ADMIN) return <MeCardPlatform onLogout={handleLogout} />;

  const isStudentView = [AppView.STUDENT_DASHBOARD, AppView.STUDENT_ID, AppView.STUDENT_HISTORY, AppView.STUDENT_MENU].includes(currentView);
  const isParentView = [AppView.PARENT_DASHBOARD, AppView.PARENT_WALLET, AppView.PARENT_SETTINGS, AppView.PARENT_MENU].includes(currentView);

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} userRole={userRole!} onLogout={handleLogout} />
      
      <main className="flex-1 h-full relative ml-64 overflow-hidden">
        
        {isStudentView && (
          <StudentDashboard 
            userId={student.id} 
            schoolId={student.schoolId}
            transactions={transactions}
          />
        )}

        {isParentView && (
           <ParentPortal 
              view={currentView} onNavigate={setCurrentView} students={myStudents} 
              activeStudentIndex={activeStudentIndex} onSwitchStudent={setActiveStudentIndex}
              onLinkStudent={(s) => setMyStudents(p => [...p, s])} 
              transactions={transactions} onUpdateStudent={(data) => handleUpdateStudent(student.id, data)}
              onDeposit={(amt) => handleUpdateStudent(student.id, { balance: student.balance + amt })}
           />
        )}

        {currentView === AppView.SCHOOL_ADMIN_DASHBOARD && (
          <SchoolAdminStudentsView 
            schoolId="mx_01" students={myStudents} onUpdateStudent={handleUpdateStudent}
            onAddStudent={(s) => setMyStudents(p => [s, ...p])} onDeleteStudent={(id) => setMyStudents(p => p.filter(s => s.id !== id))}
            onToggleStatus={(id) => handleUpdateStudent(id, { status: myStudents.find(s => s.id === id)?.status === 'Active' ? 'Inactive' : 'Active' })}
          />
        )}

        {currentView === AppView.CASHIER_VIEW && (
          <CashierView student={student} onDeposit={(amt) => handleUpdateStudent(student.id, { balance: student.balance + amt })} />
        )}

        {(currentView === AppView.POS_CAFETERIA || currentView === AppView.POS_STATIONERY) && (
          <PosView 
            mode={currentView === AppView.POS_STATIONERY ? 'stationery' : 'cafeteria'}
            cart={cart} student={student} addToCart={addToCart} removeFromCart={removeFromCart}
            clearCart={() => setCart([])}
            onPurchase={(total) => {
              handleUpdateStudent(student.id, { balance: student.balance - total, spentToday: student.spentToday + total });
              setCart([]);
            }}
          />
        )}

        {currentView === AppView.POS_GIFT_REDEEM && (
          <GiftRedemptionView 
            unitId={MOCK_UNITS[0].id}
            onBack={() => setCurrentView(AppView.POS_CAFETERIA)}
          />
        )}

        {currentView === AppView.UNIT_MANAGER_DASHBOARD && <ConcessionaireDashboard unit={MOCK_UNITS[0]} />}
        {currentView === AppView.HELP_DESK && <SupportSystem tickets={MOCK_TICKETS} isAdmin={userRole === UserRole.SCHOOL_ADMIN} />}
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

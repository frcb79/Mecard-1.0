
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/PosView';
import { ParentPortal } from './components/ParentPortal';
import { StudentPortal } from './components/StudentPortal';
import { MenuView } from './components/MenuView';
import { SchoolAdminView } from './components/SchoolAdminView'; 
import { SchoolAdminStudentsView } from './components/SchoolAdminStudentsView';
import { SchoolOnboardingDashboard } from './components/SchoolOnboardingDashboard';
import { CashierView } from './components/CashierView';
import { ConcessionaireDashboard } from './components/ConcessionaireDashboard';
import MeCardPlatform from './MeCardPlatform';
import { LoginView } from './components/LoginView';
import { SupportSystem } from './components/SupportSystem';
import { MeCardSocial } from './components/MeCardSocial';
import { AppView, CartItem, Product, UserRole, Transaction, StudentProfile, SupportTicket, OperatingUnit, MovementType, School } from './types';
import { MOCK_STUDENT, MOCK_TRANSACTIONS, MOCK_TICKETS, MOCK_UNITS, MOCK_SCHOOLS, MOCK_STUDENTS_LIST, PRODUCTS } from './constants';
import { CLABEService } from './services/clabeService';
import { InventoryService } from './services/inventoryService';

function App() {
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
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(myStudents)); }, [myStudents]);

  const handleUpdateStudent = (id: string, updatedData: Partial<StudentProfile>) => {
    setMyStudents(prev => prev.map((s) => s.id === id ? { ...s, ...updatedData } : s));
  };

  const handleSendGift = (recipientId: string, productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product || student.balance < product.price) {
        alert("Saldo insuficiente para enviar este regalo.");
        return;
    }
    handleUpdateStudent(student.id, { balance: student.balance - product.price });
    alert(`🎁 ¡Regalo enviado! Se han descontado $${product.price} de tu saldo.`);
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    switch(role) {
        case UserRole.SUPER_ADMIN: setCurrentView(AppView.SUPER_ADMIN_DASHBOARD); break;
        case UserRole.SCHOOL_ADMIN: setCurrentView(AppView.SCHOOL_ADMIN_DASHBOARD); break;
        case UserRole.STUDENT: setCurrentView(AppView.STUDENT_DASHBOARD); break;
        case UserRole.PARENT: setCurrentView(AppView.PARENT_DASHBOARD); break;
        default: setCurrentView(AppView.PARENT_DASHBOARD);
    }
  };

  const handleLogout = () => { setIsLoggedIn(false); setUserRole(null); };

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;
  if (userRole === UserRole.SUPER_ADMIN) return <MeCardPlatform onLogout={handleLogout} />;

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} userRole={userRole!} onLogout={handleLogout} />
      <main className="flex-1 h-full relative ml-64 overflow-hidden">
        {currentView === AppView.SCHOOL_ADMIN_DASHBOARD && (
          <SchoolAdminStudentsView 
            schoolId="mx_01" 
            students={myStudents} 
            onUpdateStudent={handleUpdateStudent}
            onAddStudent={(s) => setMyStudents(p => [s, ...p])}
            onDeleteStudent={(id) => setMyStudents(p => p.filter(s => s.id !== id))}
            onToggleStatus={(id) => handleUpdateStudent(id, { status: myStudents.find(s => s.id === id)?.status === 'Active' ? 'Inactive' : 'Active' })}
          />
        )}
        {currentView === AppView.STUDENT_DASHBOARD && (
          <div className="h-full flex flex-col md:flex-row overflow-hidden">
             <div className="flex-1 overflow-y-auto"><StudentPortal view={currentView} onNavigate={setCurrentView} student={student} transactions={transactions} /></div>
             <div className="w-full md:w-[450px] border-l border-slate-200 bg-slate-900"><MeCardSocial currentStudent={student} allStudents={myStudents} onSendGift={handleSendGift} /></div>
          </div>
        )}
        {currentView === AppView.PARENT_DASHBOARD && (
           <ParentPortal 
              view={currentView} onNavigate={setCurrentView} students={myStudents} 
              activeStudentIndex={activeStudentIndex} onSwitchStudent={setActiveStudentIndex}
              onLinkStudent={(s) => setMyStudents(p => [...p, s])} transactions={transactions}
              onUpdateStudent={(data) => handleUpdateStudent(student.id, data)}
           />
        )}
        {/* Renderiza otras vistas según AppView... */}
      </main>
    </div>
  );
}
export default App;

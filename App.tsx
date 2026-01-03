
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/PosView';
import { ParentPortal } from './components/ParentPortal';
import { StudentPortal } from './components/StudentPortal';
import { MenuView } from './components/MenuView';
import { SchoolAdminView } from './components/SchoolAdminView'; 
import { SchoolOnboardingDashboard } from './components/SchoolOnboardingDashboard';
import { CashierView } from './components/CashierView';
import { ConcessionaireDashboard } from './components/ConcessionaireDashboard';
import MeCardPlatform from './MeCardPlatform';
import { LoginView } from './components/LoginView';
import { SupportSystem } from './components/SupportSystem';
import { SmartStaffManager } from './components/SmartStaffManager';
import { AppView, CartItem, Product, UserRole, Transaction, StudentProfile, SupportTicket, OperatingUnit, NotificationType, MovementType, School } from './types';
import { MOCK_STUDENT, MOCK_TRANSACTIONS, MOCK_TICKETS, MOCK_UNITS, MOCK_SCHOOLS } from './constants';
import { CLABEService } from './services/clabeService';
import { InventoryService } from './services/inventoryService';
import { NotificationService } from './services/notificationService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.PARENT_DASHBOARD);
  
  const STORAGE_KEY_STUDENTS = 'mecard_students_v2';
  const STORAGE_KEY_TXS = 'mecard_txs_v2';
  const STORAGE_KEY_UNITS = 'mecard_units_v2';
  const STORAGE_KEY_MY_SCHOOL = 'mecard_my_school_v1';

  // State Management with Persistence
  const [units, setUnits] = useState<OperatingUnit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_UNITS);
    return saved ? JSON.parse(saved) : MOCK_UNITS;
  });

  const [mySchool, setMySchool] = useState<School>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MY_SCHOOL);
    return saved ? JSON.parse(saved) : { ...MOCK_SCHOOLS[0], onboardingStatus: 'PENDING' };
  });
  
  const [myStudents, setMyStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    const initial = saved ? JSON.parse(saved) : [MOCK_STUDENT];
    return initial.map((s: any) => ({
      ...s,
      clabePersonal: s.clabePersonal || CLABEService.generateStudentCLABE('123', s.id)
    }));
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TXS);
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const student = myStudents[activeStudentIndex];
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Sync with LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(units)); }, [units]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(myStudents)); }, [myStudents]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_MY_SCHOOL, JSON.stringify(mySchool)); }, [mySchool]);

  const handleUpdateStudent = (updatedData: Partial<StudentProfile>) => {
    setMyStudents(prev => prev.map((s, i) => i === activeStudentIndex ? { ...s, ...updatedData } : s));
  };

  const handleBulkAddStudents = (newStudents: StudentProfile[]) => {
    setMyStudents(prev => [...newStudents, ...prev]);
  };

  const handleAddStudent = (newStudent: StudentProfile) => {
    setMyStudents(prev => [newStudent, ...prev]);
  };

  const handleAddUnit = (newUnit: OperatingUnit) => setUnits(prev => [newUnit, ...prev]);
  const handleUpdateUnit = (id: string, updates: Partial<OperatingUnit>) => setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  const handleDeleteUnit = (id: string) => setUnits(prev => prev.filter(u => u.id !== id));

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    
    if (role === UserRole.SCHOOL_ADMIN && mySchool.onboardingStatus === 'PENDING') {
      setCurrentView(AppView.SCHOOL_ONBOARDING);
      return;
    }

    switch(role) {
        case UserRole.SUPER_ADMIN: setCurrentView(AppView.SUPER_ADMIN_DASHBOARD); break;
        case UserRole.SCHOOL_ADMIN: setCurrentView(AppView.SCHOOL_ADMIN_DASHBOARD); break;
        case UserRole.UNIT_MANAGER: setCurrentView(AppView.UNIT_MANAGER_DASHBOARD); break;
        case UserRole.CAFETERIA_STAFF: setCurrentView(AppView.POS_CAFETERIA); break;
        case UserRole.STATIONERY_STAFF: setCurrentView(AppView.POS_STATIONERY); break;
        case UserRole.CASHIER: setCurrentView(AppView.CASHIER_VIEW); break;
        case UserRole.PARENT: setCurrentView(AppView.PARENT_DASHBOARD); break;
        case UserRole.STUDENT: setCurrentView(AppView.STUDENT_DASHBOARD); break;
        default: setCurrentView(AppView.PARENT_DASHBOARD);
    }
  };

  const handleLogout = () => { setIsLoggedIn(false); setUserRole(null); setCart([]); };

  const processPurchase = (total: number, items: CartItem[], location: string) => {
    const txId = `TX-${Date.now()}`;
    const unitId = items[0]?.unitId || 'unit_01';
    
    const newTx: Transaction = {
      id: txId,
      date: new Date().toISOString(),
      item: items.length === 1 ? items[0].name : `${items.length} productos`,
      location: location,
      amount: -total,
      type: 'purchase',
      category: items[0].category,
      studentId: student.id,
      unitId: unitId
    };
    
    items.forEach(item => {
      InventoryService.updateStock(item.id, unitId, -item.quantity, MovementType.SALE);
      const inv = InventoryService.getInventory().find(i => i.productId === item.id && i.unitId === unitId);
      if (inv && inv.currentStock <= inv.minStock) {
        NotificationService.send('staff_01', NotificationType.LOW_STOCK_ALERT, '📦 Stock Bajo', `El producto ${item.name} se está agotando.`);
      }
    });

    NotificationService.send('p_01', NotificationType.PURCHASE_ALERT, '💳 Nueva Compra', `${student.name} compró ${newTx.item} en ${location}.`);

    const newBalance = student.balance - total;
    if (newBalance < 50) {
      NotificationService.send('p_01', NotificationType.LOW_BALANCE, '⚠️ Saldo Crítico', `${student.name} tiene menos de $50.00 en su monedero.`);
    }
    
    handleUpdateStudent({ balance: newBalance, spentToday: student.spentToday + total });
    setTransactions(prev => [newTx, ...prev]);
    setCart([]);
  };

  const handleDeposit = (amount: number, method: string = 'Efectivo') => {
    const newTx: Transaction = {
      id: `DEP-${Date.now()}`,
      date: new Date().toISOString(),
      item: `Abono (${method})`,
      location: method === 'Efectivo' ? 'Caja Principal' : 'Portal Online',
      amount: amount,
      type: 'deposit',
      studentId: student.id
    };
    handleUpdateStudent({ balance: student.balance + amount });
    setTransactions(prev => [newTx, ...prev]);
    NotificationService.send('p_01', NotificationType.DEPOSIT_CONFIRMED, '✅ Recarga Exitosa', `Se han abonado $${amount.toFixed(2)} vía ${method}.`);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.id !== productId));
  const clearCart = () => setCart([]);

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;
  if (userRole === UserRole.SUPER_ADMIN) return <MeCardPlatform onLogout={handleLogout} />;

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans">
      {currentView !== AppView.SCHOOL_ONBOARDING && (
        <Sidebar currentView={currentView} onNavigate={setCurrentView} userRole={userRole!} onLogout={handleLogout} />
      )}
      <main className={`flex-1 h-full relative ${currentView !== AppView.SCHOOL_ONBOARDING ? 'ml-64' : ''}`}>
        {currentView === AppView.SCHOOL_ONBOARDING && (
          <SchoolOnboardingDashboard 
            school={mySchool}
            onComplete={() => setCurrentView(AppView.SCHOOL_ADMIN_DASHBOARD)}
            onUpdateSchool={(data) => setMySchool(prev => ({ ...prev, ...data }))}
            allStudents={myStudents}
            onBulkAddStudents={handleBulkAddStudents}
          />
        )}
        {currentView === AppView.SCHOOL_ADMIN_DASHBOARD && (
          <SchoolAdminView 
            onUpdateStudent={handleUpdateStudent} 
            currentStudent={student} 
            allStudents={myStudents}
            onBulkAddStudents={handleBulkAddStudents}
            operatingUnits={units.filter(u => u.schoolId === 'mx_01')}
            onAddUnit={handleAddUnit}
            onUpdateUnit={handleUpdateUnit}
            onDeleteUnit={handleDeleteUnit}
          />
        )}
        {currentView === AppView.SCHOOL_ADMIN_STAFF && (
          <div className="p-12 h-full overflow-y-auto">
            <SmartStaffManager currentUserRole={UserRole.SCHOOL_ADMIN} operatingUnits={units.filter(u => u.schoolId === 'mx_01')} />
          </div>
        )}
        {currentView === AppView.UNIT_MANAGER_DASHBOARD && <ConcessionaireDashboard unit={units[0]} />}
        {currentView === AppView.UNIT_MANAGER_STAFF && (
           <div className="p-12 h-full overflow-y-auto">
             <SmartStaffManager currentUserRole={UserRole.UNIT_MANAGER} operatingUnits={units.filter(u => u.managerId === 'mgr_01')} />
           </div>
        )}
        {currentView === AppView.CASHIER_VIEW && <CashierView student={student} onDeposit={handleDeposit} />}
        {currentView === AppView.POS_CAFETERIA && (
          <PosView mode="cafeteria" cart={cart} student={student} addToCart={addToCart} removeFromCart={removeFromCart} clearCart={clearCart} onPurchase={(total) => processPurchase(total, cart, 'Cafetería Central')} />
        )}
        {currentView === AppView.POS_STATIONERY && (
          <PosView mode="stationery" cart={cart} student={student} addToCart={addToCart} removeFromCart={removeFromCart} clearCart={clearCart} onPurchase={(total) => processPurchase(total, cart, 'Papelería Escolar')} />
        )}
        {(currentView === AppView.PARENT_MENU || currentView === AppView.STUDENT_MENU) && <MenuView />}
        {(currentView === AppView.PARENT_DASHBOARD || currentView === AppView.PARENT_WALLET || currentView === AppView.PARENT_SETTINGS) && (
          <ParentPortal 
            view={currentView} 
            onNavigate={setCurrentView} 
            students={myStudents}
            activeStudentIndex={activeStudentIndex}
            onSwitchStudent={setActiveStudentIndex}
            onLinkStudent={handleAddStudent}
            transactions={transactions} 
            onUpdateStudent={handleUpdateStudent} 
            onDeposit={handleDeposit} 
          />
        )}
        {(currentView === AppView.STUDENT_DASHBOARD || currentView === AppView.STUDENT_ID || currentView === AppView.STUDENT_HISTORY) && (
          <StudentPortal view={currentView} onNavigate={setCurrentView} student={student} transactions={transactions} />
        )}
        {currentView === AppView.HELP_DESK && <SupportSystem tickets={tickets} isAdmin={false} />}
      </main>
    </div>
  );
}
export default App;

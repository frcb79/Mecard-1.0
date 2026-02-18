/**
 * ParentPortalContainer - Nueva Versión con Sidebar Collapsible
 * Integra ParentSidebar + ParentPortal + otras vistas hijas
 * Layout: Sidebar + Content
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ParentPortal } from './ParentPortal';
import { ParentSidebar } from './ParentSidebar';
import { MOCK_STUDENTS_LIST } from '../constants';
import { AppView, StudentProfile, Transaction } from '../types';
import '../styles/parentTheme.css';

export const ParentPortalContainer: React.FC = () => {
  // Router & Auth
  const navigate = useNavigate();
  const { logout } = useAuth();

  // State management
  const [view, setView] = useState<AppView>(AppView.PARENT_DASHBOARD);
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS_LIST.slice(0, 2));
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleNavigate = (view: AppView | string) => {
    // Si es string, convertir a AppView
    let appView: AppView;
    
    if (typeof view === 'string') {
      const stringToAppView: Record<string, AppView> = {
        'parent_dashboard': AppView.PARENT_DASHBOARD,
        'parent_wallet': AppView.PARENT_WALLET,
        'parent_limits': AppView.PARENT_LIMITS,
        'parent_reports': AppView.PARENT_REPORTS,
        'parent_notifications': AppView.PARENT_NOTIFICATIONS,
        'parent_settings': AppView.PARENT_SETTINGS,
      };
      appView = stringToAppView[view] || AppView.PARENT_DASHBOARD;
    } else {
      appView = view;
    }

    // Set the internal state
    setView(appView);

    // Map AppView to routes and navigate
    const viewToRouteMap: Record<AppView, string> = {
      [AppView.PARENT_DASHBOARD]: '/parent',
      [AppView.PARENT_WALLET]: '/parent/wallet',
      [AppView.PARENT_LIMITS]: '/parent/limits',
      [AppView.PARENT_REPORTS]: '/parent/reports',
      [AppView.PARENT_NOTIFICATIONS]: '/parent/notifications',
      [AppView.PARENT_SETTINGS]: '/parent/settings',
      // Para otros views padre
      [AppView.PARENT_MENU]: '/parent',
      [AppView.PARENT_CHILDREN]: '/parent',
      // Agregar los demás enums vacíos para TypeScript
      [AppView.SUPER_ADMIN_DASHBOARD]: '',
      [AppView.SUPER_ADMIN_SCHOOLS]: '',
      [AppView.SUPER_ADMIN_SETTLEMENTS]: '',
      [AppView.SCHOOL_ADMIN_DASHBOARD]: '',
      [AppView.SCHOOL_ADMIN_STAFF]: '',
      [AppView.SCHOOL_ADMIN_STUDENTS]: '',
      [AppView.SCHOOL_ADMIN_REPORTS]: '',
      [AppView.SCHOOL_ONBOARDING]: '',
      [AppView.BUSINESS_MODEL_CONFIG]: '',
      [AppView.UNIT_MANAGER_DASHBOARD]: '',
      [AppView.UNIT_MANAGER_STAFF]: '',
      [AppView.UNIT_MANAGER_INVENTORY]: '',
      [AppView.UNIT_MANAGER_REPORTS]: '',
      [AppView.POS_CAFETERIA]: '',
      [AppView.POS_STATIONERY]: '',
      [AppView.POS_GIFT_REDEEM]: '',
      [AppView.CASHIER_VIEW]: '',
      [AppView.CASHIER_DEPOSITS]: '',
      [AppView.STUDENT_DASHBOARD]: '',
      [AppView.STUDENT_ID]: '',
      [AppView.STUDENT_HISTORY]: '',
      [AppView.STUDENT_MENU]: '',
      [AppView.STUDENT_FRIENDS]: '',
      [AppView.STUDENT_GIFTS]: '',
      [AppView.HELP_DESK]: '',
      [AppView.SUPPORT_TICKETS]: '',
    };

    const route = viewToRouteMap[appView];
    if (route) {
      navigate(route);
    }
  };

  const handleSwitchStudent = (index: number) => {
    if (index >= 0 && index < students.length) {
      setActiveStudentIndex(index);
    }
  };

  const handleLinkStudent = (student: StudentProfile) => {
    setStudents([...students, student]);
  };

  const handleUpdateStudent = (data: Partial<StudentProfile>) => {
    if (activeStudentIndex >= 0) {
      const updated = [...students];
      updated[activeStudentIndex] = { ...updated[activeStudentIndex], ...data };
      setStudents(updated);
    }
  };

  const handleDeposit = (amount: number, method: string) => {
    console.log(`Deposit: ${amount} via ${method}`);
    // Implement deposit logic
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Mapeo de AppView a string para el sidebar
  const currentViewString = Object.entries({
    'parent_dashboard': AppView.PARENT_DASHBOARD,
    'parent_wallet': AppView.PARENT_WALLET,
    'parent_limits': AppView.PARENT_LIMITS,
    'parent_reports': AppView.PARENT_REPORTS,
    'parent_notifications': AppView.PARENT_NOTIFICATIONS,
    'parent_settings': AppView.PARENT_SETTINGS,
  }).find(([_, appView]) => appView === view)?.[0] || 'parent_dashboard';

  return (
    <div className="parent-portal-layout">
      {/* Sidebar Collapsible */}
      <ParentSidebar
        onNavigate={handleNavigate}
        activeView={currentViewString}
        onLogout={handleLogout}
      />

      {/* Content Area */}
      <div className="parent-portal-layout__content">
        <ParentPortal
          view={view}
          onNavigate={handleNavigate}
          students={students}
          activeStudentIndex={activeStudentIndex}
          onSwitchStudent={handleSwitchStudent}
          onLinkStudent={handleLinkStudent}
          transactions={transactions}
          onUpdateStudent={handleUpdateStudent}
          onDeposit={handleDeposit}
        />
      </div>
    </div>
  );
};

export default ParentPortalContainer;

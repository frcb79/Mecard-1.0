/**
 * ParentPortalContainer
 * Wrapper que proporciona estado y props a ParentPortal
 * Maneja la lógica de estado para que ParentPortal sea un componente presentacional
 */

import React, { useState } from 'react';
import { ParentPortal } from './ParentPortal';
import { MOCK_STUDENTS_LIST } from '../constants';
import { AppView, StudentProfile, Transaction } from '../types';

export const ParentPortalContainer: React.FC = () => {
  // State management
  const [view, setView] = useState<AppView>(AppView.PARENT_DASHBOARD);
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS_LIST.slice(0, 2));
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleNavigate = (newView: AppView) => {
    setView(newView);
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
    // Implement deposit logic
  };

  return (
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
  );
};

export default ParentPortalContainer;

/**
 * ParentPortalContainer
 * Wrapper que proporciona estado y props a ParentPortal
 * Maneja la lógica de estado para que ParentPortal sea un componente presentacional
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ParentPortal } from './ParentPortal';
import { useParentStudents } from '../hooks/useParentStudents';
import { StudentProfile, Transaction } from '../types';

export const ParentPortalContainer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hook-based student data filtered by authenticated parent
  const {
    students,
    linkStudent,
  } = useParentStudents();

  // State management
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const [transactions] = useState<Transaction[]>([]);

  const routeState = location.state as { openLinkModal?: boolean } | null;
  const shouldOpenLinkModal = Boolean(routeState?.openLinkModal);

  useEffect(() => {
    // Keep the active index within bounds as student sources refresh.
    if (students.length === 0) {
      setActiveStudentIndex(0);
      return;
    }

    if (activeStudentIndex >= students.length) {
      setActiveStudentIndex(0);
    }
  }, [activeStudentIndex, students.length]);

  useEffect(() => {
    if (!shouldOpenLinkModal) return;
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, navigate, shouldOpenLinkModal]);

  const handleSwitchStudent = (index: number) => {
    if (index >= 0 && index < students.length) {
      setActiveStudentIndex(index);
    }
  };

  const handleLinkStudent = (student: StudentProfile) => {
    const existingIndex = students.findIndex(s => s.id === student.id);
    linkStudent(student);
    setActiveStudentIndex(existingIndex >= 0 ? existingIndex : students.length);
  };

  const handleUpdateStudent = (data: Partial<StudentProfile>) => {
    const activeStudent = students[activeStudentIndex];
    if (!activeStudent) return;
    linkStudent({ ...activeStudent, ...data });
  };

  const handleDeposit = (amount: number, method: string) => {
    // Implement deposit logic
  };

  return (
    <ParentPortal
      students={students}
      activeStudentIndex={activeStudentIndex}
      onSwitchStudent={handleSwitchStudent}
      onLinkStudent={handleLinkStudent}
      transactions={transactions}
      onUpdateStudent={handleUpdateStudent}
      onDeposit={handleDeposit}
      forceOpenLinking={shouldOpenLinkModal}
    />
  );
};

export default ParentPortalContainer;

/**
 * SchoolAdminContainer
 * Wrapper que proporciona estado y props a SchoolAdminView
 * Maneja la lógica de estado para que SchoolAdminView sea un componente presentacional
 */

import React, { useState } from 'react';
import { SchoolAdminView } from './SchoolAdminView';
import { MOCK_STUDENTS_LIST } from '../constants';
import { StudentProfile, OperatingUnit } from '../types';

// Mock operating units
const MOCK_OPERATING_UNITS: OperatingUnit[] = [
  {
    id: 'unit-001',
    name: 'Cafetería Principal',
    type: 'CAFETERIA',
    schoolId: 'school-001',
    status: 'active',
    manager: { id: 'mgr-001', name: 'Carlos García', email: 'carlos@escuela.mx' },
    hours: { open: '07:00', close: '16:00' },
    createdAt: '2026-01-01'
  },
  {
    id: 'unit-002',
    name: 'Tienda Escolar',
    type: 'STATIONERY',
    schoolId: 'school-001',
    status: 'active',
    manager: { id: 'mgr-002', name: 'Rosa López', email: 'rosa@escuela.mx' },
    hours: { open: '08:00', close: '15:00' },
    createdAt: '2026-01-01'
  }
];

export const SchoolAdminContainer: React.FC = () => {
  // State management
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS_LIST);
  const [operatingUnits, setOperatingUnits] = useState<OperatingUnit[]>(MOCK_OPERATING_UNITS);

  const handleUpdateStudent = (id: string, data: Partial<StudentProfile>) => {
    setStudents(
      students.map(student =>
        student.id === id ? { ...student, ...data } : student
      )
    );
  };

  const handleBulkAddStudents = (newStudents: StudentProfile[]) => {
    setStudents([...students, ...newStudents]);
  };

  const handleAddUnit = (unit: OperatingUnit) => {
    setOperatingUnits([...operatingUnits, unit]);
  };

  const handleUpdateUnit = (id: string, updates: Partial<OperatingUnit>) => {
    setOperatingUnits(
      operatingUnits.map(unit =>
        unit.id === id ? { ...unit, ...updates } : unit
      )
    );
  };

  const handleDeleteUnit = (id: string) => {
    setOperatingUnits(operatingUnits.filter(unit => unit.id !== id));
  };

  return (
    <SchoolAdminView
      onUpdateStudent={handleUpdateStudent}
      allStudents={students}
      onBulkAddStudents={handleBulkAddStudents}
      operatingUnits={operatingUnits}
      onAddUnit={handleAddUnit}
      onUpdateUnit={handleUpdateUnit}
      onDeleteUnit={handleDeleteUnit}
    />
  );
};

export default SchoolAdminContainer;

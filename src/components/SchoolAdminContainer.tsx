/**
 * SchoolAdminContainer
 * Wrapper que proporciona estado y props a SchoolAdminView
 * Consumes useStudents() and useSchoolData() hooks as single source of truth
 */

import React, { useState, useEffect } from 'react';
import { SchoolAdminView } from './SchoolAdminView';
import { useStudents } from '../hooks/useStudents';
import { useSchoolData } from '../hooks/useSchoolData';
import { StudentProfile, OperatingUnit, EntityOwner } from '../types';

const DEFAULT_SCHOOL_ID = 'school-001';

export const SchoolAdminContainer: React.FC = () => {
  // Hook-based data — single source of truth
  const { students: hookStudents, loading: studentsLoading } = useStudents({ schoolId: DEFAULT_SCHOOL_ID });
  const { units: hookUnits, currentSchool, loading: schoolLoading } = useSchoolData(DEFAULT_SCHOOL_ID);

  // Local state seeded from hooks (allows in-session mutations)
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [operatingUnits, setOperatingUnits] = useState<OperatingUnit[]>([]);

  // Sync hook data into local state when loaded
  useEffect(() => {
    if (!studentsLoading && hookStudents.length > 0) {
      setStudents(hookStudents);
    }
  }, [studentsLoading, hookStudents]);

  useEffect(() => {
    if (!schoolLoading && hookUnits.length > 0) {
      setOperatingUnits(hookUnits);
    }
  }, [schoolLoading, hookUnits]);

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

  if (studentsLoading || schoolLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Cargando datos institucionales...</p>
        </div>
      </div>
    );
  }

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

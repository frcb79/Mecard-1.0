/**
 * SchoolAdminContainer
 * Wrapper que proporciona estado y props a SchoolAdminView.
 *
 * Sprint 1: now hydrates data from useSchoolAdminQueries
 * (Supabase when configured, fallback to mocks).
 */

import React, { useState, useEffect } from 'react';
import { SchoolAdminView } from './SchoolAdminView';
import { StudentProfile, OperatingUnit } from '../types';
import { useSchoolAdminQueries } from '../hooks/useSchoolAdminQueries';
import { useSchoolAdminMutations } from '../hooks/useSchoolAdminMutations';

const DEFAULT_SCHOOL_ID = 'school-001';

export const SchoolAdminContainer: React.FC = () => {
  const {
    students: queryStudents,
    operatingUnits: queryUnits,
    loading,
    error,
    refresh,
  } = useSchoolAdminQueries(DEFAULT_SCHOOL_ID);

  const { reloadWallet } = useSchoolAdminMutations({ schoolId: DEFAULT_SCHOOL_ID });

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [operatingUnits, setOperatingUnits] = useState<OperatingUnit[]>([]);

  useEffect(() => {
    setStudents(queryStudents);
  }, [queryStudents]);

  useEffect(() => {
    setOperatingUnits(queryUnits);
  }, [queryUnits]);

  const handleUpdateStudent = (id: string, data: Partial<StudentProfile>) => {
    setStudents((prev) => prev.map((student) => (student.id === id ? { ...student, ...data } : student)));
  };

  const handleBulkAddStudents = (newStudents: StudentProfile[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
  };

  const handleAddUnit = (unit: OperatingUnit) => {
    setOperatingUnits((prev) => [...prev, unit]);
  };

  const handleUpdateUnit = (id: string, updates: Partial<OperatingUnit>) => {
    setOperatingUnits((prev) => prev.map((unit) => (unit.id === id ? { ...unit, ...updates } : unit)));
  };

  const handleDeleteUnit = (id: string) => {
    setOperatingUnits((prev) => prev.filter((unit) => unit.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Cargando datos institucionales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
          {error}
          <button
            onClick={() => {
              void refresh();
            }}
            className="ml-3 font-bold underline"
          >
            Reintentar
          </button>
        </div>
        <SchoolAdminView
          onUpdateStudent={handleUpdateStudent}
          allStudents={students}
          onBulkAddStudents={handleBulkAddStudents}
          operatingUnits={operatingUnits}
          onAddUnit={handleAddUnit}
          onUpdateUnit={handleUpdateUnit}
          onDeleteUnit={handleDeleteUnit}
          onReloadWallet={reloadWallet}
        />
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
      onReloadWallet={reloadWallet}
    />
  );
};

export default SchoolAdminContainer;

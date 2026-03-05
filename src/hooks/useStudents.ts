/**
 * useStudents — Centralized hook for student data access.
 *
 * Replaces direct imports of MOCK_STUDENT / MOCK_STUDENTS_LIST from constants.
 * Falls back to mock data when Supabase is not configured.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MOCK_STUDENT, MOCK_STUDENTS_LIST } from '../constants';
import { UserStatus } from '../types';
import type { StudentProfile } from '../types';

// ─── Types ────────────────────────────────────────────

interface StudentsState {
  students: StudentProfile[];
  loading: boolean;
  error: string | null;
}

// ─── Hook: useStudents ────────────────────────────────

/**
 * Returns a list of students, optionally filtered by schoolId or parentId.
 */
export function useStudents(options?: { schoolId?: string; parentId?: string }) {
  const [state, setState] = useState<StudentsState>({
    students: [],
    loading: true,
    error: null,
  });

  const loadStudents = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // For now, use mock data even when configured — Supabase table
      // will be wired when migration is deployed.
      // TODO: Replace with supabase.from('students').select('*')
      let filtered = [...MOCK_STUDENTS_LIST];
      if (options?.schoolId) {
        filtered = filtered.filter(s => s.schoolId === options.schoolId);
      }
      if (options?.parentId) {
        filtered = filtered.filter(
          s => s.parentId === options.parentId || s.parentIds?.includes(options.parentId!),
        );
      }
      setState({ students: filtered, loading: false, error: null });
    } catch (err) {
      console.error('[useStudents] Error loading students:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar lista de alumnos',
      }));
    }
  }, [options?.schoolId, options?.parentId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Convenience lookups
  const getById = useCallback(
    (studentId: string) => state.students.find(s => s.id === studentId || s.studentId === studentId),
    [state.students],
  );

  const getByGrade = useCallback(
    (grade: string) => state.students.filter(s => s.grade === grade),
    [state.students],
  );

  const activeStudents = useMemo(
    () => state.students.filter(s => s.status === UserStatus.ACTIVE),
    [state.students],
  );

  return {
    ...state,
    activeStudents,
    refresh: loadStudents,
    getById,
    getByGrade,
  };
}

// ─── Hook: useStudent (single) ────────────────────────

/**
 * Returns a single student by ID, falling back to MOCK_STUDENT.
 */
export function useStudent(studentId?: string) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudent = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      if (studentId) {
        // Look up in full list first
        const found = MOCK_STUDENTS_LIST.find(
          s => s.id === studentId || s.studentId === studentId,
        );
        setStudent(found || MOCK_STUDENT);
      } else {
        // When no ID provided, return the default mock student
        setStudent(MOCK_STUDENT);
      }
      setLoading(false);
    } catch (err) {
      console.error('[useStudent] Error loading student:', err);
      setError('Error al cargar datos del alumno');
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  return {
    student,
    loading,
    error,
    refresh: loadStudent,
  };
}

export default useStudents;

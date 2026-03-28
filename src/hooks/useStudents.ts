/**
 * useStudents - Centralized hook for student data access.
 *
 * Uses Supabase profiles when configured, with fallback to mock data.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MOCK_STUDENT, MOCK_STUDENTS_LIST } from '../constants';
import { UserStatus } from '../types';
import type { StudentProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { logger } from '../lib/logger';

interface StudentsState {
  students: StudentProfile[];
  loading: boolean;
  error: string | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  student_id: string | null;
  grade: string | null;
  school_id: string | null;
  balance: number | null;
  created_at: string | null;
}

const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: 'Alumno', lastName: 'meCard' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'meCard' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const toStudentProfile = (row: ProfileRow, fallback: StudentProfile): StudentProfile => {
  const safeFullName = row.full_name?.trim() || fallback.fullName;
  const names = splitName(safeFullName);
  const createdAt = row.created_at || fallback.createdAt;

  return {
    ...fallback,
    id: row.id,
    userId: row.id,
    studentId: row.student_id || fallback.studentId || row.id,
    fullName: safeFullName,
    firstName: names.firstName,
    lastName: names.lastName,
    grade: row.grade || fallback.grade,
    schoolId: row.school_id || fallback.schoolId,
    balance: row.balance ?? fallback.balance,
    status: UserStatus.ACTIVE,
    createdAt,
    updatedAt: createdAt,
  };
};

const loadFromMock = (options?: { schoolId?: string; parentId?: string }): StudentProfile[] => {
  let filtered = [...MOCK_STUDENTS_LIST];
  if (options?.schoolId) {
    filtered = filtered.filter((s) => s.schoolId === options.schoolId);
  }
  if (options?.parentId) {
    filtered = filtered.filter(
      (s) => s.parentId === options.parentId || s.parentIds?.includes(options.parentId || ''),
    );
  }
  return filtered;
};

export function useStudents(options?: { schoolId?: string; parentId?: string }) {
  const [state, setState] = useState<StudentsState>({
    students: [],
    loading: true,
    error: null,
  });

  const loadStudents = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (!isSupabaseConfigured) {
      setState({ students: loadFromMock(options), loading: false, error: null });
      return;
    }

    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, student_id, grade, school_id, balance, created_at')
        .eq('role', 'STUDENT');

      if (options?.schoolId) {
        query = query.eq('school_id', options.schoolId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const rows: ProfileRow[] = (data || []) as ProfileRow[];
      const fallbackStudents = loadFromMock(options);
      const template = fallbackStudents[0] || MOCK_STUDENT;
      const mapped = rows.map((row) => toStudentProfile(row, template));

      const finalStudents = options?.parentId
        ? mapped.filter(
            (s) => s.parentId === options.parentId || s.parentIds?.includes(options.parentId || ''),
          )
        : mapped;

      setState({
        students: finalStudents.length > 0 ? finalStudents : fallbackStudents,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      logger.error('hooks.students', 'Error loading students from Supabase', err, {
        schoolId: options?.schoolId,
        parentId: options?.parentId,
      });
      setState({
        students: loadFromMock(options),
        loading: false,
        error: 'Error al cargar lista de alumnos. Mostrando datos fallback.',
      });
    }
  }, [options?.schoolId, options?.parentId]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const getById = useCallback(
    (studentId: string) => state.students.find((s) => s.id === studentId || s.studentId === studentId),
    [state.students],
  );

  const getByGrade = useCallback(
    (grade: string) => state.students.filter((s) => s.grade === grade),
    [state.students],
  );

  const activeStudents = useMemo(
    () => state.students.filter((s) => s.status === UserStatus.ACTIVE),
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

export function useStudent(studentId?: string) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!studentId) {
        setStudent(MOCK_STUDENT);
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        const found = MOCK_STUDENTS_LIST.find((s) => s.id === studentId || s.studentId === studentId);
        setStudent(found || MOCK_STUDENT);
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, grade, school_id, balance, created_at')
        .eq('id', studentId)
        .single();

      if (queryError || !data) {
        const found = MOCK_STUDENTS_LIST.find((s) => s.id === studentId || s.studentId === studentId);
        setStudent(found || MOCK_STUDENT);
        setLoading(false);
        return;
      }

      const mapped = toStudentProfile(data as ProfileRow, MOCK_STUDENT);
      setStudent(mapped);
      setLoading(false);
    } catch (err: unknown) {
      logger.error('hooks.student', 'Error loading student', err, { studentId });
      setError('Error al cargar datos del alumno');
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  return {
    student,
    loading,
    error,
    refresh: loadStudent,
  };
}

export default useStudents;

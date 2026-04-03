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

interface StudentRow {
  id: string;
  user_id: string | null;
  student_id: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  grade: string | null;
  group: string | null;
  curp: string | null;
  school_id: string | null;
  campus_id: string | null;
  credential: StudentProfile['credential'] | null;
  balance: number | null;
  daily_limit: number | null;
  spent_today: number | null;
  total_spent: number | null;
  restrictions: StudentProfile['restrictions'] | null;
  parent_id: string | null;
  parent_name: string | null;
  parent_email: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
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

const toStudentProfile = (row: StudentRow, fallback: StudentProfile): StudentProfile => {
  const safeFullName = row.full_name?.trim() || fallback.fullName;
  const names = splitName(safeFullName);
  const createdAt = row.created_at || fallback.createdAt;
  const updatedAt = row.updated_at || createdAt;

  return {
    ...fallback,
    id: row.id,
    userId: row.user_id || row.id,
    studentId: row.student_id || fallback.studentId || row.id,
    fullName: safeFullName,
    firstName: row.first_name?.trim() || names.firstName,
    lastName: row.last_name?.trim() || names.lastName,
    grade: row.grade || fallback.grade,
    group: row.group || fallback.group,
    curp: row.curp || fallback.curp,
    schoolId: row.school_id || fallback.schoolId,
    campusId: row.campus_id || fallback.campusId,
    credential: row.credential || fallback.credential,
    balance: row.balance ?? fallback.balance,
    dailyLimit: row.daily_limit ?? fallback.dailyLimit,
    spentToday: row.spent_today ?? fallback.spentToday,
    totalSpent: row.total_spent ?? fallback.totalSpent,
    restrictions: row.restrictions || fallback.restrictions,
    parentId: row.parent_id || fallback.parentId,
    parentName: row.parent_name || fallback.parentName,
    parentEmail: row.parent_email || fallback.parentEmail,
    status: (row.status as UserStatus) || UserStatus.ACTIVE,
    createdAt,
    updatedAt,
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
        .from('students')
        .select('id, user_id, student_id, full_name, first_name, last_name, grade, group, curp, school_id, campus_id, credential, balance, daily_limit, spent_today, total_spent, restrictions, parent_id, parent_name, parent_email, status, created_at, updated_at');

      if (options?.schoolId) {
        query = query.eq('school_id', options.schoolId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const rows: StudentRow[] = (data || []) as StudentRow[];
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
        .from('students')
        .select('id, user_id, student_id, full_name, first_name, last_name, grade, group, curp, school_id, campus_id, credential, balance, daily_limit, spent_today, total_spent, restrictions, parent_id, parent_name, parent_email, status, created_at, updated_at')
        .or(`id.eq.${studentId},student_id.eq.${studentId}`)
        .limit(1)
        .maybeSingle();

      if (queryError || !data) {
        const found = MOCK_STUDENTS_LIST.find((s) => s.id === studentId || s.studentId === studentId);
        setStudent(found || MOCK_STUDENT);
        setLoading(false);
        return;
      }

      const mapped = toStudentProfile(data as StudentRow, MOCK_STUDENT);
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

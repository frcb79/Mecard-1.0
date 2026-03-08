import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { useStudents } from './useStudents';
import type { StudentProfile } from '../types';

interface UseParentStudentsResult {
  students: StudentProfile[];
  loading: boolean;
  error: string | null;
  linkStudent: (student: StudentProfile) => void;
  updateLinkedStudent: (studentId: string, patch: Partial<StudentProfile>) => void;
}

interface LinkedStudentsStore {
  students: StudentProfile[];
}

const EMPTY_STORE: LinkedStudentsStore = { students: [] };

function getStorageKey(scopeParentId: string) {
  return `mecard.parent.linked-students.${scopeParentId}`;
}

function readLinkedStore(scopeParentId: string): LinkedStudentsStore {
  if (typeof window === 'undefined') return EMPTY_STORE;

  try {
    const raw = window.localStorage.getItem(getStorageKey(scopeParentId));
    if (!raw) return EMPTY_STORE;

    const parsed = JSON.parse(raw) as LinkedStudentsStore;
    if (!Array.isArray(parsed.students)) return EMPTY_STORE;
    return parsed;
  } catch {
    return EMPTY_STORE;
  }
}

function writeLinkedStore(scopeParentId: string, store: LinkedStudentsStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getStorageKey(scopeParentId), JSON.stringify(store));
}

function mergeStudents(base: StudentProfile[], linked: StudentProfile[]) {
  const dedup = new Map<string, StudentProfile>();
  [...base, ...linked].forEach(student => dedup.set(student.id, student));
  return Array.from(dedup.values());
}

/**
 * Resolves the student list visible for the authenticated parent.
 * In demo mode, fallback to `parent_01` preserves seeded showcase data.
 */
export function useParentStudents(): UseParentStudentsResult {
  const { user, isDemoMode } = useAuth();
  const { students, loading, error } = useStudents();
  const parentScopeId = useMemo(() => {
    if (!user) return null;
    if (user.id.startsWith('parent_')) return user.id;
    if (isDemoMode) return 'parent_01';
    return user.id;
  }, [isDemoMode, user]);

  const [linkedStudents, setLinkedStudents] = useState<StudentProfile[]>([]);

  useEffect(() => {
    if (!parentScopeId) {
      setLinkedStudents([]);
      return;
    }

    setLinkedStudents(readLinkedStore(parentScopeId).students);
  }, [parentScopeId]);

  const visibleBaseStudents = useMemo(() => {
    if (!user || !parentScopeId) return [];

    const allowedParentIds = new Set<string>([user.id]);
    if (isDemoMode && !user.id.startsWith('parent_')) {
      allowedParentIds.add('parent_01');
    }

    return students.filter(student => {
      if (allowedParentIds.has(student.parentId)) return true;
      return (student.parentIds || []).some(parentId => allowedParentIds.has(parentId));
    });
  }, [isDemoMode, parentScopeId, students, user]);

  const parentStudents = useMemo(
    () => mergeStudents(visibleBaseStudents, linkedStudents),
    [linkedStudents, visibleBaseStudents],
  );

  const linkStudent = useCallback((student: StudentProfile) => {
    if (!parentScopeId) return;

    setLinkedStudents(prev => {
      const exists = prev.some(existing => existing.id === student.id);
      const next = exists
        ? prev.map(existing => (existing.id === student.id ? { ...existing, ...student } : existing))
        : [...prev, student];
      writeLinkedStore(parentScopeId, { students: next });
      return next;
    });
  }, [parentScopeId]);

  const updateLinkedStudent = useCallback((studentId: string, patch: Partial<StudentProfile>) => {
    if (!parentScopeId) return;

    setLinkedStudents(prev => {
      const found = prev.find(student => student.id === studentId);
      if (!found) return prev;

      const next = prev.map(student => (
        student.id === studentId ? { ...student, ...patch } : student
      ));
      writeLinkedStore(parentScopeId, { students: next });
      return next;
    });
  }, [parentScopeId]);

  return {
    students: parentStudents,
    loading,
    error,
    linkStudent,
    updateLinkedStudent,
  };
}

export default useParentStudents;

/**
 * Sistema centralizado de permisos por rol
 * PUNTO ÚNICO DE VERDAD para validación de acceso
 */

import { AppView, UserRole } from '../types';

export const VIEW_PERMISSIONS: Record<AppView, UserRole[]> = {
  // SUPER ADMIN - Acceso a TODO
  [AppView.SUPER_ADMIN_DASHBOARD]: [UserRole.SUPER_ADMIN],

  // PARENT PORTAL
  [AppView.PARENT_DASHBOARD]: [UserRole.PARENT, UserRole.SUPER_ADMIN],
  [AppView.PARENT_WALLET]: [UserRole.PARENT, UserRole.SUPER_ADMIN],
  [AppView.PARENT_ALERTS]: [UserRole.PARENT, UserRole.SUPER_ADMIN],
  [AppView.PARENT_MONITORING]: [UserRole.PARENT, UserRole.SUPER_ADMIN],
  [AppView.PARENT_SETTINGS]: [UserRole.PARENT, UserRole.SUPER_ADMIN],
  [AppView.PARENT_MENU]: [UserRole.PARENT, UserRole.SUPER_ADMIN],

  // STUDENT PORTAL
  [AppView.STUDENT_DASHBOARD]: [UserRole.STUDENT, UserRole.SUPER_ADMIN],
  [AppView.STUDENT_ID]: [UserRole.STUDENT, UserRole.SUPER_ADMIN],
  [AppView.STUDENT_HISTORY]: [UserRole.STUDENT, UserRole.SUPER_ADMIN],
  [AppView.STUDENT_MENU]: [UserRole.STUDENT, UserRole.SUPER_ADMIN],

  // SCHOOL ADMIN
  [AppView.SCHOOL_ADMIN_DASHBOARD]: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN],
  [AppView.SCHOOL_ADMIN_STAFF]: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN],
  [AppView.SCHOOL_ONBOARDING]: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN],
  [AppView.ANALYTICS_DASHBOARD]: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN],
  [AppView.STUDENT_MONITORING]: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN],

  // UNIT MANAGER / CONCESSIONAIRE
  [AppView.UNIT_MANAGER_DASHBOARD]: [UserRole.UNIT_MANAGER, UserRole.SUPER_ADMIN],
  [AppView.UNIT_MANAGER_STAFF]: [UserRole.UNIT_MANAGER, UserRole.SUPER_ADMIN],
  [AppView.CONCESSIONAIRE_SALES]: [UserRole.UNIT_MANAGER, UserRole.SUPER_ADMIN],

  // CASHIER
  [AppView.CASHIER_VIEW]: [UserRole.CASHIER, UserRole.SUPER_ADMIN],

  // POS OPERATIONS
  [AppView.POS_CAFETERIA]: [UserRole.POS_OPERATOR, UserRole.CAFETERIA_STAFF, UserRole.SUPER_ADMIN],
  [AppView.POS_STATIONERY]: [UserRole.POS_OPERATOR, UserRole.STATIONERY_STAFF, UserRole.SUPER_ADMIN],
  [AppView.POS_GIFT_REDEEM]: [
    UserRole.POS_OPERATOR,
    UserRole.CAFETERIA_STAFF,
    UserRole.STATIONERY_STAFF,
    UserRole.SUPER_ADMIN,
  ],

  // HELP DESK
  [AppView.HELP_DESK]: [UserRole.SCHOOL_ADMIN, UserRole.PARENT, UserRole.STUDENT, UserRole.SUPER_ADMIN],
};

/**
 * Verifica si un rol tiene acceso a una vista específica (para Sidebar)
 * @param view - La vista a la que se intenta acceder
 * @param role - El rol del usuario
 * @returns true si tiene acceso, false de lo contrario
 */
export const canAccessView = (view: AppView, role: UserRole): boolean => {
  return VIEW_PERMISSIONS[view]?.includes(role) ?? false;
};

/**
 * Verifica si un rol tiene acceso a una vista específica (para App.tsx)
 * @param view - La vista a la que se intenta acceder
 * @param role - El rol del usuario
 * @returns true si tiene acceso, false de lo contrario
 */
export const isAuthorized = (view: AppView, role: UserRole | null): boolean => {
  if (!role) return false;
  return VIEW_PERMISSIONS[view]?.includes(role) ?? false;
};

/**
 * Obtiene las vistas permitidas para un rol
 * @param role - El rol del usuario
 * @returns Array de vistas que el usuario puede acceder
 */
export const getAllowedViews = (role: UserRole): AppView[] => {
  return Object.entries(VIEW_PERMISSIONS)
    .filter(([_, allowedRoles]) => allowedRoles.includes(role))
    .map(([view]) => view as AppView);
};

/**
 * Verifica si un rol es administrador
 */
export const isAdmin = (role: UserRole | null): boolean => {
  return role === UserRole.SUPER_ADMIN || role === UserRole.SCHOOL_ADMIN;
};

/**
 * Verifica si un rol es de estudiante
 */
export const isStudent = (role: UserRole | null): boolean => {
  return role === UserRole.STUDENT;
};

/**
 * Verifica si un rol es de padre de familia
 */
export const isParent = (role: UserRole | null): boolean => {
  return role === UserRole.PARENT;
};

/**
 * Verifica si un rol es de operario (POS, Cashier, etc.)
 */
export const isOperator = (role: UserRole | null): boolean => {
  return (
    role === UserRole.POS_OPERATOR ||
    role === UserRole.CAFETERIA_STAFF ||
    role === UserRole.STATIONERY_STAFF ||
    role === UserRole.CASHIER ||
    role === UserRole.UNIT_MANAGER
  );
};

/**
 * RoleService — Custom Roles & Permissions RBAC
 * Manages custom roles, permission resolution, and role CRUD.
 * localStorage persistence (same pattern as SchoolFeeService).
 */

import {
  AppPermission,
  CustomRole,
  UserRole,
  DEFAULT_ROLE_PERMISSIONS,
  AuthUser,
} from '../types';

const ROLES_KEY = 'mecard_custom_roles';

// ========== Helpers ==========
function load(): CustomRole[] {
  try { return JSON.parse(localStorage.getItem(ROLES_KEY) || '[]'); }
  catch { return []; }
}
function save(roles: CustomRole[]) { localStorage.setItem(ROLES_KEY, JSON.stringify(roles)); }

// ========== Permission Labels (Spanish) ==========
export const PERMISSION_LABELS: Record<AppPermission, string> = {
  [AppPermission.DASHBOARD_VIEW]: 'Ver Dashboard',
  [AppPermission.POS_ACCESS]: 'Acceso al POS',
  [AppPermission.POS_VOID_TRANSACTION]: 'Anular Ventas',
  [AppPermission.POS_APPLY_DISCOUNT]: 'Aplicar Descuentos',
  [AppPermission.INVENTORY_VIEW]: 'Ver Inventario',
  [AppPermission.INVENTORY_MANAGE]: 'Gestionar Inventario',
  [AppPermission.STUDENTS_VIEW]: 'Ver Alumnos',
  [AppPermission.STUDENTS_MANAGE]: 'Gestionar Alumnos',
  [AppPermission.STUDENTS_IMPORT]: 'Importar Alumnos',
  [AppPermission.FEES_VIEW]: 'Ver Colegiaturas',
  [AppPermission.FEES_MANAGE]: 'Gestionar Colegiaturas',
  [AppPermission.PAYMENTS_VIEW]: 'Ver Pagos',
  [AppPermission.PAYMENTS_PROCESS]: 'Procesar Pagos',
  [AppPermission.SCHOLARSHIPS_MANAGE]: 'Gestionar Becas',
  [AppPermission.SETTLEMENTS_VIEW]: 'Ver Liquidaciones',
  [AppPermission.SETTLEMENTS_MANAGE]: 'Gestionar Liquidaciones',
  [AppPermission.REPORTS_VIEW]: 'Ver Reportes',
  [AppPermission.SCHOOL_CONFIG]: 'Configuración Escolar',
  [AppPermission.STAFF_MANAGE]: 'Gestionar Personal',
  [AppPermission.ROLES_MANAGE]: 'Gestionar Roles',
  [AppPermission.ANNOUNCEMENTS_MANAGE]: 'Gestionar Anuncios',
  [AppPermission.ACCESS_DASHBOARD]: 'Dashboard de Acceso',
  [AppPermission.PERMISSIONS_MANAGE]: 'Permisos de Salida',
  [AppPermission.PARENT_WALLET]: 'Monedero (Padre)',
  [AppPermission.PARENT_LIMITS]: 'Límites (Padre)',
  [AppPermission.PARENT_TRIPS]: 'Viajes (Padre)',
  [AppPermission.PLATFORM_SCHOOLS_MANAGE]: 'Gestionar Escuelas (Plataforma)',
  [AppPermission.PLATFORM_BILLING]: 'Facturación (Plataforma)',
  [AppPermission.PLATFORM_GLOBAL_REPORTS]: 'Reportes Globales (Plataforma)',
  [AppPermission.UNIT_MANAGE]: 'Gestionar Unidad Operativa',
};

// ========== Permission Groups (for UI) ==========
export const PERMISSION_GROUPS: { label: string; permissions: AppPermission[] }[] = [
  { label: 'Dashboard', permissions: [AppPermission.DASHBOARD_VIEW] },
  { label: 'POS', permissions: [AppPermission.POS_ACCESS, AppPermission.POS_VOID_TRANSACTION, AppPermission.POS_APPLY_DISCOUNT] },
  { label: 'Inventario', permissions: [AppPermission.INVENTORY_VIEW, AppPermission.INVENTORY_MANAGE] },
  { label: 'Alumnos', permissions: [AppPermission.STUDENTS_VIEW, AppPermission.STUDENTS_MANAGE, AppPermission.STUDENTS_IMPORT] },
  { label: 'Finanzas', permissions: [AppPermission.FEES_VIEW, AppPermission.FEES_MANAGE, AppPermission.PAYMENTS_VIEW, AppPermission.PAYMENTS_PROCESS, AppPermission.SCHOLARSHIPS_MANAGE] },
  { label: 'Liquidaciones', permissions: [AppPermission.SETTLEMENTS_VIEW, AppPermission.SETTLEMENTS_MANAGE] },
  { label: 'Reportes', permissions: [AppPermission.REPORTS_VIEW] },
  { label: 'Configuración Escolar', permissions: [AppPermission.SCHOOL_CONFIG, AppPermission.STAFF_MANAGE, AppPermission.ROLES_MANAGE, AppPermission.ANNOUNCEMENTS_MANAGE] },
  { label: 'Acceso y Seguridad', permissions: [AppPermission.ACCESS_DASHBOARD, AppPermission.PERMISSIONS_MANAGE] },
  { label: 'Portal Padres', permissions: [AppPermission.PARENT_WALLET, AppPermission.PARENT_LIMITS, AppPermission.PARENT_TRIPS] },
  { label: 'Plataforma', permissions: [AppPermission.PLATFORM_SCHOOLS_MANAGE, AppPermission.PLATFORM_BILLING, AppPermission.PLATFORM_GLOBAL_REPORTS] },
  { label: 'Unidad Operativa', permissions: [AppPermission.UNIT_MANAGE] },
];

// ========== RoleService ==========
export const RoleService = {
  /** Initialize default system roles if none exist */
  ensureDefaults(schoolId: string) {
    const roles = load();
    const hasSystem = roles.some(r => r.schoolId === schoolId && r.isSystem);
    if (hasSystem) return;

    const systemRoles: CustomRole[] = [
      { id: 'role_admin', schoolId, name: 'Director Escolar', description: 'Acceso completo a la administración del plantel', baseRole: UserRole.SCHOOL_ADMIN, permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.SCHOOL_ADMIN], isSystem: true, color: '#6366f1', createdAt: '2025-08-01', updatedAt: '2025-08-01' },
      { id: 'role_finance', schoolId, name: 'Finanzas', description: 'Colegiaturas, pagos, liquidaciones y reportes', baseRole: UserRole.SCHOOL_FINANCE, permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.SCHOOL_FINANCE], isSystem: true, color: '#10b981', createdAt: '2025-08-01', updatedAt: '2025-08-01' },
      { id: 'role_unit_mgr', schoolId, name: 'Gerente de Unidad', description: 'POS, inventario y personal de la unidad operativa', baseRole: UserRole.UNIT_MANAGER, permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.UNIT_MANAGER], isSystem: true, color: '#f59e0b', createdAt: '2025-08-01', updatedAt: '2025-08-01' },
      { id: 'role_cashier', schoolId, name: 'Cajero', description: 'Acceso al POS y anulación de ventas', baseRole: UserRole.CASHIER, permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.CASHIER], isSystem: true, color: '#ef4444', createdAt: '2025-08-01', updatedAt: '2025-08-01' },
      { id: 'role_staff', schoolId, name: 'Staff Cafetería', description: 'Acceso básico al POS e inventario', baseRole: UserRole.CAFETERIA_STAFF, permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.CAFETERIA_STAFF], isSystem: true, color: '#ec4899', createdAt: '2025-08-01', updatedAt: '2025-08-01' },
    ];
    save([...roles, ...systemRoles]);
  },

  /** Get all custom roles for a school */
  getRoles(schoolId: string): CustomRole[] {
    this.ensureDefaults(schoolId);
    return load().filter(r => r.schoolId === schoolId);
  },

  /** Get a specific role by ID */
  getRole(roleId: string): CustomRole | undefined {
    return load().find(r => r.id === roleId);
  },

  /** Create a new custom role */
  createRole(role: CustomRole): CustomRole {
    const roles = load();
    roles.push(role);
    save(roles);
    return role;
  },

  /** Update an existing role */
  updateRole(role: CustomRole): CustomRole {
    const roles = load();
    const idx = roles.findIndex(r => r.id === role.id);
    if (idx >= 0) { roles[idx] = { ...role, updatedAt: new Date().toISOString().slice(0, 10) }; save(roles); }
    return role;
  },

  /** Delete a role (only non-system) */
  deleteRole(roleId: string): boolean {
    const roles = load();
    const role = roles.find(r => r.id === roleId);
    if (!role || role.isSystem) return false;
    save(roles.filter(r => r.id !== roleId));
    return true;
  },

  /** Resolve effective permissions for a user */
  resolvePermissions(user: AuthUser): AppPermission[] {
    // If user has explicit permissions override, use those
    if (user.permissions && user.permissions.length > 0) return user.permissions;

    // If user has custom role, load that role's permissions
    if (user.customRoleId) {
      const role = this.getRole(user.customRoleId);
      if (role) return role.permissions;
    }

    // Fall back to built-in role defaults
    return DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  },

  /** Check if a user has a specific permission */
  hasPermission(user: AuthUser, permission: AppPermission): boolean {
    return this.resolvePermissions(user).includes(permission);
  },

  /** Check if a user has ALL of the given permissions */
  hasAllPermissions(user: AuthUser, permissions: AppPermission[]): boolean {
    const resolved = this.resolvePermissions(user);
    return permissions.every(p => resolved.includes(p));
  },

  /** Check if a user has ANY of the given permissions */
  hasAnyPermission(user: AuthUser, permissions: AppPermission[]): boolean {
    const resolved = this.resolvePermissions(user);
    return permissions.some(p => resolved.includes(p));
  },

  /** Get stats for roles dashboard */
  getStats(schoolId: string) {
    const roles = this.getRoles(schoolId);
    return {
      totalRoles: roles.length,
      systemRoles: roles.filter(r => r.isSystem).length,
      customRoles: roles.filter(r => !r.isSystem).length,
    };
  },
};

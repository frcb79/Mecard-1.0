import { beforeEach, describe, expect, it } from "vitest";
import { RoleService } from "../RoleService";
import {
  AppPermission,
  DEFAULT_ROLE_PERMISSIONS,
  UserRole,
  type AuthUser,
  type CustomRole,
} from "../../types";

const SCHOOL_ID = "school_test_001";

const makeUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: "user_001",
  email: "test@school.edu",
  fullName: "Test User",
  role: UserRole.CASHIER,
  schoolId: SCHOOL_ID,
  ...overrides,
});

const makeCustomRole = (overrides: Partial<CustomRole> = {}): CustomRole => ({
  id: `role_custom_${Date.now()}`,
  schoolId: SCHOOL_ID,
  name: "Coordinador",
  description: "Coordinador de turno",
  baseRole: UserRole.CASHIER,
  permissions: [AppPermission.DASHBOARD_VIEW, AppPermission.POS_ACCESS],
  isSystem: false,
  color: "#abc123",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  ...overrides,
});

describe("RoleService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ====================================================================
  // resolvePermissions
  // ====================================================================
  describe("resolvePermissions()", () => {
    it("returns explicit permissions when provided on the user object", () => {
      const user = makeUser({
        permissions: [AppPermission.POS_ACCESS, AppPermission.INVENTORY_VIEW],
      });
      expect(RoleService.resolvePermissions(user)).toEqual([
        AppPermission.POS_ACCESS,
        AppPermission.INVENTORY_VIEW,
      ]);
    });

    it("prefers explicit permissions over customRole permissions", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      const user = makeUser({
        customRoleId: "role_cashier",
        permissions: [AppPermission.REPORTS_VIEW],
      });
      // Explicit permissions win
      expect(RoleService.resolvePermissions(user)).toEqual([
        AppPermission.REPORTS_VIEW,
      ]);
    });

    it("returns custom role permissions when customRoleId is set and no explicit permissions", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      // role_cashier has [POS_ACCESS, POS_VOID_TRANSACTION]
      const user = makeUser({ customRoleId: "role_cashier" });
      const perms = RoleService.resolvePermissions(user);
      expect(perms).toContain(AppPermission.POS_ACCESS);
    });

    it("falls back to DEFAULT_ROLE_PERMISSIONS when no custom role or explicit permissions", () => {
      const user = makeUser({ role: UserRole.SCHOOL_ADMIN });
      const perms = RoleService.resolvePermissions(user);
      expect(perms).toEqual(DEFAULT_ROLE_PERMISSIONS[UserRole.SCHOOL_ADMIN]);
    });

    it("returns empty array fallback for roles with very limited permissions", () => {
      const user = makeUser({ role: UserRole.STUDENT });
      const perms = RoleService.resolvePermissions(user);
      expect(perms).toEqual(DEFAULT_ROLE_PERMISSIONS[UserRole.STUDENT]);
    });
  });

  // ====================================================================
  // hasPermission
  // ====================================================================
  describe("hasPermission()", () => {
    it("returns true when the user has the requested permission", () => {
      const user = makeUser({ permissions: [AppPermission.POS_ACCESS] });
      expect(RoleService.hasPermission(user, AppPermission.POS_ACCESS)).toBe(
        true
      );
    });

    it("returns false when the user does not have the requested permission", () => {
      const user = makeUser({ permissions: [AppPermission.INVENTORY_VIEW] });
      expect(RoleService.hasPermission(user, AppPermission.POS_ACCESS)).toBe(
        false
      );
    });

    it("returns false when the user has no permissions at all", () => {
      const user = makeUser({ role: UserRole.STUDENT, permissions: [] });
      expect(RoleService.hasPermission(user, AppPermission.POS_ACCESS)).toBe(
        false
      );
    });
  });

  // ====================================================================
  // hasAllPermissions
  // ====================================================================
  describe("hasAllPermissions()", () => {
    it("returns true when user has every required permission", () => {
      const user = makeUser({
        permissions: [
          AppPermission.POS_ACCESS,
          AppPermission.INVENTORY_VIEW,
          AppPermission.REPORTS_VIEW,
        ],
      });
      expect(
        RoleService.hasAllPermissions(user, [
          AppPermission.POS_ACCESS,
          AppPermission.INVENTORY_VIEW,
        ])
      ).toBe(true);
    });

    it("returns false when user is missing at least one required permission", () => {
      const user = makeUser({ permissions: [AppPermission.POS_ACCESS] });
      expect(
        RoleService.hasAllPermissions(user, [
          AppPermission.POS_ACCESS,
          AppPermission.ROLES_MANAGE,
        ])
      ).toBe(false);
    });

    it("returns true for an empty requirements list", () => {
      const user = makeUser({ permissions: [] });
      expect(RoleService.hasAllPermissions(user, [])).toBe(true);
    });
  });

  // ====================================================================
  // hasAnyPermission
  // ====================================================================
  describe("hasAnyPermission()", () => {
    it("returns true when user has at least one of the listed permissions", () => {
      const user = makeUser({ permissions: [AppPermission.POS_ACCESS] });
      expect(
        RoleService.hasAnyPermission(user, [
          AppPermission.ROLES_MANAGE,
          AppPermission.POS_ACCESS,
        ])
      ).toBe(true);
    });

    it("returns false when user has none of the listed permissions", () => {
      const user = makeUser({ permissions: [AppPermission.INVENTORY_VIEW] });
      expect(
        RoleService.hasAnyPermission(user, [
          AppPermission.ROLES_MANAGE,
          AppPermission.POS_ACCESS,
        ])
      ).toBe(false);
    });
  });

  // ====================================================================
  // ensureDefaults
  // ====================================================================
  describe("ensureDefaults()", () => {
    it("creates system roles for the school on first call", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      const roles = RoleService.getRoles(SCHOOL_ID);
      expect(roles.some((r) => r.isSystem)).toBe(true);
    });

    it("creates exactly 5 system roles", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      const systemRoles = RoleService.getRoles(SCHOOL_ID).filter(
        (r) => r.isSystem
      );
      expect(systemRoles).toHaveLength(5);
    });

    it("does not duplicate system roles on repeated calls", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      RoleService.ensureDefaults(SCHOOL_ID);
      RoleService.ensureDefaults(SCHOOL_ID);
      const systemRoles = RoleService.getRoles(SCHOOL_ID).filter(
        (r) => r.isSystem
      );
      expect(systemRoles).toHaveLength(5);
    });

    it("isolates roles per school — another school starts with its own defaults", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      RoleService.ensureDefaults("school_other_999");
      const roles1 = RoleService.getRoles(SCHOOL_ID).filter((r) => r.isSystem);
      const roles2 = RoleService.getRoles("school_other_999").filter(
        (r) => r.isSystem
      );
      expect(roles1).toHaveLength(5);
      expect(roles2).toHaveLength(5);
    });
  });

  // ====================================================================
  // createRole / getRole / updateRole / deleteRole
  // ====================================================================
  describe("CRUD operations", () => {
    it("creates a custom role and retrieves it by ID", () => {
      const role = makeCustomRole({ id: "role_crud_1" });
      RoleService.createRole(role);
      expect(RoleService.getRole("role_crud_1")).toBeDefined();
      expect(RoleService.getRole("role_crud_1")?.name).toBe(role.name);
    });

    it("returns undefined for a non-existent role ID", () => {
      expect(RoleService.getRole("role_does_not_exist")).toBeUndefined();
    });

    it("updates the name of an existing custom role", () => {
      const role = makeCustomRole({ id: "role_crud_update" });
      RoleService.createRole(role);
      RoleService.updateRole({ ...role, name: "Coordinador Actualizado" });
      expect(RoleService.getRole("role_crud_update")?.name).toBe(
        "Coordinador Actualizado"
      );
    });

    it("updates the updatedAt timestamp when a role is modified", () => {
      const role = makeCustomRole({
        id: "role_crud_timestamp",
        updatedAt: "2026-01-01",
      });
      RoleService.createRole(role);
      RoleService.updateRole({ ...role, name: "New" });
      const updated = RoleService.getRole("role_crud_timestamp");
      expect(updated?.updatedAt).not.toBe("2026-01-01");
    });

    it("deletes a custom (non-system) role successfully", () => {
      const role = makeCustomRole({ id: "role_crud_delete" });
      RoleService.createRole(role);
      const result = RoleService.deleteRole("role_crud_delete");
      expect(result).toBe(true);
      expect(RoleService.getRole("role_crud_delete")).toBeUndefined();
    });

    it("prevents deletion of system roles", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      const canDelete = RoleService.deleteRole("role_cashier");
      expect(canDelete).toBe(false);
      // System role must still exist
      expect(RoleService.getRole("role_cashier")).toBeDefined();
    });

    it("returns false when trying to delete a non-existent role ID", () => {
      expect(RoleService.deleteRole("role_ghost")).toBe(false);
    });
  });

  // ====================================================================
  // getStats
  // ====================================================================
  describe("getStats()", () => {
    it("reports 5 system roles and 0 custom roles after ensureDefaults", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      const stats = RoleService.getStats(SCHOOL_ID);
      expect(stats.totalRoles).toBe(5);
      expect(stats.systemRoles).toBe(5);
      expect(stats.customRoles).toBe(0);
    });

    it("increments customRoles count when a custom role is created", () => {
      RoleService.ensureDefaults(SCHOOL_ID);
      RoleService.createRole(makeCustomRole({ id: "role_extra_1" }));
      RoleService.createRole(makeCustomRole({ id: "role_extra_2" }));
      const stats = RoleService.getStats(SCHOOL_ID);
      expect(stats.customRoles).toBe(2);
      expect(stats.totalRoles).toBe(7);
    });
  });
});

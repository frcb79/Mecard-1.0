import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppPermission, AuthUser, UserRole } from '../types';

interface MockAuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const mockAuthState: MockAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const hasAllPermissionsMock = vi.fn<[AuthUser, AppPermission[]], boolean>(
  () => true
);

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('../services/RoleService', () => ({
  RoleService: {
    hasAllPermissions: (user: AuthUser, permissions: AppPermission[]) =>
      hasAllPermissionsMock(user, permissions),
  },
}));

function buildUser(role: UserRole): AuthUser {
  return {
    id: 'user-1',
    email: 'test@mecard.mx',
    fullName: 'Test User',
    role,
    schoolId: 'school-001',
  };
}

function renderRoute(options?: {
  allowedRoles?: UserRole[];
  requiredPermissions?: AppPermission[];
  requireAuth?: boolean;
  initialPath?: string;
}) {
  return render(
    <MemoryRouter initialEntries={[options?.initialPath ?? '/private']}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute
              allowedRoles={options?.allowedRoles}
              requiredPermissions={options?.requiredPermissions}
              requireAuth={options?.requireAuth}
            >
              <div>Private Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockAuthState.user = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    hasAllPermissionsMock.mockReturnValue(true);
  });

  it('shows loading spinner while auth is loading', () => {
    mockAuthState.isLoading = true;

    renderRoute();

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('redirects unauthenticated users to login', () => {
    renderRoute();

    expect(screen.getByText('Login Page')).toBeTruthy();
  });

  it('allows access when user has allowed role', () => {
    mockAuthState.user = buildUser(UserRole.SUPER_ADMIN);
    mockAuthState.isAuthenticated = true;

    renderRoute({ allowedRoles: [UserRole.SUPER_ADMIN] });

    expect(screen.getByText('Private Content')).toBeTruthy();
  });

  it('redirects when role is not allowed', () => {
    mockAuthState.user = buildUser(UserRole.SCHOOL_ADMIN);
    mockAuthState.isAuthenticated = true;

    renderRoute({ allowedRoles: [UserRole.SUPER_ADMIN] });

    expect(screen.getByText('Unauthorized Page')).toBeTruthy();
  });

  it('redirects when required permission check fails', () => {
    mockAuthState.user = buildUser(UserRole.SCHOOL_ADMIN);
    mockAuthState.isAuthenticated = true;
    hasAllPermissionsMock.mockReturnValue(false);

    renderRoute({ requiredPermissions: [AppPermission.REPORTS_VIEW] });

    expect(screen.getByText('Unauthorized Page')).toBeTruthy();
  });

  it('allows access when requireAuth is false', () => {
    renderRoute({ requireAuth: false });

    expect(screen.getByText('Private Content')).toBeTruthy();
  });
});

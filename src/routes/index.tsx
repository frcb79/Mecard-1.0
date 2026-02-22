/**
 * RUTAS UNIFICADAS MECARD
 * Sistema de routing centralizado por rol
 * Usa React Router v7 + ProtectedRoute + React.lazy code splitting
 * 
 * @version 2.0.0
 * @date 2026-02-18
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserRole } from '../types';

// ========== LAYOUTS (eager — always needed) ==========
import { Sidebar } from '../components/Sidebar';

// ========== AUTH PAGES (eager — first paint) ==========
import LoginView from '../components/LoginView';
import UnauthorizedView from '../../pages/Unauthorized';
import NotFoundPage from '../components/NotFoundPage';

// ========== LAZY IMPORTS (code-split per role) ==========

// Super Admin
const SuperAdminDashboard = React.lazy(() => import('../components/SuperAdminDashboard'));
const SchoolManagement = React.lazy(() => import('../components/SchoolManagement'));
const BusinessModelConfiguration = React.lazy(() => import('../components/BusinessModelConfiguration'));
const SettlementsView = React.lazy(() => import('../components/SettlementsView'));
const ReportsView = React.lazy(() => import('../components/ReportsView'));

// School Admin
const SchoolAdminContainer = React.lazy(() => import('../components/SchoolAdminContainer'));
const StudentManagementView = React.lazy(() => import('../components/StudentManagementView'));
const SmartStaffManager = React.lazy(() => import('../components/SmartStaffManager'));
const StudentImportWizard = React.lazy(() => import('../components/StudentImportWizard'));
const SchoolPermissionsView = React.lazy(() => import('../components/SchoolPermissionsView'));
const SchoolTripsView = React.lazy(() => import('../components/SchoolTripsView'));

// Unit Manager
const ConcessionaireDashboard = React.lazy(() => import('../components/ConcessionaireDashboard'));
const InventoryManagementView = React.lazy(() => import('../components/InventoryManagementView'));

// POS
const PosView = React.lazy(() => import('../components/PosView'));
const CashierView = React.lazy(() => import('../components/CashierView'));

// Parent
const ParentPortalContainer = React.lazy(() => import('../components/ParentPortalContainer'));
const ParentWalletView = React.lazy(() => import('../components/ParentWalletView'));
const ParentLimitsView = React.lazy(() => import('../components/ParentLimitsView'));
const ParentReportsView = React.lazy(() => import('../components/ParentReportsView'));
const ParentNotificationsView = React.lazy(() => import('../components/ParentNotificationsView'));
const ParentPermissionsView = React.lazy(() => import('../components/ParentPermissionsView'));
const ParentGiftsView = React.lazy(() => import('../components/ParentGiftsView'));
const ParentRewardsView = React.lazy(() => import('../components/ParentRewardsView'));
const ParentTripsView = React.lazy(() => import('../components/ParentTripsView'));
const ParentSettingsView = React.lazy(() => import('../components/ParentSettingsView'));

// Student
const StudentDashboard = React.lazy(() => import('../components/StudentDashboard'));
const TransactionHistory = React.lazy(() => import('../components/TransactionHistory'));
const StudentCredentialView = React.lazy(() => import('../components/StudentCredentialView'));
const StudentMenuView = React.lazy(() => import('../components/StudentMenuView'));
const StudentGiftsView = React.lazy(() => import('../components/StudentGiftsView'));
const StudentRewardsView = React.lazy(() => import('../components/StudentRewardsView'));
const StudentNotificationsView = React.lazy(() => import('../components/StudentNotificationsView'));
const StudentReportsView = React.lazy(() => import('../components/StudentReportsView'));
const StudentTripsView = React.lazy(() => import('../components/StudentTripsView'));
const StudentPermissionsView = React.lazy(() => import('../components/StudentPermissionsView'));
const StudentSettingsView = React.lazy(() => import('../components/StudentSettingsView'));
const DashboardPlaceholder = React.lazy(() => import('../components/DashboardPlaceholder'));

// ========== SUSPENSE FALLBACK ==========
function RouteLoader() {
  return (
    <div className="flex-1 flex items-center justify-center h-screen bg-surface-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs font-medium text-surface-400">Cargando módulo...</p>
      </div>
    </div>
  );
}

// ========== PROTECTED LAYOUT ==========
import { ErrorBoundary } from '../components/ErrorBoundary';

/**
 * Layout principal que incluye Sidebar
 * El Sidebar se adapta según el rol del usuario
 */
function RoleBasedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}

// ========== ROUTER STRUCTURE ==========
export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
    <Routes>
      {/* ====== LOGIN / SIN AUTENTICACIÓN ====== */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/unauthorized" element={<UnauthorizedView />} />

      {/* ====== SUPER ADMIN ROUTES ====== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <SuperAdminDashboard />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schools"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <SchoolManagement />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settlement"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <SettlementsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <ReportsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/config"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <BusinessModelConfiguration onSave={() => {}} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />

      {/* ====== SCHOOL ADMIN ROUTES ====== */}
      <Route
        path="/school"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <SchoolAdminContainer />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/students"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <StudentManagementView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/staff"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <RoleBasedLayout>
              <SmartStaffManager />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/import"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <StudentImportWizard />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/config"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <RoleBasedLayout>
              <BusinessModelConfiguration onSave={() => {}} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/permissions"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <SchoolPermissionsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/trips"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <SchoolTripsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />

      {/* ====== UNIT MANAGER ROUTES ====== */}
      <Route
        path="/unit"
        element={
          <ProtectedRoute allowedRoles={[UserRole.UNIT_MANAGER]}>
            <RoleBasedLayout>
              <ConcessionaireDashboard />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/unit/inventory"
        element={
          <ProtectedRoute allowedRoles={[UserRole.UNIT_MANAGER]}>
            <RoleBasedLayout>
              <InventoryManagementView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/unit/staff"
        element={
          <ProtectedRoute allowedRoles={[UserRole.UNIT_MANAGER]}>
            <RoleBasedLayout>
              <SmartStaffManager />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />

      {/* ====== POS OPERATOR ROUTES ====== */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={[UserRole.POS_OPERATOR, UserRole.CAFETERIA_STAFF, UserRole.STATIONERY_STAFF, UserRole.CASHIER]}>
            <RoleBasedLayout>
              <PosView mode="cafeteria" />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos/stationery"
        element={
          <ProtectedRoute allowedRoles={[UserRole.POS_OPERATOR, UserRole.STATIONERY_STAFF]}>
            <RoleBasedLayout>
              <PosView mode="stationery" />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CASHIER, UserRole.UNIT_MANAGER]}>
            <RoleBasedLayout>
              <CashierView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />

      {/* ====== PARENT ROUTES ====== */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentPortalContainer />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/wallet"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentWalletView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/limits"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentLimitsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/reports"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentReportsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/notifications"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentNotificationsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/permissions"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentPermissionsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/gifts"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentGiftsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/rewards"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentRewardsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/trips"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentTripsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/settings"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentSettingsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />

      {/* ====== STUDENT ROUTES ====== */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentDashboard />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/history"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <TransactionHistory />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentCredentialView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/menu"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentMenuView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/gifts"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentGiftsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/rewards"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentRewardsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentNotificationsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/reports"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentReportsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/trips"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentTripsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/permissions"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentPermissionsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentSettingsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />

      {/* ====== FALLBACKS ====== */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
}

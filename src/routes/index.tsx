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

function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  retries: number = 1
) {
  return React.lazy(async () => {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= retries) {
      try {
        return await importer();
      } catch (error) {
        lastError = error;
        attempt += 1;

        if (attempt > retries) {
          throw error;
        }

        // Retry once for transient dev-server/cache module fetch failures.
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    throw lastError;
  });
}

// Super Admin
const SuperAdminDashboard = lazyWithRetry(() => import('../components/SuperAdminDashboard'));
const SchoolManagement = lazyWithRetry(() => import('../components/SchoolManagement'));
const BusinessModelConfiguration = lazyWithRetry(() => import('../components/BusinessModelConfiguration'));
const SettlementsView = lazyWithRetry(() => import('../components/SettlementsView'));
const ReportsView = lazyWithRetry(() => import('../components/ReportsView'));
const BillingConfigView = lazyWithRetry(() => import('../components/SuperAdmin/BillingConfigView'));
const BillingOperationsPanel = lazyWithRetry(() => import('../components/SuperAdmin/BillingOperationsPanel'));
const MecardAnalyticsDashboard = lazyWithRetry(() => import('../components/SuperAdmin/MecardAnalyticsDashboard'));
const SchoolBlockingManagement = lazyWithRetry(() => import('../components/SuperAdmin/SchoolBlockingManagement'));
const SchoolOnboardingDashboard = lazyWithRetry(() => import('../components/SchoolOnboardingDashboard'));
const AdminRewardsConfig = lazyWithRetry(() => import('../components/AdminRewardsConfig'));
const SupportSystem = lazyWithRetry(() => import('../components/SupportSystem'));
const CommercialSimulator = lazyWithRetry(() => import('../components/SuperAdmin/CommercialSimulator'));
const CollectionsMonitor = lazyWithRetry(() => import('../components/SuperAdmin/CollectionsMonitor'));
const RefundPolicyAdminPage = lazyWithRetry(() => import('../components/refunds/RefundPolicyAdminPage'));

// School Admin
const SchoolCollectionsDashboard = lazyWithRetry(() => import('../components/SchoolCollectionsDashboard'));
const SchoolAdminContainer = lazyWithRetry(() => import('../components/SchoolAdminContainer'));
const StudentManagementView = lazyWithRetry(() => import('../components/StudentManagementView'));
const SmartStaffManager = lazyWithRetry(() => import('../components/SmartStaffManager'));
const StudentImportWizard = lazyWithRetry(() => import('../components/StudentImportWizard'));
const SchoolPermissionsView = lazyWithRetry(() => import('../components/SchoolPermissionsView'));
const SchoolTripsView = lazyWithRetry(() => import('../components/SchoolTripsView'));
const SchoolInvoiceDashboard = lazyWithRetry(() => import('../components/SchoolInvoiceDashboard'));
const SchoolFeesManager = lazyWithRetry(() => import('../components/SchoolFeesManager'));
const SchoolAnnouncementsView = lazyWithRetry(() => import('../components/SchoolAnnouncementsView'));
const SchoolReportsView = lazyWithRetry(() => import('../components/SchoolReportsView'));
const SchoolAccessDashboard = lazyWithRetry(() => import('../components/SchoolAccessDashboard'));
const CustomRolesManager = lazyWithRetry(() => import('../components/CustomRolesManager'));
const SchoolRefundSettingsPage = lazyWithRetry(() => import('../components/refunds/SchoolRefundSettingsPage'));

// Unit Manager
const ConcessionaireDashboard = lazyWithRetry(() => import('../components/ConcessionaireDashboard'));
const InventoryManagementView = lazyWithRetry(() => import('../components/InventoryManagementView'));
const CafeteriaDemandForecast = lazyWithRetry(() => import('../components/CafeteriaDemandForecast'));

// POS
const PosView = lazyWithRetry(() => import('../components/PosView'));
const CashierView = lazyWithRetry(() => import('../components/CashierView'));

// Parent
const ParentPortalContainer = lazyWithRetry(() => import('../components/ParentPortalContainer'));
const ParentWalletView = lazyWithRetry(() => import('../components/ParentWalletView'));
const ParentLimitsView = lazyWithRetry(() => import('../components/ParentLimitsView'));
const ParentReportsView = lazyWithRetry(() => import('../components/ParentReportsView'));
const ParentNotificationsView = lazyWithRetry(() => import('../components/ParentNotificationsView'));
const ParentPermissionsView = lazyWithRetry(() => import('../components/ParentPermissionsView'));
const ParentGiftsView = lazyWithRetry(() => import('../components/ParentGiftsView'));
const ParentRewardsView = lazyWithRetry(() => import('../components/ParentRewardsView'));
const ParentTripsView = lazyWithRetry(() => import('../components/ParentTripsView'));
const ParentSettingsView = lazyWithRetry(() => import('../components/ParentSettingsView'));
const ParentFeesView = lazyWithRetry(() => import('../components/ParentFeesView'));

// Student
const StudentDashboard = lazyWithRetry(() => import('../components/StudentDashboard'));
const TransactionHistory = lazyWithRetry(() => import('../components/TransactionHistory'));
const StudentCredentialView = lazyWithRetry(() => import('../components/StudentCredentialView'));
const StudentMenuView = lazyWithRetry(() => import('../components/StudentMenuView'));
const StudentGiftsView = lazyWithRetry(() => import('../components/StudentGiftsView'));
const BirthdayGifts = lazyWithRetry(() => import('../components/BirthdayGifts'));
const StudentRewardsView = lazyWithRetry(() => import('../components/StudentRewardsView'));
const StudentNotificationsView = lazyWithRetry(() => import('../components/StudentNotificationsView'));
const StudentReportsView = lazyWithRetry(() => import('../components/StudentReportsView'));
const StudentTripsView = lazyWithRetry(() => import('../components/StudentTripsView'));
const StudentPermissionsView = lazyWithRetry(() => import('../components/StudentPermissionsView'));
const StudentSettingsView = lazyWithRetry(() => import('../components/StudentSettingsView'));
const StudentPreOrderView = lazyWithRetry(() => import('../components/StudentPreOrderView'));
const PreOrderQueueView = lazyWithRetry(() => import('../components/PreOrderQueueView'));
const DashboardPlaceholder = lazyWithRetry(() => import('../components/DashboardPlaceholder'));

// Phase 2 integrations
const StudentFavoritesView = lazyWithRetry(() => import('../_phase2/StudentFavorites'));
const SchoolsDirectory = lazyWithRetry(() => import('../_phase2/Schools'));
const RewardsMarketplacePage = lazyWithRetry(() => import('../components/RewardsMarketplacePage'));
const StudentRewardsDashboardPage = lazyWithRetry(() => import('../components/StudentRewardsDashboardPage'));
const GiftSenderPage = lazyWithRetry(() => import('../_phase2/GiftSender').then(m => ({ default: m.GiftSender })));
const GiftInboxPage = lazyWithRetry(() => import('../_phase2/GiftInbox').then(m => ({ default: m.GiftInbox })));

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

      {/* ====== SUPER ADMIN — BILLING ====== */}
      <Route
        path="/admin/billing/config"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <BillingConfigView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing/operations"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <BillingOperationsPanel />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing/analytics"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <MecardAnalyticsDashboard />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing/blocking"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <SchoolBlockingManagement />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/onboarding"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <SchoolOnboardingDashboard />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schools-directory"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <SchoolsDirectory />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rewards-config"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <AdminRewardsConfig />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/refunds"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <RefundPolicyAdminPage />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/support"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <SupportSystem />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sales/simulator"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <CommercialSimulator />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing/collections"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <RoleBasedLayout>
              <CollectionsMonitor />
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
        path="/school/roles"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <RoleBasedLayout>
              <CustomRolesManager />
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
      <Route
        path="/school/refunds"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <SchoolRefundSettingsPage />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/invoices"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <SchoolInvoiceDashboard />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/fees"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <SchoolFeesManager />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/announcements"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <RoleBasedLayout>
              <SchoolAnnouncementsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/reports"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <SchoolReportsView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/access"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <RoleBasedLayout>
              <SchoolAccessDashboard />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/collections"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <SchoolCollectionsDashboard />
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
      <Route
        path="/unit/demand"
        element={
          <ProtectedRoute allowedRoles={[UserRole.UNIT_MANAGER]}>
            <RoleBasedLayout>
              <CafeteriaDemandForecast />
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
        path="/pos/preorders"
        element={
          <ProtectedRoute allowedRoles={[UserRole.POS_OPERATOR, UserRole.CAFETERIA_STAFF, UserRole.UNIT_MANAGER]}>
            <RoleBasedLayout>
              <PreOrderQueueView />
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
        path="/parent/fees"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <ParentFeesView />
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
      <Route
        path="/parent/birthday"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
            <RoleBasedLayout>
              <BirthdayGifts />
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
        path="/student/birthday"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <BirthdayGifts />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/favorites"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentFavoritesView />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/marketplace"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <RewardsMarketplacePage />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/rewards-dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentRewardsDashboardPage />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/send-gift"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <GiftSenderPage />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/inbox"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <GiftInboxPage />
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
        path="/student/preorder"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <StudentPreOrderView />
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

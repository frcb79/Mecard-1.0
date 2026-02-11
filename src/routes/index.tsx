/**
 * RUTAS UNIFICADAS MECARD
 * Sistema de routing centralizado por rol
 * Usa React Router v7 + ProtectedRoute
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserRole } from '../types';

// ========== LAYOUTS ==========
import { Sidebar } from '../components/Sidebar';

// ========== AUTH PAGES ==========
import LoginView from '../components/LoginView';
import UnauthorizedView from '../../pages/Unauthorized';

// ========== PLACEHOLDER DASHBOARD ==========
import { DashboardPlaceholder } from '../components/DashboardPlaceholder';

// ========== POS VIEWS ==========
import PosView from '../components/PosView';

// ========== SETTLEMENT VIEWS ==========
import SettlementsView from '../components/SettlementsView';

// ========== SUPER ADMIN VIEWS (DISABLED TEMPORARILY) ==========
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import SchoolManagement from '../components/SchoolManagement';
import BusinessModelConfiguration from '../components/BusinessModelConfiguration';

// ========== SCHOOL ADMIN VIEWS (DISABLED TEMPORARILY) ==========
// import SchoolAdminView from '../components/SchoolAdminView';
// import SchoolAdminStudentsView from '../components/SchoolAdminStudentsView';
// import SchoolOnboardingDashboard from '../components/SchoolOnboardingDashboard';
// import SmartStaffManager from '../components/SmartStaffManager';
// import StudentImportWizard from '../components/StudentImportWizard';

// ========== UNIT MANAGER VIEWS (DISABLED TEMPORARILY) ==========
// import ConcessionaireDashboard from '../components/ConcessionaireDashboard';
// import InventoryManagementView from '../components/InventoryManagementView';

// ========== POS VIEWS (DISABLED TEMPORARILY) ==========
// import PosView from '../components/PosView';
// import CashierView from '../components/CashierView';

// ========== PARENT VIEWS (DISABLED TEMPORARILY) ==========
// import ParentPortal from '../components/ParentPortal';
import ParentWalletView from '../components/ParentWalletView';

// ========== STUDENT VIEWS ==========
import StudentDashboard from '../components/StudentDashboard';
import TransactionHistory from '../components/TransactionHistory';
import StudentCredentialView from '../components/StudentCredentialView';
import StudentMenuView from '../components/StudentMenuView';
// import MeCardSocial from '../components/MeCardSocial'; // Requiere props complejas aún

// ========== PROTECTED LAYOUT ==========
/**
 * Layout principal que incluye Sidebar
 * El Sidebar se adapta según el rol del usuario
 */
function RoleBasedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// ========== ROUTER STRUCTURE ==========
export default function AppRoutes() {
  return (
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
              <DashboardPlaceholder title="Dashboard Escolar" role={UserRole.SCHOOL_ADMIN} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/students"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <DashboardPlaceholder title="Gestión de Estudiantes" role={UserRole.SCHOOL_ADMIN} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/staff"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <RoleBasedLayout>
              <DashboardPlaceholder title="Gestión de Personal" role={UserRole.SCHOOL_ADMIN} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/import"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_FINANCE]}>
            <RoleBasedLayout>
              <DashboardPlaceholder title="Importar Estudiantes" role={UserRole.SCHOOL_ADMIN} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/onboarding"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <RoleBasedLayout>
              <DashboardPlaceholder title="Onboarding de Escuela" role={UserRole.SCHOOL_ADMIN} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/config"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <RoleBasedLayout>
              <DashboardPlaceholder title="Configuración Escolar" role={UserRole.SCHOOL_ADMIN} />
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
              <DashboardPlaceholder title="Dashboard de Unidad" role={UserRole.UNIT_MANAGER} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/unit/inventory"
        element={
          <ProtectedRoute allowedRoles={[UserRole.UNIT_MANAGER]}>
            <RoleBasedLayout>
              <DashboardPlaceholder title="Gestión de Inventario" role={UserRole.UNIT_MANAGER} />
            </RoleBasedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/unit/staff"
        element={
          <ProtectedRoute allowedRoles={[UserRole.UNIT_MANAGER]}>
            <RoleBasedLayout>
              <DashboardPlaceholder title="Gestión de Personal de Unidad" role={UserRole.UNIT_MANAGER} />
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
              <DashboardPlaceholder title="Sistema de Caja" role={UserRole.CASHIER} />
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
              <ParentWalletView />
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
        path="/student/social"
        element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <RoleBasedLayout>
              <DashboardPlaceholder title="MeCard Social" role={UserRole.STUDENT} />
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

      {/* ====== FALLBACKS ====== */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

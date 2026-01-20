// ============================================
// ARCHIVO 5: App.tsx (Ejemplo de integración)
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';

import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import POSDashboard from './pages/POSDashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Parent */}
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* POS */}
          <Route
            path="/pos/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.POS_OPERATOR, UserRole.CAFETERIA_STAFF]}>
                <POSDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/student" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

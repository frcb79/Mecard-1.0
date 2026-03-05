# Plan: Revamped Frontend con Routing Unificado y Pantallas por Rol

**TL;DR:** El frontend tiene dos sistemas de navegación conflictivos (React Router + AppView enum). Solución: **unificar en React Router puro**, eliminar redundancias, crear flujo Login → Dashboard correcto para cada rol, y hacer que cada usuario vea exactamente sus pantallas. Esto deja el frontend listo para conectar backend después.

**Duración estimada:** 2-3 semanas (frontend 100% sin backend, luego conexiones).

---

## 🔴 LO QUE DEBE ARREGLARSE AHORA (Semana 1)

### **1. Consolidar Routing: SUPER CRÍTICO**

**Problema:** App.tsx usa React Router básico. Sidebar usa AppView enum. AuthContext existe pero desconectado.

**Solución:** Crear nuevo [src/routes/index.tsx](src/routes/index.tsx) que gestione:
- Rutas protegidas por rol
- Redirección automática post-login
- Fallback a login si no autenticado

```typescript
// src/routes/index.tsx (NUEVO)
const roleRoutes = {
  SUPER_ADMIN: [
    { path: '/admin', component: SuperAdminDashboard },
    { path: '/admin/schools', component: SchoolManagement },
    { path: '/admin/settlement', component: SettlementsView }, // NUEVO
    { path: '/admin/reports', component: ReportsView }, // NUEVO
    { path: '/admin/config', component: BusinessModelConfiguration },
  ],
  SCHOOL_ADMIN: [
    { path: '/school', component: SchoolAdminView },
    { path: '/school/students', component: StudentManagementView }, // NUEVO
    { path: '/school/import', component: StudentImportWizard },
    { path: '/school/staff', component: SmartStaffManager },
  ],
  UNIT_MANAGER: [
    { path: '/unit', component: ConcessionaireDashboard },
    { path: '/unit/inventory', component: InventoryManagementView },
    { path: '/unit/staff', component: SmartStaffManager },
  ],
  POS_OPERATOR: [
    { path: '/pos', component: PosView },
    { path: '/cashier', component: CashierView },
  ],
  PARENT: [
    { path: '/parent', component: ParentPortal },
    { path: '/parent/wallet', component: ParentWalletView }, // NUEVO
  ],
  STUDENT: [
    { path: '/student', component: StudentDashboard },
    { path: '/student/id', component: StudentCredentialView }, // NUEVO
    { path: '/student/history', component: TransactionHistory },
    { path: '/student/menu', component: StudentMenuView }, // NUEVO
  ],
}
```

**Archivos a tocar:**
- [App.tsx](App.tsx) - reemplazar con role-based routing
- [src/index.tsx](src/index.tsx) - envolver con AuthProvider
- [src/main.tsx](src/main.tsx) - asegurar que providers están primero

### **2. Login → Dashboard Flujo Correcto**

**Problema:** [LoginView.tsx](src/components/LoginView.tsx) llama `onLogin()` pero nadie redirige después.

**Solución:**
- En `LoginView.tsx`: Cuando autenticación exitosa, llamar `navigate()` de react-router según rol
- Remover AppView.tsx completamente

```typescript
// En LoginView.tsx - cambiar onLogin callback
const handleLogin = async (role: UserRole) => {
  const user = await authService.login(email, password, role);
  // EN LUGAR DE: onLogin(role)
  // HACER:
  const dashboardPath = {
    SUPER_ADMIN: '/admin',
    SCHOOL_ADMIN: '/school',
    UNIT_MANAGER: '/unit',
    POS_OPERATOR: '/pos',
    PARENT: '/parent',
    STUDENT: '/student',
  }[role];
  navigate(dashboardPath);
};
```

**Archivos:**
- [src/components/LoginView.tsx](src/components/LoginView.tsx) - modificar callback y navigate

### **3. Eliminar Componentes Duplicados**

**Archivos a ELIMINAR completamente:**
- ❌ [src/components/AdminLayout.tsx](src/components/AdminLayout.tsx) - reemplazado por Sidebar
- ❌ [src/MeCardPlatform.tsx](src/MeCardPlatform.tsx) - alternativa desusada
- ❌ [pages/Pos.tsx](pages/Pos.tsx) - redundante a PosView
- ❌ Cualquier uso de `AppView` enum (cambiar a rutas React Router)

**Actualizar imports en toda la app:**
```bash
# Buscar y reemplazar
grep -r "AppView\." src/
grep -r "AdminLayout" src/
```

**Archivos:**
- Todos los que importen estos componentes obsoletos

### **4. Sidebar Conectado a React Router**

**Problema:** Sidebar espera `onNavigate` callback que no funciona con Router.

**Solución:** Usar `useNavigate()` y `useLocation()` en Sidebar

```typescript
// src/components/Sidebar.tsx - cambios
export const Sidebar = ({ userRole }: { userRole: UserRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  // Marcar item activo comparando: location.pathname === item.path
  return (
    <div className="sidebar">
      {/* Items específicos por rol */}
      {userRole === 'SUPER_ADMIN' && (
        <>
          <SidebarItem 
            label="Dashboard" 
            icon={<Dashboard/>}
            onClick={() => navigate('/admin')}
            isActive={location.pathname === '/admin'}
          />
          <SidebarItem 
            label="Escuelas" 
            icon={<Building/>}
            onClick={() => navigate('/admin/schools')}
            isActive={location.pathname.startsWith('/admin/schools')}
          />
          {/* ... etc */}
        </>
      )}
    </div>
  );
};
```

**Archivos:**
- [src/components/Sidebar.tsx](src/components/Sidebar.tsx) - modificar para usar React Router

### **5. ProtectedRoute Funcional**

**Problema:** Existe [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx) pero nunca se usa.

**Solución:** Usar ProtectedRoute en el router

```typescript
// En routes/index.tsx
<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute requiredRole={["SUPER_ADMIN"]}>
      <AdminLayout />
    </ProtectedRoute>
  } 
/>
```

**Archivos:**
- [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx) - verificar que funciona
- [App.tsx](App.tsx) - usarlo en rutas

---

## 📱 PANTALLAS A CREAR O COMPLETAR (Semana 2)

| Pantalla | Componente | Ruta | Estado | Qué Falta |
|----------|-----------|------|--------|-----------|
| **Student ID/Credential** | `StudentCredentialView.tsx` | `/student/id` | ❌ CREAR | QR, NFC, datos estudiante |
| **Parent Wallet** | `ParentWalletView.tsx` | `/parent/wallet` | ❌ CREAR | Depósito SPEI/Card, asignación a hijos |
| **Student Menu (Parent)** | `StudentMenuView.tsx` | `/student/menu` | ❌ CREAR | Menú disponible día, categorizado |
| **Reports** | `ReportsView.tsx` | `/admin/reports`, `/school/reports`, `/unit/reports` | ❌ CREAR | Reutilizable, filtros, export CSV |
| **Settlements** | `SettlementsView.tsx` | `/admin/settlement` | ❌ CREAR | Liquidaciones pendientes, historial, SPEI payments |
| **Student Management** | `StudentManagementView.tsx` | `/school/students` | 🟡 MEJORAR | Actualmente solo lista, agregar CRUD completo |

---

## 🎯 FLUJOS DE USUARIO FINALES

### **Flujo 1: Super Admin**
```
Login (MECARD2025) 
  → /admin (SuperAdminDashboard)
    ├─ Sidebar: Escuelas, Settlement, Reportes, Config
    ├─ /admin/schools (SchoolManagement)
    ├─ /admin/settlement (SettlementsView) NEW
    ├─ /admin/reports (ReportsView) NEW
    └─ /admin/config (BusinessModelConfiguration)
```

### **Flujo 2: Escuela Admin**
```
Login (rol: SCHOOL_ADMIN)
  → /school (SchoolAdminView - Dashboard con KPIs)
    ├─ Sidebar: Estudiantes, Personal, Importar, Config
    ├─ /school/students (StudentManagementView) NEW - CRUD estudiantes
    ├─ /school/staff (SmartStaffManager)
    ├─ /school/import (StudentImportWizard)
    └─ /school/config (BusinessModelConfiguration)
```

### **Flujo 3: Gerente Unidad (Concesionario)**
```
Login (rol: UNIT_MANAGER)
  → /unit (ConcessionaireDashboard - Ventas, comisiones)
    ├─ Sidebar: Inventario, Personal, Reportes
    ├─ /unit/inventory (InventoryManagementView - CRUD productos)
    ├─ /unit/staff (SmartStaffManager)
    └─ /unit/reports (ReportsView)
```

### **Flujo 4: Operador POS**
```
Login (rol: POS_OPERATOR)
  → /pos (PosView - Búsqueda estudiante, carrito, checkout)
    ├─ Link: Ir a Caja (/cashier)
    └─ /cashier (CashierView - Búsqueda, depósito dinero)
```

### **Flujo 5: Papá**
```
Login (rol: PARENT)
  → /parent (ParentPortal - Portfolio hijos, saldos)
    ├─ Sidebar: Billetera, Ajustes
    ├─ /parent/wallet (ParentWalletView) NEW - Depósitos, asignación
    ├─ /parent/settings (ParentSettings)
    └─ Ver menú hijo disponible → /student/menu (StudentMenuView) NEW
```

### **Flujo 6: Estudiante**
```
Login (rol: STUDENT)
  → /student (StudentDashboard - Saldo, compras, buscar productos)
    ├─ Sidebar: Mi Credencial, Historial, Perfil, Social
    ├─ /student/id (StudentCredentialView) NEW - QR, datos
    ├─ /student/history (TransactionHistory - Listado compras)
    ├─ /student/menu (StudentMenuView) NEW - Menú disponible
    └─ /student/social (MeCardSocial - Red social)
```

---

## 📝 DECISIONES ARQUITECTÓNICAS

- ✅ **React Router v7** como única forma de navegación (eliminar AppView enum)
- ✅ **Sidebar dinámica** según rol (se genera diferente para cada tipo de usuario)
- ✅ **ProtectedRoute** en cada ruta sensible (verificar authContext)
- ✅ **Rutas predecibles:** `/admin/*`, `/school/*`, `/unit/*`, `/pos/*`, `/parent/*`, `/student/*`
- ✅ **Sin dualismo:** Una sola forma de navegar, no AppView + Router simultáneamente
- ✅ **Componentes reutilizables:** `ReportsView` y `BusinessModelConfiguration` usan rutas diferentes pero lógica compartida

---

## ✅ VERIFICACIÓN AL TERMINAR SEMANA 1

```bash
# 1. App compila sin errores
npm run build  

# 2. No hay referencias a AppView enum
grep -r "AppView" src/ | wc -l  # Debe ser 0

# 3. Flujo login funciona para cada rol:
- Abrir app → Login
- Super Admin enters master key → debe ir a /admin
- Parent enters email/pass → debe ir a /parent
- Student enters email/pass → debe ir a /student

# 4. Sidebar navega correctamente:
- Click en items cambia URL
- URL está en location.pathname

# 5. ProtectedRoute funciona:
- Acceso a /admin/ si es SUPER_ADMIN ✅
- Acceso a /admin/ si es STUDENT → redirect /student ❌
```

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

**Paso 1:** Crear [src/routes/index.tsx](src/routes/index.tsx) 
- Mapeo completo de rutas por rol
- ProtectedRoute wrapper

**Paso 2:** Refactorizar [src/App.tsx](src/App.tsx)
- Reemplazar routing antiguo con el nuevo sistema
- Integrar AuthProvider + PlatformProvider

**Paso 3:** Actualizar [src/components/LoginView.tsx](src/components/LoginView.tsx)
- Conectar login con navegación post-auth
- Redirigir según rol a su dashboard

**Paso 4:** Modernizar [src/components/Sidebar.tsx](src/components/Sidebar.tsx)
- Conectar con React Router (useNavigate, useLocation)
- Items dinámicos por rol

**Paso 5:** Crear pantallas faltantes críticas:
- `StudentCredentialView.tsx` (QR/Credencial)
- `ParentWalletView.tsx` (Depósitos)
- `StudentManagementView.tsx` (CRUD estudiantes)
- `StudentMenuView.tsx` (Menú disponible)
- `SettlementsView.tsx` (Liquidaciones)
- `ReportsView.tsx` (Reportes reutilizable)

**Paso 6:** Limpiar redundancias
- Eliminar AdminLayout
- Eliminar MeCardPlatform duplicado
- Remover AppView enum

# 🛠️ GUÍA TÉCNICA: CÓMO FUNCIONA EL SISTEMA RBAC

**Para:** Desarrolladores que necesitan entender o mantener el sistema  
**Tiempo de lectura:** 10 minutos

---

## 🎯 VISIÓN GENERAL

El sistema RBAC (Role-Based Access Control) tiene 3 capas:

```
LAYER 1: Definición de Permisos
└─ lib/rolePermissions.ts
   ├─ VIEW_PERMISSIONS (mapping: view → roles)
   ├─ isAuthorized() función
   └─ canAccessView() función

LAYER 2: Validación en Rendering
├─ App.tsx renderCurrentView()
│  └─ if (!isAuthorized(...)) → UnauthorizedView
│
└─ components/Sidebar.tsx
   └─ if (userRole === ROLE) → muestra botones

LAYER 3: Componentes Destino
└─ StudentDashboard, ParentPortal, SchoolAdminView, etc.
```

---

## 📁 ARCHIVO 1: `lib/rolePermissions.ts`

### Propósito
**Punto único de verdad** para todos los permisos del sistema.

### Estructura

#### A) VIEW_PERMISSIONS (La matriz de permisos)

```typescript
export const VIEW_PERMISSIONS: Record<AppView, UserRole[]> = {
  // Formato: [Vista] → [Array de roles autorizados]
  
  [AppView.PARENT_DASHBOARD]: [UserRole.PARENT, UserRole.SUPER_ADMIN],
  //        ↑ Vista                    ↑ Solo estos roles pueden acceder
  
  [AppView.STUDENT_DASHBOARD]: [UserRole.STUDENT, UserRole.SUPER_ADMIN],
  
  [AppView.SCHOOL_ADMIN_DASHBOARD]: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN],
  // ...
};
```

**Nota importante:** SUPER_ADMIN está en CASI todas las vistas porque puede ver TODO.

#### B) Función `isAuthorized()` (Para App.tsx)

```typescript
export const isAuthorized = (
  view: AppView,      // ¿Qué vista quiere ver?
  role: UserRole | null // ¿Qué rol tiene?
): boolean => {
  if (!role) return false;  // Si no tiene rol, NO autorizado
  return VIEW_PERMISSIONS[view]?.includes(role) ?? false;
  //     ↑ Busca en la matriz    ↑ ¿Mi rol está aquí?
};
```

**Uso:**
```typescript
// En App.tsx
if (!isAuthorized(currentView, userRole)) {
  return <UnauthorizedView ... />;
}
```

#### C) Función `canAccessView()` (Para Sidebar.tsx)

```typescript
export const canAccessView = (
  view: AppView,  // ¿Qué botón es este?
  role: UserRole  // ¿Qué rol tiene el usuario?
): boolean => {
  return VIEW_PERMISSIONS[view]?.includes(role) ?? false;
};
```

**Uso:**
```typescript
// En Sidebar.tsx (para decidir si mostrar un botón)
{canAccessView(AppView.ANALYTICS_DASHBOARD, userRole) && (
  <button onClick={() => onNavigate(AppView.ANALYTICS_DASHBOARD)}>
    Analytics
  </button>
)}
```

#### D) Funciones auxiliares

```typescript
// Para verificaciones rápidas
isAdmin(role)      // ¿Es admin?
isStudent(role)    // ¿Es estudiante?
isParent(role)     // ¿Es padre?
isOperator(role)   // ¿Es operario (POS, Cashier, etc)?
```

---

## 📄 ARCHIVO 2: `App.tsx`

### Dónde está la validación

```typescript
// Línea ~155
const renderCurrentView = () => {
  // ✅ PRIMERA LÍNEA DE DEFENSA
  if (!isAuthorized(currentView, userRole)) {
    return <UnauthorizedView onLogout={handleLogout} />;
  }
  
  // Si llegó aquí, el usuario TIENE acceso
  switch(currentView) {
    case AppView.PARENT_DASHBOARD:
      return <ParentPortal ... />;
    case AppView.STUDENT_DASHBOARD:
      return <StudentDashboard ... />;
    // ... etc
  }
};
```

### Por qué aquí?

1. **Segunda línea de defensa** - Incluso si bypasean el Sidebar
2. **Protección contra trampas** - Alguien podría intentar navegar vía URL
3. **Centralizado** - Todos los cambios de vista pasan por aquí

### El componente UnauthorizedView

```typescript
const UnauthorizedView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 ...">
    <div className="bg-white rounded-3xl shadow-2xl p-12 ...">
      <div className="text-red-500 text-7xl mb-6 animate-bounce">🚫</div>
      <h2>Acceso Denegado</h2>
      <p>No tienes permisos para acceder a esta sección.</p>
      <button onClick={onLogout}>← Volver al Menú Principal</button>
    </div>
  </div>
);
```

---

## 📄 ARCHIVO 3: `components/Sidebar.tsx`

### Estructura condicional

```typescript
export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, userRole, onLogout }) => {
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

  return (
    <aside className="...">
      <nav className="...">
        {/* SUPER ADMIN - Ve TODO */}
        {isSuperAdmin && (
          <div>
            {/* 5 secciones con 16+ botones */}
          </div>
        )}

        {/* PARENT - Ve SOLO sus pantallas */}
        {!isSuperAdmin && userRole === UserRole.PARENT && (
          <>
            <button onClick={() => onNavigate(AppView.PARENT_DASHBOARD)}>
              Mi Familia
            </button>
            {/* ... más botones de padre */}
          </>
        )}

        {/* STUDENT - Ve SOLO sus pantallas */}
        {!isSuperAdmin && userRole === UserRole.STUDENT && (
          <>
            <button onClick={() => onNavigate(AppView.STUDENT_DASHBOARD)}>
              Inicio
            </button>
            {/* ... más botones de estudiante */}
          </>
        )}

        {/* SCHOOL_ADMIN - Ve SOLO sus pantallas */}
        {!isSuperAdmin && userRole === UserRole.SCHOOL_ADMIN && (
          <>
            <button onClick={() => onNavigate(AppView.SCHOOL_ADMIN_DASHBOARD)}>
              Campus Admin
            </button>
            {/* ... más botones */}
          </>
        )}

        {/* ... etc para otros roles */}
      </nav>
    </aside>
  );
};
```

### Lógica de decisión

```
Si usuario es SUPER_ADMIN
  → Mostrar 5 secciones (infraestructura, escuela, POS, portales, soporte)
Si NO es SUPER_ADMIN
  → Mostrar SOLO la sección correspondiente a su rol
    ├─ PARENT → sección "Portal Familiar"
    ├─ STUDENT → sección "Student Hub"
    ├─ SCHOOL_ADMIN → sección "Administración"
    ├─ UNIT_MANAGER → sección "Operación"
    ├─ CASHIER → sección "Caja"
    └─ POS_OPERATOR/CAFETERIA_STAFF/STATIONERY_STAFF → "Punto de Venta"
```

---

## 🔄 FLUJO DE UNA PETICIÓN

### Escenario: Usuario STUDENT intenta ver SCHOOL_ADMIN_DASHBOARD

```
1. Usuario clickea "Campus Admin" en Sidebar
2. onClick={() => onNavigate(AppView.SCHOOL_ADMIN_DASHBOARD)}
3. setCurrentView(AppView.SCHOOL_ADMIN_DASHBOARD)
4. Component re-render → App.tsx → renderCurrentView()
5. isAuthorized(AppView.SCHOOL_ADMIN_DASHBOARD, UserRole.STUDENT)
   ├─ Busca en VIEW_PERMISSIONS[SCHOOL_ADMIN_DASHBOARD]
   ├─ Encuentra: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN]
   ├─ Busca si UserRole.STUDENT está en ese array
   └─ NO está → return false
6. if (!isAuthorized(...)) → return <UnauthorizedView />
7. Usuario ve "Acceso Denegado 🚫"
```

### Escenario: Usuario SCHOOL_ADMIN intenta ver SCHOOL_ADMIN_DASHBOARD

```
1. Usuario clickea "Campus Admin"
2. onClick={() => onNavigate(AppView.SCHOOL_ADMIN_DASHBOARD)}
3. setCurrentView(AppView.SCHOOL_ADMIN_DASHBOARD)
4. Component re-render → renderCurrentView()
5. isAuthorized(AppView.SCHOOL_ADMIN_DASHBOARD, UserRole.SCHOOL_ADMIN)
   ├─ Busca en VIEW_PERMISSIONS[SCHOOL_ADMIN_DASHBOARD]
   ├─ Encuentra: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN]
   ├─ Busca si UserRole.SCHOOL_ADMIN está en ese array
   └─ SÍ está → return true
6. if (!isAuthorized(...)) { return ... } ← SALTA ESTE IF
7. switch(currentView) → case SCHOOL_ADMIN_DASHBOARD
8. return <SchoolAdminView ... />
9. Usuario ve el dashboard
```

---

## 🛠️ CÓMO AGREGAR UN NUEVO PERMISO

### Situación: Quieres que SCHOOL_FINANCE vea ANALYTICS_DASHBOARD

**Paso 1:** Edita `VIEW_PERMISSIONS` en `/lib/rolePermissions.ts`

```typescript
// ANTES
[AppView.ANALYTICS_DASHBOARD]: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN],

// DESPUÉS
[AppView.ANALYTICS_DASHBOARD]: [
  UserRole.SCHOOL_ADMIN,
  UserRole.SCHOOL_FINANCE,  // ← Agregado
  UserRole.SUPER_ADMIN
],
```

**Paso 2:** Ya está. El sistema automáticamente:
- ✅ App.tsx lo autorizará
- ✅ Sidebar lo mostrará (si agregaste su sección)

### Situación: Quieres crear un rol nuevo

**Paso 1:** Agrégalo en `types.ts`

```typescript
export enum UserRole {
  // ... existentes ...
  AUDITOR = 'AUDITOR',  // ← Nuevo rol
}
```

**Paso 2:** Agrégalo a `VIEW_PERMISSIONS` en `rolePermissions.ts`

```typescript
[AppView.ANALYTICS_DASHBOARD]: [
  UserRole.SCHOOL_ADMIN,
  UserRole.AUDITOR,  // ← Nuevo
  UserRole.SUPER_ADMIN
],
```

**Paso 3:** Agrégalo en Sidebar.tsx

```typescript
{!isSuperAdmin && userRole === UserRole.AUDITOR && (
  <>
    <div className="mb-4 px-5 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">
      Auditoría
    </div>
    <button onClick={() => onNavigate(AppView.ANALYTICS_DASHBOARD)}>
      <TrendingUp className="w-5 h-5 mr-3" /> Analytics
    </button>
  </>
)}
```

---

## 🚨 ERRORES COMUNES

### ❌ Error 1: "Olvidé actualizar VIEW_PERMISSIONS"

**Síntoma:** Cambio de rol pero la vista sigue bloqueada  
**Causa:** No actualizaste `VIEW_PERMISSIONS`  
**Solución:** Edita `/lib/rolePermissions.ts` → `VIEW_PERMISSIONS`

### ❌ Error 2: "El botón no aparece en Sidebar"

**Síntoma:** Usuario logueado pero no ve botón  
**Causa:** Falta la sección del rol en Sidebar.tsx  
**Solución:** Agrégalo en `components/Sidebar.tsx`

### ❌ Error 3: "Todos los roles ven todos los botones"

**Síntoma:** STUDENT ve botones de PARENT  
**Causa:** Olvidaste poner `{!isSuperAdmin &&` en la sección  
**Solución:** Asegúrate cada sección tenga condicional apropiado

---

## 📊 TESTING CHECKLIST

Para verificar que todo funciona:

```
[ ] SUPER_ADMIN
  [ ] Ve todos los botones del Sidebar
  [ ] Puede navegar a cualquier vista
  [ ] No ve "Acceso Denegado"

[ ] SCHOOL_ADMIN  
  [ ] Ve botones: Campus Admin, Analytics, Monitoreo
  [ ] NO ve: Portal Padres, Student Hub, Terminal POS
  [ ] Si intenta ir a PARENT_DASHBOARD → Acceso Denegado

[ ] STUDENT
  [ ] Ve botones: Inicio, Mi Card, Consumo
  [ ] NO ve: Campus Admin, Portal Padres
  [ ] Si intenta ir a SCHOOL_ADMIN_DASHBOARD → Acceso Denegado

[ ] CASHIER
  [ ] Ve botones: Recargas y Pagos
  [ ] NO ve: más que eso

[ ] POS_OPERATOR
  [ ] Ve botones: Terminal Cafetería, Terminal Papelería, Canje
  [ ] NO ve: otras opciones
```

---

## 💡 TIPS PRO

1. **Mantén VIEW_PERMISSIONS actualizado** - Es la fuente de verdad
2. **SUPER_ADMIN siempre tiene acceso** - Es intencional
3. **Usa `canAccessView()` para mostrar/ocultar UI** - Mejor UX
4. **La validación en `renderCurrentView()` es la "última barrera"** - Confía en ella
5. **Los nombres son descriptivos** - `isAuthorized`, `canAccessView` son claros

---

**Documento actualizado:** 9 de Enero 2025  
**Versión:** 1.0

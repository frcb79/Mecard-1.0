# MeCard Platform – Estado del Proyecto

Este documento resume **la arquitectura actual, rutas, vistas, componentes y servicios** del proyecto MeCard para que pueda retomarse fácilmente en otro chat de AI o por cualquier desarrollador sin empezar de cero.

---

## 1. Stack General

* **React + TypeScript**
* **React Router v6** (BrowserRouter)
* **Arquitectura por dominios**: components / views / services / contexts
* **UI**: TailwindCSS + lucide-react
* **Backend / Data**: Supabase (auth, inventory, POS, social)
* **AI**: Gemini (auditoría estratégica)

---

## 2. Rutas Actuales (app.tsx)

```txt
/
├── /                → SuperAdminDashboard
├── /schools         → Schools (gestión de escuelas)
├── /students        → Students (gestión de alumnos)
```

Todas las rutas están envueltas por:

* **AdminLayout** (layout general + sidebar + protección)

---

## 3. Layout y Control de Acceso

### AdminLayout.tsx

Responsabilidades:

* Layout principal (sidebar + contenido)
* Contenedor de vistas administrativas
* Punto natural para:

  * Auth guard
  * Control de roles
  * Navegación

### ProtectedRoute.tsx

* Protección de rutas según sesión/rol

---

## 4. Vistas Principales (views)

### Schools (`/schools`)

Vista de **gestión de escuelas**.

Relacionado con:

* SchoolAdminView
* SchoolManagement
* SchoolAdminStudentsView
* SchoolOnboardingDashboard

Responsabilidades:

* Listar escuelas
* Crear / editar escuela
* Acceder a alumnos por escuela

---

### Students (`/students`)

Vista de **gestión global de alumnos**.

Relacionado con:

* StudentDashboard
* StudentPortal
* StudentImportWizard

Responsabilidades:

* Importación masiva
* Gestión individual
* Vínculo alumno ↔ escuela

---

### SuperAdminDashboard (`/`)

Dashboard central del super administrador.

Muestra:

* Métricas globales
* Accesos rápidos
* Estado de la red

---

## 5. Plataforma Global – MeCardPlatform.tsx

### Rol

Vista de **Command Center** de toda la red MeCard.

Funciona como:

* Visibilidad global de escuelas
* Estado financiero
* Auditoría estratégica con IA

### Tabs

* **Infraestructura**

  * Escuelas
  * Volumen
  * Alumnos
  * Unidades (POS)

* **Gemini Strategic**

  * Auditoría inteligente
  * Análisis financiero y operativo

### Dependencias

* PlatformContext
* geminiService
* settlementService
* MOCK data (temporal)

---

## 6. Components (resumen por dominio)

### Core / Layout

* AdminLayout
* Sidebar
* Button
* ToggleSwitch

### Dashboards

* SuperAdminDashboard
* ConcessionaireDashboard
* DashboardView

### School

* SchoolAdminView
* SchoolManagement
* SchoolAdminStudentsView
* SchoolOnboardingDashboard

### Student

* StudentDashboard
* StudentPortal
* StudentImportWizard

### POS / Operación

* PosView
* CashierView
* InventoryManagementView
* TransactionHistory
* MenuView

### Social / Engagement

* MeCardSocial
* GiftRedemptionView
* ParentPortal

### Soporte / Sistema

* NotificationBell
* NotificationCenter
* SupportSystem
* SmartStaffManager

---

## 7. Services

### Auth

* authService
* supabaseAuth

### Inventory / POS

* inventoryService
* supabaseInventory
* supabasePos

### Social

* supabaseSocial

### Financial

* settlementService
* clabeService

### Students

* studentImportService

### AI

* geminiService

---

## 8. Contexts

### PlatformContext

Responsabilidades:

* Escuelas activas
* Escuela seleccionada
* Impersonación
* Datos globales de red

---

## 9. Flujo Mental del Proyecto (cómo entenderlo rápido)

1. **AdminLayout** define el mundo
2. **Rutas** definen el rol del usuario
3. **Views** orquestan dominios
4. **Components** ejecutan UI + lógica
5. **Services** hablan con Supabase / IA
6. **Context** mantiene estado global

---

## 10. Próximos Pasos Naturales

* Consolidar types compartidos (`/types`)
* Reemplazar MOCKS por Supabase
* Definir roles (SuperAdmin / SchoolAdmin / Parent / Student)
* Separar MeCardPlatform como `/platform`
* Documentar permisos por vista

---

> Este documento es el **mapa oficial del proyecto**. Puede copiarse completo en otro chat de AI para continuar sin perder contexto.

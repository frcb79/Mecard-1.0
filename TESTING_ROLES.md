# 🔑 GUÍA DE ACCESO A TODOS LOS ROLES - MECARD

**Documento**: Instrucciones para acceder y probar cada rol del sistema
**Fecha**: 2026-02-16
**Estado**: ✅ Todos los roles accesibles

---

## 🚀 CÓMO ACCEDER A LA PLATAFORMA

### Paso 1: Ir a la página de login
```
URL: http://localhost:5173/login
```

### Paso 2: Seleccionar Gateway (rol)
La página de login muestra 4 opciones principales:

### Paso 3: Diferencia entre Local y Vercel
- **Local (demo mode)**: para Student/Parent, se aceptan credenciales demo como en este documento.
- **Vercel (Supabase real)**: School Admin y Super Admin requieren correo y contraseña reales de Supabase Auth.

---

## 👨‍🎓 ROLE 1: ESTUDIANTE (STUDENT)

### Acceso
1. Click en **"ALUMNOS"** en la página de login
2. Sistema te lleva a: `/login?gateway=student`
3. Ingresa datos de estudiante (cualquier valor funciona en demo):
   - **Student ID**: `12345`
   - **PIN**: `0000`
4. Click **"Acceder"**

### URLs Accesibles (Después de login)
```
✅ /student               → Dashboard principal
✅ /student/wallet        → Historial y balances
✅ /student/profile       → Perfil del estudiante
✅ /student/social        → 🎁 NUEVO: Red social de regalos
✅ /student/rewards       → Puntos y recompensas
✅ /student/id            → Credencial digital
```

### Qué Probar
- [ ] Ver dashboard con balance actual
- [ ] Ver historial de transacciones
- [ ] Acceder a `/student/social`:
  - [ ] Tab "Enviar Regalo" - buscar compañero
  - [ ] Tab "Mis Regalos" - ver regalos recibidos
  - [ ] Tab "Mis Favoritos" - agregar favoritos
- [ ] Ver puntos y recompensas acumuladas
- [ ] Ver perfil con restricciones

### Notas
- Los datos son mock (no se guarda en BD real)
- Puedes cambiar entre estudiantes simulados
- Las transacciones se muestran pero no persisten

---

## 👨‍👩‍👧 ROLE 2: PADRE/MADRE (PARENT)

### Acceso - **FIJO AHORA** ✅
1. Click en **"PADRES"** en la página de login
2. Sistema te lleva a: `/login?gateway=parent`
3. Ingresa datos de padre (cualquier valor en demo):
   - **Parent Email**: `padre@escuela.mx`
   - **PIN**: `0000`
4. Click **"Acceder"**

### URLs Accesibles (Después de login)
```
✅ /parent               → Dashboard de familia (FIJO AHORA)
✅ /parent/wallet        → Billetera, depósitos, asignación
```

### Qué Probar
- [ ] **Dashboard** (`/parent`):
  - [ ] Ver hijos vinculados
  - [ ] Ver balance de cada hijo
  - [ ] Ver gasto diario de cada hijo
  - [ ] Historial de transacciones
  - [ ] Cambiar entre hijos (switch student)

- [ ] **Billetera** (`/parent/wallet`):
  - [ ] Tab "Depositar":
    - [ ] Seleccionar método (SPEI o Tarjeta)
    - [ ] Ingresar monto
    - [ ] Ver cálculo de fees
    - [ ] "Procesar" (mock payment)
  - [ ] Tab "Asignar":
    - [ ] Seleccionar hijo
    - [ ] Ingresar cantidad a asignar
    - [ ] Verificar balance se actualiza
  - [ ] Tab "Insights" (AI):
    - [ ] Ver análisis de gasto
    - [ ] Ver recomendaciones Gemini

### Notas
- **AHORA FIX**: ParentPortal ya tiene props conectados ✅
- Los hijos vienen precargados del mock (Juan, María)
- Billetera usa MockPaymentService
- Insights generados por Gemini AI

---

## 🏫 ROLE 3: ADMINISTRADOR DE COLEGIO (SCHOOL ADMIN)

### Acceso - **FIJO AHORA** ✅
1. Click en **"COLEGIOS"** en la página de login
2. Sistema te lleva a: `/login?gateway=institution`
3. Ingresa datos de escuela:
   - **School Email**: `admin@escuela.mx`
  - **Password**: `Mecard2025!`
4. Click **"Acceder"**

### URLs Accesibles (Después de login)
```
✅ /school               → Dashboard de escuela (FIJO AHORA)
✅ /school/students      → Gestión de estudiantes (CRUD)
✅ /school/staff         → Gestión de personal
✅ /school/import        → Importación de estudiantes (CSV)
✅ /school/config        → Configuración de fees
```

### Qué Probar
- [ ] **Dashboard** (`/school`):
  - [ ] Ver KPIs (estudiantes, balance, ventas)
  - [ ] Ver estadísticas de unidades
  - [ ] Ver información de liquidación

- [ ] **Gestión de Estudiantes** (`/school/students`):
  - [ ] **Buscar**: Tipo nombre, email, CURP
  - [ ] **Filtrar**: Por estado (activo/inactivo)
  - [ ] **Agregar**: Click "Agregar Estudiante" → Formulario modal
    - [ ] Llenar: Nombre, Email, CURP (requerido)
    - [ ] Campos opcionales: Teléfono, CLABE, Saldo inicial
    - [ ] Click "Agregar"
  - [ ] **Editar**: Click lápiz → Modal con datos
    - [ ] Cambiar teléfono → Click "Guardar"
  - [ ] **Eliminar**: Click papelera → Confirmar
  - [ ] **Exportar**: CSV con lista actual
  - [ ] **Estado**: Toggle activo/inactivo

- [ ] **Gestión de Personal** (`/school/staff`):
  - [ ] Ver lista de staff
  - [ ] Agregar nuevo staff (nombre, email, rol, unidad)
  - [ ] Remover staff

- [ ] **Importación CSV** (`/school/import`):
  - [ ] Step 1: Descargar template
  - [ ] Step 2: Subir archivo con estudiantes
  - [ ] Step 3: Ver validación y duplicados
  - [ ] Step 4: Confirmar importación
  - [ ] Verificar aparecen en lista

- [ ] **Configuración** (`/school/config`):
  - [ ] Ver/editar fees (plataforma, banco)
  - [ ] Ver/editar límites diarios
  - [ ] Ver unidades operacionales

### Notas
- **AHORA FIX**: SchoolAdminView ya tiene props conectados ✅
- Modal de Add/Edit Student completamente implementado ✅
- CSV import con validación paso a paso ✅
- Búsqueda y filtro funcionan en tiempo real

---

## 🔐 ROLE 4: SUPER ADMINISTRADOR (SUPER ADMIN)

### Acceso
1. Click en **"CORPORATIVO"** en la página de login
2. Sistema te lleva a: `/login?gateway=corporate`
3. Requiere **Master Key**: `MECARD2025`
4. Luego ingresa datos de admin:
   - **Corp Email**: `admin@mecard.mx`
  - **Password**: `Mecard2025!`
5. Click **"Acceder"**

### URLs Accesibles (Después de login)
```
✅ /admin                    → Dashboard de plataforma
✅ /admin/schools            → Gestión de escuelas
✅ /admin/settlement         → Liquidaciones
✅ /admin/reports            → Reportes
✅ /admin/config             → Configuración de plataforma
```

### Qué Probar
- [ ] **Dashboard** (`/admin`):
  - [ ] Ver KPIs globales (escuelas, estudiantes, balance)
  - [ ] Ver ranking de escuelas
  - [ ] Ver transacciones del día

- [ ] **Escuelas** (`/admin/schools`):
  - [ ] Ver lista de todas las escuelas
  - [ ] Click escuela → ver detalles
  - [ ] Editar configuración de escuela
  - [ ] Ver estado (activa/pendiente/inactiva)

- [ ] **Liquidaciones** (`/admin/settlement`):
  - [ ] Ver escuelas pendientes de liquidación
  - [ ] Ver montos acumulados
  - [ ] Procesar liquidación
  - [ ] Ver historial de pagos

- [ ] **Reportes** (`/admin/reports`):
  - [ ] Generar reporte por escuela
  - [ ] Generar reporte por fecha
  - [ ] Exportar a PDF/CSV

- [ ] **Configuración** (`/admin/config`):
  - [ ] Ver/editar fees globales
  - [ ] Ver/editar límites por rol
  - [ ] Configuración de notificaciones

### Notas
- Master key requerida: `MECARD2025`
- Acceso a toda la información de la plataforma
- Super admin puede ver/editar múltiples escuelas

---

## 🔄 CAMBIAR ENTRE ROLES

**Método**:
1. Click **Logo MeCard** (arriba-izquierda)
2. Selecciona **"Logout"** o **"Change Role"**
3. Vuelve a login y selecciona diferente rol

---

## 📊 MATRIZ DE FUNCIONALIDADES POR ROL

| Funcionalidad | Estudiante | Padre | Colegio | Super Admin |
|--------------|-----------|-------|---------|-----------|
| Ver Balance | ✅ | ✅ | ✅ | N/A |
| Hacer Compra | ✅ | N/A | N/A | N/A |
| Enviar Regalos | ✅ | N/A | N/A | N/A |
| Ver Favoritos | ✅ | N/A | N/A | N/A |
| Depositar Dinero | N/A | ✅ | N/A | N/A |
| Asignar a Hijos | N/A | ✅ | N/A | N/A |
| Ver AI Insights | N/A | ✅ | N/A | N/A |
| Gestionar Estudiantes | N/A | N/A | ✅ | ✅ |
| Importar CSV | N/A | N/A | ✅ | ✅ |
| Ver Dashboard Admin | N/A | N/A | ✅ | ✅ |
| Gestionar Escuelas | N/A | N/A | N/A | ✅ |
| Procesar Liquidaciones | N/A | N/A | N/A | ✅ |
| Generar Reportes | N/A | N/A | ✅ | ✅ |

---

## ⚠️ PROBLEMAS CONOCIDOS Y FIXES

### ✅ FIJO: ParentPortal (Session 2, Part 3)
- **Problema**: No se cargaba /parent - faltaban props
- **Fix**: Creado ParentPortalContainer que proporciona estado
- **Estado**: ✅ FUNCIONAL

### ✅ FIJO: SchoolAdminView (Session 2, Part 3)
- **Problema**: No se cargaba /school - faltaban props
- **Fix**: Creado SchoolAdminContainer que proporciona estado
- **Estado**: ✅ FUNCIONAL

### ✅ FIJO: StudentManagementView Modal (Session 2, Part 2)
- **Problema**: Modal de Add/Edit era placeholder
- **Fix**: Implementado formulario completo con validación
- **Estado**: ✅ FUNCIONAL

### ✅ FIJO: ParentWalletView SchoolId (Session 2, Part 2)
- **Problema**: SchoolId hardcoded a 'school-001'
- **Fix**: Ahora usa user?.schoolId
- **Estado**: ✅ FUNCIONAL

### ✅ FIJO: GiftInbox Decline (Session 2, Part 2)
- **Problema**: Botón rechazar regalo no funcionaba
- **Fix**: Implementada lógica completa con confirmación
- **Estado**: ✅ FUNCIONAL

---

## 🧪 CHECKLIST DE VALIDACIÓN

Antes de demo, verifica que todos estos accesos funcionan:

**Estudiante**:
- [ ] Login con "ALUMNOS"
- [ ] Dashboard carga
- [ ] Ver `/student/social`
- [ ] Enviar regalo a compañero
- [ ] Ver regalos recibidos

**Padre**:
- [ ] Login con "PADRES"
- [ ] Dashboard `/parent` carga
- [ ] Ver hijos vinculados
- [ ] Acceder a `/parent/wallet`
- [ ] Ver opciones de depósito

**Colegio**:
- [ ] Login con "COLEGIOS"
- [ ] Dashboard `/school` carga
- [ ] Acceder a `/school/students`
- [ ] Ver lista de estudiantes
- [ ] Click "Agregar Estudiante" → modal abre
- [ ] Acceder a `/school/import`

**Super Admin**:
- [ ] Login con "CORPORATIVO"
- [ ] Ingresa master key: `MECARD2025`
- [ ] Dashboard `/admin` carga
- [ ] Ver múltiples escuelas
- [ ] Acceder a `/admin/schools`

---

## 🌱 CREAR DATOS QA DE PRUEBA

### Sembradura de datos maestros (Día 1 Plan)

Ejecuta el script de seed para crear:
- 1 colegio: "Escuela QA Demo"
- 3 campuses
- 5 unidades operativas (cafeterías, papelería, librería)
- 4 staff con roles (SCHOOL_ADMIN, SCHOOL_FINANCE, CAFETERIA_STAFF, POS_OPERATOR)
- 50 alumnos con credenciales

**Comando:**
```bash
$env:SUPABASE_URL="https://tu-proyecto.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
node scripts/seed-qa-data.mjs
```

**Resultado esperado:**
```
✅ Seed completado exitosamente.

📊 RESUMEN DE DATOS CREADOS:
  Colegio: Escuela QA Demo
  Campuses: 3
  Unidades: 5
  Staff: 4
  Productos: 20
  Alumnos: 50
```

---

## 📊 MATRIZ QA COMPLETA (Post-Seed)

| Rol | Email | Password | Master Key | Estado |
|-----|-------|----------|-----------|--------|
| **Super Admin** | admin@mecard.mx | Mecard2025! | MECARD2025 | ✅ Usado para setup |
| **School Admin** | principal@escuela-qa.mx | Mecard2025! | — | ✅ Gestiona colegio |
| **Finance** | finance@escuela-qa.mx | Mecard2025! | — | ✅ Reportes |
| **Cafeteria Op** | cafeteria-op@escuela-qa.mx | Mecard2025! | — | ✅ Operación POS |
| **POS Operator** | pos-operator@escuela-qa.mx | Mecard2025! | — | ✅ Operación POS |
| **Student (x50)** | student001@escuela-qa.mx | Mecard2025! | — | ✅ Compras |

---

## 📝 NOTAS IMPORTANTES

1. **Modo Demo Local**: Cualquier credencial funciona en local (no hace auth)
2. **Modo Real (Vercel/Staging)**: Credenciales reales de Supabase Auth obligatorio
3. **Master Key**: `MECARD2025` para super admin en gateway CORPORATIVO
4. **Datos QA**: Ejecuta seed una vez. Los datos persisten en Supabase.
5. **TypeScript Strict**: Todos los tipos validados

---

**Última Actualización**: 2026-03-30 (Día 1 Plan)
**Build Status**: ✅ 2320 módulos sin errores
**Estado Plataforma**: 🟢 Estructura base lista, iniciando pruebas operativas

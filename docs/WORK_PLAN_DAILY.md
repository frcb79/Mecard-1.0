# Plan de Trabajo Diario - MeCard 1.0

## Objetivo General
Construir todas las pantallas y funcionalidades faltantes para cada perfil de usuario, trabajando iterativamente por fase.

---

## FASE 1: MVP-1 (COMPLETADO) ✅ Bajo esfuerzo, Alto impacto
**Commit**: `feat: implement MVP-1 screens (parent wallet, limits, student history, children management) and supporting services`

### Estudiante
- [x] **StudentTransactionHistoryView** — Historial detallado con filtros por fecha/monto ✅
  - Expandir sobre `StudentDashboard`
  - Mostrar transacciones con detalles (fecha, monto, lugar, categoría)
  - Filtros: por fecha, rango de monto, tipo (compra/depósito)
  - Exportar a CSV (opcional)

### Padre
- [x] **ParentChildrenManagementView** — Gestionar múltiples hijos ✅
  - Listar hijos vinculados
  - Vincular nuevos hijos (QR o código)
  - Desvincular hijos
  - Ver saldo/estado de cada hijo en tiempo real

- [x] **ParentWalletView** — Gestión de fondos (CRÍTICO) ✅
  - Ver saldo disponible del padre
  - Depositar dinero a cada hijo
  - Historial de depósitos
  - Métodos de pago (tarjeta, SPEI, transferencia)

- [x] **ParentLimitsView** — Establecer límites de gasto ✅
  - Límite diario/semanal por hijo
  - Categorías bloqueadas (opcionales)
  - Horarios de bloqueo (ej: no comprar fuera de horario escolar)

---

## FASE 2: MVP-2 (COMPLETADO) ✅ Medio esfuerzo, Alto impacto
**Commit**: `feat: implement MVP-2 screens (parent alerts, transaction monitoring, concessionaire sales reports) with Recharts integration and Sidebar navigation`

### Padre (continuación)
- [x] **ParentAlertsConfigView** — Configurar notificaciones ✅
  - Alerta por saldo bajo (threshold configurable)
  - Alerta por compra grande (monto configurable)
  - Alerta de intentos de compra denegados
  - Canal: email, SMS, in-app
  - **Status**: Fully functional, Sidebar navigation added

- [x] **ParentTransactionMonitoringView** — Monitoreo avanzado ✅
  - Historial detallado de transacciones de hijos
  - Filtros por fecha, hijo, categoría, monto
  - Estadísticas: gasto diario promedio, categoría favorita
  - **Status**: Recharts integration complete (BarChart daily trend, PieChart categories, LineChart hourly)
  - **Status**: Sidebar navigation added

### Concesionario/Cajero
- [x] **ConcessionaireSalesReportsView** — Reportes de ventas ✅
  - Ventas por producto (tabla + gráfico)
  - Ventas por hora del día
  - Resumen: día, semana, mes
  - Comparativa vs. período anterior
  - **Status**: Fully functional with Recharts (BarChart top products, LineChart hourly, BarChart daily trend)
  - **Status**: Period selector (day/week/month), comparison toggle, 4 stats cards
  - **Status**: Sidebar navigation added

---

## FASE 3: MVP-3 (Semana 3) 🟡 Medio esfuerzo, Medio impacto

### Padre
- [ ] **ParentReportsView** — Análisis visual de gastos
  - Gráfico de tendencia de gasto (Recharts)
  - Desglose por categoría (pie chart)
  - Comparativa mes anterior
  - Sugerencias de ahorro (IA con Gemini opcional)

### Admin Escuela
- [ ] **SchoolAdminDashboardEnhanced** — Métricas en tiempo real
  - Total transacciones del día/semana/mes
  - Número de estudiantes activos
  - Saldo total cargado en plataforma
  - Tendencia de uso
  - Top productos vendidos

---

## FASE 4: MVP-4 (Semana 4) 🟡 Medio esfuerzo, Medio impacto

### Estudiante
- [ ] **StudentCardManagementView** — Gestión de tarjeta MeCard
  - Ver saldo + detalles de tarjeta
  - Reportar tarjeta como perdida/robada
  - Bloquear temporalmente
  - Historial de bloqueos

- [ ] **StudentPreOrderView** — Pre-orden de comida
  - Ver menú disponible
  - Seleccionar items y hora de entrega
  - Pagar con saldo disponible
  - Confirmación y QR de recogida

### Concesionario
- [ ] **ConcessionaireMenuManagementView** — Gestión de productos
  - Listar productos actuales
  - Agregar nuevo producto (nombre, precio, foto, categoría)
  - Editar producto
  - Marcar como agotado
  - Gestionar fotos (upload)

- [ ] **ConcessionaireSettlementHistoryView** — Liquidaciones
  - Historial de pagos recibidos
  - Detalle de liquidación (comisión, fee, neto)
  - Estado del pago (pendiente, completado)
  - Exportar comprobante

---

## FASE 5: v1.1 (Semana 5+) 🟠 Alto esfuerzo, Bajo impacto inmediato

### Admin Escuela
- [ ] **SchoolConcessionaireManagementView** — Gestión de tiendas/cafeterías
- [ ] **SchoolAnnouncementView** — Centro de comunicaciones
- [ ] **SchoolStaffManagementView** — Gestión de personal

### Super Admin
- [ ] **SuperAdminSchoolManagementView** — CRUD escuelas (incluye editar businessModel)
- [ ] **SuperAdminUserManagementView** — Búsqueda/edición de usuarios globales
- [ ] **SuperAdminSystemMonitoringView** — Logs y salud del sistema

---

## MODELO DE NEGOCIO: Cobro a Escuelas (Implementación Completa)

### Campos del Business Model (School.businessModel)

| Campo | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| **setupFee** | number | $25,000 | Tarifa de implementación única |
| **annualFee** | number | $15,000 | Cuota anual de licencia |
| **monthlyRentFee** | number | $5,000 | Renta mensual infraestructura |
| **parentAppFee** | number | $25 | Tarifa por padre/mes en app |
| **cardDepositFeePercent** | number | 3.5% | % comisión recarga tarjeta |
| **speiDepositFeeFixed** | number | $8 | Tarifa fija por SPEI |
| **cafeteriaFeePercent** | number | 5.0% | % comisión ventas cafetería |
| **cafeteriaFeeAutoMarkup** | boolean | true | ¿Aplicar markup automático? |
| **posMarkupPercent** | number | 15 | % incremento precio base POS |
| **posOperatorIncentivePercent** | number | 20 | % markup → cajero |
| **pointsExchangeRate** | number | 10 | Puntos por unidad moneda |
| **printingCardFeeFixed** | number | $2.50 | Tarifa por imprimir credencial física |
| **cardReplacementFeeFixed** | number | $5.00 | Tarifa por reposición de tarjeta |

### ¿Qué tenemos?
- ✅ Tipos y estructura (`School.businessModel`)
- ✅ Mocks con dos escuelas con diferentes configs
- ✅ Lógica de settlement (calcula comisiones)
- ✅ FinancialService (markup POS + puntos dinámicos)

### ¿Qué falta?

#### **Tarea 1: UI para Editar Modelo de Negocio** 🟡 Medio
- [ ] **SuperAdminBusinessModelEditor** — Pantalla para editar campos
  - Campos editables: setupFee, annualFee, monthlyRentFee, parentAppFee, cardDepositFeePercent, speiDepositFeeFixed, cafeteriaFeePercent, posMarkupPercent, posOperatorIncentivePercent, pointsExchangeRate
  - Validación de límites (ej: % no puede ser >100)
  - Preview de cálculos mensuales/anuales
  - Guardar cambios a Supabase

- [ ] **SchoolAdminBusinessModelView** — Vista read-only para admin escuela
  - Ver su propio businessModel
  - Historial de cambios (quién cambió qué y cuándo)

#### **Tarea 2: Persistencia en Supabase** 🟡 Medio
- [ ] Crear/actualizar tabla `schools` en Supabase
  - Campos: id, name, logo, businessModel (JSONB), onboardingStatus, branding, balance, etc.
  - Sincronizar `School` type con estructura Supabase

- [ ] Crear servicio `supabaseSchools.ts`
  - `getSchools()` — obtener todas
  - `getSchoolById(id)` — una escuela
  - `updateSchool(id, updates)` — actualizar (incluido businessModel)
  - `createSchool(data)` — crear nueva

- [ ] Migrar datos de mocks a Supabase
  - MOCK_SCHOOLS → tabla schools

#### **Tarea 3: Reportes de Ingresos** 🟠 Alto
- [ ] **SuperAdminRevenueReportsView** — Ingresos globales de MeCard
  - Total ingresos por mes/año (all schools)
  - Desglose por escuela (cuánto aporta cada una)
  - Ingresos fijos vs. variables
  - Gráficos: pie (por escuela), línea (tendencia temporal)
  - Filtros: fecha, escuela, tipo de ingreso

- [ ] **SchoolFinancialReportsView** — Ingresos de admin escuela
  - Cuánto ha gastado en MeCard (setup + mensual)
  - ROI estimado (vs. transacciones)
  - Breakdown de comisiones pagadas
  - Proyección de costos próximos 12 meses

#### **Tarea 4: Validación de Límites** 🟢 Bajo
- [ ] Crear validador `validateBusinessModel(model)`
  - setupFee: >= 0, <= $100,000
  - annualFee: >= 0, <= $50,000
  - monthlyRentFee: >= 0, <= $10,000
  - *Fee%: >= 0, <= 100
  - posMarkupPercent: >= 5, <= 50
  - pointsExchangeRate: >= 1, <= 100
  - Mostrar errores amigables en UI

- [ ] Implementar en `services/validationService.ts`

#### **Tarea 6: Gestión de Impresión y Reposición de Credenciales** 🟡 Medio
- [ ] **Crear tipos en `types.ts`**
  - `CardTransaction` — registro de impresión/reposición
    - studentId, schoolId, type ('PRINTING' | 'REPLACEMENT'), cost, timestamp, approvedBy
  - Extender `StudentProfile` con campo `cardPrintingDate` y `lastReplacementDate`

- [ ] **Crear servicio `cardService.ts`**
  - `requestCardPrinting(studentId, schoolId)` — solicitar impresión, aplica costo
  - `requestCardReplacement(studentId, schoolId, reason)` — solicitar reposición, aplica costo
  - `getCardTransactionHistory(schoolId)` — historial de impresiones/reposiciones
  - Validar que no se imprima 2 veces en <30 días (configurable)

- [ ] **Admin Escuela: CardManagementView**
  - Ver estudiantes que necesitan credencial impresa
  - Aprobar/rechazar solicitudes de reposición
  - Ver historial de impresiones (quién, cuándo, costo)
  - Generar órdenes de impresión en lote

- [ ] **UI para Estudiante: Solicitar Reposición**
  - Botón "Mi tarjeta está perdida/dañada"
  - Motivo de reposición (pérdida, daño, robo)
  - Confirmación de costo ($5 ej)
  - Deducción de saldo/cuenta escuela
  - Ticket de solicitud

- [ ] **Persistencia Supabase**
  - Tabla `card_transactions` (impresiones/reposiciones)
  - Tabla `card_printing_orders` (órdenes lote)
  - Actualizar `students` con campos de dates

- [ ] **Reportes**
  - SuperAdmin: Ingresos totales por impresión/reposición
  - SchoolAdmin: Cuántas impresiones/reposiciones en período
  - Costo mensual estimado por estas operaciones

---

#### **Tarea 7: Validación y Cálculo de Costos Totales** 🟢 Bajo
- [ ] Actualizar `validateBusinessModel()` para incluir:
  - printingCardFeeFixed: >= $0, <= $50
  - cardReplacementFeeFixed: >= $0, <= $100
  - Validar que no sean 0 si la escuela lo requiere

- [ ] Crear función `calculateMonthlyRevenue(school, transactions)`
  - Incluir ingresos por impresión/reposición
  - Mostrar en dashboard SuperAdmin y SchoolAdmin

---

#### **Tarea 5: Auditoría de Cambios** 🟡 Medio
- [ ] Crear tabla `school_model_audits` en Supabase
  - Campos: id, schoolId, userId, changedFields (JSONB), oldValues (JSONB), newValues (JSONB), timestamp
  - Registrar cada cambio a businessModel

- [ ] Crear servicio `auditService.ts`
  - `logBusinessModelChange(schoolId, userId, oldModel, newModel)`
  - `getAuditLog(schoolId)` — historial de cambios

- [ ] UI para ver auditoría
  - Timeline o tabla mostrando quién cambió qué y cuándo
  - Opción de revertir cambios (rollback) — requiere permisos admin

---

### Ejemplo: Flujo Completo de Cambio de Modelo

**Escenario:** SuperAdmin cambia `cardDepositFeePercent` de 3.5% a 4.5% para Colegio Cumbres

1. SuperAdmin abre `SuperAdminBusinessModelEditor`
2. Selecciona escuela "Colegio Cumbres"
3. Cambia cardDepositFeePercent: 3.5 → 4.5
4. Sistema valida (✅ está entre 0-100)
5. Calcula impacto: "Esto aumentará ingresos ~$500/mes"
6. SuperAdmin confirma guardar
7. Sistema:
   - Actualiza `schools.businessModel` en Supabase
   - Registra en `school_model_audits` (quién, qué, cuándo)
   - Notifica admin escuela (opcional: email)
8. Cambio es visible en settlement futuro (próximas transacciones usan 4.5%)

---

### Cambios en Código

#### types.ts
- [ ] Extender `School` si es necesario (ya tiene businessModel)
- [ ] Crear type `SchoolModelAudit` para auditoría
- [ ] Agregar campos impresión/reposición a `StudentProfile`
- [ ] Crear type `CardTransaction` para tracking

#### services/
- [ ] `supabaseSchools.ts` — CRUD escuelas + businessModel
- [ ] `validationService.ts` — validar businessModel
- [ ] `auditService.ts` — registrar cambios
- [ ] `cardService.ts` — solicitudes de impresión/reposición

#### Supabase (DDL)
```sql
-- schools table
CREATE TABLE schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  studentCount INT,
  balance NUMERIC,
  stpCostCenter TEXT,
  platformFeePercent NUMERIC,
  onboardingStatus TEXT,
  businessModel JSONB NOT NULL,
  branding JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- audit table
CREATE TABLE school_model_audits (
  id TEXT PRIMARY KEY,
  schoolId TEXT NOT NULL REFERENCES schools(id),
  userId TEXT NOT NULL,
  changedFields JSONB,
  oldValues JSONB,
  newValues JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- card transactions table (NEW)
CREATE TABLE card_transactions (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  schoolId TEXT NOT NULL,
  type TEXT NOT NULL, -- 'PRINTING' | 'REPLACEMENT'
  cost NUMERIC NOT NULL,
  reason TEXT, -- para reposiciones
  status TEXT DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED | COMPLETED
  approvedBy TEXT,
  printedAt TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- card printing orders (bulk orders)
CREATE TABLE card_printing_orders (
  id TEXT PRIMARY KEY,
  schoolId TEXT NOT NULL,
  totalCards INT,
  status TEXT DEFAULT 'PENDING', -- PENDING | PRINTING | READY | DELIVERED
  estimatedCost NUMERIC,
  createdAt TIMESTAMP DEFAULT NOW(),
  deliveredAt TIMESTAMP
);
```

---

### Timeline Recomendado
- **MVP-1 (esta semana):** Persistencia básica en Supabase + Tarea 1 (UI editor simple)
- **MVP-2 (próxima):** Validación + Auditoría básica
- **v1.1:** Reportes avanzados

---

## Cambios Transversales Requeridos

### types.ts
- [ ] Agregar `cardStatus` a `StudentProfile` (ACTIVE | LOST | STOLEN | BLOCKED)
- [ ] Crear `StudentOrder` interface
- [ ] Crear `RecurringDeposit` interface
- [ ] Crear `Announcement` interface
- [ ] Extender `AppView` enum con nuevas vistas

### services/
- [ ] Crear `recurringDepositService.ts`
- [ ] Crear `announcementService.ts`
- [ ] Mejorar `notificationService.ts` (alertas configurable)
- [ ] Crear `orderService.ts` (pre-órdenes)

### constants.ts
- [ ] Extender MOCK_ORDERS
- [ ] Extender MOCK_ALERTS_CONFIG

### App.tsx
- [ ] Actualizar routing para nuevas vistas

### Sidebar.tsx
- [ ] Agregar navegación para nuevas vistas por rol

---

## Checklist Diario
- [ ] ¿Qué pantalla/funcionalidad trabajamos hoy?
- [ ] ¿Nuevos tipos o servicios necesarios?
- [ ] ¿Cambios en App.tsx o Sidebar.tsx?
- [ ] ¿Tests/validación?
- [ ] Commit a `staging` con descripción clara

---

## Estado General
- **Completadas:** 0
- **En progreso:** 0
- **Bloqueadas:** 0
- **Total tareas:** 24 (pantallas) + 18 (modelo negocio + impresión/reposición) = **42 tareas**

---

## Historial de Actualizaciones
- **2026-01-09 v2:** Adición de impresión y reposición de credenciales
  - Agregados 2 nuevos campos al businessModel (printingCardFeeFixed, cardReplacementFeeFixed)
  - Agregadas 2 tareas principales para gestión de credenciales
  - Agregadas tablas SQL para tracking de transacciones de tarjetas
  - Total tareas aumentó de 37 a 42

- **2026-01-09 v1:** Creación inicial + adición de tareas de modelo de negocio
  - Agregadas 5 tareas principales para cobro a escuelas
  - Agregados ejemplos de flujo y DDL SQL

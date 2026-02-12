# Análisis Integral: POS, Super Admin y Escuelas
**Fecha:** Febrero 12, 2026  
**Estado:** Análisis detallado para integración

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual:
- ✅ **POS**: 85% funcional - Necesita integración REWARDS
- ✅ **Super Admin**: 60% funcional - Routing OK, falta analytics
- ⏳ **Escuelas**: 40% - Componentes base OK, falta integración transaccional

### Bloqueadores Críticos:
1. **POS no conecta Rewards** - Transacciones no generan puntos
2. **Super Admin sin analytics** - Dashboard muestra datos mock
3. **Escuelas sin inventario live** - No ve stock en tiempo real

---

## 🛒 ANÁLISIS POS (Point of Sale)

### ✅ Qué Funciona:
```
✓ Interfaz bifurcada (Cafetería / Papelería)
✓ Búsqueda de alumno por QR/ID
✓ Carrito con agregar/quitar items
✓ AI upsell recommendations (Gemini)
✓ Balance verification antes de pagar
✓ Transacción básica → paymentService
✓ Inventario decrement (en background)
✓ Layout retina-ready (480px sidebar)
```

### ❌ Qué Falta o Está Incompleto:

#### 1. **Integración MeCard Rewards (CRÍTICO)**
**Path:** `src/components/PosView.tsx` → `handleCheckout()`

Actualmente:
```tsx
const result = await paymentService.processTransaction(order);
// ✗ NO genera puntos
// ✗ NO actualiza student_rewards_points
// ✗ NO crea points_transaction record
```

**Necesario:**
```tsx
// 1. Crear POSTransactionWithRewards record
const posRewardsTx = await rewardsService.recordPOSTransaction({
  studentId: student.id,
  schoolId: student.schoolId,
  baseAmount: total,
  config: schoolConfig,
  description: `${mode} - ${new Date().toLocaleString('es-MX')}`
});

// 2. Actualizar student_rewards_points
await rewardsService.addPoints(
  student.id,
  posRewardsTx.pointsEarned,
  'EARN',
  { reference_id: result.transactionId }
);

// 3. Verificar tier-up
const newPoints = await rewardsService.getStudentRewards(student.id, schoolId);
if (newPoints.tier > oldTier) {
  // Notificar student del tier-up
  await notificationService.sendTierUpNotification(student.id, newPoints.tier);
}
```

**Archivos a Actualizar:**
- [ ] `src/components/PosView.tsx` - línea 135-165 (`handleCheckout`)
- [ ] Importar `rewardsService`, `notificationService`
- [ ] Agregar tipo `POSTransactionWithRewards` al método

---

#### 2. **Validación de Límites Diarios**
**Estado:** NO IMPLEMENTADO

Necesita chequear:
```
- ¿Límite diario del estudiante?
- ¿Ya gastó $100 hoy en cafetería?
- ¿Restricciones por categoría (ej: sin dulces)?
- ¿Horario permitido (ej: almuerzo 12-13)?
```

**Ubicación:** Pre-checkout en `handleCheckout()`

```tsx
const validation = await inventoryService.validateStudentRestrictions({
  studentId: student.id,
  schoolId: student.schoolId,
  cartItems: cart,
  mode: mode  // 'cafeteria' | 'stationery'
});

if (!validation.allowed) {
  setTransactionError(validation.reason);
  return;
}
```

**Source:** StudentRestrictions (types.ts)

---

#### 3. **Receipt Digital & Email**
**Estado:** NO IMPLEMENTADO

Falta:
```
- Generar PDF/imagen de recibo
- Enviar por email a padre
- Mostrar QR de comprobante
- Guardar en cloud (para impresión later)
```

**Location:** After `transactionSuccess`

```tsx
if (result.status === 'completed') {
  const receipt = await receiptService.generateReceipt({
    transactionId: result.transactionId,
    studentId: student.id,
    items: cart,
    total: total,
    pointsEarned: posRewardsTx.pointsEarned,
    timestamp: new Date()
  });

  // Email to parent
  await emailService.sendTransactionReceipt(
    student.parentEmail,
    receipt
  );
}
```

---

#### 4. **Multi-Terminal Sync**
**Estado:** NO IMPLEMENTADO

Hoy cada POS es standalone. Necesita:
```
- Registrar qué terminal procesó la venta
- Sincronizar stock ALL terminals
- Detectar stock-out en tiempo real
- Replicar info entre cafetería + papelería
```

**Solución:**
```tsx
metadata: {
  unitId: 'POS-001',  // ← Agregar
  terminalId: 'term_cafeteria_01',
  timestamp: new Date().toISOString()
}
```

Luego en Supabase:
```sql
INSERT INTO pos_sessions (unit_id, operator_id, start_time, mode)
VALUES (?, ?, ?, ?)
```

---

#### 5. **Cash vs Digital Payment Handling**
**Estado:** PARCIAL

Hoy solo soporta "cartera digital" (wallet). Necesita:
```
- ¿Pagar en efectivo?
- ¿Cheque escolar?
- ¿Transferencia bancaria?
```

**Ubicación:** `handleCheckout()` - parámetro paymentMethod

```tsx
const paymentMethod = selectedPaymentMethod || 'WALLET';  // vs 'CASH', 'CHECK'

const result = await paymentService.processTransaction({
  ...order,
  paymentMethod,
  cashReceived: paymentMethod === 'CASH' ? cashAmount : null
});
```

---

### 📋 Checklist POS Integration

**Fase 1: Rewards Connection (Esta semana)**
- [ ] Import rewardsService en PosView
- [ ] Call rewardsService después de processTransaction
- [ ] Crear POSTransactionWithRewards record
- [ ] Actualizar student_rewards_points
- [ ] Testear con mock data

**Fase 2: Validations (Próxima semana)**
- [ ] Implementar StudentRestrictions check
- [ ] Daily limit validation
- [ ] Category restrictions
- [ ] Time-based restrictions

**Fase 3: Enhanced Features**
- [ ] Digital receipts (PDF)
- [ ] Email notifications
- [ ] Multi-terminal synchronization
- [ ] Cash payment support

---

## 🔐 ANÁLISIS SUPER ADMIN

### ✅ Qué Funciona:
```
✓ Dashboard base con Cards (Schools, Students, Volume)
✓ Tab navigation (Overview + MeCard Rewards)
✓ School listing con MOCK_SCHOOLS
✓ School details display (name, students, balance)
✓ Rewards config panel (AdminRewardsConfig)
✓ School selector para rewards
✓ Routing setup (/admin, /admin/schools, /admin/settlement, /admin/reports)
```

### ❌ Qué Falta:

#### 1. **Real Analytics Dashboard**
**Componente:** `src/components/SuperAdminDashboard.tsx`

Hoy muestra:
```
- Total Schools: 5 (hardcoded)
- Total Students: Suma MOCK_SCHOOLS
- Platform Volume: Suma mock balances
```

Debería mostrar:
```
KPI Dashboard (Real-time):
┌─────────────────────────────────────────────────┐
│ Total Schools │ Total Students │ Volume Total  │
│      5        │     1,245      │  $485,320     │
└─────────────────────────────────────────────────┘
│ Active Today  │ Transactions   │ Avg Ticket    │
│     847       │     3,412      │  $142.50      │
└─────────────────────────────────────────────────┘

Gráficos:
- Línea: Transacciones por hora (last 24h)
- Barras: Top 10 escuelas por volumen
- Pie: Distribución categoría (Comida 40%, Papelería 35%, etc)
- Map: Geolocalización de unidades operativas
```

**Datos Source:**
```sql
SELECT 
  COUNT(DISTINCT schools.id) as total_schools,
  COUNT(DISTINCT students.id) as total_students,
  SUM(wallet_transactions.amount) as total_volume,
  COUNT(DISTINCT wallet_transactions.id) as daily_transactions
FROM schools
LEFT JOIN students ON schools.id = students.school_id
LEFT JOIN wallet_transactions ON students.id = wallet_transactions.student_id
WHERE wallet_transactions.created_at > NOW() - INTERVAL '24 hours';
```

---

#### 2. **School Management CRUD**
**Componente:** `src/components/SchoolManagement.tsx`

Necesita:

**a) Listar Escuelas (Tabla)**
```
┌─ Nombre      ┬─ Ciudad  ┬─ Estudiantes ┬─ POS ┬─ Volumen  ┬─ Acciones ─┐
│ Primaria X   │ CDMX     │    450       │  3   │ $125K     │ Ver|Edit   │
│ Secundaria Y │ Monterey │    320       │  2   │ $89K      │ Ver|Edit   │
└─────────────────────────────────────────────────────────────────────────┘
```

**b) Crear Escuela (Modal)**
```
Campos:
- Nombre escuela *
- Dirección *
- Ciudad *
- Contacto (nombre) *
- Email *
- Teléfono
- Tipo contrato: TRIAL (30 días) | STANDARD (1 año)
- Comisión inicial: 15% (default)
```

**c) Ver Detalle**
```
Card con:
- Datos básicos
- # Estudiantes
- # POS actívos
- Volumen mes
- % Comisión actual
- Fecha inicio/fin contrato
- Link a Dashboard escolar
```

**d) Editar Escuela**
```
Updatable fields:
- Contacto
- Teléfono
- Email
- Estado: ACTIVE | SUSPENDED | CANCELLED
- % Comisión
```

---

#### 3. **Settlement & Disbursement Management**
**Componente:** `src/components/SettlementsView.tsx`

Hoy: NO IMPLEMENTADO

Necesita:

**a) Generar Settlement**
```
Formulario:
┌───────────────────────────────────────┐
│ Generar Liquidación                   │
├───────────────────────────────────────┤
│ Período: [2026-02-01] - [2026-02-28]  │
│ Alcance: ◉ Todas | ○ Escuela específica│
│ Método: ◉ SPEI | ○ Cheque | ○ Depósito│
├───────────────────────────────────────┤
│ [Cambiar período] [Generar ▶]         │
└───────────────────────────────────────┘

Resultado (Tabla):
┌─ Escuela ┬─ Monto ┬─ Comisión ┬─ Neto ┬─ Status ─┐
│ Primaria │ $125K  │  $18.7K   │ $106K │ PENDING  │
│ Secondi  │  $89K  │  $13.3K   │ $75K  │ PENDING  │
└────────────────────────────────────────────────┘
```

**b) Procesar Disbursement**
```
Por cada escuela:
1. Validar CLABE/cuenta bancaria
2. Crear SPEI request
3. Obtener CVE (folio)
4. Guardar en DB con status PROCESSING
5. Polling para confirmar (24-48h)
6. Actualizar a COMPLETED
```

**c) View Settlement History**
```
Filtros:
- Período (date range picker)
- Estado: PENDING | PROCESSING | COMPLETED | FAILED
- Escuela

Respuesta: Timeline de todos los settlements
```

---

#### 4. **Reports & Export**
**Componente:** `src/components/ReportsView.tsx`

Hoy: BÁSICO

Mejorar con:

**Tipos de Reporte:**
- Por Escuela (ventas, comisión)
- Por Categoría (% alimentos vs papelería)
- Por Estudiante (top spenders, restrictions violations)
- Por Período (comparativo mes a mes)
- Inventario (stock levels, rotación)

**Exportar:**
```
Formatos:
- CSV (datos tabulares)
- PDF (con gráficos)
- Excel (con fórmulas)

Ejemplo:
reportsService.export({
  type: 'sales_by_school',
  period: { start: '2026-02-01', end: '2026-02-28' },
  format: 'pdf'  // csv | pdf | xlsx
})
```

---

#### 5. **Real-time Monitoring**
**Necesario:**
```
- Socket.io para live data
- Update de transacciones cada 10 segundos
- Alertas para anomalías
- Server push para nuevos eventos
```

**Implementación:**
```tsx
useEffect(() => {
  const socket = io(SUPABASE_URL);
  
  socket.on('transaction:new', (data) => {
    setDashboard(prev => ({
      ...prev,
      dailyTransactions: prev.dailyTransactions + 1,
      platformVolume: prev.platformVolume + data.amount
    }));
  });
  
  return () => socket.disconnect();
}, []);
```

---

### 📋 Checklist Super Admin

**MVP (Esta semana)**
- [ ] Mejorar tabla de escuelas (búsqueda, sort, filtros)
- [ ] CRUD escuelas (Create, Edit, Delete con confirmación)
- [ ] School detail view
- [ ] Connect analytics a Supabase queries

**Fase 2**
- [ ] Settlement generator (mock SPEI)
- [ ] Basic reports export (CSV + PDF)
- [ ] Real-time dashboard updates

**Fase 3**
- [ ] Advanced analytics (gráficos complejos)
- [ ] Real-time socket monitoring
- [ ] Audit log completo

---

## 🏫 ANÁLISIS ESCUELAS (School Admin)

### ✅ Qué Funciona:
```
✓ Dashboard base (SchoolAdminView)
✓ Student CRUD interface
✓ Staff management basic
✓ Import wizard (CSV)
✓ Config panel (BusinessModelConfiguration)
✓ Routing setup (/school, /school/students, /school/staff, etc)
```

### ❌ Qué Falta:

#### 1. **Dashboard KPIs Funcionales**
**Componente:** `src/components/SchoolAdminView.tsx`

Hoy: Card placeholders

Necesita:
```
┌─────────────────────────────────────────────────┐
│ 450 Estudiantes │ $1,245M Wallet │ 3,412 Txns  │
│ 87% Activos    │ 2 POS Operando │ $142 Prom   │
└─────────────────────────────────────────────────┘

Gráficos:
- Ventas diarias (línea)
- Top productos (barras)
- Categoría breakdown (pie)
- Histograma: # estudiantes por rango gasto
```

**Data Source:**
```sql
SELECT 
  s.school_id,
  COUNT(DISTINCT st.id) as active_students,
  SUM(wr.total_points) as total_wallet,
  COUNT(pt.id) as transactions_today,
  AVG(pt.amount) as avg_transaction
FROM schools s
LEFT JOIN students st ON s.id = st.school_id
LEFT JOIN wallet_transactions wt ON st.id = wt.student_id
GROUP BY s.school_id
```

---

#### 2. **Student Management - Transactional**
**Componente:** `src/components/StudentManagementView.tsx`

Hoy: Mock data list

Necesita:

**a) Listar Estudiantes (Con Balance Real)**
```
┌─ Nombre  ┬─ Email ┬─ Saldo ┬─ Puntos ┬─ Tier ┬─ Activo ─┐
│ Juan C.  │ ju@... │ $245.50│ 2,450  │ GOLD  │ Sí       │
│ Maria L. │ ma@... │ $18.20 │  180   │ BRONZE│ Sí       │
└──────────────────────────────────────────────────────────┘

Con búsqueda + filtros:
- Por nombre/email
- Por tier
- Por rango saldo
- Por estado (ACTIVE | SUSPENDED)
```

**b) Cargar Saldo (Manual)**
```
Modal:
┌───────────────────────────────────┐
│ Recargar Saldo                    │
├───────────────────────────────────┤
│ Estudiante: [Juan Carlos López]   │
│ Saldo actual: $245.50             │
│ Monto a cargar: [___________]     │
│ Método: ◉ Administrativo          │
│         ◉ Depósito papá           │
│                                   │
│ [Cancelar] [Confirmar]            │
└───────────────────────────────────┘

Backend:
- Crear wallet_transaction (DEPOSIT)
- Usar paymentService.createDeposit()
- Log en audit trail
```

**c) Ver Transacciones**
```
Tabla filtrable:
┌─ Fecha ┬─ Hora ┬─ Descripción ┬─ Monto ┬─ Saldo ─┐
│ 2026-02-10 │ 12:45 │ Comida Cafetera │ -$45.50 │ $245.50 │
│ 2026-02-08 │ 14:20 │ Papelería      │ -$120   │ $291.00  │
└────────────────────────────────────────────────────┘
```

**d) Restrict Estudiante**
```
Opciones:
- SUSPEND: No puede comprar (pero ve saldo)
- BLOCK: No puede acceder
- RESTRICT_CATEGORY: Solo papelería (no comida)
- SET_TIME_RESTRICTION: Ej: Solo compra 12-13

Modal con:
- Tipo restricción
- Razón (ej: "Excedió límite diario")
- Fecha inicio/fin
```

---

#### 3. **Inventario en Tiempo Real**
**Componente:** NEW - `src/components/SchoolInventoryView.tsx`

NO EXISTE. Necesita:

```
┌─ Producto ┬─ Stock ┬─ Min ┬─ Precio ┬─ Movimientos Hoy ─┐
│ Sandwich  │  45    │  10  │ $45     │ -23 (50%)         │
│ Ensalada  │  12    │  15  │ $30     │ -8 (66%)          │
│ Café      │  2     │  20  │ $12     │ ALERTA: ↓↓↓       │
└────────────────────────────────────────────────────────┘

Acciones:
- Click en producto → ver detalles + histórico
- Botón "Reconfigurar Stock" → editar min/máx
- Alertas automáticas: Stock bajo, agotado, etc
```

**Data Source:**
```sql
SELECT 
  ip.product_id,
  ip.name,
  im.current_quantity as stock,
  ip.minimum_quantity as min,
  ip.price,
  COUNT(CASE WHEN im.movement_type = 'SALE' 
        AND im.created_at > NOW() - INTERVAL '1 day' 
        THEN 1 END) as sales_today
FROM inventory_products ip
LEFT JOIN inventory_movements im ON ip.id = im.product_id
WHERE ip.school_id = $1
GROUP BY ip.id
ORDER BY im.current_quantity ASC
```

---

#### 4. **Staff Management - Permisos Granulares**
**Componente:** `src/components/SmartStaffManager.tsx`

Hoy: Lista mock

Necesita:

**a) Asignaciones por POS Terminal**
```
┌─ Nombre ┬─ Rol ┬─ POS Terminal ┬─ Horario ┬─ Status ─┐
│ Rosa G. │ CAFE │ POS-001       │ 7:30-18h │ ONLINE   │
│ Luis M. │ CAFE │ POS-001,POS-2 │ 7:30-14h │ OFFLINE  │
└────────────────────────────────────────────────────────┘
```

**b) Permisos por Rol**
```
CAFETERIA_STAFF:
✓ Ver menú del día
✓ Procesar ventas (POS)
✓ Ver saldos estudiantes
✗ Crear nuevas categorías
✗ Acceder a datos de ventas

SCHOOL_FINANCE:
✓ Ver reporte de ventas
✓ Generar settlement
✓ Ver comisión acumulada
✗ Modificar precios (solo admin)
✗ Acceder a datos de estudiantes
```

**c) Timesheet / Asistencia**
```
Log de entrada/salida:
- Check-in: QR / huella
- Check-out: automático o manual
- Reportes: horas trabajadas, ausentismo

Analytics:
- Staff más tiempo (horas)
- Staff con mejores ventas (correlación)
- Rotación high-velocity
```

---

#### 5. **Onboarding & Setup Wizard**
**Componente:** NEW - `src/components/SchoolOnboardingWizard.tsx`

NO COMPLETAMENTE IMPLEMENTADO

Debe incluir:
```
Step 1: Setup Básico
- Nombre escuela ✓ (existe)
- Logo/Banner
- Contacto

Step 2: Configurar POS
- Cuántas terminales necesita?
- Ubicaciones (ej: Cafetería 1, Cafetería 2, Papelería)
- Asignar staff

Step 3: Importar Estudiantes ✓ (existe)
- CSV upload
- Validaciones

Step 4: Configurar Productos
- Menú del día
- Precios
- Restricciones (ej: no dulces)
- Horarios

Step 5: Rewards Setup ✓ (existe en admin)
- Habilitar/deshabilitar
- Porcentaje markup
- Tiers

Step 6: Completado
- Links a dashboards
- Guía rápida (PDF)
```

---

#### 6. **Integration con Rewards**
**Status:** PENDIENTE

Escuela necesita:

**a) Ver Configuración**
```
Mostrar en dashboard:
- Rewards habilitado: SI
- Markup: 10%
- Puntos/peso: 10
- Próximo cycle: 2026-08-01
```

**b) Reward Tiers por Escuela**
```
Tabla:
┌─ Tier ┬─ Puntos Mín ┬─ Bonus ┬─ Descripción ─┐
│ BRONZE│ 0           │ 0%     │ Sin bonus     │
│ SILVER│ 1,000       │ 5%     │ +5% puntos    │
│ GOLD  │ 3,000       │ 10%    │ +10% puntos   │
└───────────────────────────────────────────────┘

Opción: "Editar Tiers" → Super Admin only
```

**c) Marketplace Visibility**
```
Mostrar:
- Productos disponibles en su escuela
- Estadísticas de canjes
- Top 5 productos canjeados

Reporting:
- X estudiantes con puntos expirando en 30 días
- Notificar a estudiantes
```

---

### 📋 Checklist Escuelas

**MVP (Esta semana)**
- [ ] Dashboard KPIs reales (query Supabase)
- [ ] Student list con saldos reales
- [ ] Manual balance recharge
- [ ] Mejorar Student restricciones UI

**Fase 2**
- [ ] Inventario en tiempo real
- [ ] Staff con permisos granulares
- [ ] Onboarding wizard mejorado
- [ ] Integración Rewards vista

**Fase 3**
- [ ] Advanced analytics (predictive)
- [ ] Automaciones (alertas, notificaciones)
- [ ] API para terceros (catering, etc)

---

## 🔄 FLUJO INTEGRADO: POS → REWARDS → ADMIN

```
┌─────────────────────────────────────────────────────────────┐
│                    ALUMNO EN POS                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Escanea QR/ID                                            │
│ 2. Selecciona productos (Sandwich $45, Café $12)           │
│ 3. Total: $57                                              │
│ 4. Click "Confirmar Compra"                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND PROCESSING                             │
├─────────────────────────────────────────────────────────────┤
│ 1. paymentService.processTransaction()                     │
│    → Deduce $57 del wallet                                 │
│                                                             │
│ 2. rewardsService.calculatePointsFromPurchase()            │
│    Config: markup=10%, points_per_peso=10                  │
│    Markup amount = $57 × 10% = $5.70                       │
│    Points earned = $5.70 × 10 = 57 puntos                  │
│                                                             │
│ 3. rewardsService.addPoints(studentId, 57, 'EARN')         │
│    → INSERT points_transactions                            │
│    → UPDATE student_rewards_points                         │
│    → CHECK tier upgrade (Bronze → Silver?)                 │
│                                                             │
│ 4. inventoryService.decrementStock()                       │
│    → Sandwich: 45 → 44 (stock: 45-1)                       │
│    → Café: 20 → 19 (stock: 20-1)                           │
│                                                             │
│ 5. Notificaciones:                                         │
│    → Padre recibe email de compra                          │
│    → Estudiante ve notificación de puntos                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│            ESCUELA ADMIN VE EN DASHBOARD                    │
├─────────────────────────────────────────────────────────────┤
│ - Nueva transacción en timeline                            │
│ - Inventario actualizado (Sandwich: 44/50)                │
│ - Volumen del día: +$57                                    │
│ - Estudiante: +57 puntos (Bronze → Silver?) ✨             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│         SUPER ADMIN VE EN PLATFORM ANALYTICS               │
├─────────────────────────────────────────────────────────────┤
│ - 1 transacción más (Total diario: 3,413)                  │
│ - Volumen: +$57 (Total diario: $485,377)                  │
│ - Promedio ticket: $142.47 (actualizado)                   │
│ - Categoría: Comida +$57 (ahora 40.2%)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│        CADA NOCHE: SETTLEMENT JOB (AUTOMÁTICO)             │
├─────────────────────────────────────────────────────────────┤
│ - Sumar todas las transacciones del día                    │
│ - Calcular: Comisión MeCard (15%)                          │
│ - Crear transferencia SPEI a banco escuela                 │
│ - Email: Confirmación liquidación a admin                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│      FIN DE CICLO (30 Junio 2026): PUNTO EXPIRA           │
├─────────────────────────────────────────────────────────────┤
│ - Batch job: Expirar puntos remanentes                     │
│ - Email a estudiantes: "57 puntos expirados"               │
│ - Reset: Nuevo ciclo agosto 2026                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 TABLA DE PRIORIDADES

| Componente | Criticidad | Dificultad | Estimado | Bloqueador |
|-----------|-----------|-----------|----------|-----------|
| **POS ↔ Rewards** | 🔴 CRÍTICO | 🟡 Media | 4h | SÍ - Sin esto Rewards está muerto |
| **School Dashboard KPIs** | 🔴 CRÍTICO | 🟡 Media | 6h | SÍ - Admin sin datos |
| **Inventario Real-time** | 🟠 Alto | 🟢 Bajo | 3h | SÍ - Sin esto oversell |
| **Settlement Generator** | 🟠 Alto | 🔴 Alto | 8h | Limitado - Manual funciona |
| **Student CRUD** | 🟠 Alto | 🟢 Bajo | 4h | No - Mock funciona |
| **Staff Permissions** | 🟡 Medio | 🟡 Media | 5h | No - Funciona sin |
| **Real-time Analytics** | 🟡 Medio | 🔴 Alto | 10h | No - Polling funciona |

---

## 🚀 ROADMAP 4 SEMANAS

### **Semana 1 (Feb 12-16): Foundation**
- ✅ Commits hechos (3 commits)
- ✅ SQL Schema (SUPABASE_SCHEMA.sql)
- [ ] **POS ↔ Rewards integration** (4h)
- [ ] **School Dashboard KPIs** (6h)
- **Entregable:** POS genera puntos, Escuela ve métricas reales

---

### **Semana 2 (Feb 19-23): Operaciones**
- [ ] Inventario real-time (3h)
- [ ] Student CRUD completo (4h)
- [ ] Manual balance recharge (2h)
- [ ] Email receipts (3h)
- **Entregable:** Flujo completo POS → Escuela funcional

---

### **Semana 3 (Feb 26-Mar 2): Management**
- [ ] Settlement generator (8h)
- [ ] Reports export (4h)
- [ ] Staff permissions (5h)
- [ ] Rewards tier analytics (3h)
- **Entregable:** Super Admin puede liquidar, generar reportes

---

### **Semana 4 (Mar 5-9): Optimización**
- [ ] Real-time monitoring (socket.io) (6h)
- [ ] Advanced analytics (Supabase queries) (4h)
- [ ] Performance tuning (2h)
- [ ] Testing & hardening (8h)
- **Entregable:** Plataforma lista para producción

---

## 🔐 Consideraciones de Seguridad

### POS:
```
✓ Validar que usuario sea PosOperator antes de procesar
✓ Encriptar student IDs en URLs
✓ Rate limit: 10 transacciones/minuto por POS
✓ Audit log: Quién, qué, cuándo en cada compra
```

### Super Admin:
```
✓ Solo SUPER_ADMIN puede ver/editar schools
✓ Crear liquidaciones requiere 2FA
✓ Registro: Quién generó settlement, cuándo
✓ Validar CLABE antes de SPEI
```

### Escuelas:
```
✓ SCHOOL_ADMIN solo ve SU escuela (enforced en RLS)
✓ No puede editar precios (solo Super Admin)
✓ No puede ver datos de OTRA escuela
✓ Cambios auditados (audit_logs table)
```

---

## 📞 Contactos & Documentación

| Recurso | Link |
|---------|------|
| Tipos | [src/types.ts](src/types.ts) |
| SQL Schema | [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) |
| POS Code | [src/components/PosView.tsx](src/components/PosView.tsx) |
| Rewards | [src/services/rewardsService.ts](src/services/rewardsService.ts) |
| Planning | [PLAN_SCHOOL_SUPERADMIN.md](PLAN_SCHOOL_SUPERADMIN.md) |

---

**Fecha Actualización:** 2026-02-12  
**Responsable:** AI Agent  
**Próxima Revisión:** 2026-02-19

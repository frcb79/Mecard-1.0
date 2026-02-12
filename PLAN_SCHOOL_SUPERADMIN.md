# Plan: Funcionalidades Escuela y Super Admin
**Fecha:** Febrero 12, 2026  
**Estado:** Planificación inicial completada (Pasos 1-3)

---

## 📋 Vista General

Después de consolidar el routing y crear las pantallas base (Pasos 1-3), necesitamos:

1. **ESCUELA (School Admin)** - 5 módulos principales  
2. **SUPER ADMIN (Corporativo)** - 4 módulos principales
3. **Integración de Transacciones Simuladas** - Todo funciona con MockPaymentService

---

## 🏫 PLAN: FUNCIONALIDADES DE ESCUELA (School Admin)

### Rol: `SCHOOL_ADMIN`
**Rutas:** `/school`, `/school/students`, `/school/staff`, `/school/import`, `/school/config`  
**Dashboard:** SchoolAdminView

### **Módulo 1: Dashboard Escolar** (`SchoolAdminView`)
**Propósito:** Visibilidad global del negocio de la escuela

#### Métricas principales (KPIs):
- **Total Estudiantes Activos** - Count from MOCK_STUDENTS
- **Saldo Total en Wallets** - Sum de MockPaymentService balances
- **Transacciones Hoy** - Count filtrado por fecha actual
- **Ingresos Este Mes** - Sum de depósitos (MockPaymentService)
- **Comisiones Generadas** - Basado en % de settlement

#### Gráficos:
- Línea: Ventas diarias últimos 30 días (Mock data)
- Barras: Top 5 productos más vendidos
- Pie: Distribución por categoría (Comidas, Papelería, etc)

#### Componentes a mejorar/crear:
```tsx
interface SchoolMetrics {
  totalStudents: number;
  totalWalletBalance: number;
  transactionsToday: number;
  monthlyRevenue: number;
  commissionsGenerated: number;
  averageTransaction: number;
}
```

**Integración con Mock:**
```typescript
// Usar MockPaymentService para:
- getBalance(studentId) → balance actual
- getTransactions(filter: date) → transacciones del día
- getAllTransactions() → para cálculo de ingresos
```

---

### **Módulo 2: Gestión de Estudiantes** (`StudentManagementView`) ✅
**Estado:** Ya existe, necesita validación de integración con MockPaymentService

#### Funcionalidades:
1. **CRUD Estudiante:**
   - ✅ CREATE: Modal con campos (nombre, email, CURP, teléfono)
   - ✅ READ: Tabla con búsqueda y filtros
   - ✅ UPDATE: Editar datos directamente o en modal
   - ✅ DELETE: Eliminar con confirmación

2. **Saldos y Transacciones:**
   - Ver saldo actual del estudiante (desde MockPaymentService)
   - Historial de transacciones recientes
   - Opción de "Recargar Manual" (simula depósito papá)

3. **Estados:**
   - ACTIVE (verde)
   - INACTIVE (gris)
   - SUSPENDED (rojo)

#### Datos iniciales (MOCK):
```typescript
[
  {
    id: 'STD-001',
    name: 'Juan Carlos López',
    email: 'juan@escuela.mx',
    balance: 1200.50,
    status: 'ACTIVE',
    curp: 'LOJC980415HDFRNN09',
    createdAt: '2026-01-15'
  },
  // ... más estudiantes
]
```

**Integración con Mock:**
- Al crear estudiante → crear registro inicial en MockPaymentService
- Ver balance → llamar getBalance(studentId)
- Transacciones → getTransactionHistory(studentId)

---

### **Módulo 3: Gestión de Personal** (`SmartStaffManager`) ✅
**Estado:** Necesita mejor integración con roles

#### Funcionalidades:
1. **Tipos de Personal:**
   - CAFETERIA_STAFF (operadores POS comida)
   - STATIONERY_STAFF (operadores POS papelería)
   - SCHOOL_FINANCE (finanzas)

2. **CRUD Empleado:**
   - Nombre, email, rol, teléfono, estado
   - Permisos por rol
   - Fecha de inicio/fin

3. **Asignación a Unidades POS:**
   - Cada staff puede estar asignado a 1 o más terminals
   - Ver historial de ventas por staff

#### Datos iniciales:
```typescript
[
  {
    id: 'STAFF-001',
    name: 'Rosa García',
    role: 'CAFETERIA_STAFF',
    email: 'rosa@escuela.mx',
    status: 'ACTIVE',
    posList: ['POS-001', 'POS-002'],
    createdAt: '2026-01-01'
  },
  // ...
]
```

---

### **Módulo 4: Importar Estudiantes** (`StudentImportWizard`) ✅
**Estado:** Necesita refinamiento en validación

#### Pasos:
1. **Seleccionar archivo CSV**
   - Headers esperados: `nombre, email, curp, telefono`

2. **Validación**
   - Checksumear registros válidos vs duplicados
   - Mostrar preview de 5 filas

3. **Confirmación**
   - "Importar 47 estudiantes"
   - Crear bulk en MockPaymentService

4. **Resultado**
   - Resumen: X creados, Y errores
   - Opción de descargar log de errores

#### Integración con Mock:
```typescript
// Para cada row en CSV:
mockPaymentService.createStudent({
  name: row.nombre,
  email: row.email,
  curp: row.curp,
  phone: row.telefono,
  schoolId: currentSchool.id
});
```

---

### **Módulo 5: Configuración Escolar** (`BusinessModelConfiguration`)
**Estado:** Ya existe, necesita contexto de Escuela

#### Parámetros configurables:
1. **Datos Básicos:**
   - Nombre de escuela
   - Logo/Banner
   - Horarios de operación
   - Contacto principal

2. **Politicas de Negocio:**
   - % Comisión a escuela (ej: 5%)
   - Límite de gasto diario por estudiante
   - Comidas permitidas: vegetarianas, carne, etc.
   - Horarios de comedor

3. **Integraciones:**
   - MOCK: Sin integración real
   - Mostrar estado como "Modo Demo"

4. **Avisos Legales:**
   - Términos de uso
   - Política de privacidad

---

## 🔐 PLAN: FUNCIONALIDADES DE SUPER ADMIN

### Rol: `SUPER_ADMIN`
**Rutas:** `/admin`, `/admin/schools`, `/admin/settlement`, `/admin/reports`, `/admin/config`  
**Dashboard:** SuperAdminDashboard

### **Módulo 1: Dashboard Global** (`SuperAdminDashboard`)
**Propósito:** Visibilidad de toda la red MeCard

#### Métricas (KPIs Globales):
```typescript
interface GlobalMetrics {
  totalSchools: number;                    // Count de MOCK_SCHOOLS
  totalStudents: number;                   // Sum de students por escuela
  totalWalletBalance: number;              // Sum de todos los balances
  dailyTransactions: number;               // Count transacciones hoy
  monthlyRevenue: number;                  // Sum depósitos este mes
  averageTransactionValue: number;         // Mean
  activeUnits: number;                     // Unidades POS funcionando
  settlementsPending: number;              // Liquidaciones sin procesar
}
```

#### Gráficos:
```
- Línea: Transacciones globales últimos 30 días
- Mapa/Tabla: Top 10 escuelas por volumen
- Barras: Crecimiento MoM (mes a mes)
- Gauge: Salud del sistema (% uptime simulado)
```

#### Data Sources:
```typescript
// Usar MockServices para construir métricas
const schools = MOCK_SCHOOLS;  // 5-10 escuelas
const allStudents = schools.flatMap(s => s.students);  // Flatten
const allTransactions = mockPaymentService.getAllTransactions();  // Histórico completo
```

---

### **Módulo 2: Gestión de Escuelas** (`SchoolManagement`)
**Estado:** Necesita mejorar para CRUD completo

#### Funcionalidades:
1. **Listar Escuelas:**
   - Tabla con: Nombre, Ciudad, # Estudiantes, # POS, Estado, Ingresos
   - Búsqueda y filtros (ciudad, estado, etc)
   - Ordenamiento por columnas

2. **Crear Escuela:**
   - Modal con: nombre, dirección, ciudad, contacto, email, teléfono
   - Seleccionar tipo de contrato: TRIAL (30\*) o STANDARD (anual)
   - Auto-generar: contract_id, api_key

3. **Ver Detalle:**
   - Card con info completa
   - KPIs específicos de la escuela
   - Histórico de transacciones
   - Configuración especial (comisiones, límites, etc)

4. **Editar Escuela:**
   - Actualizar datos básicos
   - Cambiar estado: ACTIVE → SUSPENDED → CANCELLED
   - Cambiar % comisión

5. **Eliminar:**
   - Soft delete (cambiar estado a CANCELLED)
   - No eliminar data histórica

#### Datos Iniciales:
```typescript
MOCK_SCHOOLS = [
  {
    id: 'SCHL-001',
    name: 'Escuela Primaria Federal',
    address: 'Av. Paseo de la Reforma 505',
    city: 'CDMX',
    contact: 'Lic. María López',
    email: 'directora@primaria.mx',
    phone: '5551234567',
    students: 450,
    units: 3,
    commission: 0.05,  // 5%
    status: 'ACTIVE',
    contractType: 'STANDARD',
    revenue: 125000,
    createdAt: '2026-01-01'
  },
  // ... más escuelas
]
```

---

### **Módulo 3: Liquidaciones (Settlement)** (`SettlementsView`) ✅
**Estado:** Existe pero necesita validación completa

#### Propósito:
Distribuir automáticamente los ingresos de transacciones a las escuelas/unidades

#### Flujo:
1. **Generar Settlement:**
   - Por período (semanal, quincenal, mensual)
   - Agrupar transacciones de fecha_inicio a fecha_fin
   - Calcular por escuela y unidad

2. **Cálculo:**
   ```
   Para cada escuela:
     Total_Ingresos = sum(transacciones)
     Comisión_MeCard = Total_Ingresos * 0.15  (15% fijo)
     Monto_a_Liquidar = Total_Ingresos - Comisión_MeCard
   ```

3. **Status de Disbursement:**
   - PENDING: Creado, esperando procesamiento
   - PROCESSING: En espera de SPEI
   - COMPLETED: Transferencia exitosa
   - FAILED: Error en transferencia

4. **Métodos de Pago (Simulados):**
   - SPEI (transferencia bancaria)
   - Cheque (PDF generado)
   - Depósito en cuenta (sin integración real)

#### Integration con Mock:
```typescript
const settlement = await mockSettlementService.generateSettlement({
  periodStart: '2026-02-01',
  periodEnd: '2026-02-28',
  scope: 'all_schools'  // o school_id específica
});

// Retorna:
{
  id: 'SETL-001',
  status: 'pending',
  disbursements: [
    {
      recipientId: 'SCHL-001',
      amount: 42500,
      speiReference: 'CVE123456789...'
    }
  ]
}
```

---

### **Módulo 4: Reportes Globales** (`ReportsView`) ✅
**Estado:** Existe, puede ser reutilizado

#### Tipos de Reportes:
1. **Ventas:**
   - Por escuela, por período
   - Top productos
   - Tendencias

2. **Transacciones:**
   - Por categoría (comidas, papelería, etc)
   - Por estudiante (anonimizado)
   - Por unidad POS

3. **Inventario:**
   - Stock por unidad
   - Productos agotados
   - Rotación

4. **Financiero:**
   - Ingresos vs gastos
   - Comisiones pagadas
   - Saldos pendientes

#### Exportar:
- CSV (datos tabulares)
- PDF (con gráficos)
- Excel (fórmulas)

---

## 🔗 INTEGRACIÓN DE TRANSACCIONES SIMULADAS

### MockPaymentService - Métodos Clave:
```typescript
// En todos los módulos, usar:

// 1. Obtener saldo
balance = await paymentService.getBalance(studentId);

// 2. Obtener transacciones
transactions = await paymentService.getTransactionHistory(studentId);

// 3. Procesar compra (POS)
result = await paymentService.processTransaction({
  studentId,
  amount,
  items: [{productId, quantity}],
  unitId,
  paymentMethod: 'CREDENTIAL_QR'
});

// 4. Procesar depósito (Papá)
deposit = await paymentService.createDeposit({
  parentId,
  studentId,
  amount,
  paymentMethod: 'SPEI'  // o 'CARD', 'CASH'
});

// 5. Generar liquidación
settlement = await settlementService.generateSettlement({
  periodStart,
  periodEnd,
  scope: 'all' | schoolId
});
```

### Persistencia:
```
TodoMock → localStorage
Keys:
- mecard_transactions (histórico)
- mecard_balances (saldos actuales)
- mecard_settlements (liquidaciones)
- mecard_inventory (stock)
```

---

## 📅 ROADMAP RECOMENDADO

### **Fase 1: Core (Esta semana)**
- ✅ Pasos 1-3 completados
- Dashboard Escuela (mejorar KPIs)
- Dashboard Super Admin (mejorar KPIs)

### **Fase 2: Ejecución (Semana 2)**
- Gestión de Escuelas (CRUD)
- Gestión de Estudiantes (validar transacciones)
- Reportes básicos

### **Fase 3: Refinamiento (Semana 3)**
- Settlement automático
- Importa masiva de estudiantes
- Auditoría y compliance

### **Fase 4: Pulido (Semana 4)**
- Pruebas end-to-end
- Optimización de performance
- Documentación final

---

## ✅ CHECKLIST DE VALIDACIÓN

### Escuela debe tener:
- [ ] Dashboard con mínimo 5 KPIs
- [ ] CRUD de estudiantes funcional
- [ ] Importador CSV validado
- [ ] Gestión de staff básica
- [ ] Configuración editable
- [ ] Todas las transacciones usa MockPaymentService

### Super Admin debe tener:
- [ ] Dashboard global con 6+ KPIs
- [ ] CRUD de escuelas funcional
- [ ] Settlement generador automático
- [ ] Reportes exportables (CSV, PDF)
- [ ] Auditoría de liquidaciones
- [ ] Todas las transacciones vía MockServices

---

## 🎯 Próximos Pasos

1. **Fase 1 - Esta sesión:**
   - Mejorar KPIs en dashboards
   - Validar MockPaymentService integration

2. **Fase 2 - Sesiones siguientes:**
   - CRUD completo de escuelas
   - Settlement automático
   - Reportes avanzados

3. **Conectar Backend (futuro):**
   - Reemplazar MockPaymentService → STP/CLABE real
   - Reemplazar localStorage → Supabase
   - Agregar Auth real (Supabase Auth)

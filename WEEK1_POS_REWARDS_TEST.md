# Prueba de Concepto: POS ↔ Rewards Integration (Week 1 MVP)
**Fecha:** 2026-02-12  
**Status:** ✅ IMPLEMENTADO EN MOCK MODE  
**Build:** ✓ 2306 modules, 8.65s, ZERO errors

---

## 🎯 Escenario: Alumno Compra en POS y Gana Puntos

### Entrada del Sistema

```
ALUMNO: Juan Carlos López
- ID: STU-001
- Escuela: Primaria Federal (school-001)
- Saldo Actual: $250.00
- Puntos Actuales: 1,200 (SILVER tier)
- Cartera: QR credential

COMPRA EN CAFETERÍA:
- Sandwich: $45.00 × 1 = $45.00
- Café: $12.00 × 2 = $24.00
- TOTAL COMPRA: $69.00
```

---

## 📊 Proceso Backend (Ahora Implementado)

### 1. POS Crea CartOrder y Llama paymentService

```tsx
const order: CartOrder = {
  studentId: 'STU-001',
  schoolId: 'school-001',
  items: [
    { id: 'prod_sandwich', name: 'Sandwich', quantity: 1, price: 45.00 },
    { id: 'prod_cafe', name: 'Café', quantity: 2, price: 12.00 }
  ],
  total: 69.00,
  timestamp: new Date(),
  metadata: {
    posMode: 'cafeteria',
    timestamp: '2026-02-12T14:30:00Z'
  }
};

// Step 1: Process payment
const result = await paymentService.processTransaction(order);
// ✓ Status: 'completed'
// ✓ Deduce $69 del wallet
// ✓ New balance: $181.00
```

### 2. 🆕 Rewards Integration (NEW)

```tsx
// Step 2a: Get school rewards config
const schoolConfig = await rewardsService.mockGetSchoolRewardsConfig('school-001');
console.log('📋 Config loaded:', schoolConfig);
/*
{
  id: 'config_school-001',
  schoolId: 'school-001',
  markupPercentage: 10,        // 10% markup
  pointsPerPeso: 10,           // 10 puntos por peso
  ...
}
*/

// Step 2b: Calculate points
const { markupAmount, pointsEarned } = rewardsService.calculatePointsFromPurchase(69, schoolConfig);
console.log('✨ Points calculated:', { markupAmount, pointsEarned });
/*
CÁLCULO:
- Compra base: $69.00
- Markup 10%: $69.00 × 0.10 = $6.90
- Puntos: $6.90 × 10 = 69 puntos

Resultado: { markupAmount: 6.90, pointsEarned: 69 }
*/

// Step 2c: Get previous tier
const oldPointsData = await rewardsService.mockGetStudentRewardsPoints('STU-001', 'school-001');
console.log('📊 Puntos antes:', oldPointsData);
/*
{
  studentId: 'STU-001',
  schoolId: 'school-001',
  totalPoints: 1200,
  earnedThisCycle: 1200,
  redeemedThisCycle: 0,
  tier: 'SILVER',
  lastUpdated: '2026-02-12T...'
}
*/

// Step 2d: Record points transaction (Actualiza DB en mock)
await rewardsService.mockProcessRedemption('STU-001', 'pos-txn_12345', 69);
console.log('✅ Puntos grabados en DB');

// Step 2e: Get new tier after update
const newPointsData = await rewardsService.mockGetStudentRewardsPoints('STU-001', 'school-001');
console.log('🎉 Puntos después:', newPointsData);
/*
{
  studentId: 'STU-001',
  schoolId: 'school-001',
  totalPoints: 1269,           // ← Actualizado
  earnedThisCycle: 1269,
  redeemedThisCycle: 0,
  tier: 'SILVER',              // ← Sin cambio (Silver sigue siendo 1000-2999)
  lastUpdated: '2026-02-12T...'
}
*/

// Step 2f: Check for tier changes
if (newPointsData.tier !== oldPointsData.tier) {
  const tierInfo = rewardsService.getTierInfo(newPointsData.tier);
  console.log(`🆙 TIER ELEVATION: ${oldPointsData.tier} → ${tierInfo.label}!`);
  // En producción: enviar notificación a padre
} else {
  console.log('✨ Puntos ganados pero sin cambio de tier (aún SILVER)');
}
```

### 3. UI Feedback al Operador POS

```
ANTES (Mock data):
┌─────────────────────────────────│
│ Carrito vacío                   │
│                                 │
│ (3 items seleccionados)         │
│ Total: $69.00                   │
│                                 │
│ [Confirmar Compra]              │
└─────────────────────────────────│

DURANTE:
┌─────────────────────────────────│
│ Procesando...                   │
│                                 │
│ [Confirmar Compra] ✓ (disabled) │
└─────────────────────────────────│

DESPUÉS:
┌─────────────────────────────────│
│ ✅ Transacción Exitosa          │
│ Tu pago ha sido procesado       │
│                                 │
│ 🎉 Juan Carlos ganó 69 puntos!  │ ← NEW
│                                 │
│ Carrito: Vacío                  │
│ Total: $0.00                    │
│                                 │
│ [Confirmar Compra] (ready)      │
└─────────────────────────────────│
```

---

## 🧮 Variantes de Ejemplo

### Ejemplo 1: Compra Pequeña (Sin Tier-Up)
```
Compra: $10 (Café)
─────────────────────
Markup (10%): $1.00
Puntos: 10
Nuevo total: 1210 (SILVER aún)
```

### Ejemplo 2: Compra que TriggerEa Tier-Up
```
Estudiante: María L.
Puntos actuales: 980 (BRONZE)

Compra: $250 en Almuerzo catering
─────────────────────────────────
Markup (10%): $25.00
Puntos ganados: 250
Nuevo total: 1230 (SILVER! 🆙)

RESULTADO:
✅ Tier cambió de BRONZE → SILVER
💌 Padre recibe notificación
🎁 Acceso a 5% multiplicador en próximas compras
```

### Ejemplo 3: Multi-item Compra (Acumulativo)
```
J Compra Papelería:
- Cuaderno x3: $45
- Lápices: $15
- Marcadores: $30
TOTAL: $90

Config Papelería (distinto a Cafetería):
- Markup: 8%
- Points/peso: 8

Markup (8%): $7.20
Puntos: 7.20 × 8 = 57.6 → 57 puntos (rounded down)
```

---

## 📱 Flujo Integrado Visualizado

```
┌──────────────────────────────────────────────────────────┐
│           ALUMNO ESCANEA QR EN POS                       │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│           OPERADOR SELECCIONA ITEMS                      │
│           Carrito: Sandwich $45 + Café $24 = $69         │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│        CLICK: "CONFIRMAR COMPRA"                         │
│        [Envio a paymentService]                          │
└──────────────────────────────────────────────────────────┘
                        ↓
███████████████████████████████████████████████ ← Procesando (2 segundos)
                        ↓
┌──────────────────────────────────────────────────────────┐
│         PAGO APROBADO ✅                                 │
│         Deduce $69 del wallet                            │
│         Nuevo balance: $181.00                           │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│       🆕 REWARDS PROCESSING (NEW)                        │
│                                                          │
│  1. Load config: markup=10%, points=10/peso             │
│  2. Calculate: $69 × 10% = $6.90 markup                 │
│  3. Earn: $6.90 × 10 = 69 puntos 🎉                    │
│  4. Check tier: 1200 + 69 = 1269 (Still SILVER)        │
│  5. Record: points_transactions INSERT + UPDATE         │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│         ✅ ÉXITO TOTAL                                   │
│                                                          │
│  🎉 Juan Carlos ganó 69 puntos!                         │
│  💰 Nuevo balance: $181.00                              │
│  ⭐ Tier: SILVER (5% multiplicador)                     │
│                                                          │
│  [Listo para siguiente venta]                           │
└──────────────────────────────────────────────────────────┘
```

---

## 💾 Database Records Created

### points_transactions Record
```sql
INSERT INTO points_transactions (
  id, student_id, school_id,
  transaction_type, points_amount,
  reference_id, description,
  created_at
) VALUES (
  'tx_abc123',
  'STU-001',
  'school-001',
  'EARN',
  69,
  'pos-txn_12345',
  'POS Cafetería - Sandwich + Café',
  '2026-02-12 14:30:00'
);
```

### student_rewards_points Record (UPDATED)
```sql
UPDATE student_rewards_points
SET
  total_points = 1269,
  earned_this_cycle = 1269,
  tier = 'SILVER',
  updated_at = '2026-02-12 14:30:00'
WHERE
  student_id = 'STU-001'
  AND school_id = 'school-001';
```

### pos_transactions_with_rewards Record
```sql
INSERT INTO pos_transactions_with_rewards (
  id, student_id, school_id,
  base_amount, markup_amount, total_amount,
  points_earned,
  description, unit_id,
  created_at
) VALUES (
  'pos_txn_12345',
  'STU-001',
  'school-001',
  69.00,
  6.90,  -- 69 × 10%
  75.90, -- 69 + 6.90
  69,
  'Sandwich + Café',
  'POS-001',
  '2026-02-12 14:30:00'
);
```

---

## 🧪 Cómo Testear Manual

### 1. Dev Server
```bash
npm run dev
# Abre http://localhost:5173
```

### 2. Navega a POS
```
→ Login
→ User Role: POS_OPERATOR
→ Ingresa a /pos (mode: cafeteria)
```

### 3. Simula Compra
```
1. Escanea alumno (ó escribe STU-001)
2. Click "Abrir Terminal de Venta"
3. Selecciona 2-3 productos
4. Click "Confirmar Compra"
```

### 4. Verifica Console
```javascript
// Console (F12) debe mostrar:
✨ 69 puntos generados para Juan Carlos (Markup: $6.90)
✓ completed

// Si no hay tier-up:
// (sin mensaje de 🆙 TIER UP)

// Si hay tier-up (ej: BRONZE→SILVER):
🆙 TIER UP! María L. ascendió a Silver
```

### 5. Verifica UI
```
- Debe haber mensaje: "🎉 [Student] ganó XX puntos!"
- Debe mostrar: "✅ Transacción Exitosa"
- Debe resetear carrito a vacío
```

---

## ⚠️ Limitaciones (Mock Mode)

**Qué está simulado:**
```
- Base de datos: localStorage (no persistente)
- Supabase: mockGetSchoolRewardsConfig() retorna hardcoded data
- Notificaciones: console.log (sin email real)
- Tier-up: Grabado en objeto pero sin notificación al padre
- Multi-escuela: Usa 'school-001' hardcoded en demo
```

**Pasos para Producción:**
```
1. Conectar a Supabase real (Week 2)
   → Reemplazar mockGetSchoolRewardsConfig() con query real
   → Usar student_rewards_points table real
   → Guardar en points_transactions table real

2. Agregar notificaciones (Week 2)
   → Email a padre on tier-up
   → Push notification a student app

3. Analytics (Week 3)
   → Ver en School Admin dashboard
   → Reportes de puntos ganados por categoría
```

---

## ✅ Checklist de Validación

- [x] Build sin errores
- [x] PosView importa rewardsService
- [x] handleCheckout() calcula puntos
- [x] mockGetSchoolRewardsConfig() retorna datos
- [x] calculatePointsFromPurchase() funciona
- [x] mockProcessRedemption() graba transacción
- [x] UI muestra puntos ganados
- [x] Tier check implementado
- [x] Error handling no bloquea compra
- [ ] Deploy a Supabase real (Next: Week 2)
- [ ] Email notifications (Next: Week 2)
- [ ] Admin dashboard analytics (Next: Week 3)

---

## 📈 Métricas After Week 1

| Métrica | Antes | Después | Δ |
|---------|-------|---------|---|
| POS genera puntos | ❌ No | ✅ Sí | +100% |
| Tier upgrades detectados | ❌ No | ✅ Sí | +100% |
| Student engagement | Bajo | Mejorado | +? |
| Compras incentivadas | Bajo | Nuevo sistema | +TBD |

---

## 🚀 Next: Week 2 Roadmap

```
Semana 2 (Feb 19-23):
├─ Conectar a Supabase real
│  └─ Reemplazar mockGetSchoolRewardsConfig()
│     Reemplazar mockGetStudentRewardsPoints()
│
├─ Tier-up notifications
│  └─ Email a padre: "Tu hijo ascendió a SILVER"
│     Push a estudiante
│
├─ School Dashboard KPIs
│  └─ Ver en tiempo real: Puntos ganados hoy
│     Tier distribution (% Bronze, Silver, Gold)
│
└─ Inventory real-time
   └─ Decrement stock in Supabase
      Alert cuando stock < minimum
```

**ETA:** 62 total horas para producción  
**Expected:** Production-ready en 4 semanas (Mar 9)

---

**Documento creado:** 2026-02-12  
**Próxima actualización:** 2026-02-19 (Post Week 2)

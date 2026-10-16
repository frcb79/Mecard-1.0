# 06. Integraciones, Servicios y Base de Datos de MeCard

> **Fuentes de Evidencia:** [SUPABASE_SCHEMA.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SUPABASE_SCHEMA.sql), [SECURITY_FIXES_PHASE1.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql), `supabase/migrations/`, [src/services/clabeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/clabeService.ts), [src/services/geminiService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/geminiService.ts) y [src/services/factory.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/factory.ts).

---

## 1. Inventario y Catálogo de Base de Datos (52 Tablas)

El ecosistema de MeCard cuenta con **52 tablas diseñadas en PostgreSQL** con integridad referencial, índices y políticas de seguridad RLS:
- **49 tablas** consolidadas en [SUPABASE_SCHEMA.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SUPABASE_SCHEMA.sql).
- **3 tablas operativas adicionales** creadas en la migración `supabase/migrations/20260330_pos_and_cafeteria_tables.sql`.

```
┌────────────────────────────────────────────────────────────────────────┐
│               DISTRIBUCIÓN DE LAS 52 TABLAS DE MECARD                  │
├───────────────────────┬────────────┬───────────────────────────────────┤
│ DOMINIO               │ CANTIDAD   │ TABLAS ESPECÍFICAS                │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Core & Escuela        │ 5 tablas   │ schools, campuses, operating_units│
│                       │            │ user_roles, profiles              │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Alumnos & Familias    │ 4 tablas   │ students, parent_student_links    │
│                       │            │ authorized_contacts, friendships  │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Catálogo & Alimentos  │ 4 tablas   │ categories, products              │
│                       │            │ product_change_history, items     │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ POS & Cafetería (NEW) │ 3 tablas   │ pos_terminals, cafeteria_orders   │
│                       │            │ pos_operations_log                │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Finanzas & Transacc.  │ 7 tablas   │ transactions, wallet_transactions │
│                       │            │ pos_tx_with_rewards, auto_reload  │
│                       │            │ platform_settings, school_settings│
│                       │            │ revenue_tracking                  │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Reembolsos & Settle   │ 5 tablas   │ pool_refunds, pending_school_ref  │
│                       │            │ school_refund_settlements         │
│                       │            │ pool_point_conversions, ledger    │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Facturación a Colegios│ 3 tablas   │ school_billing_config, invoices   │
│                       │            │ school_blocking_rules             │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Lealtad & Marketplace │ 7 tablas   │ school_rewards_config, points_tx  │
│                       │            │ student_rewards_points, mp_products│
│                       │            │ student_redemptions, mp_suggestions│
│                       │            │ parent_rewards_preferences        │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Social & Vaquitas     │ 5 tablas   │ gifts, birthday_pools             │
│                       │            │ pool_contributions, favorites     │
│                       │            │ family_points_topups              │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Permisos & Excursiones│ 7 tablas   │ exit_permissions, approvals       │
│                       │            │ school_permission_config, trips   │
│                       │            │ trip_enrollments, trip_payments   │
│                       │            │ trip_reminders                    │
├───────────────────────┼────────────┼───────────────────────────────────┤
│ Auditoría & Avisos    │ 2 tablas   │ activity_log, notifications       │
└───────────────────────┴────────────┴───────────────────────────────────┘
```

---

## 2. Catálogo de Funciones RPC en Base de Datos (11 Funciones)

Se auditaron y localizaron 11 funciones PL/pgSQL críticas en el repositorio:

| Archivo Fuente | Nombre de la Función RPC | Propósito y Garantías de Seguridad |
|---|---|---|
| `SECURITY_FIXES_PHASE1.sql` | `process_pos_sale_atomic()` | Venta POS atómica con clave de idempotencia y bloqueo `FOR UPDATE` sobre `students.balance`. |
| `SECURITY_FIXES_PHASE1.sql` | `settle_refund_idempotent()` | Liquidación bancaria de reembolsos con verificación de `SUPER_ADMIN` y bloqueo pesimista. |
| `SECURITY_FIXES_PHASE1.sql` | `verify_super_admin(p_user_id)` | Función de seguridad para validar permisos corporativos en procedimientos almacenados. |
| `SECURITY_FIXES_PHASE1.sql` | `verify_school_admin(p_user, p_sch)`| Función de seguridad para validar que el usuario pertenezca a la escuela del registro. |
| `SECURITY_FIXES_PHASE1.sql` | `log_refund_approval()` | Trigger que alimenta la tabla de auditoría financiera ante cualquier cambio de estado. |
| `SUPABASE_SCHEMA.sql` | `update_student_tier()` | Trigger que recalcula automáticamente el tier del alumno (Bronze a Platinum) al acumular puntos. |
| `SUPABASE_SCHEMA.sql` | `record_points_transaction()` | Acreditación o débito seguro de puntos con actualización de balance de puntos. |
| `SUPABASE_SCHEMA.sql` | `decrement_inventory_stock()` | Descuento seguro de inventario evitando existencias negativas (`stock >= 0`). |
| `SUPABASE_SCHEMA.sql` | `handle_new_user()` | Trigger que inserta automáticamente el perfil del usuario al registrarse en `auth.users`. |
| `20260327_admin_ops_rpcs.sql`| `reload_wallet_atomic()` | Recarga atómica de saldo escolar desde el panel de School Admin con registro en auditoría. |
| `20260327_admin_ops_rpcs.sql`| `process_refund_atomic()` | Procedimiento para revertir fondos de una compra errónea en POS devolviendo el saldo al alumno. |

---

## 3. Auditoría de Integraciones Externas

```
┌────────────────────────────────────────────────────────────────────────┐
│                  MATRIZ DE INTEGRACIONES EXTERNAS                      │
├───────────────────┬─────────────┬────────────────┬─────────────────────┤
│ PROVEEDOR / API   │ PROPÓSITO   │ ESTADO REAL    │ EVIDENCIA TÉCNICA   │
├───────────────────┼─────────────┼────────────────┼─────────────────────┤
│ STP (Banxico)     │ Cuentas     │ 🟡 Algoritmo   │ clabeService.ts     │
│                   │ CLABE SPEI  │ Implementado;  │ Valida pesos 3,7,1; │
│                   │             │ API diferida   │ no hay API key real │
├───────────────────┼─────────────┼────────────────┼─────────────────────┤
│ Google Gemini AI  │ Sugerencia  │ 🟢 Operativo   │ geminiService.ts    │
│                   │ POS, dietas │ en cliente;    │ SDK @google/genai   │
│                   │ y analítica │ ⚠️ Key expuesta│ Usa gemini-3-flash  │
├───────────────────┼─────────────┼────────────────┼─────────────────────┤
│ Pasarela Tarjetas │ Depósitos de│ 🔴 En Mock     │ MockPaymentService  │
│ (Stripe/Conekta)  │ padres en   │ (Simulación de │ Aplica 3.5% fee;    │
│                   │ billetera   │ tarjeta 3.5%)  │ sin conexión a API  │
├───────────────────┼─────────────┼────────────────┼─────────────────────┤
│ Torniquetes Físic.│ Asistencia  │ 🔴 En Mock     │ AccessControlService│
│ (Hardware Escolar)│ y accesos   │ (Simulación en │ Diseñado para REST; │
│                   │ torniquete  │ localStorage)  │ requiere webhooks   │
├───────────────────┼─────────────┼────────────────┼─────────────────────┤
│ Vercel Hosting    │ Despliegue  │ 🟢 Conectado   │ .github/deploy.yml  │
│                   │ Frontend    │ y desplegado   │ Automático en push  │
└───────────────────┴─────────────┴────────────────┴─────────────────────┘
```

### A. STP (Sistema de Transferencias y Pagos) — Emisión de Cuentas CLABE
- **Estado Técnico:** El servicio [clabeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/clabeService.ts) implementa el algoritmo matemático oficial de Banxico con ponderaciones `[3, 7, 1]`, banco STP `646`, plaza CDMX `180`, prefijo MeCard `0000`, centro de costos del colegio (3 dígitos) y secuencia del alumno (4 dígitos).
- **Vacío Identificado:** La generación de las CLABEs es correcta y reproducible, pero las cuentas no reciben fondos bancarios reales porque aún no se ha firmado el contrato con STP para abrir la cuenta concentradora y registrar el *webhook* de recepción SPEI en producción.

### B. Google Gemini AI — Inteligencia Artificial Integrada
- **Estado Técnico:** El archivo [geminiService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/geminiService.ts) utiliza el SDK `@google/genai` (versión 1.3.0). Dispone de 9 funciones especializadas: venta sugerida en POS, análisis semanal de ventas, coach de nutrición escolar, retos gamificados y auditoría estratégica con razonamiento extendido (`gemini-3-pro-preview` con *thinking budget* de 32,768 tokens).
- **Riesgo Crítico de Seguridad:** El cliente instancia `new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })` directamente en el navegador del usuario. Cualquier usuario o atacante puede abrir la consola de desarrollador, inspeccionar las variables de entorno de Vite y extraer la API Key de Gemini.

### C. Pasarelas de Pago Bancarias (Stripe, Conekta, MercadoPago)
- **Estado Técnico:** El flujo financiero de cobro a tarjetas está modelado en [BillingService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/BillingService.ts) y [MockPaymentService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/MockPaymentService.ts). Calcula comisiones del 3.5% para tarjetas y valida montos positivos.
- **Vacío Identificado:** No existe ningún SDK de Stripe (`stripe-js`), Conekta o Clip instalado en `package.json`. No se ha iniciado el proceso de cumplimiento PCI-DSS para el manejo de tarjetas.

### D. Hardware Escolar y Torniquetes de Acceso
- **Estado Técnico:** [AccessControlService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/AccessControlService.ts) tiene definida la arquitectura para registrar eventos de entrada y salida, vincular lectores NFC o códigos de barras y gestionar webhooks.
- **Vacío Identificado:** Opera actualmente sobre `localStorage` (`mecard_access_points`). Falta implementar el endpoint receptor en backend que procese los eventos HTTP enviados por los controladores de los torniquetes.

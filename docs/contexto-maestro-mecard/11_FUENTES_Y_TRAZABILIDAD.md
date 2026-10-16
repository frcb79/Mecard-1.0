# 11. Índice de Fuentes, Archivos y Trazabilidad

> **Garantía de Auditoría:** Cada hallazgo, diagnóstico y recomendación emitidos en este compendio documental se respalda en evidencia empírica directa presente en el código fuente, la historia de commits de Git, los esquemas de bases de datos o los documentos formales del workspace.

---

## 1. Fuentes Primarias de Código Fuente y Configuración

| Componente / Archivo | Ruta Absoluta en el Workspace | Líneas Relevantes | Evidencia y Hallazgo Vinculado |
|---|---|:---:|---|
| **Definición de Dependencias** | [package.json](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/package.json) | L1-L60 | Node 20.x, React 19.0.0, Vite 6.0.11, Supabase JS 2.48.2, GenAI 1.3.0. |
| **Enrutador Centralizado** | [src/routes/index.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/routes/index.tsx) | L1-L894 | Catálogo unificado de las 53 rutas protegidas por roles con React.lazy y retry. |
| **Terminal Punto de Venta** | [src/components/PosView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/PosView.tsx) | L1-L808 | Interfaz táctil, sugerencias Gemini, escaneo QR y cobro atómico. |
| **Simulador Comercial** | [src/components/SuperAdmin/CommercialSimulator.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SuperAdmin/CommercialSimulator.tsx) | L1-L250 | Modelos comerciales A, B, C, comisiones de cafetería, float y breakage. |
| **Módulo de Colegiaturas** | [src/components/SchoolFeesManager.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolFeesManager.tsx) | L1-L988 | Tablero de mensualidades, becas y aging de cobranza (69 KB de UI). |
| **Servicio de Colegiaturas** | [src/services/SchoolFeeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/SchoolFeeService.ts) | L1-L80 | Lógica de recargos y aging; evidencia de persistencia en `localStorage`. |
| **Generador de CLABE** | [src/services/clabeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/clabeService.ts) | L1-L52 | Implementación del algoritmo oficial de Banxico con pesos [3, 7, 1], banco 646 STP. |
| **Micro-servicios de IA** | [src/services/geminiService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/geminiService.ts) | L7-L14, L53-L70 | 9 funciones IA; evidencia de exposición de `VITE_GEMINI_API_KEY` en cliente. |
| **Fuga de Privacidad Social**| [src/services/supabaseSocial.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/supabaseSocial.ts) | L15 | Evidencia de inclusión de la columna `balance` en búsqueda pública de amigos. |
| **Factory de Servicios** | [src/services/factory.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/factory.ts) | L28-L54 | Patrón Factory para alternar dinámicamente entre Mocks y Supabase real. |
| **Validador de Entorno** | [src/lib/env.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/env.ts) | L23-L40 | Detección de credenciales placeholder de Supabase y flag `VITE_REQUIRE_SUPABASE`. |
| **Cliente de Supabase** | [src/lib/supabaseClient.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/supabaseClient.ts) | L12-L37 | Cliente único consolidado con fallback seguro a mock. |
| **Importador Masivo CSV** | [src/services/studentImportService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/studentImportService.ts) | L42-L63 | Validación de CURP oficial mexicano por regex, email y teléfono a 10 dígitos. |

---

## 2. Fuentes de Base de Datos y Scripts de Migración

| Archivo SQL / Script | Ubicación en el Workspace | Líneas | Contenido y Evidencia |
|---|---|:---:|---|
| **Esquema Maestro 49 Tablas** | [SUPABASE_SCHEMA.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SUPABASE_SCHEMA.sql) | L1-L2144 | 49 tablas base, RLS multi-tenant, índices y triggers de tiers de lealtad. |
| **Blindaje de Concurrencia** | [SECURITY_FIXES_PHASE1.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql) | L1-L260 | Funciones `process_pos_sale_atomic` y `settle_refund_idempotent` con `FOR UPDATE`. |
| **Migración POS 2026-03-30** | `supabase/migrations/20260330_pos_and_cafeteria_tables.sql` | L1-L172 | Tablas `pos_terminals`, `cafeteria_orders` y `pos_operations_log`. |
| **RPCs de Administración** | `supabase/migrations/20260327_admin_ops_rpcs.sql` | L1-L281 | Funciones `reload_wallet_atomic` y `process_refund_atomic`. |
| **Especificación Reembolsos** | [PHASE1_REFUND_POLICY_SPEC.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/PHASE1_REFUND_POLICY_SPEC.md) | L1-L100 | Matriz de reembolsos de 6 módulos y regla de conversión a puntos en 30 días. |
| **Script Semilla QA** | [scripts/seed-qa-data.mjs](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/scripts/seed-qa-data.mjs) | L1-L332 | Poblador automático de 1 colegio QA, 3 sedes, 5 unidades, staff y 50 alumnos. |
| **Auditoría de Esquema** | [scripts/audit-schema-coverage.mjs](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/scripts/audit-schema-coverage.mjs) | L1-L136 | Script validador de cobertura entre tablas SQL y llamadas `.from()` en TypeScript. |

---

## 3. Fuentes de Pruebas Automatizadas y QA

| Archivo de Prueba | Ubicación | Cobertura | Estado Verificado |
|---|---|---|:---:|
| **Guardián de Rutas RBAC** | [src/components/ProtectedRoute.test.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ProtectedRoute.test.tsx) | 16 pruebas unitarias de roles y permisos | 🟢 PASS (16/16) |
| **Algoritmo Banxico CLABE** | [src/services/__tests__/clabeService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/clabeService.test.ts) | Verificación de pesos 3, 7, 1 y dígito verificador | 🟢 PASS |
| **Simulador Transaccional** | [src/services/__tests__/MockPaymentService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/MockPaymentService.test.ts) | Validación de saldo, saldo insuficiente y órdenes | 🟢 PASS |
| **Servicio de Roles** | [src/services/__tests__/RoleService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/RoleService.test.ts) | Permisos de superadmin, colegio y concesionario | 🟢 PASS |
| **Logger y Observabilidad** | [src/lib/logger.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/logger.test.ts) | Eventos `mecard:log` y captura de excepciones | 🟢 PASS |
| **Telemetría Frontend** | [src/lib/telemetry.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/telemetry.test.ts) | Batching y despacho de errores de cliente | 🟢 PASS |

---

## 4. Fuentes Documentales e Históricas del Repositorio

| Documento | Ubicación | Contenido Relevante |
|---|---|---|
| **Project Brain** | [docs/project/PROJECT_BRAIN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/PROJECT_BRAIN.md) | Bitácora de estado vivo al 2026-03-30: plan de 10 días de go-live y decisiones de UAT. |
| **Registro de Decisiones** | [docs/project/DECISIONS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md) | Registro de 10 decisiones históricas desde Enero hasta finales de Marzo 2026. |
| **Ideas y Decisiones 2026** | [IDEAS_2026.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/IDEAS_2026.md) | Especificación de permisos de salida, módulo multi-padre y sistema de excursiones. |
| **Directrices de Diseño** | [Diseño_MeCard.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/Dise%C3%B1o_MeCard.md) | Prompt maestro de UI "MeCard Elite Interface (Fintech Edition)": Bento Grid, Inter, Slate. |
| **Plan E2E Día 2** | [docs/project/DAY2_E2E_PLAN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DAY2_E2E_PLAN.md) | Matriz de credenciales QA y protocolo de prueba de los 8 casos de uso de acceso. |
| **Reporte de Seguridad** | [SECURITY_IMPLEMENTATION_REPORT.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_IMPLEMENTATION_REPORT.md) | Detalle técnico del parche de 4 vulnerabilidades críticas el 2026-03-11. |
| **Guía de Facturación** | [BILLING_TESTING_GUIDE.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/BILLING_TESTING_GUIDE.md) | 5 workflows paso a paso para depósitos, facturación mensual, cobro y dunning timeline. |
| **Prompt Multi-Agente** | [_archive/MeCard-Multi-Agent...](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/_archive/MeCard-Multi-Agent-Implementation-Plan.prompt.md) | Plan histórico de tareas automáticas asignadas a agentes de IA anteriores. |

---

## 5. Trazabilidad de Commits y Ramas Clave en Git

- **`86a62c3` (2026-04-03):** Último commit en `main`: "refactor: remove remaining runtime mx_01 defaults".
- **`ec5aa8f` (2026-03-30):** Commit que conectó los servicios reales de Supabase al POS.
- **`eb0f2a8` (2026-03-11):** Commit que incorporó el archivo de seguridad atómica `SECURITY_FIXES_PHASE1.sql`.
- **`50a8b8f` (2026-01-06):** Punto de bifurcación (*merge base*) entre `main` y `origin/staging`.
- **`62db4a5` (2026-01-12):** Último commit en `origin/staging` ("Service Layer"), donde quedaron atrapados el módulo de proveedores y 18 documentos de arquitectura.

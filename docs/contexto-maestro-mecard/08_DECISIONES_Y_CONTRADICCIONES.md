# 08. Registro de Decisiones y Detección de Contradicciones en MeCard

> **Fuentes de Evidencia:** [docs/project/DECISIONS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md), [SETUP_SISTEMA_PROFESIONAL.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SETUP_SISTEMA_PROFESIONAL.md), [.github/copilot-instructions.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/.github/copilot-instructions.md), `_archive/` y árbol de Git.

---

## 1. Registro Cronológico de Decisiones Históricas

| Fecha | Decisión Registrada | Justificación y Contexto | Evidencia Documental |
|---|---|---|---|
| **Enero 2026** | **Adopción de Vite + React 19** | Priorizar velocidad de carga, rendimiento en dispositivos móviles y ligereza frente a SSR pesado. | [docs/project/DECISIONS.md:L50](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md#L50) |
| **Enero 2026** | **Multi-Tenancy con Supabase RLS** | Aislar datos de cada colegio a nivel base de datos mediante `school_id` sin tener que crear una BD separada por institución. | [docs/project/DECISIONS.md:L53](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md#L53) |
| **Febrero 2026** | **Unificación de Navegación en React Router v7** | Eliminar el enum conflictivo `AppView` y centralizar todas las 53 pantallas bajo un enrutador unificado por roles. | [_archive/Plan-Revamped-Frontend...](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/_archive/Plan-Revamped-Frontend-con-Routing-Un.prompt.md) |
| **2026-03-11** | **Blindaje Atómico de Ventas POS y Reembolsos** | Crear funciones atómicas SQL con bloqueo `FOR UPDATE` para impedir compras sin saldo (*double-spend*) y liquidaciones duplicadas. | [SECURITY_IMPLEMENTATION_REPORT.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_IMPLEMENTATION_REPORT.md) |
| **2026-03-21** | **Validación de Entorno y Modo Demo Desacoplado** | Crear `src/lib/env.ts` para permitir desarrollo offline con mocks sin fallar si faltan llaves reales de Supabase. | [docs/project/DECISIONS.md:L21](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md#L21) |
| **2026-03-22** | **Estabilización de Despliegue en Vercel & Node 20** | Fijar Node 20 en engines/nvmrc, configurar `--legacy-peer-deps` y bloquear previews innecesarias de Dependabot. | [docs/project/DECISIONS.md:L37](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md#L37) |
| **2026-03-24** | **Observabilidad Centralizada Frontend** | Crear `src/lib/logger.ts` y despacho de eventos `mecard:log` para capturar errores de inicio y autenticación de forma estructurada. | [docs/project/DECISIONS.md:L44](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md#L44) |
| **2026-03-27** | **Priorización de Operaciones Administrativas sobre QA** | Priorizar la conexión de `SCHOOL_ADMIN` y `SUPER_ADMIN` a Supabase real antes de extender la pirámide de pruebas E2E. | [docs/project/DECISIONS.md:L3](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md#L3) |
| **2026-03-27** | **Expansión de Skills por Dominio Técnico y Negocio** | Formalizar 15 carpetas de playbooks en `docs/skills/` (arquitectura, seguridad, finanzas, legal, estrategia). | [docs/project/DECISIONS.md:L7](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md#L7) |
| **2026-03-30** | **Decisión de Go-Live Escalonado (Días 1-10)** | Iniciar un plan de 10 días para entrega de plataforma operativa lista para UAT con colegios reales, **diferiendo pagos bancarios reales**. | [docs/project/PROJECT_BRAIN.md:L72](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/PROJECT_BRAIN.md#L72) |

---

## 2. Detección de Contradicciones, Conflictos y Trabajo Duplicado

Durante la auditoría integral se detectaron **7 contradicciones y discrepancias críticas** entre la documentación, las instrucciones históricas y el código real:

### ⚠️ Contradicción 1: Documentación Residual del Proyecto "PETER" (Next.js 14)
- **Evidencia:** El archivo [SETUP_SISTEMA_PROFESIONAL.md:L53-L89](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SETUP_SISTEMA_PROFESIONAL.md#L53-L89) contiene instrucciones para configurar un proyecto ajeno llamado *"PETER — Plataforma SaaS de consultoría estratégica"* con stack técnico: `Next.js 14 App Router (NO Vite), Tailwind CSS + shadcn/ui con tema oscuro (#070B14)` y Zustand.
- **Realidad en MeCard:** MeCard es una aplicación escolar construida sobre **Vite + React 19** con tema visual claro y paleta esmeralda/indigo.
- **Causa Raíz:** Un agente de IA anterior copió un archivo de instrucciones de otro proyecto del usuario para usarlo como plantilla, pero no limpió el encabezado ni los lineamientos de stack.
- **Riesgo:** Confusión severa para agentes de IA o desarrolladores que intenten migrar erróneamente MeCard a Next.js 14 sin autorización.
- **Acción:** Preservar el archivo en `_archive/` o actualizarlo para eliminar referencias ajenas a PETER.

### ⚠️ Contradicción 2: Tarea de Seguridad "Terminada" en Prompts pero Omitida en Código
- **Evidencia:** En el plan de agentes [_archive/MeCard-Multi-Agent-Implementation-Plan.prompt.md:L42-L45](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/_archive/MeCard-Multi-Agent-Implementation-Plan.prompt.md#L42-L45), la tarea `E4` ordenaba textualmente:
  > *"Remove Balance from findPotentialFriend: File: src/services/supabaseSocial.ts — Remove balance field from the query to prevent students seeing other students' balances."*
- **Realidad en Código:** Al revisar [src/services/supabaseSocial.ts:L15](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/supabaseSocial.ts#L15), la línea sigue conteniendo:
  ```typescript
  .select('id, full_name, student_id, school_id, grade, balance, status')
  ```
- **Diagnóstico:** El agente que ejecutó las tareas marcó mentalmente o reportó la tarea como hecha sin haber editado el archivo, dejando abierta la fuga de información de saldos económicos de menores.

### ⚠️ Contradicción 3: Trabajo Abandonado en la Rama `origin/staging`
- **Evidencia:** La rama `origin/staging` contiene 35 commits que implementaron el módulo de **Proveedores y Órdenes de Compra** (`SupplierManagementView.tsx`, `supplierService.ts`, migraciones `003` y `004`), mientras que en `main` no existe rastro alguno de estos archivos.
- **Causa Raíz:** Cuando se realizó la migración masiva de la estructura plana a la carpeta `src/`, el desarrollador o agente que integró `main` olvidó portar los archivos de compras y proveedores desarrollados en `staging`.

### ⚠️ Contradicción 4: Archivos Huérfanos y Duplicados en la Raíz
- **Evidencia:** En la raíz del repositorio coexisten archivos que compiten directamente con la versión activa en `src/`:
  - `types.ts` en raíz (31 KB, desactualizado) vs. `src/types.ts` (68 KB, versión canónica activa).
  - Carpeta `hooks/` en raíz (4 archivos: `useAuth`, `useNotifications`, `usePools`, `useTransactions`) vs. `src/hooks/` (19 archivos canónicos).
  - Carpeta `pages/` en raíz (`Login.tsx` y `Unauthorized.tsx`) coexistiendo con `src/components/LoginView.tsx`.
- **Riesgo:** Importaciones rotas o regresiones si un desarrollador importa accidentalmente `'../types'` en vez de `'./types'`.

### ⚠️ Contradicción 5: La Carpeta Aislada `src/_phase2/`
- **Evidencia:** Existen 10 componentes dentro de [src/_phase2/](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/_phase2/) (tales como `RewardsMarketplace.tsx`, `StudentFavorites.tsx`, `GiftSender.tsx`, `GiftInbox.tsx`).
- **Conflicto:** Varios de estos componentes tienen versiones duplicadas o análogas en `src/components/` (por ejemplo, `RewardsMarketplacePage.tsx` importa de `src/components/` pero la versión enriquecida está en `src/_phase2/`).
- **Diagnóstico:** `_phase2/` se usó como laboratorio para probar conexiones directas a Supabase, pero nunca se realizó la fusión definitiva con los componentes de la vista principal.

### ⚠️ Contradicción 6: Módulos Escolar y de Accesos en `localStorage` a pesar de tener Tablas SQL
- **Evidencia:** Los módulos de **Colegiaturas** ([SchoolFeesManager.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolFeesManager.tsx)) y **Control de Accesos/Torniquetes** ([SchoolAccessDashboard.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolAccessDashboard.tsx)) son dos de los componentes más avanzados visualmente (69 KB y 34 KB de código React refinado).
- **Conflicto:** A pesar de que [SUPABASE_SCHEMA.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SUPABASE_SCHEMA.sql) tiene 52 tablas definidas, ambos módulos persisten sus datos exclusivamente en el navegador (`localStorage.getItem('mecard_school_fees')`), de modo que al recargar la página en otro equipo o limpiar cookies, toda la configuración de colegiaturas se pierde.

### ⚠️ Contradicción 7: Hipótesis de Reducción de Comisiones vs. Código Real
- **Evidencia:** Existe la expectativa estratégica de negociar tasas reducidas de adquirencia para compartir el margen con las escuelas.
- **Realidad en Código:** [BillingService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/BillingService.ts) y los esquemas SQL tienen codificadas tasas fijas rígidas (3.5% tarjeta, $8 SPEI) y no existe un modelo dinámico de dispersión de ahorros adquirentes.

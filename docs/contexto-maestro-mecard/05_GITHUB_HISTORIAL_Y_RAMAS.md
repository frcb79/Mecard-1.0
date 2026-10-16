# 05. Historial de GitHub, Ramas y Trabajo Abandonado en MeCard

> **Repositorio Oficial:** `https://github.com/frcb79/Mecard-1.0.git`  
> **Comandos de Auditoría Ejecutados:** `git status`, `git branch -a`, `git log --graph`, `git diff --stat`, `git merge-base`.  
> **Estado del Árbol de Trabajo Local:** Limpio (*working tree clean*), sincronizado al 100% con `origin/main`.

---

## 1. Inventario Completo de Ramas en el Repositorio Remoto

| Rama | Tipo | Último Commit | Fecha Último Commit | Estado de Integración |
|---|:---:|:---:|:---:|---|
| `main` / `origin/main` | Principal | `86a62c3` | 2026-04-03 | **Activa y en producción**. Es la rama sobre la que se han hecho los últimos despliegues y correcciones de seguridad. |
| `origin/staging` | Desarrollo previo | `62db4a5` | 2026-01-12 | **ABANDONADA / NO INTEGRADA**. Se bifurcó en Enero 2026 y contiene 35 commits no incluidos en `main`. |
| `origin/dependabot/.../react-router-dom-7.13.2` | Bot | `ad2f165` | Marzo 2026 | Dependencia menor de routing. |
| `origin/dependabot/.../react-stack-3da5448bfe` | Bot | `1c1763b` | Marzo 2026 | Actualización agrupada de testing library y types. |
| `origin/dependabot/.../recharts-3.8.0` | Bot | `55cc364` | Marzo 2026 | Actualización mayor de recharts (bloqueada intencionalmente para evitar roturas de UI). |

---

## 2. Hallazgo Forense Crítico: La Bifurcación y Abandono de `origin/staging`

Mediante el comando `git merge-base main origin/staging`, se determinó con precisión matemática el punto de separación de ambas líneas de desarrollo:

- **Commit de Bifurcación (Merge Base):** `50a8b8f` (Fecha: 2026-01-06 16:30:59 -0600).
- **Línea de Tiempo de `origin/staging`:** Recibió 35 commits intensivos entre el 6 y el 12 de Enero de 2026, culminando en el commit `62db4a5` ("Service Layer"). **Posteriormente nunca más fue tocada ni fusionada.**
- **Línea de Tiempo de `main`:** Continuó su evolución independiente desde Enero hasta Abril de 2026, reestructurando el proyecto dentro de la carpeta `src/`, agregando la suite de roles, corrigiendo vulnerabilidades críticas y desplegando en Vercel.

```
                     ┌─── [origin/staging] (Enero 6 al 12, 2026) 35 COMMITS ABANDONADOS
                     │    ├─ SupplierManagementView.tsx
                     │    ├─ supplierService.ts & purchaseOrderService.ts
                     │    ├─ Migraciones 003 y 004 (suppliers, purchase_orders)
                     │    └─ 18 documentos de arquitectura previa en docs/
                     │
─── [50a8b8f] ───────┤ (Merge Base: 2026-01-06)
                     │
                     └─── [main] (Enero a Abril 2026) -> ACTIVO
                          ├─ Reorganización modular a src/
                          ├─ Role-based routing (53 rutas)
                          ├─ Atomic POS sale RPC (SECURITY_FIXES_PHASE1.sql)
                          ├─ Módulo de Colegiaturas (SchoolFeesManager.tsx)
                          └─ 86a62c3 (2026-04-03: Último commit en main)
```

---

## 3. Inventario del Trabajo Existente Exclusivamente en `origin/staging`

El análisis de código mediante `git show origin/staging:<ruta>` identificó los siguientes activos de software que **no existen en la rama `main`** y que corren el riesgo de perderse si la rama es eliminada:

### A. Módulo Completo de Proveedores y Órdenes de Compra
1. **Componente de Interfaz:** `components/SupplierManagementView.tsx` (código React completo con formulario, tabla de proveedores, RFC, persona de contacto y condiciones de pago).
2. **Servicios de Backend:**
   - `services/supplierService.ts`: CRUD completo de proveedores contra Supabase.
   - `services/purchaseOrderService.ts`: Creación de órdenes de compra, control de estatus (`PENDING`, `APPROVED`, `DELIVERED`, `CANCELLED`) y costeo de artículos.
3. **Migraciones de Base de Datos:**
   - `supabase/migrations/003_add_supplier_management.sql`: Tabla `suppliers` con llaves foráneas y RLS.
   - `supabase/migrations/004_add_purchase_orders.sql`: Tablas `purchase_orders` y `purchase_order_items`.

### B. Prototipo del Módulo Financiero y Gamificación
- `propuesta-modulo-financiero.js`: Script ejecutable en Node.js que simula billeteras de alumnos, apartados (*savings goals*), canje de dinero por puntos, comisiones de concesionarios y consejos financieros con Gemini.

### C. Acervo Documental de Enero 2026 (91 KB de Especificaciones)
En `origin/staging` existían 18 archivos dentro de `docs/` que fueron reemplazados en `main` cuando se introdujo la carpeta `docs/skills/`:
- `docs/BACKEND_SERVICES_API_DESIGN.md` (25 KB): Contratos de API y firmas de métodos.
- `docs/SUPABASE_SCHEMA_PLAN.md` (22 KB): Plan original de base de datos.
- `docs/EXECUTION_PLAN_4WEEKS.md` (17 KB): Tareas y checklist de 4 semanas.
- `docs/README_ROADMAP.md` (15 KB): Matriz de funcionalidades original.
- `docs/COMPLETION_REPORT_ABC.md`: Reporte de entrega de fases A, B y C.
- `docs/PHASE_2_SERVICES_COMPLETE.md`: Detalle de servicios de depósito y límites de gasto.

---

## 4. Diferencias entre el Código Local y el Remoto

Al ejecutar `git status` en el entorno:
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```
- **No existen cambios locales sin commit.** El árbol local está limpio y alineado bit a bit con `origin/main`.
- **Diferencia entre `main` y `origin/staging`:** Existen **335 archivos modificados** entre ambas ramas, con 24,067 líneas añadidas en `staging` y 68,907 líneas añadidas en `main`.

> [!WARNING]
> **Peligro de Fusión Directa:** **BAJO NINGUNA CIRCUNSTANCIA SE DEBE HACER `git merge origin/staging` en `main`.**
> Hacer un merge directo causaría cientos de conflictos catastróficos debido a que `main` reestructuró todos los directorios hacia `src/` y renombró decenas de interfaces.

---

## 5. Recomendación Operativa para Recuperar el Trabajo Valioso

Para rescatar lo útil de `origin/staging` sin poner en riesgo la estabilidad de `main`:

1. **No borrar la rama `origin/staging`:** Mantenerla como respaldo histórico de referencia.
2. **Rescate Quirúrgico (Cherry-Pick Manual de Archivos):**
   - Cuando se decida implementar el módulo de proveedores en la fase de Concesionarios (P2), extraer los archivos puntuales:
     - `git show origin/staging:components/SupplierManagementView.tsx` -> copiar y adaptar a `src/components/SupplierManagementView.tsx`.
     - `git show origin/staging:services/supplierService.ts` -> adaptar a `src/services/supplierService.ts`.
     - `git show origin/staging:services/purchaseOrderService.ts` -> adaptar a `src/services/purchaseOrderService.ts`.
     - Agregar las tablas de las migraciones `003` y `004` como una nueva migración formal en `supabase/migrations/`.
3. **Cierre de Ramas de Dependabot:**
   - La rama `dependabot/npm_and_yarn/react-router-dom-7.13.2` puede ser fusionada tras verificar build en CI.
   - La rama `dependabot/npm_and_yarn/recharts-3.8.0` debe ser rechazada/cerrada porque la versión 3 de Recharts contiene *breaking changes* en la API de gráficas que rompen los dashboards actuales.

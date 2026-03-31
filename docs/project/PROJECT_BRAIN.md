# PROJECT BRAIN — meCard
> Última actualización: 2026-03-30

## Estado Actual del Proyecto

**Fase:** Phase 2 — Operación End-to-End (Sin pagos reales aún)  
**Sprint actual:** Semana de 2026-03-30 (Día 1 de 10 - Plan de Go-Live)  
**Próxima entrega:** Plataforma operativa para demos y UAT

## Lo que está DONE ✅

### Frontend
- Estructura React + Vite + Tailwind establecida (2320 módulos, 0 errores de build)
- 48 rutas implementadas para 6 roles: STUDENT, PARENT, POS_OPERATOR, SCHOOL_ADMIN, SUPER_ADMIN, CASHIER
- 70+ componentes con lazy loading por ruta
- Sistema de roles RBAC con permisos granulares (AppPermission + CustomRole)
- AI integrada (9 funciones Gemini): análisis de gastos, recomendaciones, menú
- Sistema de Rewards: puntos, tiers (BRONZE/SILVER/GOLD/PLATINUM), marketplace mock
- POS terminal: escaneo QR, carrito, pago, generación de puntos
- Portal Parent: wallet, límites, viajes, permisos de salida, notificaciones
- AuthContext actualizado: login real desde tabla profiles (no users)

### Base de Datos
- SUPABASE_SCHEMA.sql: esquema completo listo para ejecutar
- SECURITY_FIXES_PHASE1.sql: función atómica POS + RLS multi-tenant + idempotency keys
- PHASE1_SCHEMA_DEPLOYMENT.sql: políticas de reembolso
- **DÍA 1**: Migration 20260330_pos_and_cafeteria_tables.sql creada (pos_terminals, cafeteria_orders, pos_operations_log, updates a products)

### Datos QA (Día 1 - Listo para ejecutar)
- Script seed-qa-data.mjs creado: siembra 1 colegio + 50 alumnos + 4 staff + 20 productos + 5 unidades
- Credenciales estables documentadas en TESTING_ROLES.md
- Matriz QA completa con emails, contraseñas y roles

### Seguridad
- RLS implementado con aislamiento por school_id
- 4 vulnerabilidades críticas resueltas (ver SECURITY_IMPLEMENTATION_REPORT.md)
- Función process_pos_sale_atomic() previene double-spend
- AuthContext ahora lee de tabla profiles correctamente

### CI/CD
- GitHub Actions: type-check + tests + build en cada PR a main
- Deploy automático a Vercel en push a main
- Instalación de dependencias alineada en CI/Vercel con `--legacy-peer-deps`
- Previews de Vercel ignoradas para ramas `dependabot/*`

### Calidad (2026-03-30)
- Validación centralizada de variables de entorno: `src/lib/env.ts`
- 4 suites de unit tests: CLABEService, MockPaymentService, RoleService, factory
- Observabilidad base: `src/lib/logger.ts` con eventos `mecard:log`

## Lo que está EN PROGRESO (Días 1-10 Plan)
- [x] **Día 1**: ✅ COMPLETADO - Schema + Seed + Docs
- [x] **Día 2**: ⏳ EN PROGRESO - Button fixes done, E2E tests pending
- [ ] **Día 3**: School Admin - Alta de colegio
- [ ] **Día 4**: School Admin - CSV import de alumnos
- [ ] **Día 5**: Crear y configurar POS
- [ ] **Día 6**: Catálogo de productos
- [ ] **Día 7**: Operación de POS - Compra completa
- [ ] **Día 8**: Pedidos de cafetería
- [ ] **Día 9**: Administración de POS
- [ ] **Día 10**: QA integral + Go/No-Go

## Lo que está PENDIENTE 📋
- Integración real de pagos SPEI (diferido a Fase 3)
- Pruebas E2E con Playwright (Días 2-10 plan)
- Lighthouse CI baseline
- Gate de cobertura en CI (umbral 60%)
- Madurar skills transversales en el ciclo de entrega

## Decisiones Ejecutivas (2026-03-30)
- **INCLUIDO en este corte**: Operación escolar completa (colegio, alumnos, credenciales, POS, cafetería, supervisión)
- **DIFERIDO**: Pagos reales (SPEI/tarjeta) → Fase después de UAT
- **CRITERIO**: Platform "go-live ready for staged rollout with mock payments"

## Módulos y su Estado

| Módulo | Estado | Cobertura tests |
|--------|--------|----------------|
| Auth / Roles | ✅ UI done, Supabase parcial | ⚠️ Solo smoke |
| POS / Pagos | ✅ Mock completo | ✅ Unit tests |
| Rewards | ✅ Mock completo | ⚠️ Pendiente |
| Parent Portal | ✅ UI done | ⚠️ Pendiente |
| School Admin | ✅ UI done | ⚠️ Pendiente |
| Super Admin | ✅ UI done | ⚠️ Pendiente |
| CLABE / FinTech | ✅ Algoritmo implementado | ✅ Unit tests |
| Reembolsos | ✅ Phase 1 completo | ⚠️ Pendiente |
| Accesos / Asistencia | ✅ UI done | ⚠️ Pendiente |

## Variables de Entorno Necesarias
Ver `.env.example` para la lista completa.  
Nueva variable:
- `VITE_REQUIRE_SUPABASE=false` (default) / `true` para modo estricto

## Decisiones Técnicas Importantes
Ver `docs/project/DECISIONS.md` para el historial completo.




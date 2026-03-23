# PROJECT BRAIN — meCard
> Última actualización: 2026-03-21

## Estado Actual del Proyecto

**Fase:** Phase 1 — Base técnica de calidad + habilitación de pruebas  
**Sprint actual:** Semana de 2026-03-21  
**Próxima entrega:** Suite de tests completa + entorno híbrido operativo

## Lo que está DONE ✅

### Frontend
- Estructura React + Vite + Tailwind establecida (2306 módulos, 0 errores de build)
- 48 rutas implementadas para 6 roles: STUDENT, PARENT, POS_OPERATOR, SCHOOL_ADMIN, SUPER_ADMIN, CASHIER
- 70+ componentes con lazy loading por ruta
- Sistema de roles RBAC con permisos granulares (AppPermission + CustomRole)
- AI integrada (9 funciones Gemini): análisis de gastos, recomendaciones, menú
- Sistema de Rewards: puntos, tiers (BRONZE/SILVER/GOLD/PLATINUM), marketplace mock
- POS terminal: escaneo QR, carrito, pago, generación de puntos
- Portal Parent: wallet, límites, viajes, permisos de salida, notificaciones

### Base de Datos
- SUPABASE_SCHEMA.sql: esquema completo listo para ejecutar
- SECURITY_FIXES_PHASE1.sql: función atómica POS + RLS multi-tenant + idempotency keys
- PHASE1_SCHEMA_DEPLOYMENT.sql: políticas de reembolso

### Seguridad
- RLS implementado con aislamiento por school_id
- 4 vulnerabilidades críticas resueltas (ver SECURITY_IMPLEMENTATION_REPORT.md)
- Función process_pos_sale_atomic() previene double-spend

### CI/CD
- GitHub Actions: type-check + tests + build en cada PR a main
- Deploy automático a Vercel en push a main
- Instalación de dependencias alineada en CI/Vercel con `--legacy-peer-deps`
- Previews de Vercel ignoradas para ramas `dependabot/*` para reducir ruido operativo

### Calidad (2026-03-21)
- Validación centralizada de variables de entorno: `src/lib/env.ts`
- Modo estricto opcional: `VITE_REQUIRE_SUPABASE=true` falla en arranque si no hay credenciales reales
- 4 suites de unit tests nuevas:
  - `src/services/__tests__/clabeService.test.ts`
  - `src/services/__tests__/MockPaymentService.test.ts`
  - `src/services/__tests__/RoleService.test.ts`
  - `src/services/__tests__/factory.test.ts`
- Skill de testing documentado: `docs/skills/testing/README.md`

## Lo que está EN PROGRESO 🔄
- [ ] Cobertura de tests de integración (auth, POS → Supabase, RLS multi-tenant)
- [ ] Observabilidad: logging estructurado y trazabilidad de errores en producción
- [ ] Entorno staging: Supabase DEV + Vercel preview configurados (sin ruido de ramas dependabot)

## Lo que está PENDIENTE 📋
- Integración real de pagos SPEI (actualmente MockPaymentService)
- Pruebas E2E con Playwright (5 flujos críticos)
- Lighthouse CI baseline
- Gate de cobertura en CI (umbral acordado)
- Skills faltantes: `docs/skills/operations/`, `docs/skills/performance/`, `docs/skills/ai/`

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

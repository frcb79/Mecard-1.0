# DECISIONS — meCard

## [2026-03-21] Validación de entorno centralizada
- Se crea `src/lib/env.ts` como fuente única de verdad para detectar credenciales Supabase válidas vs placeholder.
- Se elimina la lógica duplicada que existía en `supabaseClient.ts`.
- Nueva variable `VITE_REQUIRE_SUPABASE=false` (default): la app puede correr en modo mock si no hay credenciales reales. Si se activa (`=true`), el arranque falla rápido con mensaje claro.
- **Impacto**: no bloquea desarrollo local ni demos; solo bloquea staging/producción si se olvida configurar el entorno.

## [2026-03-21] Suite de unit tests — cobertura mínima viable
- Se crean 4 suites de tests en `src/services/__tests__/` para los dominios críticos.
- **Dominios elegidos**: CLABEService (algoritmo financiero sin dependencias), MockPaymentService (balance/reembolso), RoleService (permisos RBAC), factory (singleton de servicios).
- **Criterio de elección**: alta criticidad de negocio + lógica pura o aislada, maximizando confianza por esfuerzo.
- **Pendiente**: integración con Supabase real, tests de RLS multi-tenant, E2E con Playwright.

## [2026-03-21] Skill de testing creado
- Se formaliza `docs/skills/testing/README.md` como playbook oficial para escribir tests en el proyecto.
- Define pirámide de testing, convención de archivos, flujos P0/P1/P2 obligatorios y reglas de código.

## [2026-03-22] Estabilización de deploys automáticos (Dependabot + Vercel)
- Se endurece `.github/dependabot.yml` para agrupar updates acoplados (`react-stack`, `test-stack`) y limitar PRs abiertas.
- Se ignoran updates **major** automáticas de `tailwindcss` y `@types/node` para tratarlas como migraciones planificadas.
- Se define `engines` en `package.json` y `.nvmrc` para alinear runtime local/CI/Vercel con Node 20.
- Se configura `vercel.json` con `installCommand` explícito y `ignoreCommand` para evitar previews en ramas `dependabot/*`.
- Se alinea `deploy.yml` para instalar con `npm ci --legacy-peer-deps`, igual que Vercel.

## [2026-03-24] Observabilidad frontend mínima centralizada
- Se crea `src/lib/logger.ts` para normalizar logs de frontend con `scope`, `level`, `timestamp` y error serializado.
- Se emite el evento global `mecard:log` para habilitar futura integración con telemetry/Sentry sin volver a tocar todos los call sites.
- Se reemplazan `console.*` en puntos críticos de entrada: `main.tsx`, `ErrorBoundary.tsx`, `AuthContext.tsx` y `ServiceContext.tsx`.
- **Impacto**: errores de arranque y autenticación quedan estructurados y listos para captura centralizada.

## [2026-01-XX] Decisión sobre stack
- Se valida mantener Vite + React 19 según requisitos actuales de rendimiento y simplicidad.

## [2026-01-XX] Decisión sobre seguridad multi-tenant
- Se implementa RLS en Supabase, validación `tenant_id` en backend y frontend.
- Ver `SECURITY_FIXES_PHASE1.sql` y `SECURITY_IMPLEMENTATION_REPORT.md` para detalle de implementación.

## [2026-01-XX] API de IA
- Usar `@google/genai` para casos de análisis de gastos y recomendaciones de reward points.
- **Decisión de seguridad pendiente**: mover llamadas a Gemini API a Edge Functions de Supabase para que la API key no quede expuesta en el cliente. Actualmente está en `src/services/geminiService.ts` (riesgo XSS).

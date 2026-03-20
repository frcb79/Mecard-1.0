# DECISIONS — meCard

## [YYYY-MM-DD] Decisión sobre stack
- Se valida mantener Vite + React 19 según requisitos actuales de rendimiento y simplicidad.

## [YYYY-MM-DD] Decisión sobre seguridad multi-tenant
- Se implementa RLS en Supabase, validación `tenant_id` en backend y frontend.

## [YYYY-MM-DD] API de IA
- Usar `@google/genai` para casos de análisis de gastos y recomendaciones de reward points; tokens en backend solo.

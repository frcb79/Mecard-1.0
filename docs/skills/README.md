# docs/skills — Skills por dominio para meCard

Este directorio contiene la guía de habilidades (skills) que el equipo debe consultar antes de implementar cambios en el proyecto.

## Estructura
- docs/skills/architecture
- docs/skills/design
- docs/skills/devops
- docs/skills/security
- docs/skills/testing
- docs/skills/ux
- docs/skills/legal
- docs/skills/operations
- docs/skills/performance
- docs/skills/accessibility
- docs/skills/data
- docs/skills/ai

## Uso recomendado
1. Antes de desarrollar una funcionalidad, identifica el dominio principal.
2. Lee el arquivo correspondiente (si existe) en `docs/skills/[dominio]/`.
3. Añade una nota breve con fecha y nombre en ese doc cuando tomes una decisión crítica.
4. Si un dominio no existe aún, crea un archivo `docs/skills/[dominio]/README.md` con la política.

## Skills de arranque para meCard
- Seguridad: tokenización, RLS, protección de endpoints, vault de secrets.
- Arquitectura: multi-tenant, DDD, escalabilidad de transacciones, performance de consulta.
- DevOps: GitHub Actions, Vercel + Supabase deployment, CI, linter, tests.
- UX/UI: accesibilidad WCAG, flujos de cash-in/cash-out, responsividad y modelos móviles.
- Diseño: sistema de componentes Tailwind, estado de UI, patterns de tarjeta y lista.
- Otros: producto (roadmap de escuelas), analytics (financial-metrics), legal (datos personales).

## Documentos iniciales por dominio
- `docs/skills/architecture/README.md`
- `docs/skills/security/README.md`
- `docs/skills/devops/README.md`
- `docs/skills/ux/README.md`

## Plantilla de skill
- `docs/skills/skill-template.md`

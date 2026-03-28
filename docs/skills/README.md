# docs/skills — Skills por dominio para meCard

Este directorio contiene la guía de habilidades (skills) que el equipo debe consultar antes de implementar cambios en el proyecto.

## Estructura
- docs/skills/architecture
- docs/skills/devops
- docs/skills/security
- docs/skills/testing
- docs/skills/ux
- docs/skills/product-strategy
- docs/skills/strategy-orchestration
- docs/skills/operations
- docs/skills/performance
- docs/skills/accessibility
- docs/skills/data
- docs/skills/ai
- docs/skills/legal
- docs/skills/design
- docs/skills/reporting

## Uso recomendado
1. Antes de desarrollar una funcionalidad, identifica el dominio principal.
2. Lee el archivo correspondiente (si existe) en `docs/skills/[dominio]/`.
3. Añade una nota breve con fecha y nombre en ese doc cuando tomes una decisión crítica.
4. Si un dominio no existe aún, crea un archivo `docs/skills/[dominio]/README.md` con la política.

## Cómo elegir un skill
- Si la decisión cambia prioridades, costos, roadmap o métricas de adopción: `product-strategy`.
- Si la decisión cruza negocio + arquitectura + seguridad + release: `strategy-orchestration`.
- Si la decisión afecta límites de dominio, modularidad o contratos: `architecture`.
- Si hay riesgo de datos, acceso, credenciales o abuso: `security`.
- Si impacta despliegues, pipeline, rollback u operación diaria: `devops` y `operations`.
- Si impacta tiempos de respuesta o costo de cómputo: `performance`.
- Si impacta experiencia, flujos críticos o inclusión: `ux` y `accessibility`.
- Si impacta analitica, trazabilidad o modelos de datos: `data` y `reporting`.
- Si involucra IA generativa o scoring: `ai`.
- Si afecta términos, consentimiento o datos de menores: `legal`.
- Si modifica patrones visuales y componentes: `design`.

## Documentos por dominio
- `docs/skills/architecture/README.md`
- `docs/skills/security/README.md`
- `docs/skills/devops/README.md`
- `docs/skills/testing/README.md`
- `docs/skills/ux/README.md`
- `docs/skills/product-strategy/README.md`
- `docs/skills/strategy-orchestration/README.md`
- `docs/skills/operations/README.md`
- `docs/skills/performance/README.md`
- `docs/skills/accessibility/README.md`
- `docs/skills/data/README.md`
- `docs/skills/ai/README.md`
- `docs/skills/legal/README.md`
- `docs/skills/design/README.md`
- `docs/skills/reporting/README.md`

## Definición de terminado para un skill
- Tiene objetivo claro y alcance.
- Tiene checklist operativo con criterios verificables.
- Incluye riesgos frecuentes y mitigaciones.
- Incluye historial breve con fecha y decisión.
- Referencia `docs/project/PROJECT_BRAIN.md`, `docs/project/DECISIONS.md` y `docs/project/ERROR_LOG.md` cuando aplica.

## Plantilla de skill
- `docs/skills/skill-template.md`


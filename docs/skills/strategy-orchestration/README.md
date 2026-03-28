# Skill: Strategy Orchestration — meCard

## Objetivo

Orquestar decisiones transversales entre negocio, arquitectura, seguridad, datos, operación y release.
Este skill es la puerta de entrada para cambios estratégicos que afectan múltiples dominios.

## Cuándo consultar este skill

- Cuando una iniciativa toca 2 o más dominios de skills.
- Cuando existe conflicto entre impacto de negocio y riesgo técnico.
- Cuando se planea una entrega de fase (Phase 1/2/3) o un cambio estructural.

## Marco de decisión transversal

Evaluar cada iniciativa en 6 ejes:

1. Negocio: impacto esperado y KPI primario.
2. Arquitectura: límites de dominio y deuda técnica.
3. Seguridad/Legal: riesgos y controles obligatorios.
4. Datos: trazabilidad y calidad de métricas.
5. Operación/DevOps: desplegabilidad, monitoreo y rollback.
6. UX/Accesibilidad: fricción de usuario y cobertura de flujos críticos.

No avanzar a implementación si algún eje crítico está en rojo sin plan de mitigación.

## Checklist de planificación

- [ ] Problema de negocio y resultado esperado definidos.
- [ ] Alcance de entrega por fase definido (MVP, hardening, escala).
- [ ] Dependencias técnicas y de equipo identificadas.
- [ ] Riesgos principales con owner y mitigación.
- [ ] Estrategia de pruebas por nivel (unit/integración/E2E).
- [ ] Plan de observabilidad y operación post-release.

## Governance de entrega

- Decision log obligatorio en `docs/project/DECISIONS.md` para cambios estratégicos.
- Si hay incidente relevante, registrar aprendizaje en `docs/project/ERROR_LOG.md`.
- Mantener `docs/project/PROJECT_BRAIN.md` actualizado con estado real.

## Plantilla rápida de orquestación

- Iniciativa:
- Objetivo de negocio:
- KPI primario:
- Riesgos críticos:
- Dependencias:
- Criterio de salida a producción:
- Owner:
- Fecha objetivo:

## Referencias clave

- `docs/skills/product-strategy/README.md`
- `docs/skills/architecture/README.md`
- `docs/skills/security/README.md`
- `docs/skills/operations/README.md`
- `docs/project/PROJECT_BRAIN.md`

## Historial

- [2026-03-27] Skill creado para planeación y orquestación estratégica multi-dominio.

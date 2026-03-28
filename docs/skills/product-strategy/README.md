# Skill: Product Strategy — meCard

## Objetivo

Alinear decisiones de producto con impacto de negocio real para escuelas, padres, estudiantes y operación POS.
Este skill se usa para priorizar qué construir, en qué secuencia y con qué métricas de éxito.

## Cuándo consultar este skill

- Cuando se propone una nueva funcionalidad o módulo.
- Cuando hay conflicto entre velocidad de entrega y calidad/riesgo.
- Cuando una decisión técnica puede cambiar costos, adopción o retención.

## Framework de priorización (obligatorio)

Evaluar cada iniciativa en escala 1-5:

- Impacto de negocio: ingresos, retención, activación o ahorro operativo.
- Riesgo: seguridad, cumplimiento, complejidad técnica.
- Esfuerzo: desarrollo, QA, despliegue, soporte.
- Dependencias: bloqueos por equipos, datos, proveedores, arquitectura.
- Time-to-value: tiempo para entregar valor verificable al usuario final.

Priorizar iniciativas con mayor relación impacto/tiempo y riesgo controlado.

## Checkpoints antes de arrancar una iniciativa

- [ ] Problema y segmento objetivo definidos (rol principal afectado).
- [ ] Hipótesis de valor escrita en una frase.
- [ ] KPI primario y KPI de guardrail definidos.
- [ ] Criterio de éxito a 30/60/90 días.
- [ ] Dependencias técnicas y operativas identificadas.
- [ ] Riesgos de seguridad/compliance revisados con skills de Security y Legal.

## KPIs sugeridos por flujo

- Wallet/Recargas: tasa de recarga exitosa, monto promedio, abandono.
- POS checkout: tiempo por transacción, éxito de cobro, tasa de reintento.
- Rewards: tasa de canje, frecuencia de uso, costo por recompensa.
- Parent Portal: usuarios activos semanales, uso de límites/permisos.

## Definición de listo (Ready)

- [ ] User story con valor de negocio claro.
- [ ] Alcance de fase definido (MVP vs iteración futura).
- [ ] Métricas instrumentables disponibles.
- [ ] Criterio de no-regresión definido para rol impactado.

## Definición de terminado (Done)

- [ ] KPI primario medible en entorno objetivo.
- [ ] No hay regresiones en flujos P0/P1.
- [ ] Decisión relevante registrada en `docs/project/DECISIONS.md`.

## Referencias clave

- `docs/project/PROJECT_BRAIN.md`
- `docs/project/DECISIONS.md`
- `docs/skills/strategy-orchestration/README.md`
- `docs/skills/operations/README.md`

## Historial

- [2026-03-27] Se formaliza framework de priorización para planificación de roadmap.

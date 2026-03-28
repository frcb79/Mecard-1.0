# Skill: Performance — meCard

## Objetivo

Establecer metas de rendimiento para frontend, consultas y flujos transaccionales, evitando degradación a medida que crece la plataforma.

## Cuándo consultar este skill

- Al cambiar vistas críticas o consultas con alto volumen.
- Al agregar widgets, dashboards o integraciones costosas.
- Al detectar lentitud en POS, wallet o parent portal.

## Presupuesto de performance (guía inicial)

- Render inicial de vista crítica: <= 2.5s en red 4G simulada.
- Interacción clave (click a confirmación visual): <= 300ms.
- Consulta crítica de backend: p95 <= 600ms.
- Flujo de checkout POS completo: p95 <= 2.0s (sin proveedor externo).

## Checkpoints de implementación

- [ ] Evitar renders innecesarios y cálculos pesados en UI.
- [ ] Aplicar lazy loading por rutas/módulos.
- [ ] Revisar índices y filtros de consultas críticas.
- [ ] Medir p95 y no solo promedio.
- [ ] Verificar impacto en dispositivos móviles de gama media.

## Anti-patrones

- Cargar datos globales que la vista no usa.
- Repetir consultas por falta de caché o memoización.
- Bloquear UI en operaciones de red sin feedback progresivo.
- Introducir dependencias pesadas sin análisis de bundle.

## Validación mínima antes de merge

- [ ] Medición comparativa pre/post cambio en flujo afectado.
- [ ] No hay regresión mayor al 10% en métrica principal del módulo.
- [ ] Si hay degradación, existe justificación y plan de compensación.

## Referencias clave

- `docs/project/PROJECT_BRAIN.md`
- `docs/skills/architecture/README.md`
- `docs/skills/devops/README.md`

## Historial

- [2026-03-27] Skill de performance creado con presupuesto inicial y controles de regresión.
